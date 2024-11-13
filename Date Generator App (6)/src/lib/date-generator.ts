import { DateInputs, DateItinerary } from '@/types';

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
const MODEL = 'llama-3.1-sonar-small-128k-chat';

async function generatePrompt(inputs: DateInputs): Promise<string> {
  const currencySymbol = inputs.budget.match(/[£$€]/)?.[0] || '$';
  
  return `You are a date planning expert. Create a romantic date plan with exactly 3 activities based on these preferences:
- Location: ${inputs.location}
- Date: ${inputs.date}
- Time of Day: ${inputs.timeOfDay}
- Partner's Interests: ${inputs.interests}
- Partner's Personality: ${inputs.personality}
- Budget: ${inputs.budget}
- Love Language: ${inputs.loveLanguage}

CRITICAL REQUIREMENTS:
1. ALL activities MUST be located in ${inputs.location} ONLY
2. NEVER suggest locations in any other city
3. Use REAL venues and locations that exist in ${inputs.location}
4. Use ${currencySymbol} for all prices
5. Format prices as "${currencySymbol}X" (e.g. "${currencySymbol}50")

For each activity, provide:
1. A specific venue or location name with a real address in ${inputs.location}
2. The ACTUAL cost based on real prices, using ${currencySymbol}
3. NO placeholder or estimated costs - only use real prices
4. For BookingUrl, provide ONLY the direct URL without any markdown formatting

Respond with ONLY the following format, no additional text or markdown:

Title: [Overall theme of the date]

Activity 1:
Title: [Name of activity]
Time: [Specific time]
Location: [Specific location name and address in ${inputs.location}]
Description: [2-3 sentences about the activity]
Considerations: [Important notes or tips]
Weather: [Weather-related advice]
Travel: [How to get there]
Cost: [Exact current price with ${currencySymbol}]
BookingUrl: [Direct URL without markdown]

Activity 2:
[Same format as Activity 1]

Activity 3:
[Same format as Activity 1]

Total Cost: [Sum of all activity costs with ${currencySymbol}]`;
}

export async function generateDate(inputs: DateInputs): Promise<DateItinerary> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('API key is not configured');
  }

  try {
    const prompt = await generatePrompt(inputs);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message || 
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content;
    return parseAIResponse(content, inputs.location);
  } catch (error) {
    console.error('Generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate date plan');
  }
}

function parseAIResponse(content: string, expectedLocation: string): DateItinerary {
  try {
    // Remove any markdown formatting and clean up the content
    content = content.replace(/\*\*/g, '').replace(/\[|\]/g, '');
    
    // Split into sections and remove empty lines
    const sections = content.split('\n\n').filter(Boolean);
    
    // Parse title
    const titleMatch = sections[0].match(/Title:\s*(.+)/);
    if (!titleMatch) throw new Error('Could not parse date title');
    const title = titleMatch[1].trim();

    const activities = [];
    let currentActivity: Record<string, string> = {};
    let totalCost = '';
    
    // Process each section
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      
      if (section.startsWith('Activity')) {
        if (Object.keys(currentActivity).length > 0) {
          // Validate location before adding activity
          if (!currentActivity.location?.toLowerCase().includes(expectedLocation.toLowerCase())) {
            throw new Error(`Activity location must be in ${expectedLocation}`);
          }
          activities.push(currentActivity);
          currentActivity = {};
        }
        
        // Process each line in the activity
        const lines = section.split('\n').slice(1);
        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            const keyLower = key.trim().toLowerCase();
            
            // Clean up any markdown formatting in URLs
            if (keyLower === 'bookingurl') {
              const urlMatch = value.match(/(?:https?:\/\/[^\s)]+)/);
              currentActivity[keyLower] = urlMatch ? urlMatch[0] : '';
            } else {
              currentActivity[keyLower] = value;
            }
          }
        });
      } else if (section.startsWith('Total Cost:')) {
        totalCost = section.split(':')[1].trim();
      }
    }

    // Add the last activity
    if (Object.keys(currentActivity).length > 0) {
      // Validate location before adding activity
      if (!currentActivity.location?.toLowerCase().includes(expectedLocation.toLowerCase())) {
        throw new Error(`Activity location must be in ${expectedLocation}`);
      }
      activities.push(currentActivity);
    }

    if (activities.length === 0) {
      throw new Error('No activities found in the response');
    }

    // Validate required fields
    activities.forEach((activity, index) => {
      const requiredFields = ['title', 'time', 'location', 'description', 'cost'];
      const missing = requiredFields.filter(field => !activity[field]);
      if (missing.length > 0) {
        throw new Error(`Activity ${index + 1} is missing required fields: ${missing.join(', ')}`);
      }
    });

    return {
      title,
      activities: activities.map(activity => ({
        title: activity.title,
        time: activity.time,
        location: activity.location,
        description: activity.description,
        considerations: activity.considerations || 'No special considerations',
        weather: activity.weather || 'Weather information not available',
        travel: activity.travel || 'Travel information not available',
        cost: activity.cost,
        bookingUrl: activity.bookingurl
      })),
      totalCost: totalCost || 'Total cost not available'
    };
  } catch (error) {
    console.error('Parse error:', error, '\nContent:', content);
    throw new Error('Failed to parse the date plan response. Please try again.');
  }
}