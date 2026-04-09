import type { ExerciseLog, ProgressionSuggestion } from '@/types/workout';

export function calculateProgression(
  exercise: ExerciseLog,
  lastPerformance: ExerciseLog | null
): ProgressionSuggestion | null {
  const validSets = exercise.sets.filter(s => s.type === 'valid');
  if (validSets.length === 0) return null;

  const avgWeight = validSets.reduce((sum, s) => sum + s.weight, 0) / validSets.length;
  const allMetTarget = validSets.length >= exercise.targetSets &&
    validSets.every(s => s.reps >= exercise.targetReps);

  if (allMetTarget) {
    const increase = avgWeight >= 40 ? 5 : 2.5;
    return {
      exerciseName: exercise.exerciseName,
      currentWeight: avgWeight,
      suggestedWeight: avgWeight + increase,
      reason: 'increase',
      message: `Meta atingida! Aumente para ${avgWeight + increase}kg`,
    };
  }

  if (lastPerformance) {
    const lastValid = lastPerformance.sets.filter(s => s.type === 'valid');
    const lastAvg = lastValid.length > 0
      ? lastValid.reduce((sum, s) => sum + s.reps, 0) / lastValid.length
      : 0;
    const currentAvg = validSets.reduce((sum, s) => sum + s.reps, 0) / validSets.length;

    if (lastAvg > 0 && currentAvg < lastAvg * 0.8) {
      const decrease = avgWeight >= 40 ? 5 : 2.5;
      return {
        exerciseName: exercise.exerciseName,
        currentWeight: avgWeight,
        suggestedWeight: Math.max(0, avgWeight - decrease),
        reason: 'decrease',
        message: `Desempenho caiu. Considere reduzir para ${Math.max(0, avgWeight - decrease)}kg`,
      };
    }
  }

  return {
    exerciseName: exercise.exerciseName,
    currentWeight: avgWeight,
    suggestedWeight: avgWeight,
    reason: 'maintain',
    message: `Mantenha ${avgWeight}kg e tente atingir a meta`,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
