import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProfileSection } from "@/components/ProfileSection";
import { SettingsSection } from "@/components/SettingsSection";
import {
  History,
  Settings,
  HelpCircle,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  LogIn,
  Loader2,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSearchHistory, getSavedDates, clearSearchHistory, deleteSearchHistoryItem } from '@/lib/storage';
import { format } from 'date-fns';
import type { DateItinerary, SearchHistory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onViewDate?: (date: DateItinerary) => void;
}

export function Sidebar({ onViewDate }: Props) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState<'main' | 'profile' | 'settings' | 'help'>('main');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedDates, setSavedDates] = useState<DateItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user]);

  // Set up polling for updates
  useEffect(() => {
    const interval = setInterval(loadData, 1000); // Poll every second
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    try {
      const [history, dates] = await Promise.all([
        getSearchHistory(user?.id),
        getSavedDates()
      ]);

      // Only update state if data has changed
      if (JSON.stringify(history) !== JSON.stringify(searchHistory)) {
        setSearchHistory(history);
      }
      if (JSON.stringify(dates) !== JSON.stringify(savedDates)) {
        setSavedDates(dates);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your search history?')) {
      await clearSearchHistory(user?.id);
      setSearchHistory([]);
    }
  };

  const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSearchHistoryItem(id, user?.id);
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleViewDate = (dateId: string) => {
    const date = savedDates.find(d => d.id === dateId);
    if (date && onViewDate) {
      onViewDate(date);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (activeSection === 'profile') {
    return <ProfileSection onClose={() => setActiveSection('main')} />;
  }

  if (activeSection === 'settings') {
    return <SettingsSection onClose={() => setActiveSection('main')} />;
  }

  return (
    <div
      className={cn(
        "group/sidebar h-full bg-white/50 backdrop-blur-sm border-r border-purple-100 dark:border-purple-800 dark:bg-gray-900/50 relative flex flex-col",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 h-8 w-8 rounded-full border border-purple-200 bg-white dark:border-purple-800 dark:bg-gray-900"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {!user ? (
        <div className="flex-1 p-4 flex flex-col items-center justify-center text-center space-y-4">
          <LogIn className="h-5 w-5 text-purple-400" />
          {!isCollapsed && (
            <>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                Sign in to Access Features
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Sign in to sync your search history across devices
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 p-4">
            <div className={cn(
              "flex items-center justify-between",
              isCollapsed && "justify-center"
            )}>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                {!isCollapsed && (
                  <span className="font-semibold text-purple-900 dark:text-purple-300">Recent Searches</span>
                )}
              </div>
              {!isCollapsed && searchHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Separator className="my-4" />

            <ScrollArea className="h-[calc(100vh-12rem)]">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((search) => {
                    const savedDate = search.dateItineraryId 
                      ? savedDates.find(date => date.id === search.dateItineraryId)
                      : undefined;

                    return (
                      <div
                        key={search.id}
                        className={cn(
                          "p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors relative group cursor-pointer",
                          isCollapsed ? "text-center" : "space-y-1"
                        )}
                        onClick={() => savedDate && handleViewDate(savedDate.id!)}
                      >
                        {isCollapsed ? (
                          <MapPin className="h-4 w-4 mx-auto text-purple-600 dark:text-purple-400" />
                        ) : (
                          <>
                            {search.dateTitle && (
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 truncate pr-8">
                                  {search.dateTitle}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleDeleteSearch(search.id, e)}
                                  className="h-6 w-6 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500 hover:text-red-600" />
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-300">
                              <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <span className="truncate">{search.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(search.date)} ({search.timeOfDay})</span>
                            </div>
                            {savedDate && (
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <Calendar className="h-3 w-3" />
                                  <span className="truncate">Date plan saved</span>
                                </div>
                                <ExternalLink className="h-3 w-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={cn(
                  "text-sm text-gray-500 dark:text-gray-400",
                  isCollapsed && "text-center"
                )}>
                  {!isCollapsed && "No recent searches"}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="p-4 mt-auto">
            <Separator className="mb-4" />
            <div className="space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setActiveSection('profile')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>Profile</span>}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setActiveSection('settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>Settings</span>}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setActiveSection('help')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>Help</span>}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}