import type { SupabaseClient } from '@supabase/supabase-js';
import { SURVEY_VERSION } from './config';
import type { Answers } from './engine';

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Attempt {
  id: string;
  config_version: number;
  status: AttemptStatus;
  answers: Answers;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

const COLUMNS = 'id, config_version, status, answers, started_at, updated_at, completed_at';

/** The person's attempts, newest first. Throws if the database cannot be read. */
export async function listAttempts(supabase: SupabaseClient): Promise<Attempt[]> {
  const { data, error } = await supabase
    .from('survey_attempts')
    .select(COLUMNS)
    .neq('status', 'abandoned')
    .order('started_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Attempt[];
}

export async function startAttempt(supabase: SupabaseClient, userId: string): Promise<Attempt> {
  const { data, error } = await supabase
    .from('survey_attempts')
    .insert({ user_id: userId, config_version: SURVEY_VERSION, status: 'in_progress', answers: {} })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Attempt;
}

/** Saves the answers of an unfinished attempt. Resolves false if no row changed (frozen or gone). */
export async function saveAnswers(supabase: SupabaseClient, id: string, answers: Answers): Promise<boolean> {
  const { data, error } = await supabase
    .from('survey_attempts')
    .update({ answers })
    .eq('id', id)
    .eq('status', 'in_progress')
    .select('id');
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/** Saves the final answers and freezes the attempt in one step. */
export async function completeAttempt(supabase: SupabaseClient, id: string, answers: Answers): Promise<boolean> {
  const { data, error } = await supabase
    .from('survey_attempts')
    .update({ answers, status: 'completed' })
    .eq('id', id)
    .eq('status', 'in_progress')
    .select('id');
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function abandonAttempt(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase
    .from('survey_attempts')
    .update({ status: 'abandoned' })
    .eq('id', id)
    .eq('status', 'in_progress');
  if (error) throw error;
}
