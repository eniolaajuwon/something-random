import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, Search, Trash2, ExternalLink, SlidersHorizontal } from 'lucide-react';
import { getSavedDates, deleteSavedDate } from '@/lib/storage';
import type { DateItinerary } from '@/types';

interface Props {
  onBack: () => void;
  setDateItinerary: (itinerary: DateItinerary) => void;
  onViewItinerary: () => void;
}

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';
type TimeOfDay = 'all' | 'morning' | 'afternoon' | 'evening';

interface Filters {
  search: string;
  timeOfDay: TimeOfDay;
  sortBy: SortOption;
  minPrice: string;
  maxPrice: string;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(price: string): string {
  const match = price.match(/([£$€¥]?\s?\d+(?:[,.]\d+)?)/);
  return match ? `💰 ${match[0].replace(/\s+/, '')}` : price;
}

function extractNumericPrice(price: string): number {
  const match = price.match(/\d+(?:[,.]\d+)?/);
  return match ? parseFloat(match[0].replace(',', '')) : 0;
}

export function SavedDatesStep({ onBack, setDateItinerary, onViewItinerary }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [savedDates] = useState(getSavedDates());
  const [filters, setFilters] = useState<Filters>({
    search: '',
    timeOfDay: 'all',
    sortBy: 'newest',
    minPrice: '',
    maxPrice: ''
  });

  const filteredAndSortedDates = useMemo(() => {
    let results = [...savedDates];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(date => 
        date.title.toLowerCase().includes(searchLower) ||
        date.activities.some(activity => 
          activity.title.toLowerCase().includes(searchLower) ||
          activity.location.toLowerCase().includes(searchLower)
        ) ||
        date.inputs?.location.toLowerCase().includes(searchLower)
      );
    }

    // Time of day
    if (filters.timeOfDay !== 'all') {
      results = results.filter(date => 
        date.inputs?.timeOfDay === filters.timeOfDay
      );
    }

    // Price range
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      results = results.filter(date => 
        extractNumericPrice(date.totalCost) >= minPrice
      );
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      results = results.filter(date => 
        extractNumericPrice(date.totalCost) <= maxPrice
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.savedAt!).getTime() - new Date(a.savedAt!).getTime());
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.savedAt!).getTime() - new Date(b.savedAt!).getTime());
        break;
      case 'price-high':
        results.sort((a, b) => extractNumericPrice(b.totalCost) - extractNumericPrice(a.totalCost));
        break;
      case 'price-low':
        results.sort((a, b) => extractNumericPrice(a.totalCost) - extractNumericPrice(b.totalCost));
        break;
    }

    return results;
  }, [savedDates, filters]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved date?')) {
      deleteSavedDate(id);
      window.location.reload(); // Refresh to update the list
    }
  };

  const handleView = (date: DateItinerary) => {
    setDateItinerary(date);
    onViewItinerary();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <BookMarked className="h-6 w-6" />
          Saved Dates
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          View and manage your saved date itineraries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search saved dates..."
                  className="pl-10 bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Time of Day
                  </label>
                  <Select
                    value={filters.timeOfDay}
                    onValueChange={(value: TimeOfDay) => 
                      setFilters(prev => ({ ...prev, timeOfDay: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Times</SelectItem>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Sort By
                  </label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: SortOption) => 
                      setFilters(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="Min price..."
                    className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="Max price..."
                    className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
                  />
                </div>
              </div>
            )}
          </div>

          {filteredAndSortedDates.length === 0 && (
            <div className="text-center py-8">
              <BookMarked className="h-12 w-12 mx-auto text-purple-300 dark:text-purple-700 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {filters.search ? 'No dates match your search' : 'No saved dates yet'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredAndSortedDates.map((date) => (
              <div
                key={date.id}
                className="group relative p-4 rounded-lg bg-purple-50/80 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                      {date.title}
                    </h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Saved on {formatDate(date.savedAt!)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      {formatPrice(date.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                  <p>Location: {date.inputs?.location}</p>
                  <p>Date: {date.inputs?.date} ({date.inputs?.timeOfDay})</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleView(date)}
                    className="flex-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleDelete(date.id!)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={onBack}
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            Create New Date
          </Button>
        </div>
      </CardContent>
    </>
  );
}