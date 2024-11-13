import { createEvents } from 'ics';
import type { DateItinerary } from '@/types';

function parseTime(timeStr: string, dateStr: string): Date {
  // Extract hours and minutes from time string (e.g., "10:00 AM" or "10:00")
  const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (!timeMatch) return new Date(dateStr);

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2] || '0');
  const period = timeMatch[3]?.toLowerCase();

  // Convert to 24-hour format if PM
  if (period === 'pm' && hours < 12) hours += 12;
  // Convert 12 AM to 0 hours
  if (period === 'am' && hours === 12) hours = 0;

  const date = new Date(dateStr);
  date.setHours(hours, minutes);
  return date;
}

function formatDateForICS(date: Date): [number, number, number, number, number] {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // months are 0-indexed in JS
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  ];
}

export async function generateCalendarEvents(itinerary: DateItinerary): Promise<string> {
  const events = itinerary.activities.map(activity => {
    const startDate = parseTime(activity.time, itinerary.inputs?.date || new Date().toISOString());
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); // Default 1 hour duration

    return {
      start: formatDateForICS(startDate),
      end: formatDateForICS(endDate),
      title: activity.title,
      description: `${activity.description}\n\nConsiderations: ${activity.considerations}\n\nWeather: ${activity.weather}\n\nTravel: ${activity.travel}\n\nCost: ${activity.cost}`,
      location: activity.location,
      url: activity.bookingUrl
    };
  });

  return new Promise((resolve, reject) => {
    createEvents(events, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

export function downloadCalendarFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}