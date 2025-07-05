import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'book' | 'course';
  url: string | null;
  content: string | null;
  company: string | null;
  step_id: string | null;
  tags: string[];
  video_duration: number | null;
  is_user_generated: boolean;
  created_by: string | null;
  created_at: string;
}

export const useResources = (company?: string, stepId?: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, [company, stepId]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let query = supabase.from('resources').select('*');

      if (company) {
        query = query.eq('company', company);
      }

      if (stepId) {
        query = query.eq('step_id', stepId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { resources, loading, error, refetch: fetchResources };
};