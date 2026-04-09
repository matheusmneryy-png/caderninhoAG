import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkoutTemplates } from '@/hooks/useWorkoutStore';
import { generateId } from '@/lib/progression';
import type { WorkoutTemplate, ExerciseTemplate } from '@/types/workout';
import { toast } from 'sonner';

const CreateEditWorkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { templates, loading, addTemplate, updateTemplate } = useWorkoutTemplates();

  const existing = id ? templates.find(t => t.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [exercises, setExercises] = useState<ExerciseTemplate[]>(
    existing?.exercises || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(!id);

  // Sync correctly when editing an existing template and it resolves asynchronously
  useEffect(() => {
    if (id && existing && !initialized) {
      setName(existing.name);
      setExercises(existing.exercises);
      setInitialized(true);
    }
  }, [id, existing, initialized]);

  useEffect(() => {
    if (id && !loading && !existing && !initialized) {
      toast.error('Treino não encontrado');
      navigate('/');
    }
  }, [id, loading, existing, initialized, navigate]);

  if (id && !initialized) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  const addExercise = () => {
    setExercises([...exercises, {
      id: generateId(),
      name: '',
      targetSets: 3,
      targetReps: 12,
    }]);
  };

  const updateExercise = (idx: number, updates: Partial<ExerciseTemplate>) => {
    setExercises(exercises.map((ex, i) => i === idx ? { ...ex, ...updates } : ex));
    // Clear errors for this field
    if (updates.targetSets !== undefined) {
      setErrors(prev => { const n = { ...prev }; delete n[`sets-${idx}`]; return n; });
    }
    if (updates.targetReps !== undefined) {
      setErrors(prev => { const n = { ...prev }; delete n[`reps-${idx}`]; return n; });
    }
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!name.trim() || exercises.length === 0) return;
    const filtered = exercises.filter(ex => ex.name.trim());
    if (filtered.length === 0) return;

    // Validate
    const newErrors: Record<string, string> = {};
    filtered.forEach((ex, idx) => {
      if (!ex.targetSets || ex.targetSets < 1) {
        newErrors[`sets-${idx}`] = 'Informe o número de séries';
      }
      if (!ex.targetReps || ex.targetReps < 1) {
        newErrors[`reps-${idx}`] = 'Informe o número de repetições';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const template: WorkoutTemplate = {
      id: existing?.id || generateId(),
      name: name.trim(),
      exercises: filtered,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (existing) {
        await updateTemplate(template);
      } else {
        await addTemplate(template);
      }
      toast.success('Treino salvo com sucesso');
      navigate('/');
    } catch (error) {
      console.error("Erro no handleSave:", error);
      toast.error('Erro ao salvar treino. Tente novamente');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">
          {existing ? 'Editar Treino' : 'Novo Treino'}
        </h1>
      </div>

      <div className="px-5 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Nome do treino</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Treino A - Peito"
            className="bg-card border-border text-foreground h-12 text-base"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Exercícios</h2>
            <span className="text-xs text-muted-foreground">{exercises.length} exercício{exercises.length !== 1 ? 's' : ''}</span>
          </div>

          {exercises.map((ex, idx) => (
            <div key={ex.id} className="bg-card rounded-xl p-4 border border-border animate-slide-up">
              <div className="flex items-start gap-2 mb-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                <Input
                  value={ex.name}
                  onChange={e => updateExercise(idx, { name: e.target.value })}
                  placeholder="Nome do exercício"
                  className="bg-secondary border-0 text-foreground h-10"
                />
                <button onClick={() => removeExercise(idx)} className="p-2 text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-3 pl-7">
                <div className="flex-1">
                  <label className="text-[11px] text-muted-foreground mb-1 block">Séries alvo</label>
                  <Input
                    type="number"
                    value={ex.targetSets === 0 ? '' : ex.targetSets}
                    onChange={e => {
                      const val = e.target.value;
                      updateExercise(idx, { targetSets: val === '' ? 0 : parseInt(val) || 0 });
                    }}
                    className={`bg-secondary border-0 h-10 text-center text-foreground ${errors[`sets-${idx}`] ? 'ring-2 ring-destructive' : ''}`}
                    min={1}
                  />
                  {errors[`sets-${idx}`] && (
                    <p className="text-[10px] text-destructive mt-1">{errors[`sets-${idx}`]}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-muted-foreground mb-1 block">Reps alvo</label>
                  <Input
                    type="number"
                    value={ex.targetReps === 0 ? '' : ex.targetReps}
                    onChange={e => {
                      const val = e.target.value;
                      updateExercise(idx, { targetReps: val === '' ? 0 : parseInt(val) || 0 });
                    }}
                    className={`bg-secondary border-0 h-10 text-center text-foreground ${errors[`reps-${idx}`] ? 'ring-2 ring-destructive' : ''}`}
                    min={1}
                  />
                  {errors[`reps-${idx}`] && (
                    <p className="text-[10px] text-destructive mt-1">{errors[`reps-${idx}`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="secondary"
            className="w-full h-12 gap-2 border border-dashed border-border"
            onClick={addExercise}
          >
            <Plus className="h-4 w-4" />
            Adicionar exercício
          </Button>
        </div>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSave}
          disabled={!name.trim() || exercises.filter(e => e.name.trim()).length === 0}
        >
          {existing ? 'Salvar alterações' : 'Criar treino'}
        </Button>
      </div>
    </div>
  );
};

export default CreateEditWorkout;
