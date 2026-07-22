import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../core/firebase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the route guard in App.tsx
    } catch (err: any) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--color-background)' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center', color: 'var(--color-text-primary)' }}>Timetriq</h1>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--color-error)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-1)' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-1)' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: 'var(--spacing-2)', 
              padding: 'var(--spacing-3)', 
              backgroundColor: 'var(--color-primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 600,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};
