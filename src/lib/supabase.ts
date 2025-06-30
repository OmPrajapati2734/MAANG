import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          step_id: string;
          completed: boolean;
          score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          step_id: string;
          completed?: boolean;
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company?: string;
          step_id?: string;
          completed?: boolean;
          score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          time_taken: number;
          answers: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          time_taken: number;
          answers: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          total_questions?: number;
          time_taken?: number;
          answers?: any;
          created_at?: string;
        };
      };
    };
  };
};