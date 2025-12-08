import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [sendingResetOtp, setSendingResetOtp] = useState(false);
  const [verifyingResetOtp, setVerifyingResetOtp] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleSendResetOtp = async () => {
    try {
      if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
        toast({ title: "Invalid email", description: "Enter a valid email address", variant: "destructive" });
        return;
      }
      setSendingResetOtp(true);
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send OTP");
      toast({ title: "OTP sent", description: data.previewUrl ? `Preview: ${data.previewUrl}` : "Check your email for the code" });
      setForgotStep("otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSendingResetOtp(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    try {
      if (!resetOtp || resetOtp.length !== 6) {
        toast({ title: "Invalid OTP", description: "Enter the 6-digit code", variant: "destructive" });
        return;
      }
      setVerifyingResetOtp(true);
      const res = await fetch("/api/forgot-password-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: resetOtp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Verification failed");
      toast({ title: "Verified", description: "Enter a new password" });
      setForgotStep("reset");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setVerifyingResetOtp(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!newPass || !confirmNewPass) {
        toast({ title: "Required", description: "Enter and confirm your new password", variant: "destructive" });
        return;
      }
      if (newPass !== confirmNewPass) {
        toast({ title: "Mismatch", description: "Passwords must match", variant: "destructive" });
        return;
      }
      if (newPass.length < 8) {
        toast({ title: "Too short", description: "Password must be at least 8 characters", variant: "destructive" });
        return;
      }
      setUpdatingPassword(true);
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: resetOtp, newPassword: newPass, confirmPassword: confirmNewPass }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update password");
      toast({ title: "Password updated", description: "You can now sign in" });
      setForgotOpen(false);
      navigate("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setUpdatingPassword(false);
    }
  };

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
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  setForgotEmail("");
                  setResetOtp("");
                  setNewPass("");
                  setConfirmNewPass("");
                  setForgotStep("email");
                  setForgotOpen(true);
                }}
              >
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
        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Follow the steps to reset your account password</DialogDescription>
            </DialogHeader>

            {forgotStep === "email" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleSendResetOtp} disabled={sendingResetOtp}>
                    {sendingResetOtp ? "Sending..." : "Validate & Send OTP"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {forgotStep === "otp" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp">Verification Code</Label>
                  <Input
                    id="reset-otp"
                    inputMode="numeric"
                    pattern="\\d{6}"
                    maxLength={6}
                    placeholder="123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setForgotStep("email")}>Back</Button>
                  <Button onClick={handleVerifyResetOtp} disabled={verifyingResetOtp}>
                    {verifyingResetOtp ? "Verifying..." : "Verify"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {forgotStep === "reset" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setForgotStep("otp")}>Back</Button>
                  <Button onClick={handleUpdatePassword} disabled={updatingPassword}>
                    {updatingPassword ? "Updating..." : "Set New Password"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
