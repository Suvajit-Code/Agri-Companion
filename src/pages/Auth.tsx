import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Eye, EyeOff, Mail, Lock, User, Phone,
  CheckCircle2, XCircle, ArrowRight, ArrowLeft,
  MapPin, Wheat, Loader2,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

type AuthMode = "login" | "signup" | "forgot";

export default function Auth() {
  const { isAuthenticated, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [farmSize, setFarmSize] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");

  // Check network connectivity
  const checkNetworkStatus = () => {
    if (!navigator.onLine) {
      return "You are offline. Please check your internet connection.";
    }
    return null;
  };

  const handleNetworkError = (error: unknown) => {
    const err = error as any;
    const errorMsg = err?.message || String(err);

    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("ERR_NAME_NOT_RESOLVED")) {
      return "Network error: Can't reach authentication server. Check your internet connection or try a different WiFi/network.";
    }
    if (errorMsg.includes("timeout")) {
      return "Request timed out. Network is slow - try again.";
    }
    return errorMsg;
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getPasswordStrength(signupPassword);
  const strengthLabel = ["", "Weak", "Fair", "Medium", "Strong", "Very Strong"][strength] || "";
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-warning", "bg-success", "bg-success"][strength] || "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const netError = checkNetworkStatus();
    if (netError) {
      toast({ title: "Network Issue", description: netError, variant: "destructive" });
      return;
    }

    if (!loginEmail || !loginPassword) {
      toast({ title: "Error", description: "Email and password required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(loginEmail, loginPassword);
      if (result.error) {
        const errMsg = handleNetworkError(result.error);
        toast({ title: "Login Failed", description: errMsg, variant: "destructive" });
      } else {
        toast({ title: "Login Successful!", description: "Redirecting to dashboard..." });
      }
    } catch (err) {
      const errMsg = handleNetworkError(err);
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const netError = checkNetworkStatus();
    if (netError) {
      toast({ title: "Network Issue", description: netError, variant: "destructive" });
      return;
    }

    if (signupStep === 1) {
      if (!signupEmail || !fullName || !signupPassword) {
        toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      if (signupPassword !== confirmPassword) {
        toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
        return;
      }
      if (signupPassword.length < 8) {
        toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
        return;
      }
      setSignupStep(2);
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(signupEmail, signupPassword, fullName, {
        mobile: signupPhone || undefined,
        state: state || undefined,
        district: district || undefined,
        village: village || undefined,
        pin_code: pinCode || undefined,
        farm_size: farmSize ? Number(farmSize) : null,
      });
      if (result.error) {
        const errMsg = handleNetworkError(result.error);
        toast({ title: "Signup Failed", description: errMsg, variant: "destructive" });
      } else {
        toast({ title: "Success!", description: result.message || "Account created successfully!" });
        setTimeout(() => {
          setMode("login");
          setSignupStep(1);
        }, 1500);
      }
    } catch (err) {
      const errMsg = handleNetworkError(err);
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const netError = checkNetworkStatus();
    if (netError) {
      toast({ title: "Network Issue", description: netError, variant: "destructive" });
      return;
    }

    if (!forgotEmail) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(forgotEmail);
      if (result.error) {
        const errMsg = handleNetworkError(result.error);
        toast({ title: "Reset failed", description: errMsg, variant: "destructive" });
        return;
      }
      toast({ title: "Success!", description: "Reset link sent to your email. Check inbox and spam folder." });
      setMode("login");
    } catch (err) {
      const errMsg = handleNetworkError(err);
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: "10K+", label: "Happy Farmers" },
    { value: "500+", label: "Crops Tracked" },
    { value: "95%", label: "Success Rate" },
    { value: "₹50Cr+", label: "Transactions" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[42%] gradient-hero relative overflow-hidden flex-col justify-between p-10 text-primary-foreground">
        <div className="absolute inset-0 grain-texture" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <BrandLogo size="lg" />
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight mb-4">
            Smart Farming,<br />Smarter Future
          </h1>
          <p className="text-primary-foreground/80 text-lg font-body max-w-md">
            Join thousands of farmers using AI-powered insights to grow more, earn more, and farm smarter.
          </p>
          {/* Demo credentials hint */}
          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="text-sm font-medium mb-1">Secure Authentication</p>
            <p className="text-xs text-primary-foreground/70">Signup and login are now connected to Supabase Auth.</p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <p className="font-numbers text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-4 justify-center">
            <BrandLogo size="lg" animated={false} variant="onLight" />
          </div>

          {/* Mobile demo hint */}
          <div className="lg:hidden mb-6 bg-muted rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Use your registered email and password to sign in.</p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Welcome Back!</h2>
                <p className="text-muted-foreground mb-8">Sign in to continue farming smarter</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="your.email@example.com" type="email" className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <button type="button" className="text-xs text-primary hover:underline" onClick={() => setMode("forgot")}>Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="••••••••" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </Button>
                </form>
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button className="text-primary font-medium hover:underline" onClick={() => { setMode("signup"); setSignupStep(1); }}>Sign Up Now</button>
                </p>
              </motion.div>
            )}

            {mode === "signup" && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Create Your Account</h2>
                <p className="text-muted-foreground mb-2">Join thousands of farmers growing smarter</p>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`h-1.5 flex-1 rounded-full ${signupStep >= 1 ? "bg-primary" : "bg-muted"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${signupStep >= 2 ? "bg-primary" : "bg-muted"}`} />
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {signupStep === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Enter your full name" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Mobile Number</Label>
                          <div className="relative flex">
                            <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground">+91</span>
                            <Input placeholder="10-digit mobile" className="rounded-l-none" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="your.email@example.com" type="email" className="pl-10" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="••••••••" type={showPassword ? "text" : "password"} className="pl-10 pr-10" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {signupPassword && (
                            <div className="space-y-1.5">
                              <div className="flex gap-1 h-1.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div key={i} className={`flex-1 rounded-full ${i <= strength ? strengthColor : "bg-muted"}`} />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">Strength: {strengthLabel}</p>
                              <div className="space-y-0.5 text-xs">
                                <div className="flex items-center gap-1">
                                  {signupPassword.length >= 8 ? <CheckCircle2 className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                                  <span>At least 8 characters</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {/[A-Z]/.test(signupPassword) && /[a-z]/.test(signupPassword) ? <CheckCircle2 className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                                  <span>Uppercase & lowercase</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {/[0-9]/.test(signupPassword) ? <CheckCircle2 className="w-3 h-3 text-success" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                                  <span>Include numbers</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} className="pl-10 pr-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {confirmPassword && confirmPassword !== signupPassword && (
                            <p className="text-xs text-destructive">Passwords don't match</p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {signupStep === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" /> Tell Us About Your Farm (Optional)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Input placeholder="e.g. West Bengal" value={state} onChange={(e) => setState(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>District</Label>
                            <Input placeholder="e.g. Bardhaman" value={district} onChange={(e) => setDistrict(e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Village/Town</Label>
                            <Input placeholder="e.g. Memari" value={village} onChange={(e) => setVillage(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>PIN Code</Label>
                            <Input placeholder="6-digit PIN" value={pinCode} onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Farm Size (Acres)</Label>
                          <div className="relative">
                            <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="e.g. 5" type="number" className="pl-10" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    {signupStep === 2 && (
                      <Button type="button" variant="outline" onClick={() => setSignupStep(1)} className="flex-1">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                    )}
                    <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : signupStep === 1 ? <>Continue <ArrowRight className="w-4 h-4" /></> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                    </Button>
                  </div>
                </form>
                <p className="text-center mt-6 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button className="text-primary font-medium hover:underline" onClick={() => setMode("login")}>Sign In</button>
                </p>
              </motion.div>
            )}

            {mode === "forgot" && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Reset Password</h2>
                <p className="text-muted-foreground mb-8">Enter your email to receive a reset link</p>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="your.email@example.com" type="email" className="pl-10" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                  </Button>
                </form>
                <button className="mt-4 text-sm text-primary hover:underline" onClick={() => setMode("login")}>
                  ← Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
