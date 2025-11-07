import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Gift } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { SiCodesignal } from 'react-icons/si';

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setInvitationCode(refCode);
    }
  }, []);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, username, invitationCode || undefined);
      toast({
        title: 'Welcome to PingCaset!',
        description: 'Your account has been created successfully.',
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Failed to create account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      await signInWithGoogle(invitationCode || undefined);
      toast({
        title: 'Welcome to PingCaset!',
        description: 'Successfully signed up with Google.',
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message || 'Failed to signup with Google',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-cyan-900/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),transparent)]" />
      
      <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-emerald-200/50 dark:border-emerald-800/50 shadow-2xl" data-testid="card-signup">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <SiCodesignal className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Join PingCaset
          </CardTitle>
          <CardDescription className="text-base dark:text-gray-400">
            Start mining Caset coins every 6 hours
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium dark:text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                  data-testid="input-username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invitationCode" className="text-sm font-medium dark:text-gray-300">
                Invitation Code (Optional)
              </Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                  data-testid="input-invitation-code"
                />
              </div>
              {invitationCode && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  🎉 You'll get 400 bonus coins with this invitation!
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
              data-testid="button-signup"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            data-testid="button-google-signup"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <button
              type="button"
              onClick={() => setLocation('/login')}
              className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              data-testid="link-login"
            >
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
