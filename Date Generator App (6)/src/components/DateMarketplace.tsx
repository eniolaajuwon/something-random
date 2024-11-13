import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingBag, Heart, Share2, Filter } from 'lucide-react';
import { SocialShare } from './SocialShare';
import type { DateItinerary } from '@/types';

interface Props {
  onViewDate: (date: DateItinerary) => void;
}

export function DateMarketplace({ onViewDate }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  // This would normally come from an API
  const sampleDates: DateItinerary[] = [
    {
      id: '1',
      title: 'Romantic Evening in Paris',
      activities: [
        {
          title: 'Dinner at Le Jules Verne',
          time: '7:00 PM',
          location: 'Eiffel Tower, Paris',
          description: 'Exclusive dining experience with panoramic views',
          considerations: 'Dress code: Formal',
          weather: 'Indoor venue',
          travel: 'Metro or taxi recommended',
          cost: '€300'
        }
      ],
      totalCost: '€300',
      savedAt: new Date().toISOString(),
      inputs: {
        location: 'Paris',
        date: '2024-03-20',
        timeOfDay: 'evening',
        interests: 'Fine dining',
        personality: 'Romantic',
        budget: '€300',
        loveLanguage: 'quality-time'
      }
    }
  ];

  const filteredDates = sampleDates.filter(date => 
    date.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    date.inputs?.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search date plans..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDates.map((date) => (
            <Card key={date.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-purple-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1496318447583-f524534e9ce1"
                  alt={date.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <SocialShare dateItinerary={date} />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{date.title}</h3>
                <p className="text-gray-600 mb-4">{date.inputs?.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">
                    {date.totalCost}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-pink-50 hover:text-pink-600"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onViewDate(date)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}