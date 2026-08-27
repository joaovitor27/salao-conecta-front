import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { currentRole, currentEmployeeId } = useAuth();

  const isManagerOrOwner = currentRole === 'owner' || currentRole === 'manager';
  
  const canSeeAllSchedules = true; // Everyone who can login can see all schedules
  
  const canSeeFinancials = isManagerOrOwner || currentRole === 'financial';
  
  const canManageSchedules = isManagerOrOwner || currentRole === 'receptionist';
  
  const canManageCustomers = isManagerOrOwner || currentRole === 'receptionist';

  return {
    currentRole,
    currentEmployeeId,
    isManagerOrOwner,
    canSeeAllSchedules,
    canSeeFinancials,
    canManageSchedules,
    canManageCustomers
  };
}
