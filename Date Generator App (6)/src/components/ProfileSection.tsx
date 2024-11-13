import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, Camera, X, Calendar, MapPin, Check } from 'lucide-react';
import { getSavedDates } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  displayName: string;
  avatar: string | null;
  datePreference: string;
  interests: string;
  budget: string;
}

export function ProfileSection({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const savedDates = getSavedDates();

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile) as ProfileData;
      setProfileData(parsed);
      setAvatar(parsed.avatar);
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setAvatar(newAvatar);
        if (profileData) {
          const updatedProfile = { ...profileData, avatar: newAvatar };
          localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = {
    totalDates: savedDates.length,
    favLocation: savedDates.length > 0 
      ? Object.entries(
          savedDates.reduce((acc, date) => {
            const location = date.inputs?.location || 'Unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a)[0][0]
      : 'No dates yet',
    lastPlanned: savedDates.length > 0
      ? new Date(savedDates[0].savedAt!).toLocaleDateString()
      : 'Never'
  };

  const handleSaveChanges = () => {
    if (profileData) {
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto relative">
      {showConfirmation && (
        <div className="absolute top-4 right-4 left-4 z-50 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <Check className="h-4 w-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-16 h-16 text-purple-400" />
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={profileData?.displayName || ''}
              onChange={(e) => setProfileData(prev => prev ? { ...prev, displayName: e.target.value } : null)}
              placeholder="Your name"
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
            />
          </div>
        </div>

        {/* Date Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">Date Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datePreference">Preferred Date Type</Label>
              <Select
                value={profileData?.datePreference || ''}
                onValueChange={(value) => setProfileData(prev => prev ? { ...prev, datePreference: value } : null)}
              >
                <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventure">Adventure & Outdoors</SelectItem>
                  <SelectItem value="culture">Arts & Culture</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="relaxation">Relaxation & Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Typical Budget</Label>
              <Select
                value={profileData?.budget || ''}
                onValueChange={(value) => setProfileData(prev => prev ? { ...prev, budget: value } : null)}
              >
                <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget-Friendly (Under $50)</SelectItem>
                  <SelectItem value="moderate">Moderate ($50-$150)</SelectItem>
                  <SelectItem value="upscale">Upscale ($150-$300)</SelectItem>
                  <SelectItem value="luxury">Luxury ($300+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              value={profileData?.interests || ''}
              onChange={(e) => setProfileData(prev => prev ? { ...prev, interests: e.target.value } : null)}
              placeholder="e.g., hiking, art, music, cooking"
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Dates</span>
            </div>
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.totalDates}</span>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Favorite Location</span>
            </div>
            <span className="text-lg font-bold text-purple-700 dark:text-purple-400 truncate">{stats.favLocation}</span>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">Last Planned</span>
            </div>
            <span className="text-lg font-bold text-purple-700 dark:text-purple-400">{stats.lastPlanned}</span>
          </div>
        </div>

        <Button 
          onClick={handleSaveChanges}
          className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}