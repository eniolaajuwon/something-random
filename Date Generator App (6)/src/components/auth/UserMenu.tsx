import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { ProfileSetup } from "./ProfileSetup";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function UserMenu() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      checkProfileStatus();
    }
  }, [user]);

  const checkProfileStatus = async () => {
    if (!user) return;

    try {
      // Check Supabase first
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        // Fallback to local storage
        const hasCompletedProfile = localStorage.getItem(`profile_complete_${user.id}`);
        if (!hasCompletedProfile) {
          setShowProfileSetup(true);
        }
        return;
      }

      // If no profile exists in Supabase, show setup
      if (!data) {
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error('Profile check error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileComplete = async () => {
    if (!user) return;

    try {
      // Insert profile into Supabase
      const { error } = await supabase
        .from('user_profiles')
        .insert([{ 
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      // Set local storage as backup
      localStorage.setItem(`profile_complete_${user.id}`, 'true');
      setShowProfileSetup(false);
    } catch (error) {
      console.error('Error completing profile:', error);
      // Fallback to local storage only
      localStorage.setItem(`profile_complete_${user.id}`, 'true');
      setShowProfileSetup(false);
    }
  };

  return (
    <>
      {user ? (
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="border-purple-400 bg-white/50 text-purple-700 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-300 dark:hover:bg-purple-900/20"
        >
          Sign Out
        </Button>
      ) : (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAuthModal(true)}
            className="border-purple-400 bg-white/50 text-purple-700 hover:bg-purple-50 dark:border-purple-500 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            Sign In
          </Button>
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white"
          >
            Get Started
          </Button>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onProfileSetup={() => setShowProfileSetup(true)}
      />

      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}
    </>
  );
}