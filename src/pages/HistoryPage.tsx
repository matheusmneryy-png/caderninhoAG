import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, History as HistoryIcon, Dumbbell, Activity, Trash2 } from 'lucide-react';
import { useWorkoutLogs } from '@/hooks/useWorkoutStore';
import { formatDuration } from '@/lib/progression';
import { toast } from 'sonner';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { logs, deleteLog } = useWorkoutLogs();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const finishedLogs = logs.filter(l => l.finishedAt);

  // Get unique exercise names for filtering
  const allExercises = Array.from(
    new Set(finishedLogs.flatMap(l => l.exercises.map(e => e.exerciseName)))
  );
  const [filterExercise, setFilterExercise] = useState('');

  const filtered = filterExercise
    ? finishedLogs.filter(l => l.exercises.some(e => e.exerciseName === filterExercise))
    : finishedLogs;

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Histórico</h1>
      </div>

      {/* Filter */}
      {allExercises.length > 0 && (
        <div className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                !filterExercise ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
              }`}
              onClick={() => setFilterExercise('')}
            >
              Todos
            </button>
            {allExercises.map(name => (
              <button
                key={name}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${
                  filterExercise === name ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
                }`}
                onClick={() => setFilterExercise(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HistoryIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum treino registrado</p>
          </div>
        ) : (
          filtered.map(log => {
            const duration = log.finishedAt
              ? Math.floor((new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
              : 0;
            const isExpanded = expandedId === log.id;
            const date = new Date(log.finishedAt!);

            return (
              <div key={log.id} className="bg-card rounded-xl border border-border overflow-hidden relative">
                <button
                  className="w-full p-4 text-left flex items-center justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{log.templateName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {date.toLocaleDateString('pt-BR')} · {formatDuration(duration)}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className="absolute top-4 right-12 z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Deseja realmente excluir este registro de treino?')) {
                        deleteLog(log.id);
                        toast.success('Registro excluído');
                      }
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-slide-up">
                    {log.exercises.map(ex => {
                      const validSets = ex.sets.filter(s => s.type === 'valid');
                      if (filterExercise && ex.exerciseName !== filterExercise) return null;
                      return (
                        <div key={ex.exerciseId} className="bg-secondary rounded-lg p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">{ex.exerciseName}</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {ex.sets.map(s => (
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
                          {validSets.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Melhor: {Math.max(...validSets.map(s => s.weight))}kg
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-3 flex items-center justify-around z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <Dumbbell className="h-5 w-5" />
          <span className="text-[10px] font-medium">Treinos</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-primary">
          <HistoryIcon className="h-5 w-5" />
          <span className="text-[10px] font-medium">Histórico</span>
        </button>
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Estatísticas</span>
        </button>
      </div>
    </div>
  );
};

export default HistoryPage;
