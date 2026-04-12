import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Scale, Ruler, Calendar, VenusMars, Save, Dumbbell, History, Activity } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, loading, updateProfile, calculateBMI, getBMICategory } = useProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setWeight(profile.weight?.toString() || '');
      setHeight(profile.height?.toString() || '');
      setBirthDate(profile.birth_date || '');
      setGender(profile.gender || '');
    }
  }, [profile]);

  const bmi = calculateBMI(Number(weight), Number(height));
  const bmiCategory = getBMICategory(bmi);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        birth_date: birthDate || null,
        gender: gender || null,
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
      </div>

      <div className="px-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* BMI Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Scale className="h-16 w-16" />
          </div>
          <p className="text-sm text-muted-foreground mb-1 font-medium">Seu IMC Atual</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-foreground">
              {bmi ? bmi.toFixed(1) : '--'}
            </h2>
            {bmiCategory && (
              <span className={`text-sm font-bold ${bmiCategory.color}`}>
                ({bmiCategory.label})
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            O Índice de Massa Corporal (IMC) é uma medida internacional usada para calcular se uma pessoa está no peso ideal.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Nome de Exibição
            </Label>
            <Input
              id="display_name"
              placeholder="Como quer ser chamado?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-card border-border h-12 rounded-xl focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-card border-border h-12 rounded-xl focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Ruler className="h-3.5 w-3.5" />
                Altura (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-card border-border h-12 rounded-xl focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <VenusMars className="h-3.5 w-3.5" />
              Gênero
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="bg-card border-border h-12 rounded-xl">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="other">Outro / Prefiro não dizer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Data de Nascimento
            </Label>
            <Input
              id="birth_date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-card border-border h-12 rounded-xl focus:ring-primary"
            />
          </div>
        </div>

        <Button 
          className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
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
        <button onClick={() => navigate('/stats')} className="flex flex-col items-center gap-1 text-muted-foreground">
          <Activity className="h-5 w-5" />
          <span className="text-[10px] font-medium">Estatísticas</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-primary">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
