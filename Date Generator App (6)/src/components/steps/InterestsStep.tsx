import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";
import type { DateInputs } from "@/types";

interface Props {
  inputs: DateInputs;
  updateInputs: (inputs: Partial<DateInputs>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function InterestsStep({ inputs, updateInputs, onNext, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.interests) onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Interests
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          What does your partner enjoy?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interests">Partner's Interests</Label>
            <Textarea
              id="interests"
              value={inputs.interests}
              onChange={(e) => updateInputs({ interests: e.target.value })}
              placeholder="e.g., outdoor activities, art, music, food..."
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
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}