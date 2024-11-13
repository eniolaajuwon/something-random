import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Globe, Bell, Calendar, Check } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export function SettingsSection({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSettings();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSaveChanges = () => {
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto relative">
      {showConfirmation && (
        <div className="absolute top-4 right-4 left-4 z-50 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <Check className="h-4 w-4" />
          <span>Changes saved successfully!</span>
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
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regional */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Regional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => updateSettings({ currency: value as 'USD' | 'EUR' | 'GBP' })}
              >
                <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance Units</Label>
              <Select 
                value={settings.distance} 
                onValueChange={(value) => updateSettings({ distance: value as 'miles' | 'kilometers' })}
              >
                <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                  <SelectValue placeholder="Select units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="miles">Miles</SelectItem>
                  <SelectItem value="kilometers">Kilometers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="cursor-pointer">Enable notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Integration
          </h3>
          <div className="space-y-2">
            <Label htmlFor="calendar">Default Calendar</Label>
            <Select 
              value={settings.calendar} 
              onValueChange={(value) => updateSettings({ calendar: value })}
            >
              <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="apple">Apple Calendar</SelectItem>
                <SelectItem value="outlook">Outlook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">Privacy</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="history" className="cursor-pointer">Save search history</Label>
              <Switch id="history" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics" className="cursor-pointer">Share anonymous usage data</Label>
              <Switch id="analytics" defaultChecked />
            </div>
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