import { Plus, Menu, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

interface TopbarProps {
  onAddServer: () => void;
}

export function Topbar({ onAddServer }: TopbarProps) {
  const { user, logout } = useAuth();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">SSH Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Server */}
          {user && (
            <>
              <Button
                onClick={onAddServer}
                className="hidden sm:inline-flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Server
              </Button>
              <Button
                onClick={onAddServer}
                size="icon"
                className="sm:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setOpenLogin(true)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpenRegister(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={openLogin} onOpenChange={setOpenLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setOpenLogin(false)} />
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={openRegister} onOpenChange={setOpenRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create account</DialogTitle>
          </DialogHeader>
          <RegisterForm onSuccess={() => setOpenRegister(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
