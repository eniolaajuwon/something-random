import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAvatar } from '@/lib/storage-utils';
import type { Gender, Sexuality, AgeRange } from '@/types';

interface Props {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    avatar: null,
    datePreference: '',
    interests: '',
    budget: '',
    gender: 'prefer-not-to-say' as Gender,
    sexuality: 'prefer-not-to-say' as Sexuality,
    ageRange: '25-34' as AgeRange
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);

        const publicUrl = await uploadAvatar(file, user.id);
        if (publicUrl) {
          setFormData(prev => ({ ...prev, avatar: publicUrl }));
        }
      } catch (error) {
        console.error('Error handling avatar:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save to local storage first as a fallback
      localStorage.setItem('user_profile', JSON.stringify(formData));
      localStorage.setItem(`profile_complete_${user?.id}`, 'true');
      
      // Complete the setup
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Help us personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Rest of your component JSX remains the same */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={uploading}
              className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
            >
              {step === 4 ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}