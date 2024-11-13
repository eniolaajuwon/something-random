import { DateItinerary, SearchHistory } from '@/types';
import { supabase } from './supabase';

const STORAGE_KEY = 'saved_dates';
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

// Save date itinerary
export function saveDateItinerary(itinerary: DateItinerary): DateItinerary {
  const savedDates = getSavedDates();
  const dateToSave = {
    ...itinerary,
    id: itinerary.id || crypto.randomUUID(),
    savedAt: itinerary.savedAt || new Date().toISOString()
  };
  
  const existingIndex = savedDates.findIndex(date => date.id === dateToSave.id);
  if (existingIndex !== -1) {
    savedDates[existingIndex] = dateToSave;
  } else {
    savedDates.unshift(dateToSave);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDates));
  return dateToSave;
}

export function getSavedDates(): DateItinerary[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function deleteSavedDate(id: string): void {
  const savedDates = getSavedDates().filter(date => date.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDates));
}

export function searchSavedDates(query: string): DateItinerary[] {
  const savedDates = getSavedDates();
  const lowercaseQuery = query.toLowerCase();
  
  return savedDates.filter(date => 
    date.title.toLowerCase().includes(lowercaseQuery) ||
    date.activities.some(activity => 
      activity.title.toLowerCase().includes(lowercaseQuery) ||
      activity.location.toLowerCase().includes(lowercaseQuery)
    ) ||
    date.inputs?.location.toLowerCase().includes(lowercaseQuery)
  );
}

// Search history functions
export async function saveToSearchHistory(
  userId: string | undefined,
  location: string, 
  date: string, 
  timeOfDay: string,
  dateItineraryId?: string,
  dateTitle?: string
): Promise<void> {
  try {
    if (!userId) {
      // Handle anonymous users with local storage
      const searchHistory = getLocalSearchHistory();
      
      // Check for duplicates
      const isDuplicate = searchHistory.some(item => 
        item.dateItineraryId === dateItineraryId &&
        item.location === location &&
        item.date === date &&
        item.timeOfDay === timeOfDay
      );

      if (isDuplicate) {
        return;
      }

      const newSearch: SearchHistory = {
        id: crypto.randomUUID(),
        location,
        date,
        timeOfDay,
        searchedAt: new Date().toISOString(),
        dateItineraryId,
        dateTitle
      };

      searchHistory.unshift(newSearch);
      while (searchHistory.length > MAX_HISTORY_ITEMS) {
        searchHistory.pop();
      }
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      return;
    }

    // Check for duplicates in Supabase
    const { data: existingSearches } = await supabase
      .from('search_history')
      .select('id')
      .eq('user_id', userId)
      .eq('location', location)
      .eq('date', date)
      .eq('time_of_day', timeOfDay)
      .eq('date_itinerary_id', dateItineraryId)
      .limit(1);

    if (existingSearches && existingSearches.length > 0) {
      return;
    }

    // Save to Supabase for logged-in users
    const { error } = await supabase
      .from('search_history')
      .insert([{
        user_id: userId,
        location,
        date,
        time_of_day: timeOfDay,
        date_itinerary_id: dateItineraryId,
        date_title: dateTitle,
        searched_at: new Date().toISOString()
      }]);

    if (error) {
      console.warn('Falling back to local storage:', error);
      await saveToSearchHistory(undefined, location, date, timeOfDay, dateItineraryId, dateTitle);
    }
  } catch (error) {
    console.error('Error saving search history:', error);
    await saveToSearchHistory(undefined, location, date, timeOfDay, dateItineraryId, dateTitle);
  }
}

export async function getSearchHistory(userId?: string): Promise<SearchHistory[]> {
  try {
    if (!userId) {
      return getLocalSearchHistory();
    }

    // Get from Supabase for logged-in users
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(MAX_HISTORY_ITEMS);

    if (error) {
      console.warn('Falling back to local search history:', error);
      return getLocalSearchHistory();
    }

    return data.map(item => ({
      id: item.id,
      location: item.location,
      date: item.date,
      timeOfDay: item.time_of_day,
      searchedAt: item.searched_at,
      dateItineraryId: item.date_itinerary_id,
      dateTitle: item.date_title
    }));
  } catch (error) {
    console.error('Error fetching search history:', error);
    return getLocalSearchHistory();
  }
}

function getLocalSearchHistory(): SearchHistory[] {
  try {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function clearSearchHistory(userId?: string): Promise<void> {
  try {
    if (!userId) {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
      return;
    }

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('Falling back to local storage clear:', error);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error clearing search history:', error);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
  }
}

export async function deleteSearchHistoryItem(id: string, userId?: string): Promise<void> {
  try {
    if (!userId) {
      const searchHistory = getLocalSearchHistory().filter(item => item.id !== id);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
      return;
    }

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Falling back to local storage delete:', error);
      const searchHistory = getLocalSearchHistory().filter(item => item.id !== id);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    }
  } catch (error) {
    console.error('Error deleting search history item:', error);
    const searchHistory = getLocalSearchHistory().filter(item => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }
}