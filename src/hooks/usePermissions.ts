import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { currentRole, currentEmployeeId } = useAuth();

  // "owner", "manager", "receptionist" têm acesso total à agenda
  const isManagerOrOwner = currentRole === 'owner' || currentRole === 'manager';
  
  // "receptionist" pode ver tudo na agenda mas não pode ver finanças profundas, por exemplo.
  const canSeeAllSchedules = isManagerOrOwner || currentRole === 'receptionist';
  
  // Apenas donos e gerentes veem o faturamento financeiro completo
  const canSeeFinancials = isManagerOrOwner;

  // Um profissional ("professional") vê apenas os próprios agendamentos e seu próprio faturamento
  const isProfessionalOnly = currentRole === 'professional';

  return {
    currentRole,
    currentEmployeeId,
    isManagerOrOwner,
    canSeeAllSchedules,
    canSeeFinancials,
    isProfessionalOnly
  };
}
