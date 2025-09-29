import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, googleAuthUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const resp = await login(email, password);
      setAuth(resp);
      onSuccess?.();
      toast({ title: "Welcome back!", description: resp.user.email });
    } catch (e: any) {
      toast({ title: "Login failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input value={email} onChange={e=>setEmail(e.target.value)} required type="email" placeholder="you@example.com" />
      </div>
      <div className="grid gap-2">
        <Label>Password</Label>
        <Input value={password} onChange={e=>setPassword(e.target.value)} required type="password" />
      </div>
      <Button className="w-full" disabled={busy} type="submit">{busy ? '...' : 'Login'}</Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => window.location.href = googleAuthUrl()}>
        Continue with Google
      </Button>
    </form>
  );
}
