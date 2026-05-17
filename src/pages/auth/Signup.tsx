import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthLayout } from './AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';



export default function Signup() {
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // 1. The Strict Password Vault Check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special symbol (@$!%*?&).');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Proceed with Supabase Auth (NOW WITH METADATA!)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase().replace(/\s+/g, ''),
          }
        }
      });

      if (authError) throw authError;

      // 3. Safely Upsert the Profile 
      // (Using upsert prevents crashes if a database trigger already created the profile)
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: fullName,
          username: username.toLowerCase().replace(/\s+/g, ''),
        });

        // If there's an error, and it's NOT a "duplicate key" error (code 23505), log it.
        if (profileError && profileError.code !== '23505') {
          console.error("Profile sync issue:", profileError);
          // We don't throw here so the user can still log in even if sync has a minor hiccup
        }
      }

      // Success! Send them to the feed
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup.');
    } finally {
      setIsLoading(false);
    } 
  };

  return (
    <AuthLayout>
      <div className="mb-6 mt-2">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-2">Join Unora</div>
        <h2 className="text-[26px] font-bold tracking-tight leading-tight">Share your<br />creative voice.</h2>
      </div>

      <form className="flex flex-col gap-1" onSubmit={handleSignup}>
        {error && <div className="text-red-500 text-xs font-semibold mb-3 p-3 bg-red-50 rounded-xl">{error}</div>}
        
        <Input 
          label="Full Name" placeholder="Aria Mehra" required
          value={fullName} onChange={(e) => setFullName(e.target.value)}
        />
        <Input 
          label="Username" placeholder="@yourname" required rightElement="Available"
          value={username} onChange={(e) => setUsername(e.target.value)}
        />
        <Input 
          label="Email" type="email" placeholder="you@example.com" required
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <Input 
          label="Password" type="password" placeholder="••••••••" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError && (
  <div className="text-red-500 text-[11px] font-medium leading-snug mt-1.5 px-1">
    {passwordError}
  </div>
)}
        
        <Button className="w-full mt-2" size="lg" isLoading={isLoading} type="submit">
          Create Account
        </Button>
      </form>

      <div className="text-center text-[13px] text-muted mt-4 cursor-pointer" onClick={() => navigate('/login')}>
        Already a creator? <span className="text-primary font-semibold hover:underline">Sign in</span>
      </div>
      <div className="text-[11px] text-muted text-center mt-4 leading-relaxed">
        By joining you agree to our <span className="text-primary font-semibold">Terms</span> & <span className="text-primary font-semibold">Privacy Policy</span>
      </div>
    </AuthLayout>
  );
}