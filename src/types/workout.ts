export type SetType = 'warmup' | 'preparation' | 'valid';

export interface ExerciseSet {
  id: string;
  type: SetType;
  weight: number;
  reps: number;
  completedAt?: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: string;
  templateId: string;
  templateName: string;
  startedAt: string;
  finishedAt?: string;
  exercises: ExerciseLog[];
}

export interface ProgressionSuggestion {
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: 'increase' | 'maintain' | 'decrease';
  message: string;
}
