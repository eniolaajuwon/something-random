import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAvatar } from '@/lib/storage-utils';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import type { Gender, Sexuality, AgeRange } from '@/types';

interface ProfileData {
  displayName: string;
  avatar: string | null;
  datePreference: string;
  interests: string;
  budget: string;
  gender: Gender;
  sexuality: Sexuality;
  ageRange: AgeRange;
}

interface Props {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: Props) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    avatar: null,
    datePreference: '',
    interests: '',
    budget: '',
    gender: 'prefer-not-to-say',
    sexuality: 'prefer-not-to-say',
    ageRange: '25-34'
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

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (user) {
        try {
          // Save profile data to Supabase
          const { error } = await supabase
            .from('user_profiles')
            .upsert([{
              user_id: user.id,
              display_name: formData.displayName,
              avatar_url: formData.avatar,
              date_preference: formData.datePreference,
              interests: formData.interests,
              budget: formData.budget,
              gender: formData.gender,
              sexuality: formData.sexuality,
              age_range: formData.ageRange,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (error) {
            throw error;
          }

          // Save to local storage as backup
          localStorage.setItem('user_profile', JSON.stringify(formData));
          
          // Call the completion handler
          onComplete();
        } catch (error) {
          console.error('Error saving profile:', error);
          // Fallback to local storage only
          localStorage.setItem('user_profile', JSON.stringify(formData));
          onComplete();
        }
      }
    }
  };

  // Rest of your component code remains the same...
  // (Keep all the JSX and other functions as they were)
}