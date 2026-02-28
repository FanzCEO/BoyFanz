import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Mail, Lock, Key } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      return await apiRequest<{ success: boolean; message: string; user: any; token?: string }>(
        "/api/auth/login",
        { method: "POST", body: data }
      );
    },
    onSuccess: async (responseData) => {
      // Set user directly in the auth query cache from the login response
      if (responseData?.user) {
        queryClient.setQueryData(["/api/auth/user"], responseData.user);
      }
      // Refresh the AuthContext so the router shows authenticated routes
      await refreshAuth();
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/dashboard';
      setLocation(returnTo);
    },
    onError: (error: Error) => {
      let errorMessage = "Please check your email and password and try again.";

      if (error.message) {
        const parts = error.message.split(':');
        if (parts.length > 1) {
          const statusCode = parts[0].trim();
          const serverMessage = parts.slice(1).join(':').trim();

          if (statusCode === '401') {
            errorMessage = "Invalid email or password. Please try again.";
          } else if (statusCode === '403') {
            errorMessage = "Access forbidden. Your account may be suspended.";
          } else if (statusCode === '429') {
            errorMessage = "Too many login attempts. Please try again later.";
          } else if (statusCode.startsWith('5')) {
            errorMessage = "Server error. Please try again in a moment.";
          } else if (serverMessage && serverMessage.length > 0 && serverMessage.length < 200) {
            errorMessage = serverMessage;
          }
        } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold mb-2">
            <span className="text-[#00e5ff]">Boy</span>
            <span className="text-[#d4a959]">Fanz</span>
          </h1>
          <p className="text-zinc-400 text-sm">Welcome back</p>
        </div>

        {/* Glass Card */}
        <div
          className="relative backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl"
          style={{
            boxShadow: "0 8px 32px 0 rgba(255, 0, 0, 0.1), inset 0 0 20px rgba(212, 169, 89, 0.05)",
          }}
        >
          {/* Neon glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00e5ff]/5 via-transparent to-[#d4a959]/5 pointer-events-none" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300 font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          data-testid="input-email"
                          className="pl-10 bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-zinc-300 font-medium">Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => setLocation("/auth/forgot-password")}
                        data-testid="link-forgot-password"
                        className="text-xs text-[#d4a959] hover:text-[#e5ba6a] transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          data-testid="input-password"
                          className="pl-10 pr-10 bg-black/60 border-white/10 text-white placeholder:text-zinc-600 focus:border-[#00e5ff]/50 focus:ring-[#00e5ff]/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                data-testid="button-login"
                className="w-full h-12 bg-[#00e5ff] hover:bg-[#00bcd4] text-white font-bold text-base shadow-lg shadow-cyan-500/20 transition-all"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>

              {/* SSO Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/40 px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/api/auth/sso'}
                data-testid="button-sso-login"
                className="w-full h-11 bg-black/40 border-[#d4a959]/30 hover:bg-[#d4a959]/10 text-[#d4a959] hover:text-[#e5ba6a] transition-all"
              >
                <Key className="w-4 h-4 mr-2" />
                Sign in with FanzSSO
              </Button>

              <div className="text-center text-sm">
                <span className="text-zinc-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setLocation("/auth/register")}
                  data-testid="link-register"
                  className="text-[#d4a959] hover:text-[#e5ba6a] font-medium transition-colors"
                >
                  Create one
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setLocation("/auth/resend-verification")}
                  data-testid="link-resend-verification"
                  className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                >
                  Didn't receive verification email?
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
