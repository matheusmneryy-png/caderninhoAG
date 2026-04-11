import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutTemplates, useWorkoutLogs } from '@/hooks/useWorkoutStore';
import { generateId, formatDuration } from '@/lib/progression';
import type { WorkoutLog, SetType } from '@/types/workout';
import ExerciseSetsSheet from '@/components/ExerciseSetsSheet';

const ACTIVE_WORKOUT_KEY = 'active_workout';
const ACTIVE_WORKOUT_START_KEY = 'active_workout_start';

export function getActiveWorkout(): WorkoutLog | null {
  try {
    const data = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearActiveWorkout() {
  localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  localStorage.removeItem(ACTIVE_WORKOUT_START_KEY);
}

const ActiveWorkout = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { templates, loading } = useWorkoutTemplates();
  const { addLog, getLastPerformance } = useWorkoutLogs();

  const template = templates.find(t => t.id === templateId);
  const [elapsed, setElapsed] = useState(0);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);

  // Restore or create workout
  const [workout, setWorkout] = useState<WorkoutLog | null>(() => {
    const saved = getActiveWorkout();
    if (saved && saved.templateId === templateId && Array.isArray(saved.exercises)) {
      return {
        ...saved,
        exercises: saved.exercises.map(ex => ({ ...ex, sets: Array.isArray(ex.sets) ? ex.sets : [] }))
      };
    }
    return null;
  });

  useEffect(() => {
    if (!workout && template) {
      setWorkout({
        id: generateId(),
        templateId: template.id,
        templateName: template.name,
        startedAt: new Date().toISOString(),
        exercises: (template.exercises || []).map(ex => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          targetSets: ex.targetSets || 0,
          targetReps: ex.targetReps || 0,
          sets: [],
        })),
      });
    }
  }, [workout, template]);

  // Restore start time
  const startTime = useRef(() => {
    const savedStart = localStorage.getItem(ACTIVE_WORKOUT_START_KEY);
    if (savedStart) return parseInt(savedStart);
    const now = Date.now();
    localStorage.setItem(ACTIVE_WORKOUT_START_KEY, now.toString());
    return now;
  });
  const startTimeValue = useRef(startTime.current());

  // Persist workout state on every change
  useEffect(() => {
    if (workout?.id) {
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workout));
    }
  }, [workout]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeValue.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addSet = useCallback((exerciseIdx: number, type: SetType, weight: number, reps: number) => {
    setWorkout(prev => {
      if (!prev || !prev.exercises) return prev;
      const exercises = [...prev.exercises];
      if (!exercises[exerciseIdx]) return prev;
      const ex = { ...exercises[exerciseIdx] };
      ex.sets = [...(ex.sets || []), {
        id: generateId(),
        type,
        weight,
        reps,
        completedAt: new Date().toISOString(),
      }];
      exercises[exerciseIdx] = ex;
      return { ...prev, exercises };
    });
  }, []);

  const removeSet = useCallback((exerciseIdx: number, setId: string) => {
    setWorkout(prev => {
      if (!prev || !prev.exercises) return prev;
      const exercises = [...prev.exercises];
      if (!exercises[exerciseIdx]) return prev;
      const ex = { ...exercises[exerciseIdx] };
      ex.sets = (ex.sets || []).filter(s => s.id !== setId);
      exercises[exerciseIdx] = ex;
      return { ...prev, exercises };
    });
  }, []);
  
  const updateNotes = useCallback((exerciseIdx: number, notes: string) => {
    setWorkout(prev => {
      if (!prev || !prev.exercises) return prev;
      const exercises = [...prev.exercises];
      if (!exercises[exerciseIdx]) return prev;
      exercises[exerciseIdx] = { ...exercises[exerciseIdx], notes };
      return { ...prev, exercises };
    });
  }, []);

  const finishWorkout = () => {
    if (!workout) return;
    const finished = { ...workout, finishedAt: new Date().toISOString() };
    addLog(finished);
    clearActiveWorkout();
    navigate(`/summary/${finished.id}`, { state: { workout: finished } });
  };

  const handleNext = () => {
    if (!workout || !workout.exercises) return;
    if (activeExercise !== null && activeExercise < workout.exercises.length - 1) {
      setActiveExercise(activeExercise + 1);
    }
  };

  useEffect(() => {
    if (!loading && !template) {
      navigate('/');
    }
  }, [loading, template, navigate]);

  if (!workout || !template) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header with timer */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-5 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-lg font-mono font-bold text-foreground">{formatDuration(elapsed)}</span>
          </div>
          <Button size="sm" onClick={finishWorkout} className="gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Finalizar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1 text-center">{template.name}</p>
      </div>

      {/* Exercise list */}
      <div className="px-5 py-4 space-y-3">
        {(workout.exercises || []).map((ex, idx) => {
          const validCount = (ex.sets || []).filter(s => s.type === 'valid').length;
          const isComplete = validCount >= (ex.targetSets || 0);
          return (
            <button
              key={ex.exerciseId || idx}
              className={`w-full bg-card rounded-xl p-4 border text-left card-hover ${isComplete ? 'border-primary/50' : 'border-border'}`}
              onClick={() => setActiveExercise(idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{ex.exerciseName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {validCount}/{ex.targetSets || 0} séries
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      Alvo: {ex.targetReps || 0} reps
                    </span>
                  </div>
                  {(ex.sets || []).length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {(ex.sets || []).map(s => (
                        <span
                          key={s.id}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            s.type === 'warmup' ? 'set-badge-warmup' :
                            s.type === 'preparation' ? 'set-badge-preparation' :
                            'set-badge-valid'
                          }`}
                        >
                          {s.weight}×{s.reps}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Exercise Sets Sheet */}
      {activeExercise !== null && (workout.exercises || [])[activeExercise] && (
        <ExerciseSetsSheet
          exercise={(workout.exercises || [])[activeExercise]}
          exerciseIdx={activeExercise}
          totalExercises={(workout.exercises || []).length}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          onClose={() => setActiveExercise(null)}
          onNext={handleNext}
          onFinish={finishWorkout}
          onUpdateNotes={updateNotes}
          getLastPerformance={getLastPerformance}
        />
      )}
    </div>
  );
};

export default ActiveWorkout;
