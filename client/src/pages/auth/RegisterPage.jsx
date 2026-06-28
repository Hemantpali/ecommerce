import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/toast';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { KeyRound, Mail, User, UserPlus, ShoppingBag } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      toast({
        title: 'Validation error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast({
        title: 'Account created!',
        description: `Successfully registered and signed in as ${user.name}.`,
        variant: 'success',
      });
      navigate(ROUTES.HOME);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Email might be in use.';
      setError(msg);
      toast({
        title: 'Registration failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex min-h-[70vh] items-center justify-center select-none">
      <Card className="w-full max-w-md bg-card shadow-lg border border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">Create Account</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Create an account to track shipments and save wishlist items.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && <Alert message={error} className="mb-4" onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Full Name</span>
              </label>
              <Input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="h-10"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Email Address</span>
              </label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Password</span>
              </label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Confirm Password</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="h-10"
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full font-bold h-11 mt-6">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground font-semibold">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-bold text-primary hover:underline transition">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
