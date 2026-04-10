export interface ExerciseInfo {
  name: string;
  group: 'PEITO' | 'COSTAS' | 'OMBROS' | 'PERNAS' | 'BRAÇOS' | 'CORE';
  type: 'Máquina' | 'Peso Livre' | 'Cabo' | 'Peso Corporal';
}

export const PREDEFINED_EXERCISES: ExerciseInfo[] = [
  // PEITO
  { name: 'Chest Press Reto', group: 'PEITO', type: 'Máquina' },
  { name: 'Chest Press Inclinado', group: 'PEITO', type: 'Máquina' },
  { name: 'Chest Press Declinado', group: 'PEITO', type: 'Máquina' },
  { name: 'Pec Deck (Voador)', group: 'PEITO', type: 'Máquina' },
  { name: 'Supino Articulado Máquina', group: 'PEITO', type: 'Máquina' },
  { name: 'Supino Reto (Barra/Halter)', group: 'PEITO', type: 'Peso Livre' },
  { name: 'Supino Inclinado (Barra/Halter)', group: 'PEITO', type: 'Peso Livre' },
  { name: 'Supino Declinado (Barra/Halter)', group: 'PEITO', type: 'Peso Livre' },
  { name: 'Crucifixo com Halteres', group: 'PEITO', type: 'Peso Livre' },
  { name: 'Cross Over Alto', group: 'PEITO', type: 'Cabo' },
  { name: 'Cross Over Médio', group: 'PEITO', type: 'Cabo' },
  { name: 'Cross Over Baixo', group: 'PEITO', type: 'Cabo' },

  // COSTAS
  { name: 'Puxada Alta Frente', group: 'COSTAS', type: 'Máquina' },
  { name: 'Puxada Alta Atrás', group: 'COSTAS', type: 'Máquina' },
  { name: 'Remada Baixa', group: 'COSTAS', type: 'Máquina' },
  { name: 'Remada Articulada', group: 'COSTAS', type: 'Máquina' },
  { name: 'Pulldown Unilateral', group: 'COSTAS', type: 'Máquina' },
  { name: 'Máquina de Pull-over', group: 'COSTAS', type: 'Máquina' },
  { name: 'Remada Curvada', group: 'COSTAS', type: 'Peso Livre' },
  { name: 'Remada Unilateral (Serrote)', group: 'COSTAS', type: 'Peso Livre' },
  { name: 'Levantamento Terra', group: 'COSTAS', type: 'Peso Livre' },
  { name: 'Puxada na Polia', group: 'COSTAS', type: 'Cabo' },
  { name: 'Remada na Polia', group: 'COSTAS', type: 'Cabo' },
  { name: 'Barra Fixa (Pullup)', group: 'COSTAS', type: 'Peso Corporal' },

  // OMBROS
  { name: 'Shoulder Press', group: 'OMBROS', type: 'Máquina' },
  { name: 'Elevação Lateral Máquina', group: 'OMBROS', type: 'Máquina' },
  { name: 'Elevação Frontal Máquina', group: 'OMBROS', type: 'Máquina' },
  { name: 'Reverse Fly (Posterior)', group: 'OMBROS', type: 'Máquina' },
  { name: 'Desenvolvimento c/ Halter', group: 'OMBROS', type: 'Peso Livre' },
  { name: 'Desenvolvimento c/ Barra', group: 'OMBROS', type: 'Peso Livre' },
  { name: 'Elevação Lateral Halter', group: 'OMBROS', type: 'Peso Livre' },
  { name: 'Elevação Frontal Halter', group: 'OMBROS', type: 'Peso Livre' },
  { name: 'Elevação Lateral no Cabo', group: 'OMBROS', type: 'Cabo' },
  { name: 'Face Pull', group: 'OMBROS', type: 'Cabo' },

  // PERNAS
  { name: 'Leg Press 45°', group: 'PERNAS', type: 'Máquina' },
  { name: 'Leg Press Horizontal', group: 'PERNAS', type: 'Máquina' },
  { name: 'Hack Machine', group: 'PERNAS', type: 'Máquina' },
  { name: 'Agachamento Guiado (Smith)', group: 'PERNAS', type: 'Máquina' },
  { name: 'Extensora', group: 'PERNAS', type: 'Máquina' },
  { name: 'Flexora Sentado', group: 'PERNAS', type: 'Máquina' },
  { name: 'Flexora Deitado', group: 'PERNAS', type: 'Máquina' },
  { name: 'Flexora em Pé', group: 'PERNAS', type: 'Máquina' },
  { name: 'Abdutora', group: 'PERNAS', type: 'Máquina' },
  { name: 'Adutora', group: 'PERNAS', type: 'Máquina' },
  { name: 'Glute Machine (Coice)', group: 'PERNAS', type: 'Máquina' },
  { name: 'Hip Thrust Máquina', group: 'PERNAS', type: 'Máquina' },
  { name: 'Panturrilha Sentado', group: 'PERNAS', type: 'Máquina' },
  { name: 'Panturrilha em Pé', group: 'PERNAS', type: 'Máquina' },
  { name: 'Agachamento Livre', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Agachamento Frontal', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Levantamento Terra Romeno', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Stiff', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Afundo (Lunge)', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Passada', group: 'PERNAS', type: 'Peso Livre' },
  { name: 'Coice no Cabo', group: 'PERNAS', type: 'Cabo' },
  { name: 'Abdução no Cabo', group: 'PERNAS', type: 'Cabo' },
  { name: 'Adução no Cabo', group: 'PERNAS', type: 'Cabo' },

  // BRAÇOS
  { name: 'Rosca Bíceps Máquina', group: 'BRAÇOS', type: 'Máquina' },
  { name: 'Tríceps Máquina', group: 'BRAÇOS', type: 'Máquina' },
  { name: 'Tríceps Testa Máquina', group: 'BRAÇOS', type: 'Máquina' },
  { name: 'Rosca Direta', group: 'BRAÇOS', type: 'Peso Livre' },
  { name: 'Rosca Alternada', group: 'BRAÇOS', type: 'Peso Livre' },
  { name: 'Rosca Martelo', group: 'BRAÇOS', type: 'Peso Livre' },
  { name: 'Tríceps Testa Halter/Barra', group: 'BRAÇOS', type: 'Peso Livre' },
  { name: 'Tríceps Francês Halter', group: 'BRAÇOS', type: 'Peso Livre' },
  { name: 'Rosca Direta no Cabo', group: 'BRAÇOS', type: 'Cabo' },
  { name: 'Rosca Martelo no Cabo', group: 'BRAÇOS', type: 'Cabo' },
  { name: 'Tríceps Corda', group: 'BRAÇOS', type: 'Cabo' },
  { name: 'Tríceps Barra', group: 'BRAÇOS', type: 'Cabo' },
  { name: 'Tríceps Unilateral Cabo', group: 'BRAÇOS', type: 'Cabo' },

  // CORE
  { name: 'Abdominal Supra', group: 'CORE', type: 'Peso Corporal' },
  { name: 'Abdominal Infra', group: 'CORE', type: 'Peso Corporal' },
  { name: 'Prancha Isométrica', group: 'CORE', type: 'Peso Corporal' },
  { name: 'Russian Twist', group: 'CORE', type: 'Peso Livre' },
  { name: 'Abdominal Curvado no Cabo', group: 'CORE', type: 'Cabo' },
];
