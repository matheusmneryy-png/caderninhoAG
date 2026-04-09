import { useState, useEffect } from 'react';
import { Plus, Play, History, Dumbbell, RotateCcw, LogOut, Activity, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutTemplates } from '@/hooks/useWorkoutStore';
import { getActiveWorkout } from '@/pages/ActiveWorkout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { WorkoutTemplate } from '@/types/workout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { templates, deleteTemplate } = useWorkoutTemplates();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const [holdId, setHoldId] = useState<string | null>(null);
  const activeWorkout = getActiveWorkout();

  useEffect(() => {
    const pendingImport = localStorage.getItem('pending_import_data');
    if (pendingImport && user) {
      localStorage.removeItem('pending_import_data');
      navigate(`/import?data=${pendingImport}`);
    }
  }, [user, navigate]);

  const handleShare = (template: WorkoutTemplate) => {
    try {
      // Create a simplified version for sharing (no IDs, no timestamps)
      const shareData = {
        name: template.name,
        exercises: template.exercises.map(ex => ({
          name: ex.name,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps
        }))
      };
      
      const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
      const shareUrl = `${window.location.origin}/import?data=${encodedData}`;

      if (navigator.share) {
        navigator.share({
          title: `Meu treino: ${template.name}`,
          text: `Confira meu treino "${template.name}" no Caderninho!`,
          url: shareUrl,
        }).catch(() => {
          // Fallback to clipboard if share was cancelled or failed
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link do treino copiado!');
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link do treino copiado!');
      }
    } catch (error) {
      console.error('Error sharing workout:', error);
      toast.error('Erro ao gerar link de compartilhamento');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Meus Treinos</h1>
          </div>
          <button onClick={signOut} className="p-2 text-muted-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <p className="text-muted-foreground text-sm">Registre e acompanhe sua evolução</p>
      </div>

      {/* Active workout banner */}
      {activeWorkout && (
        <div className="px-5 mb-4">
          <button
            className="w-full bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-3 text-left"
            onClick={() => navigate(`/workout/${activeWorkout.templateId}`)}
          >
            <RotateCcw className="h-6 w-6 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Treino em andamento</p>
              <p className="text-xs text-muted-foreground">{activeWorkout.templateName}</p>
            </div>
            <Button size="sm" className="shrink-0">Continuar</Button>
          </button>
        </div>
      )}

      {/* Workout List */}
      <div className="px-5 space-y-3">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">Nenhum treino criado ainda</p>
            <Button onClick={() => navigate('/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar primeiro treino
            </Button>
          </div>
        ) : (
          templates.map(template => (
            <div
              key={template.id}
              className="bg-card rounded-xl p-4 card-hover border border-border"
              onTouchStart={() => setHoldId(template.id)}
              onTouchEnd={() => setHoldId(null)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {template.exercises.length} exercício{template.exercises.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {template.exercises.slice(0, 3).map(ex => (
                  <span key={ex.id} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {ex.name}
                  </span>
                ))}
                {template.exercises.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{template.exercises.length - 3}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => navigate(`/workout/${template.id}`)}
                >
                  <Play className="h-3.5 w-3.5" />
                  Iniciar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate(`/edit/${template.id}`)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3"
                  onClick={() => handleShare(template)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {holdId === template.id && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-3 flex items-center justify-around z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-primary">
          <Dumbbell className="h-5 w-5" />
          <span className="text-[10px] font-medium">Treinos</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <History className="h-5 w-5" />
          <span className="text-[10px] font-medium">Histórico</span>
        </button>
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Estatísticas</span>
        </button>
      </div>

      {/* FAB */}
      {templates.length > 0 && (
        <button
          className="fab animate-pulse-green"
          onClick={() => navigate('/create')}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Dashboard;
