import { useState } from 'react';
import { Terminal, CreditCard as Edit, Trash2, MoveVertical as MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Server } from '@/lib/api';

interface ServerCardProps {
  server: Server;
  onEdit: (server: Server) => void;
  onDelete: (server: Server) => void;
  onOpenTerminal: (server: Server) => void;
}

export function ServerCard({ server, onEdit, onDelete, onOpenTerminal }: ServerCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOpenTerminal = () => {
    setIsConnecting(true);
    onOpenTerminal(server);
    // Reset connecting state after a delay
    setTimeout(() => setIsConnecting(false), 1000);
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold truncate">{server.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {server.host}:{server.port} • {server.username}
            </p>
          </div>
          
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpenTerminal} disabled={isConnecting}>
                  <Terminal className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Open SSH'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(server)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(server)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {server.tags && server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {server.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {server.note && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {server.note}
          </p>
        )}
        
        <div className="hidden sm:flex gap-2">
          <Button
            onClick={handleOpenTerminal}
            size="sm"
            disabled={isConnecting}
            className="flex-1"
          >
            <Terminal className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Open SSH'}
          </Button>
          <Button
            onClick={() => onEdit(server)}
            variant="outline"
            size="sm"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(server)}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}