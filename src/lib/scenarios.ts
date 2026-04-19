import { supabase } from './supabase';

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  principal: number;
  interest_rate: number;
  loan_term: number;
  term_unit: 'months' | 'years';
  repayment_plan: 'standard' | 'ibr' | 'icr' | 'paye';
  income: number | null;
  family_size: number | null;
  created_at: string;
  updated_at: string;
}

export type NewScenario = Omit<Scenario, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export async function fetchScenarios(): Promise<{ data: Scenario[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .order('updated_at', { ascending: false });
  return { data, error };
}

export async function saveScenario(
  scenario: NewScenario,
): Promise<{ data: Scenario | null; error: Error | null }> {
  const userResult = await supabase.auth.getUser();
  if (userResult.error) return { data: null, error: userResult.error };

  const userId = userResult.data.user.id;

  const response = await supabase
    .from('scenarios')
    .insert({ ...scenario, user_id: userId })
    .select()
    .single<Scenario>();
  return { data: response.data, error: response.error };
}

export async function renameScenario(
  id: string,
  name: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('scenarios')
    .update({ name })
    .eq('id', id);
  return { error };
}

export async function deleteScenario(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('scenarios').delete().eq('id', id);
  return { error };
}
