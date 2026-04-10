import type { ExerciseLog, ProgressionSuggestion } from '@/types/workout';

export function calculateProgression(
  exercise: ExerciseLog,
  lastPerformance: ExerciseLog | null
): ProgressionSuggestion | null {
  const validSets = (exercise.sets || []).filter(s => s.type === 'valid');
  if (validSets.length === 0) return null;

  // Usa o peso da última série válida ao invés da média
  const lastWeight = validSets[validSets.length - 1].weight;
  
  const allMetTarget = validSets.length >= (exercise.targetSets || 0) &&
    validSets.every(s => s.reps >= (exercise.targetReps || 0));

  if (allMetTarget) {
    const increase = lastWeight >= 40 ? 5 : 2.5;
    const suggested = parseFloat((lastWeight + increase).toFixed(2));
    return {
      exerciseName: exercise.exerciseName,
      currentWeight: parseFloat(lastWeight.toFixed(2)),
      suggestedWeight: suggested,
      reason: 'increase',
      message: `Meta atingida! Aumente para ${suggested.toFixed(2)}kg`,
    };
  }

  if (lastPerformance) {
    const lastValid = (lastPerformance.sets || []).filter(s => s.type === 'valid');
    const lastAvgReps = lastValid.length > 0
      ? lastValid.reduce((sum, s) => sum + s.reps, 0) / lastValid.length
      : 0;
    const currentAvgReps = validSets.reduce((sum, s) => sum + s.reps, 0) / validSets.length;

    if (lastAvgReps > 0 && currentAvgReps < lastAvgReps * 0.8) {
      const decrease = lastWeight >= 40 ? 5 : 2.5;
      const suggested = parseFloat(Math.max(0, lastWeight - decrease).toFixed(2));
      return {
        exerciseName: exercise.exerciseName,
        currentWeight: parseFloat(lastWeight.toFixed(2)),
        suggestedWeight: suggested,
        reason: 'decrease',
        message: `Desempenho caiu. Considere reduzir para ${suggested.toFixed(2)}kg`,
      };
    }
  }

  return {
    exerciseName: exercise.exerciseName,
    currentWeight: parseFloat(lastWeight.toFixed(2)),
    suggestedWeight: parseFloat(lastWeight.toFixed(2)),
    reason: 'maintain',
    message: `Mantenha ${lastWeight.toFixed(2)}kg e tente atingir a meta`,
  };
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
