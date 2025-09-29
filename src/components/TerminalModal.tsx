import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { X, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Server } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server | null;
}

export function TerminalModal({ isOpen, onClose, server }: TerminalModalProps) {
  const { toast } = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const initializeTerminal = () => {
    if (!terminalRef.current || !server) return;

    // Clean up existing terminal
    if (terminalInstance.current) {
      terminalInstance.current.dispose();
    }

    // Create new terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0b0f14',
        foreground: '#d1d5db',
        cursor: '#facc15',
        black: '#1f2937',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f9fafb',
        brightBlack: '#6b7280',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(terminalRef.current);
    fit.fit();

    terminalInstance.current = term;
    fitAddon.current = fit;

    // Handle resize
    const handleResize = () => {
      if (fitAddon.current && websocket.current?.readyState === WebSocket.OPEN) {
        fitAddon.current.fit();
        websocket.current.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows,
        }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  };

  const connectWebSocket = () => {
    console.log(server, !terminalInstance.current);
    if (!server || !terminalInstance.current) return;

    setIsConnecting(true);

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws/ssh';
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      const authData = password ? { password } : undefined;
      const message = {
        serverId: server.id,
        cols: terminalInstance.current!.cols,
        rows: terminalInstance.current!.rows,
        auth: authData,
      };

      ws.send(JSON.stringify(message));
      setIsConnected(true);
      setIsConnecting(false);

      toast({
        title: 'Connected',
        description: `Connected to ${server.name}`,
      });
    };

    ws.onmessage = (event) => {
      if (terminalInstance.current) {
        if (event.data instanceof ArrayBuffer) {
          terminalInstance.current.write(new Uint8Array(event.data));
        } else {
          terminalInstance.current.write(event.data);
        }
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setIsConnecting(false);

      if (terminalInstance.current) {
        terminalInstance.current.write('\r\n[Disconnected]\r\n');
      }

      if (event.code !== 1000) { // Not a normal closure
        toast({
          title: 'Connection Lost',
          description: `Disconnected from ${server?.name}`,
          variant: 'destructive',
        });
      }
    };

    ws.onerror = () => {
      setIsConnecting(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the SSH server',
        variant: 'destructive',
      });
    };

    // Handle terminal input
    terminalInstance.current.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    websocket.current = ws;
  };

  const handleConnect = () => {
    if (!terminalInstance.current) {
      const cleanup = initializeTerminal();
      // așteaptă până când DOM-ul a montat canvas-ul xterm
      requestAnimationFrame(() => connectWebSocket());
      return;
    }
    if (isConnected && websocket.current) {
      websocket.current.close();
      setTimeout(connectWebSocket, 100);
    } else {
      connectWebSocket();
    }
  };


  const handleClose = () => {
    if (websocket.current) {
      websocket.current.close();
    }
    if (terminalInstance.current) {
      terminalInstance.current.dispose();
    }
    setPassword('');
    setIsConnected(false);
    setIsConnecting(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen && server) {
      const cleanup = initializeTerminal();
      return cleanup;
    }
  }, [isOpen, server]);

  useEffect(() => {
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
      if (terminalInstance.current) {
        terminalInstance.current.dispose();
      }
    };
  }, []);

  if (!server) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{server.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="hidden sm:inline">
                {server.host}:{server.port}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isConnected && (
              <div className="flex items-center gap-2">
                <Label htmlFor="password" className="text-sm whitespace-nowrap hidden sm:block">
                  Password:
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Optional"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-24 sm:w-32 h-8"
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="sm"
              className="whitespace-nowrap"
            >
              {isConnecting ? (
                'Connecting...'
              ) : isConnected ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reconnect
                </>
              ) : (
                'Connect'
              )}
            </Button>

            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Terminal Container */}
        <div className="flex-1 p-4 bg-[#0b0f14] overflow-hidden">
          <div
            ref={terminalRef}
            className="h-full w-full rounded border border-border/50"
            style={{ minHeight: '300px' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}