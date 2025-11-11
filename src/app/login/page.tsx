
"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';
import { API_URL } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check if user was redirected after email verification
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedMessage(true);
      toast({
        title: "Email Verified! ✓",
        description: "Your email has been verified successfully. You can now log in.",
        variant: "default",
      });
      // Hide message after 5 seconds
      setTimeout(() => setShowVerifiedMessage(false), 5000);
    }
  }, [searchParams, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        toast({
          title: "Login Successful! ✓",
          description: `Welcome back, ${data.data.user.name}!`,
          variant: "default",
        });

        // Redirect based on role
        setTimeout(() => {
          if (data.data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/client/accommodations');
          }
        }, 500);
      } else {
        setError(data.message || 'Invalid email or password');
        toast({
          title: "Login Failed",
          description: data.message || 'Invalid email or password',
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError('Failed to login. Please try again.');
      toast({
        title: "Login Error",
        description: 'Failed to login. Please check your connection and try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          {showVerifiedMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold">Email verified successfully!</p>
                <p className="text-sm">You can now login to your account.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    placeholder="Password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground hover:bg-accent/40"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a19.87 19.87 0 014.127-6.02M6.6 6.6A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7.5a19.85 19.85 0 01-1.66 3.01M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center relative flex-col text-center grid-pattern">
         <Link href="/" className="absolute top-8 left-8 text-lg font-medium">
          Elimar Spring Garden
        </Link>
        <div className="text-4xl font-bold font-headline tracking-tight">
          Welcome Back
        </div>
        <p className="mt-2 text-lg text-muted-foreground">
          Your serene escape is just a login away.
        </p>
        <div className="absolute bottom-8 text-sm text-muted-foreground">
           &copy; {new Date().getFullYear()} Elimar Spring Garden. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
