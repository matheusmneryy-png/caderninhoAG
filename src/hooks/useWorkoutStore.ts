import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { WorkoutTemplate, WorkoutLog, ExerciseTemplate } from '@/types/workout';

const LOCAL_STORAGE_KEY_TEMPLATES = 'caderninho_workout_templates';
const LOCAL_STORAGE_KEY_LOGS = 'caderninho_workout_logs';

export function useWorkoutTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    // Carregar localStorage primeiro
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
    let localTemplates: WorkoutTemplate[] = [];
    if (localData) {
      try { localTemplates = JSON.parse(localData); } catch (e) {}
    }
    
    console.log("Treinos carregados do LocalStorage:", localTemplates);

    if (!user) { 
      setTemplates(localTemplates); 
      setLoading(false); 
      return; 
    }

    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const remoteTemplates = data.map(row => ({
          id: row.id,
          name: row.name,
          exercises: (row.exercises as any) as ExerciseTemplate[],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        
        // Merge e salva no localstorage
        setTemplates(remoteTemplates);
        localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(remoteTemplates));
      }
    } catch (err) {
      console.error("Erro ao puxar do supabase:", err);
      setTemplates(localTemplates);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const addTemplate = useCallback(async (template: WorkoutTemplate) => {
    console.log("Salvando treino:", template);
    
    // Salvar localmente
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
    let localTemplates: WorkoutTemplate[] = [];
    if (localData) {
      try { localTemplates = JSON.parse(localData); } catch (e) {}
    }
    const newTemplates = [template, ...localTemplates];
    localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(newTemplates));
    setTemplates(newTemplates);

    if (!user) return;
    try {
      await supabase.from('workout_templates').insert({
        id: template.id,
        user_id: user.id,
        name: template.name,
        exercises: template.exercises as any,
      });
      await fetchTemplates();
    } catch (err) {
      console.error("Erro no supabase insert:", err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const updateTemplate = useCallback(async (template: WorkoutTemplate) => {
    console.log("Atualizando treino:", template);

    // Atualizar localmente
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
    if (localData) {
      try { 
        let localTemplates: WorkoutTemplate[] = JSON.parse(localData);
        localTemplates = localTemplates.map(t => t.id === template.id ? template : t);
        localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(localTemplates));
        setTemplates(localTemplates);
      } catch (e) {}
    }

    if (!user) return;
    try {
      await supabase.from('workout_templates').update({
        name: template.name,
        exercises: template.exercises as any,
      }).eq('id', template.id);
      await fetchTemplates();
    } catch (err) {
      console.error("Erro no supabase update:", err);
      throw err;
    }
  }, [user, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    console.log("Deletando treino:", id);

    // Deletar localmente
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATES);
    if (localData) {
      try { 
        let localTemplates: WorkoutTemplate[] = JSON.parse(localData);
        localTemplates = localTemplates.filter(t => t.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATES, JSON.stringify(localTemplates));
        setTemplates(localTemplates);
      } catch (e) {}
    }

    if (!user) return;
    try {
      await supabase.from('workout_templates').delete().eq('id', id);
    } catch (err) {
      console.error("Erro no supabase delete:", err);
      throw err;
    }
  }, [user, fetchTemplates]);

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate };
}

export function useWorkoutLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const fetchLogs = useCallback(async () => {
    // Carregar localStorage primeiro
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    let localLogs: WorkoutLog[] = [];
    if (localData) {
      try { localLogs = JSON.parse(localData); } catch (e) {}
    }

    console.log("Logs carregados do LocalStorage:", localLogs);

    if (!user) { 
      setLogs(localLogs); 
      return; 
    }

    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const remoteLogs = data.map(row => ({
          id: row.id,
          templateId: row.template_id,
          templateName: row.template_name,
          startedAt: row.started_at,
          finishedAt: row.finished_at ?? undefined,
          exercises: (row.exercises as any) as WorkoutLog['exercises'],
        }));
        setLogs(remoteLogs);
        localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(remoteLogs));
      }
    } catch (err) {
      console.error("Erro ao puxar logs do supabase:", err);
      setLogs(localLogs);
    }
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = useCallback(async (log: WorkoutLog) => {
    console.log("Salvando log:", log);

    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    let localLogs: WorkoutLog[] = [];
    if (localData) {
      try { localLogs = JSON.parse(localData); } catch (e) {}
    }
    const newLogs = [log, ...localLogs];
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(newLogs));
    setLogs(newLogs);

    if (!user) return;
    try {
      await supabase.from('workout_logs').insert({
        id: log.id,
        user_id: user.id,
        template_id: log.templateId,
        template_name: log.templateName,
        started_at: log.startedAt,
        finished_at: log.finishedAt || null,
        exercises: log.exercises as any,
      });
      await fetchLogs();
    } catch (err) {
      console.error("Erro no supabase insert log:", err);
    }
  }, [user, fetchLogs]);

  const updateLog = useCallback(async (log: WorkoutLog) => {
    console.log("Atualizando log:", log);

    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    if (localData) {
      try { 
        let localLogs: WorkoutLog[] = JSON.parse(localData);
        localLogs = localLogs.map(l => l.id === log.id ? log : l);
        localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(localLogs));
        setLogs(localLogs);
      } catch (e) {}
    }

    if (!user) return;
    try {
      await supabase.from('workout_logs').update({
        finished_at: log.finishedAt || null,
        exercises: log.exercises as any,
      }).eq('id', log.id);
      await fetchLogs();
    } catch (err) {
      console.error("Erro no supabase update log:", err);
    }
  }, [user, fetchLogs]);

  const getExerciseHistory = useCallback((exerciseName: string) => {
    const history: { date: string; sets: WorkoutLog['exercises'][0]['sets'] }[] = [];
    for (const log of logs) {
      if (!log.finishedAt) continue;
      for (const ex of log.exercises) {
        if (ex.exerciseName === exerciseName) {
          history.push({ date: log.finishedAt, sets: ex.sets });
        }
      }
    }
    return history;
  }, [logs]);

  const getLastPerformance = useCallback((exerciseName: string) => {
    for (const log of logs) {
      if (!log.finishedAt) continue;
      for (const ex of log.exercises) {
        if (ex.exerciseName === exerciseName) {
          return ex;
        }
      }
    }
    return null;
  }, [logs]);

  const deleteLog = useCallback(async (id: string) => {
    console.log("Deletando log:", id);

    const localData = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    if (localData) {
      try { 
        let localLogs: WorkoutLog[] = JSON.parse(localData);
        localLogs = localLogs.filter(l => l.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(localLogs));
        setLogs(localLogs);
      } catch (e) {}
    }

    if (!user) return;
    try {
      await supabase.from('workout_logs').delete().eq('id', id);
    } catch (err) {
      console.error("Erro no supabase delete log:", err);
    }
  }, [user, fetchLogs]);

  return { logs, addLog, updateLog, deleteLog, getExerciseHistory, getLastPerformance };
}
