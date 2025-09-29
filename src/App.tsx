import { useState, useEffect } from 'react';
import { Topbar } from '@/components/Topbar';
import { ServerCard } from '@/components/ServerCard';
import { ServerForm } from '@/components/ServerForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TerminalModal } from '@/components/TerminalModal';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import {
  Server,
  CreateServerPayload,
  listServers,
  createServer,
  updateServer,
  deleteServer
} from '@/lib/api';
import { useAuth } from './context/AuthContext';

function App() {
  const { toast } = useToast();
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { logout, user } = useAuth();

  const { setAuth } = useAuth();

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('token');
  if (t) {
    // decodează minimal pentru a seta user-ul imediat
    const [, payloadB64] = t.split('.');
    try {
      const b64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(json);
      const user = payload?.id && payload?.email ? { id: payload.id, email: payload.email, name: payload.name } : null;
      if (user) setAuth({ token: t, user });
      else localStorage.setItem('token', t); // fallback minimal
    } catch {
      localStorage.setItem('token', t);
    }
    window.history.replaceState({}, '', window.location.pathname);
  }
}, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load servers on mount
 useEffect(() => {
  if (user) {
    loadServers();
  } else {
    setServers([]); // golește lista când nu e logat
  }
}, [user]);

  const loadServers = async () => {
    try {
      setIsLoading(true);
      const serverList = await listServers();
      setServers(serverList);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load servers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddServer = () => {
    setSelectedServer(null);
    setIsFormOpen(true);
  };

  const handleEditServer = (server: Server) => {
    setSelectedServer(server);
    setIsFormOpen(true);
  };

  const handleDeleteServer = (server: Server) => {
    setServerToDelete(server);
    setIsConfirmOpen(true);
  };

  const handleOpenTerminal = (server: Server) => {
    setSelectedServer(server);
    setIsTerminalOpen(true);
  };

  const handleSaveServer = async (payload: CreateServerPayload) => {
    if (selectedServer) {
      await updateServer(selectedServer.id, payload);
    } else {
      await createServer(payload);
    }
    await loadServers();
  };

  const handleConfirmDelete = async () => {
    if (serverToDelete) {
      try {
        await deleteServer(serverToDelete.id);
        await loadServers();
        toast({
          title: 'Success',
          description: 'Server deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete server',
          variant: 'destructive',
        });
      }
    }
    setIsConfirmOpen(false);
    setServerToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Topbar onAddServer={handleAddServer} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar onAddServer={handleAddServer} />

      <main className="container mx-auto px-4 py-8">
        {servers.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-2">No servers yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first SSH server
              </p>
              <button
                onClick={handleAddServer}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Your First Server
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onEdit={handleEditServer}
                onDelete={handleDeleteServer}
                onOpenTerminal={handleOpenTerminal}
              />
            ))}
          </div>
        )}
      </main>

      <ServerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveServer}
        server={selectedServer}
        isMobile={isMobile}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${serverToDelete?.name}?`}
        description="This action cannot be undone. All saved connection data will be lost."
        confirmText="Delete Server"
        isDestructive
      />

      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        server={selectedServer}
      />

      <Toaster />
    </div>
  );
}

export default App;