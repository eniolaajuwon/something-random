import { DateItinerary, ChatMessage } from '@/types';

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
const MODEL = 'llama-3.1-sonar-small-128k-chat';

function generateSystemPrompt(dateItinerary: DateItinerary): string {
  return `You are a helpful date planning assistant. You have access to the following date plan:

Title: ${dateItinerary.title}

${dateItinerary.activities.map((activity, index) => `
Activity ${index + 1}:
- Title: ${activity.title}
- Time: ${activity.time}
- Location: ${activity.location}
- Description: ${activity.description}
- Cost: ${activity.cost}
- Considerations: ${activity.considerations}
- Weather: ${activity.weather}
- Travel: ${activity.travel}
${activity.bookingUrl ? `- Booking URL: ${activity.bookingUrl}` : ''}
`).join('\n')}

Total Cost: ${dateItinerary.totalCost}

Your role is to:
1. Answer questions about this specific date plan
2. Provide alternatives or modifications when asked
3. Give detailed advice about each activity
4. Help with practical aspects like timing, transportation, and reservations
5. Suggest ways to make the date more romantic or personalized

Keep responses concise but informative. If asked about something not in the plan, acknowledge that and provide relevant suggestions based on the overall theme and location.`;
}

export async function sendChatMessage(
  message: string,
  dateItinerary: DateItinerary,
  previousMessages: ChatMessage[]
): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('API key is not configured');
  }

  try {
    const systemPrompt = generateSystemPrompt(dateItinerary);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to get a response. Please try again.');
  }
}