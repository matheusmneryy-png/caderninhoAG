import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, History, Activity, TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';
import { useWorkoutLogs } from '@/hooks/useWorkoutStore';
import { formatDuration, calculateProgression } from '@/lib/progression';
import type { ProgressionSuggestion } from '@/types/workout';

const SuggestionIcon = ({ reason }: { reason: string }) => {
  if (reason === 'increase') return <TrendingUp className="h-5 w-5 text-valid mt-0.5 shrink-0" />;
  if (reason === 'decrease') return <TrendingDown className="h-5 w-5 text-destructive mt-0.5 shrink-0" />;
  return <Minus className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />;
};

const StatsPage = () => {
  const navigate = useNavigate();
  const { logs, getLastPerformance } = useWorkoutLogs();

  const finishedLogs = useMemo(() => logs.filter(l => l.finishedAt), [logs]);

  const stats = useMemo(() => {
    let totalDuration = 0;
    let totalVolume = 0;
    let totalSets = 0;

    finishedLogs.forEach(log => {
      const start = new Date(log.startedAt).getTime();
      const end = new Date(log.finishedAt!).getTime();
      totalDuration += (end - start) / 1000;

      (log.exercises || []).forEach(ex => {
        (ex.sets || []).forEach(set => {
          if (set.type === 'valid') {
            totalVolume += set.weight * set.reps;
            totalSets += 1;
          }
        });
      });
    });

    return {
      workoutsCount: finishedLogs.length,
      totalVolume,
      totalSets,
      totalDuration
    };
  }, [finishedLogs]);

  const suggestions = useMemo(() => {
    const suggs: ProgressionSuggestion[] = [];
    const exNames = new Set<string>();
    
    finishedLogs.forEach(l => (l.exercises || []).forEach(e => exNames.add(e.exerciseName)));

    exNames.forEach(name => {
      const currentPerf = getLastPerformance(name);
      if (!currentPerf) return;

      let foundCurrent = false;
      let lastPerf = null;
      for (const log of finishedLogs) {
        for (const ex of (log.exercises || [])) {
          if (ex.exerciseName === name) {
            if (!foundCurrent) {
              foundCurrent = true;
            } else {
              lastPerf = ex;
              break;
            }
          }
        }
        if (lastPerf) break;
      }

      const suggestion = calculateProgression(currentPerf, lastPerf);
      if (suggestion) {
        suggs.push(suggestion);
      }
    });

    return suggs;
  }, [finishedLogs, getLastPerformance]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Activity className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Estatísticas</h1>
        </div>
        <p className="text-muted-foreground text-sm">Acompanhe seu desempenho e receba dicas</p>
      </div>

      <div className="px-5 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between">
            <h3 className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><Dumbbell className="h-3 w-3" /> Treinos Concluídos</h3>
            <p className="text-3xl font-bold text-foreground">{stats.workoutsCount}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between">
            <h3 className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><Zap className="h-3 w-3" /> Volume Levantado</h3>
            <p className="text-3xl font-bold text-foreground">
              {stats.totalVolume > 1000 ? (stats.totalVolume / 1000).toFixed(1) + 'k' : stats.totalVolume}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between">
            <h3 className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Séries Válidas</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalSets}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border flex flex-col justify-between">
            <h3 className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Tempo de Treino</h3>
            <p className="text-2xl font-bold text-foreground">{formatDuration(stats.totalDuration)}</p>
          </div>
        </div>

        {/* Suggestions & Insights */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dicas Analíticas
          </h2>
          
          {suggestions.length === 0 ? (
            <div className="bg-card rounded-xl p-6 text-center border border-border">
              <p className="text-sm text-muted-foreground">Complete mais treinos para ver dicas personalizadas de progressão de carga!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                  <SuggestionIcon reason={s.reason} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{s.exerciseName}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.message}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Atual</span>
                    <span className="text-sm font-bold text-foreground">{s.currentWeight}kg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-3 flex items-center justify-around z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <Dumbbell className="h-5 w-5" />
          <span className="text-[10px] font-medium">Treinos</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <History className="h-5 w-5" />
          <span className="text-[10px] font-medium">Histórico</span>
        </button>
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center gap-1 text-primary">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Estatísticas</span>
        </button>
      </div>
    </div>
  );
};

export default StatsPage;
