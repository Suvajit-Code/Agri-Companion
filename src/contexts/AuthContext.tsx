import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SignupProfileInput {
  mobile?: string;
  state?: string;
  district?: string;
  village?: string;
  pin_code?: string;
  farm_size?: number | null;
}

interface AppUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthUserLike {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, profile?: SignupProfileInput) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAuthenticated: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  resetPassword: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getFallbackName = useCallback((authUser: AuthUserLike) => {
    const metadataName =
      typeof authUser.user_metadata?.full_name === "string"
        ? authUser.user_metadata.full_name
        : null;

    return metadataName || (authUser.email ? authUser.email.split("@")[0] : "Farmer");
  }, []);

  const mapAuthUserFallback = useCallback((authUser: AuthUserLike): AppUser => {
    return {
      id: authUser.id,
      email: authUser.email || "",
      full_name: getFallbackName(authUser),
    };
  }, [getFallbackName]);

  const withTimeout = useCallback(async <T,>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Operation timed out")), timeoutMs);
      });
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }, []);

  const ensureProfile = useCallback(async (authUser: AuthUserLike) => {
    const fallbackName = getFallbackName(authUser);

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: authUser.id,
        full_name: fallbackName,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }
  }, [getFallbackName]);

  const mapUser = useCallback(async (authUser: AuthUserLike) => {
    // Try to get profile with fallback to avoid UI hangs
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (error || !profile) {
        return mapAuthUserFallback(authUser);
      }

      return {
        id: authUser.id,
        email: authUser.email || "",
        full_name: profile?.full_name || getFallbackName(authUser),
      } satisfies AppUser;
    } catch {
      // Fallback to internal metadata if DB query fails
      return mapAuthUserFallback(authUser);
    }
  }, [getFallbackName, mapAuthUserFallback]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await withTimeout(supabase.auth.getSession());
        if (!mounted) return;

        if (data.session?.user) {
          try {
            await withTimeout(ensureProfile(data.session.user));
          } catch {
            // Do not block auth flow if profile table policies fail on some devices.
          }

          const mappedUser = await withTimeout(mapUser(data.session.user));
          if (mounted) setUser(mappedUser);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          try {
            await withTimeout(ensureProfile(session.user));
          } catch {
            // Auth can still proceed even if profile write is blocked.
          }

          const mappedUser = await withTimeout(mapUser(session.user));
          setUser(mappedUser);
        } else {
          setUser(null);
        }
      } catch {
        if (session?.user) {
          setUser(mapAuthUserFallback(session.user));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile, mapAuthUserFallback, mapUser, withTimeout]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })
      );

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
          return { error: "Email verify koren, tarpor login korun." };
        }
        return { error: error.message };
      }

      if (data.user) {
        try {
          await withTimeout(ensureProfile(data.user));
        } catch {
          // Non-critical, continue login.
        }

        const mappedUser = await withTimeout(mapUser(data.user));
        setUser(mappedUser);
      }

      return {};
    } catch {
      return { error: "Login e timeout hocche. Network check kore abar try korun." };
    }
  }, [ensureProfile, mapUser, withTimeout]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, profile?: SignupProfileInput) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
      );

      if (error) {
        // Email verification not confirmed - allow them to know
        if (error.message.toLowerCase().includes("confirm")) {
          return { error: "Email-e confirmation link bhejgechi. Email verify kore abar login korun." };
        }
        return { error: error.message };
      }

      if (data.user) {
        try {
          await supabase.from("profiles").upsert(
            {
              user_id: data.user.id,
              full_name: fullName,
              mobile_number: profile?.mobile || null,
              state: profile?.state || null,
              district: profile?.district || null,
              village: profile?.village || null,
              pin_code: profile?.pin_code || null,
              farm_size: profile?.farm_size ?? null,
            },
            { onConflict: "user_id" }
          );
        } catch {
          // Profile creation failed - but don't block signup
          console.warn("Profile creation failed, but signup completed");
        }
      }

      if (data.session?.user) {
        const mappedUser = await withTimeout(mapUser(data.session.user));
        setUser(mappedUser);
        return { message: "Account created successfully!" };
      } else {
        // Email confirmation required
        return { message: "Account created! Email-e verification link phechechi. Verify kore login korun." };
      }
    } catch {
      return { error: "Signup e timeout hocche. Network check kore abar try korun." };
    }
  }, [mapUser, withTimeout]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      // Try with extreme short timeout, don't wait for server if it hang
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("SignOut Timeout")), 2000))
      ]).catch(() => {
        // Fallback: Clear session locally anyway if server is unreachable
        localStorage.removeItem("supabase.auth.token");
        sessionStorage.clear();
      });
      
      setUser(null);
    } catch (e) {
      setUser(null);
    } finally {
      // Small delay to ensure state propagates, then redirect
      setTimeout(() => {
        setLoading(false);
        window.location.href = "/auth";
      }, 100);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signIn, signUp, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
