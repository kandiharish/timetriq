import React, { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../core/firebase';
import { isAllowedDomain } from '../utils/auth';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

const features = [
  { title: "Streamline your workflow", description: "Manage tasks, projects, and deadlines seamlessly in one place." },
  { title: "Track time effortlessly", description: "Log your hours accurately and gain insights into your productivity." },
  { title: "Manage your team", description: "Assign roles, monitor workloads, and collaborate with precision." }
];

export const Login: React.FC = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [isRegistering, setIsRegistering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role before continuing.');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      if (isRegistering) {
        if (!isAllowedDomain(email)) {
          setError('Only Verve Advisory email accounts are allowed.');
          setLoading(false);
          return;
        }
        // Role is passed via localStorage so AuthContext can pick it up during initial profile creation
        localStorage.setItem('pendingUserRole', role);
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        localStorage.setItem('pendingUserRole', role);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        if (!isAllowedDomain(credential.user.email)) {
          await auth.signOut();
          setError('Unauthorized email domain. Access denied.');
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        console.error("Login error:", err);
        setError(isRegistering ? `Failed to create an account: ${err.message}` : `Failed to log in: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!role) {
      setError('Please select a role before continuing with Google.');
      return;
    }
    try {
      setError(null);
      setLoading(true);
      localStorage.setItem('pendingUserRole', role);
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      
      if (!isAllowedDomain(credential.user.email)) {
        await auth.signOut();
        setError('Access denied. Please sign in using your Verve Advisory account.');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError('Failed to log in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResetMessage(null);
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(`Failed to send reset email: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1200px', 
        height: '85vh',
        minHeight: '650px',
        maxHeight: '900px',
        backgroundColor: 'white', 
        borderRadius: '24px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(0,0,0,0.1)', 
        overflow: 'hidden' 
      }}>
      {/* Left Side - Branding */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#1E1B4B', 
        backgroundImage: 'linear-gradient(rgba(30, 27, 75, 0.7), rgba(67, 56, 202, 0.7)), url("/image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '4.5rem', fontWeight: 700, marginBottom: '3rem', letterSpacing: '-0.025em', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>Timetriq</h1>
           
           <div style={{ position: 'relative', height: '140px', width: '100%', maxWidth: '450px', fontFamily: 'Inter, system-ui, sans-serif' }}>
             {features.map((feature, index) => (
               <div 
                 key={index}
                 style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   width: '100%',
                   opacity: currentFeatureIndex === index ? 1 : 0,
                   transform: currentFeatureIndex === index ? 'translateY(0)' : 'translateY(20px)',
                   transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                   pointerEvents: currentFeatureIndex === index ? 'auto' : 'none'
                 }}
               >
                 <h3 style={{ 
                   fontSize: '2rem', 
                   fontWeight: 700, 
                   marginBottom: '1rem',
                   textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                   letterSpacing: '-0.01em'
                 }}>
                   {feature.title}
                 </h3>
                 <p style={{ 
                   fontSize: '1.25rem', 
                   opacity: currentFeatureIndex === index ? 0.9 : 0,
                   transform: currentFeatureIndex === index ? 'translateY(0)' : 'translateY(10px)',
                   transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s',
                   lineHeight: 1.6,
                   textShadow: '0 1px 5px rgba(0,0,0,0.3)',
                   fontWeight: 300
                 }}>
                   {feature.description}
                 </p>
               </div>
             ))}
           </div>
           

        </div>
      </div>

      {/* Right Side - Form */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', color: '#111827', fontSize: '2rem', fontWeight: 700 }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '2.5rem', fontSize: '0.875rem' }}>
            Sign in using your Verve Advisory account.
          </p>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--color-error)', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>{error}</div>}
        {resetMessage && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: 'var(--spacing-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>{resetMessage}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 'var(--spacing-1)' }}>Select Role</label>
            <div 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{ width: '100%', padding: 'var(--spacing-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ color: role ? '#111827' : '#9CA3AF' }}>{role || 'Select your role...'}</span>
              <ChevronDown size={16} style={{ color: '#6B7280' }} />
            </div>
            
            {showRoleDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', zIndex: 10 }}>
                {['Admin', 'Manager', 'Employee'].map(r => (
                  <div
                    key={r}
                    onClick={() => { setRole(r); setShowRoleDropdown(false); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem', backgroundColor: role === r ? '#F3F4F6' : 'transparent', color: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = role === r ? '#F3F4F6' : 'transparent'}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={6}
                style={{ width: '100%', padding: 'var(--spacing-2)', paddingRight: '40px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isRegistering && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-1)' }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              </div>
            )}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div style={{ margin: 'var(--spacing-4) 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ flex: 1, borderTop: '1px solid #E5E7EB' }}></div>
          <span style={{ margin: '0 var(--spacing-3)', fontSize: '0.875rem' }}>or</span>
          <div style={{ flex: 1, borderTop: '1px solid #E5E7EB' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ 
            width: '100%',
            padding: 'var(--spacing-3)', 
            backgroundColor: 'white', 
            color: '#374151', 
            border: '1px solid #D1D5DB', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isRegistering ? 'Log in' : 'Sign up'}
          </button>
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
          Only @verveadvisory.com email accounts are permitted.
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};
