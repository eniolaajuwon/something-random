import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import type { DateInputs } from "@/types";

interface Props {
  inputs: DateInputs;
  updateInputs: (inputs: Partial<DateInputs>) => void;
  onNext: () => void;
}

export function LocationStep({ inputs, updateInputs, onNext }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputs.location) onNext();
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Location
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-gray-100">
          Where would you like your date to take place?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">City or Area</Label>
            <Input
              id="location"
              name="location"
              value={inputs.location}
              onChange={(e) => updateInputs({ location: e.target.value })}
              placeholder="Enter your preferred location"
              className="bg-white/80 border-purple-200 dark:border-purple-700 dark:bg-gray-800/80"
              required
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            Next Step
          </Button>
        </form>
      </CardContent>
    </>
  );
}