import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [signingIn, setSigningIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSigningIn(true);
      const res = await fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      const role = data?.data?.role === 'admin' ? 'admin' : 'user';
      const apiName = data?.data?.name || data?.name;
      const email = formData.email;
      const name = apiName || email.split('@')[0].split(/[._-]/).map((s: string) => s ? s[0].toUpperCase() + s.slice(1) : s).join(' ');
      try {
        localStorage.setItem('app_user', JSON.stringify({ name, email }));
      } catch {
        void 0;
      }
      toast({ title: 'Welcome back!', description: role === 'admin' ? 'Redirecting to admin dashboard' : 'Login successful' });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <header className="w-screen px-4 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Softwate Requiremnet Bot" className="w-12 h-12 rounded-xl object-contain" />
            <span className="font-semibold text-2xl">Softwate Requiremnet Bot</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={signingIn}>
                {signingIn ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
