import { useState, useEffect } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockIcon, MapPinIcon, ThermometerIcon, CarIcon, Wand2, AlertCircle, Shirt, Navigation, Info, ExternalLink, Calendar } from 'lucide-react';
import { generateDate } from '@/lib/date-generator';
import { generateCalendarEvents, downloadCalendarFile } from '@/lib/calendar';
import { SocialShare } from '@/components/SocialShare';
import type { DateInputs, DateItinerary, Activity } from '@/types';

interface Props {
  inputs: DateInputs;
  dateItinerary: DateItinerary | null;
  setDateItinerary: (itinerary: DateItinerary | null) => void;
  onBack: () => void;
  onDateGenerated: (itinerary: DateItinerary) => void;
}

interface ActivityModalProps {
  activity: Activity;
  onClose: () => void;
}

function ActivityModal({ activity, onClose }: ActivityModalProps) {
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-300">
              {activity.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid gap-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 min-w-[150px]">
                <ClockIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-900 dark:text-purple-100">{activity.time}</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <MapPinIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-900 dark:text-purple-100">{activity.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-700 dark:text-green-300">💰 {activity.cost}</span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">About This Activity</h4>
              <p className="text-purple-800 dark:text-purple-100">{activity.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ThermometerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300">Weather Conditions</h4>
                </div>
                <p className="text-blue-800 dark:text-blue-100">{activity.weather}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-300">What to Wear</h4>
                </div>
                <p className="text-green-800 dark:text-green-100">
                  {activity.weather.includes('rain') ? 'Bring a waterproof jacket and comfortable shoes' :
                   activity.weather.includes('hot') ? 'Light, breathable clothing and sun protection' :
                   activity.weather.includes('cold') ? 'Warm layers and a coat' :
                   'Smart casual attire suitable for the venue'}
                </p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h4 className="font-semibold text-orange-900 dark:text-orange-300">Travel Information</h4>
              </div>
              <p className="text-orange-800 dark:text-orange-100">{activity.travel}</p>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <h4 className="font-semibold text-pink-900 dark:text-pink-300">Tips & Considerations</h4>
              </div>
              <p className="text-pink-800 dark:text-pink-100">{activity.considerations}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          {activity.bookingUrl && (
            <Button
              onClick={() => handleExternalLink(activity.bookingUrl!)}
              className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          )}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ResultsStep({ inputs, dateItinerary, setDateItinerary, onBack, onDateGenerated }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [originalInputs] = useState<DateInputs>(inputs);

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleStartOver = () => {
    setDateItinerary(null);
    // Reset all inputs and go back to location step
    onBack();
  };

  const handleExportCalendar = async () => {
    if (!dateItinerary) return;

    try {
      const calendarContent = await generateCalendarEvents(dateItinerary);
      const filename = `date-plan-${new Date().toISOString().split('T')[0]}.ics`;
      downloadCalendarFile(calendarContent, filename);
    } catch (error) {
      console.error('Failed to generate calendar events:', error);
      alert('Failed to generate calendar file. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateDate(originalInputs);
      setDateItinerary(result);
      onDateGenerated(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate date plan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const generateItinerary = async () => {
      if (dateItinerary) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await generateDate(originalInputs);
        setDateItinerary(result);
        onDateGenerated(result);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to generate date plan');
      } finally {
        setIsLoading(false);
      }
    };

    generateItinerary();
  }, [originalInputs, setDateItinerary, dateItinerary, onDateGenerated]);

  if (error) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Error Generating Date Plan
          </CardTitle>
          <CardDescription className="text-gray-900 dark:text-gray-100">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button
            onClick={() => {
              setError(null);
              setDateItinerary(null);
            }}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={handleStartOver}
            className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            Start Over
          </Button>
        </CardContent>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Wand2 className="h-6 w-6 animate-pulse" />
            Generating Your Perfect Date
          </CardTitle>
          <CardDescription className="text-gray-900 dark:text-gray-100">
            Please wait while we create your personalized date itinerary...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        </CardContent>
      </>
    );
  }

  if (!dateItinerary) return null;

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">
          {dateItinerary.title}
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          Your personalized date itinerary based on your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {dateItinerary.activities.map((activity, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden p-4 rounded-lg bg-purple-50/80 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700 transition-all duration-300 hover:shadow-lg"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  {activity.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-purple-700 dark:text-purple-300">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <ClockIcon className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <MapPinIcon className="h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                    <span className="truncate">{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-700 dark:text-green-300">💰 {activity.cost}</span>
                  </div>
                </div>
                <p className="text-purple-900 dark:text-purple-100 text-sm line-clamp-2">
                  {activity.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedActivity(activity)}
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/40"
                  >
                    View Details
                  </Button>
                  {activity.bookingUrl && (
                    <Button
                      onClick={() => handleExternalLink(activity.bookingUrl!)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <SocialShare dateItinerary={dateItinerary} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleStartOver}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
        >
          Start Over
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleRegenerate}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            Regenerate
          </Button>
          <Button 
            onClick={handleExportCalendar}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Export to Calendar
          </Button>
        </div>
      </CardFooter>

      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </>
  );
}