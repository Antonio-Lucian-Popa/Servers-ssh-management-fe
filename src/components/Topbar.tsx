import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onAddServer: () => void;
}

export function Topbar({ onAddServer }: TopbarProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">SSH Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                Import Servers
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Export Servers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}