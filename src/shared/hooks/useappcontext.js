import { useAuth } from '@/identity';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissions } from '@/identity';

/**
 * useAppContext — single hook for the three most commonly co-consumed app-level contexts.
 * Eliminates the 3-line boilerplate (useAuth + useWorkspace + usePermissions) repeated in ~40+ files.
 */
export function useAppContext() {
  const auth = useAuth();
  const workspace = useWorkspace();
  const permissions = usePermissions();

  return {
    user: auth.user,
    logout: auth.logout,
    ...workspace,
    ...permissions,
  };
}
