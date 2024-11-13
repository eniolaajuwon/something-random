import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import type { DateInputs } from "@/types";

interface Props {
  inputs: DateInputs;
  updateInputs: (inputs: Partial<DateInputs>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalityStep({ inputs, updateInputs, onNext, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.personality) onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <User className="h-5 w-5" />
          Personality
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          Tell us about your partner's personality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personality">Partner's Personality</Label>
            <Textarea
              id="personality"
              value={inputs.personality}
              onChange={(e) => updateInputs({ personality: e.target.value })}
              placeholder="e.g., adventurous, introverted, loves surprises..."
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80 min-h-[120px]"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              Back
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
            >
              Generate Date
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}