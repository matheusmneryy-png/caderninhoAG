import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, History, Activity, TrendingUp, TrendingDown, Minus, Clock, Zap, User } from 'lucide-react';
import { useWorkoutLogs } from '@/hooks/useWorkoutStore';
import { formatDuration, calculateProgression } from '@/lib/progression';
import type { ProgressionSuggestion } from '@/types/workout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SuggestionIcon = ({ reason }: { reason: string }) => {
  if (reason === 'increase') return <TrendingUp className="h-5 w-5 text-valid mt-0.5 shrink-0" />;
  if (reason === 'decrease') return <TrendingDown className="h-5 w-5 text-destructive mt-0.5 shrink-0" />;
  return <Minus className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />;
};

const StatsPage = () => {
  const navigate = useNavigate();
  const { logs, getLastPerformance, getExerciseHistory } = useWorkoutLogs();

  const [selectedChartExercise, setSelectedChartExercise] = useState<string>('');

  const finishedLogs = useMemo(() => logs.filter(l => l.finishedAt), [logs]);

  const stats = useMemo(() => {
    let totalDuration = 0;
    let totalVolume = 0;
    let totalSets = 0;

    finishedLogs.forEach(log => {
      const start = new Date(log.startedAt).getTime();
      const end = new Date(log.finishedAt!).getTime();
      totalDuration += Math.floor((end - start) / 1000);

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

  const uniqueExercises = useMemo(() => {
    return Array.from(new Set(finishedLogs.flatMap(l => l.exercises || []).map(e => e.exerciseName)));
  }, [finishedLogs]);

  useEffect(() => {
    if (!selectedChartExercise && uniqueExercises.length > 0) {
      setSelectedChartExercise(uniqueExercises[0]);
    }
  }, [uniqueExercises, selectedChartExercise]);

  const chartData = useMemo(() => {
    if (!selectedChartExercise) return [];
    const history = getExerciseHistory(selectedChartExercise);
    return [...history].reverse().map(entry => {
      const validSets = entry.sets.filter(s => s.type === 'valid');
      const maxWeight = validSets.length > 0 ? Math.max(...validSets.map(s => s.weight)) : 0;
      return {
        date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        weight: maxWeight
      };
    }).filter(d => d.weight > 0);
  }, [selectedChartExercise, getExerciseHistory]);

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
              {stats.totalVolume > 1000 ? (stats.totalVolume / 1000).toFixed(2) + 'k' : stats.totalVolume.toFixed(2)}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
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

        {/* Progression Chart */}
        {uniqueExercises.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Evolução de Carga
              </h3>
              <select 
                className="bg-secondary text-xs text-foreground py-1 px-2 rounded-md border-0 ring-0 max-w-[140px] truncate"
                value={selectedChartExercise}
                onChange={(e) => setSelectedChartExercise(e.target.value)}
              >
                {uniqueExercises.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            
            {chartData.length < 2 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center px-4 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Registre este exercício em pelo menos 2 treinos para visualizar seu progresso em gráfico.</p>
              </div>
            ) : (
              <div className="h-44 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333' }}
                      itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}
                      formatter={(value: number) => [`${value}kg`, 'Carga Máx.']}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#111" }}
                      activeDot={{ r: 6, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

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
                    <span className="text-sm font-bold text-foreground">{s.currentWeight.toFixed(2)}kg</span>
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
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default StatsPage;
