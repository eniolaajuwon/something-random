import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";
import { useSettings } from '@/contexts/SettingsContext';
import type { DateInputs } from "@/types";

interface Props {
  inputs: DateInputs;
  updateInputs: (inputs: Partial<DateInputs>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PartnerStep({ inputs, updateInputs, onNext, onBack }: Props) {
  const { settings } = useSettings();
  const currencySymbol = settings?.currency === 'EUR' ? '€' : settings?.currency === 'GBP' ? '£' : '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.interests && inputs.personality && inputs.budget && inputs.loveLanguage) onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <Heart className="h-6 w-6" />
          About Your Partner
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          Tell us about your partner to create the perfect date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interests">What do they enjoy?</Label>
            <Textarea
              id="interests"
              value={inputs.interests}
              onChange={(e) => updateInputs({ interests: e.target.value })}
              placeholder="e.g., outdoor activities, art, music, food..."
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80 min-h-[60px] max-h-[60px] resize-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personality">What's their personality like?</Label>
            <Textarea
              id="personality"
              value={inputs.personality}
              onChange={(e) => updateInputs({ personality: e.target.value })}
              placeholder="e.g., adventurous, introverted, loves surprises..."
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80 min-h-[60px] max-h-[60px] resize-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">What's your budget?</Label>
            <Select 
              value={inputs.budget} 
              onValueChange={(value) => updateInputs({ budget: value })}
            >
              <SelectTrigger 
                id="budget"
                className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
              >
                <SelectValue placeholder="Select your budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={`{currencySymbol}50`}>Budget-Friendly (Under {currencySymbol}50)</SelectItem>
                <SelectItem value={`{currencySymbol}150`}>Moderate ({currencySymbol}50-{currencySymbol}150)</SelectItem>
                <SelectItem value={`{currencySymbol}300`}>Upscale ({currencySymbol}150-{currencySymbol}300)</SelectItem>
                <SelectItem value={`{currencySymbol}500`}>Luxury ({currencySymbol}300+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loveLanguage">Their Love Language</Label>
            <Select 
              value={inputs.loveLanguage} 
              onValueChange={(value) => updateInputs({ loveLanguage: value })}
            >
              <SelectTrigger 
                id="loveLanguage"
                className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
              >
                <SelectValue placeholder="Select their primary love language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="words-of-affirmation">Words of Affirmation</SelectItem>
                <SelectItem value="acts-of-service">Acts of Service</SelectItem>
                <SelectItem value="receiving-gifts">Receiving Gifts</SelectItem>
                <SelectItem value="quality-time">Quality Time</SelectItem>
                <SelectItem value="physical-touch">Physical Touch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              Back
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
            >
              Generate Date
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}