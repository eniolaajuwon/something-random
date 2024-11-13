import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import type { DateInputs } from "@/types";

interface Props {
  inputs: DateInputs;
  updateInputs: (inputs: Partial<DateInputs>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BudgetStep({ inputs, updateInputs, onNext, onBack }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.budget) onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Budget
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          What's your budget for this date?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Price Range</Label>
            <Select 
              value={inputs.budget} 
              onValueChange={(value) => updateInputs({ budget: value })}
            >
              <SelectTrigger className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80">
                <SelectValue placeholder="Select your budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="budget">Budget-Friendly (Under $50)</SelectItem>
                <SelectItem value="moderate">Moderate ($50-$150)</SelectItem>
                <SelectItem value="upscale">Upscale ($150-$300)</SelectItem>
                <SelectItem value="luxury">Luxury ($300+)</SelectItem>
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
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}