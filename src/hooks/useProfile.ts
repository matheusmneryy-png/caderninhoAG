import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  }, [user, fetchProfile]);

  const calculateBMI = useCallback((weight: number | null, height: number | null) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }, []);

  const getBMICategory = useCallback((bmi: number | null) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-500' };
    if (bmi < 35) return { label: 'Obesidade Grau I', color: 'text-orange-500' };
    if (bmi < 40) return { label: 'Obesidade Grau II', color: 'text-red-500' };
    return { label: 'Obesidade Grau III', color: 'text-red-700' };
  }, []);

  const estimateCalories = useCallback((weight: number | null, durationSeconds: number) => {
    if (!weight || durationSeconds <= 0) return 0;
    // Using MET (Metabolic Equivalent of Task) for Strength Training
    // MET 5.0 is moderate intensity
    const MET = 5.0;
    const durationHours = durationSeconds / 3600;
    return Math.round(MET * weight * durationHours);
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    calculateBMI,
    getBMICategory,
    estimateCalories
  };
}
