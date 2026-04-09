import { useState } from 'react';
import { ArrowLeft, Flame, Shield, Target, Trash2, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ExerciseLog, SetType } from '@/types/workout';

interface Props {
  exercise: ExerciseLog;
  exerciseIdx: number;
  totalExercises: number;
  onAddSet: (idx: number, type: SetType, weight: number, reps: number) => void;
  onRemoveSet: (idx: number, setId: string) => void;
  onClose: () => void;
  onNext: () => void;
  onFinish: () => void;
  getLastPerformance: (name: string) => ExerciseLog | null;
}

const setTypeConfig = {
  warmup: { label: 'Aquecimento', icon: Flame, className: 'set-badge-warmup' },
  preparation: { label: 'Preparação', icon: Shield, className: 'set-badge-preparation' },
  valid: { label: 'Série Válida', icon: Target, className: 'set-badge-valid' },
};

const ExerciseSetsSheet = ({ exercise, exerciseIdx, totalExercises, onAddSet, onRemoveSet, onClose, onNext, onFinish, getLastPerformance }: Props) => {
  const lastPerf = getLastPerformance(exercise.exerciseName);
  const lastValidSets = lastPerf?.sets.filter(s => s.type === 'valid') || [];
  const lastWeight = lastValidSets.length > 0 ? lastValidSets[0].weight : 0;

  const [weight, setWeight] = useState(lastWeight.toString());
  const [reps, setReps] = useState(exercise.targetReps.toString());

  const isLastExercise = exerciseIdx >= totalExercises - 1;

  const handleAdd = (type: SetType) => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (r <= 0) return;
    onAddSet(exerciseIdx, type, w, r);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-bold text-foreground">{exercise.exerciseName}</h2>
          <p className="text-xs text-muted-foreground">
            Alvo: {exercise.targetSets} × {exercise.targetReps} reps · Exercício {exerciseIdx + 1}/{totalExercises}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Last performance */}
        {lastPerf && lastValidSets.length > 0 && (
          <div className="bg-secondary rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-2">Último treino</p>
            <div className="flex gap-2 flex-wrap">
              {lastPerf.sets.map((s, i) => (
                <span key={i} className={`text-xs font-medium px-2 py-1 rounded-md ${setTypeConfig[s.type].className}`}>
                  {s.weight}kg × {s.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weight & Reps input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Carga (kg)</label>
            <Input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="bg-card border-border h-12 text-center text-lg font-bold text-foreground"
              step="0.5"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">Repetições</label>
            <Input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="bg-card border-border h-12 text-center text-lg font-bold text-foreground"
            />
          </div>
        </div>

        {/* Add buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            className="h-12 flex-col gap-0.5 text-warmup border border-border"
            onClick={() => handleAdd('warmup')}
          >
            <Flame className="h-4 w-4" />
            <span className="text-[10px]">Aquecimento</span>
          </Button>
          <Button
            variant="secondary"
            className="h-12 flex-col gap-0.5 text-preparation border border-border"
            onClick={() => handleAdd('preparation')}
          >
            <Shield className="h-4 w-4" />
            <span className="text-[10px]">Preparação</span>
          </Button>
          <Button
            className="h-12 flex-col gap-0.5 glow-primary"
            onClick={() => handleAdd('valid')}
          >
            <Target className="h-4 w-4" />
            <span className="text-[10px]">Válida</span>
          </Button>
        </div>

        {/* Sets list */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Séries registradas</h3>
          {exercise.sets.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma série registrada</p>
          ) : (
            exercise.sets.map((s) => {
              const config = setTypeConfig[s.type];
              return (
                <div key={s.id} className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border animate-slide-up">
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${config.className}`}>
                    {config.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground flex-1">
                    {s.weight}kg × {s.reps} reps
                  </span>
                  <button onClick={() => onRemoveSet(exerciseIdx, s.id)} className="p-1 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom: Next exercise / Finish */}
      <div className="px-5 py-4 border-t border-border">
        {isLastExercise ? (
          <Button className="w-full h-12 text-base font-semibold gap-2" onClick={onFinish}>
            <Check className="h-5 w-5" />
            Finalizar treino
          </Button>
        ) : (
          <Button className="w-full h-12 text-base font-semibold gap-2" onClick={onNext}>
            Próximo exercício
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseSetsSheet;
