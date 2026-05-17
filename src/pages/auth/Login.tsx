import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    navigate('/home');
  };

  return (
    <AuthLayout>
      <div className="mb-7 mt-2">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-2">Welcome back</div>
        <h2 className="text-[26px] font-bold tracking-tight leading-tight">Sign in to<br />your world.</h2>
      </div>

      <form className="flex flex-col gap-1" onSubmit={handleLogin}>
        {error && <div className="text-red-500 text-xs font-semibold mb-3 p-3 bg-red-50 rounded-xl">{error}</div>}
        
        <Input 
          label="Email" type="email" placeholder="you@example.com" required
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          label="Password" type="password" placeholder="••••••••" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        
        <div className="text-right text-xs font-semibold text-muted -mt-2 mb-5 cursor-pointer hover:text-primary transition-colors">
          Forgot password?
        </div>

        <Button className="w-full" size="lg" isLoading={isLoading} type="submit">
          Continue
        </Button>
      </form>

      {/* ... (Keep your social login buttons and bottom links here) ... */}
      
      <div className="text-center text-[13px] text-muted mt-5 cursor-pointer" onClick={() => navigate('/signup')}>
        New here? <span className="text-primary font-semibold hover:underline">Create account</span>
      </div>
    </AuthLayout>
  );
}