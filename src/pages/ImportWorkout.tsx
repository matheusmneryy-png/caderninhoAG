import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutTemplates } from '@/hooks/useWorkoutStore';
import { generateId } from '@/lib/progression';
import type { WorkoutTemplate, ExerciseTemplate } from '@/types/workout';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ImportWorkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTemplate } = useWorkoutTemplates();
  const { user, loading: authLoading } = useAuth();
  
  const [workoutData, setWorkoutData] = useState<Partial<WorkoutTemplate> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setError('Nenhum dado de treino encontrado no link.');
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(atob(data)));
      if (!decoded.name || !Array.isArray(decoded.exercises)) {
        throw new Error('Formato de treino inválido');
      }
      setWorkoutData(decoded);
    } catch (err) {
      console.error('Error decoding workout data:', err);
      setError('O link de compartilhamento parece estar corrompido ou é inválido.');
    }
  }, [searchParams]);

  const handleImport = async () => {
    if (!workoutData) return;
    if (!user) {
      // Store pending import and redirect to auth
      localStorage.setItem('pending_import_data', searchParams.get('data') || '');
      toast.info('Faça login para salvar o treino');
      navigate('/auth');
      return;
    }

    setImporting(true);
    try {
      const newTemplate: WorkoutTemplate = {
        id: generateId(),
        name: workoutData.name || 'Treino Importado',
        exercises: (workoutData.exercises || []).map(ex => ({
          id: generateId(),
          name: ex.name,
          targetSets: ex.targetSets || 3,
          targetReps: ex.targetReps || 12
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addTemplate(newTemplate);
      toast.success('Treino importado com sucesso!');
      navigate('/');
    } catch (err) {
      console.error('Error importing workout:', err);
      toast.error('Ocorreu um erro ao importar o treino.');
    } finally {
      setImporting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
          <ArrowLeft className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Ops! Link Inválido</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/')} variant="outline">Voltar para o Dashboard</Button>
      </div>
    );
  }

  if (!workoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground truncate flex-1">
          Importar Treino
        </h1>
      </div>

      <div className="px-5 space-y-6">
        <div className="bg-card rounded-xl p-5 border border-border text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{workoutData.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {workoutData.exercises?.length} exercícios encontrados
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground px-1">Visualização do Treino</h3>
          {workoutData.exercises?.map((ex, idx) => (
            <div key={idx} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{ex.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ex.targetSets} séries × {ex.targetReps} reps
                </p>
              </div>
              <Check className="h-4 w-4 text-primary opacity-50" />
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/95 backdrop-blur border-t border-border z-10">
        <Button 
          className="w-full h-12 text-base font-semibold gap-2" 
          onClick={handleImport}
          disabled={importing || authLoading}
        >
          {importing ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Salvar nos meus treinos
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ImportWorkout;
