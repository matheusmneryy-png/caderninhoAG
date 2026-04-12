import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Clock, Dumbbell, Share2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutLogs } from '@/hooks/useWorkoutStore';
import { useProfile } from '@/hooks/useProfile';
import { calculateProgression, formatDuration } from '@/lib/progression';
import type { WorkoutLog, ProgressionSuggestion } from '@/types/workout';

const WorkoutSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLastPerformance } = useWorkoutLogs();
  const { profile, estimateCalories } = useProfile();

  const workout = location.state?.workout as WorkoutLog | undefined;

  if (!workout) {
    navigate('/');
    return null;
  }

  const duration = workout.finishedAt
    ? Math.floor((new Date(workout.finishedAt).getTime() - new Date(workout.startedAt).getTime()) / 1000)
    : 0;

  const calories = estimateCalories(profile?.weight || null, duration);

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalValidSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.type === 'valid').length, 0
  );

  const suggestions: ProgressionSuggestion[] = workout.exercises
    .map(ex => calculateProgression(ex, getLastPerformance(ex.exerciseName)))
    .filter((s): s is ProgressionSuggestion => s !== null);

  const handleShare = async () => {
    const text = `🏋️ ${workout.templateName}\n⏱ ${formatDuration(duration)}\n💪 ${totalValidSets} séries válidas\n\n${
      workout.exercises.map(ex => {
        const valid = ex.sets.filter(s => s.type === 'valid');
        return `${ex.exerciseName}: ${valid.map(s => `${s.weight}kg×${s.reps}`).join(', ')}`;
      }).join('\n')
    }`;

    if (navigator.share) {
      try {
        await navigator.share({ title: workout.templateName, text: text + (calories > 0 ? `\n🔥 ${calories} kcal estimadas` : '') });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text + (calories > 0 ? `\n🔥 ${calories} kcal estimadas` : ''));
    }
  };

  const SuggestionIcon = ({ reason }: { reason: string }) => {
    if (reason === 'increase') return <TrendingUp className="h-4 w-4 text-valid" />;
    if (reason === 'decrease') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Resumo</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Stats */}
        <div className="bg-card rounded-xl p-5 border border-border text-center">
          <h2 className="text-lg font-bold text-foreground mb-4">{workout.templateName}</h2>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{formatDuration(duration)}</p>
              <p className="text-[10px] text-muted-foreground">Duração</p>
            </div>
            <div>
              <Dumbbell className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{workout.exercises.length}</p>
              <p className="text-[10px] text-muted-foreground">Exercícios</p>
            </div>
            <div>
              <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">{totalValidSets}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{totalSets}</p>
              <p className="text-[10px] text-muted-foreground">Séries</p>
            </div>
            <div>
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{calories > 0 ? calories : '--'}</p>
              <p className="text-[10px] text-muted-foreground">Kcal Est.</p>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-2">Sugestões de Progressão</h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3 animate-slide-up">
                  <SuggestionIcon reason={s.reason} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{s.exerciseName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 h-12" onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
          <Button variant="secondary" className="h-12 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;
