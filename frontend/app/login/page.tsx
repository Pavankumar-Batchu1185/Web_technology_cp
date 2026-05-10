'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const auth = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  const { login } = auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ username, password });
      router.push(redirect);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .login-root {
  font-family: 'Outfit', sans-serif;
}


        .serif {
        font-family: 'Outfit', sans-serif;
        letter-spacing: -0.04em;
        }

        .panel-logo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: fit-content;
  text-decoration: none;

  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.panel-logo:hover {
  transform: translateY(-2px);
}

.logo-mark {
  width: 56px;
  height: 56px;

  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #3B82F6,
    #60A5FA
  );

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 0 25px rgba(59,130,246,0.35),
    inset 0 1px 1px rgba(255,255,255,0.2);
}

.logo-mark span {
  font-weight: 800;
  font-size: 28px;
  color: white;
  line-height: 1;

  letter-spacing: -0.05em;
}

.logo-name {
  font-family: 'Outfit', sans-serif;

  font-size: 2rem;
  font-weight: 800;

  letter-spacing: -0.06em;

  color: white;

  text-shadow:
    0 0 12px rgba(255,255,255,0.08);
}

        .field-line {
          position: relative;
          border-bottom: 1.5px solid #333;
          transition: border-color 0.2s;
        }
        .field-line.active { border-color: #D4A853; }
        .field-line::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #D4A853;
          transition: width 0.35s cubic-bezier(.4,0,.2,1);
        }
        .field-line.active::after { width: 100%; }

        .submit-btn {
          position: relative;
          overflow: hidden;
          background: #D4A853;
          transition: background 0.2s;
        }
        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #fff;
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
          mix-blend-mode: overlay;
        }
        .submit-btn:hover::after { transform: translateX(0); }
        .submit-btn:hover { background: #C49843; }

        .geo-bg {
          background-color: #07111F;
          background-image:
            linear-gradient(rgba(212,168,83,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,83,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.19s; }
        .fade-up-4 { animation-delay: 0.26s; }
        .fade-up-5 { animation-delay: 0.33s; }




      `}</style>

      <div className="login-root min-h-screen flex" style={{ background: '#0C0C0C' }}>

        <div className="hidden lg:flex lg:w-[52%] geo-bg flex-col justify-between p-14 relative overflow-hidden">

          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
              style={{ border: '1px solid rgba(212,168,83,0.12)' }} />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full"
              style={{ border: '1px solid rgba(212,168,83,0.08)' }} />

            <div className="absolute top-0 right-0 w-1 h-full opacity-30"
              style={{ background: 'linear-gradient(to bottom, transparent, #D4A853, transparent)' }} />
            
            <div className="absolute top-1/2 right-20 w-3 h-3 -translate-y-1/2"
              style={{ background: '#D4A853', opacity: 0.4 }} />
            
            <div className="absolute bottom-16 right-16 w-12 h-12">
              <div className="absolute top-1/2 left-0 w-full h-px" style={{ background: 'rgba(212,168,83,0.3)' }} />
              <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: 'rgba(212,168,83,0.3)' }} />
            </div>
          </div>

          
          {/* <Link href="/" className="relative flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 flex items-center justify-center"
              style={{ border: '1.5px solid rgba(212,168,83,0.5)' }}>
              <span className="serif text-xl font-bold" style={{ color: '#D4A853' }}>Q</span>
            </div>
            <span className="text-sm font-medium tracking-[0.2em] text-white/70 uppercase group-hover:text-white transition-colors">
              Campus<span style={{ color: '#D4A853' }}>QA</span>
            </span>
          </Link> */}

         <Link
  href="/"
  className="
    flex
    items-center
    gap-4
    group
    w-fit
  "
>
  <div
    className="
      w-14
      h-14
      rounded-2xl
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-blue-500
      to-blue-400
      shadow-[0_0_30px_rgba(59,130,246,0.35)]
      transition-all
      duration-300
      group-hover:scale-105
    "
  >
    <span
      className="
        text-white
        text-3xl
        font-black
        tracking-tight
      "
    >
      Q
    </span>
  </div>

  <span
    className="
      text-white
      text-[2rem]
      font-black
      tracking-[-0.06em]
      leading-none
    "
  >
    CampusQA
  </span>
</Link>

          
          <div className="relative">
            <div className="mb-2" style={{ color: 'rgba(212,168,83,0.6)', fontSize: 11, letterSpacing: '0.3em' }}>
              EST. YOUR CAMPUS · KNOWLEDGE NETWORK
            </div>
            <h2 className="serif text-white leading-none mb-8"
              style={{ fontSize: 'clamp(48px, 5vw, 72px)', fontWeight: 900 }}>
              Ask.<br />
              <span style={{ color: '#D4A853' }}>Answer.</span><br />
              Learn.
            </h2>
            <p className="text-sm leading-loose max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Get unstuck, help your peers, and build your academic reputation — all in one place.
            </p>
          </div>

          
          <div className="relative flex flex-wrap gap-2">
            {[
              { label: 'Questions', val: '2.4k' },
              { label: 'Answers', val: '8.1k' },
              { label: 'Students', val: '940' },
            ].map(({ label, val }) => (
              <div key={label} className="px-4 py-2.5 flex items-center gap-2.5"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <span className="serif text-lg font-bold" style={{ color: '#D4A853' }}>{val}</span>
                <span className="text-xs text-white/40 tracking-widest uppercase">{label}</span>
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex-1 flex items-center justify-center px-6 py-14"
          style={{ background: '#F6F4EF' }}>
          <div className="w-full max-w-[360px]">

            
            <Link href="/" className="flex items-center gap-2.5 mb-12 lg:hidden w-fit">
              <div className="w-8 h-8 flex items-center justify-center"
                style={{ border: '1.5px solid #D4A853' }}>
                <span className="serif logo-mark font-bold text-base" style={{ color: '#D4A853' }}>Q</span>
              </div>
              <span className="text-xs tracking-[0.25em] uppercase font-medium text-gray-600">
                Campus<span style={{ color: '#D4A853' }}>QA</span>
              </span>
            </Link>

                      

          
            <div className="fade-up fade-up-1 mb-10">
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#999' }}>
                Member Login
              </p>
              <h1 className="serif leading-tight" style={{ fontSize: 36, color: '#111', fontWeight: 900 }}>
                Welcome<br />back.
              </h1>
              <div className="mt-3 h-0.5 w-12" style={{ background: '#D4A853' }} />
            </div>

        
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className={`fade-up fade-up-2 field-line pb-2 ${focused === 'username' ? 'active' : ''}`}>
                <label className="block text-xs tracking-[0.25em] uppercase mb-3"
                  style={{ color: focused === 'username' ? '#D4A853' : '#999', transition: 'color 0.2s' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  placeholder="your_username"
                  className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-gray-300"
                  style={{ color: '#111', caretColor: '#D4A853' }}
                  required
                  autoComplete="username"
                />
              </div>

              <div className={`fade-up fade-up-3 field-line pb-2 ${focused === 'password' ? 'active' : ''}`}>
                <label className="block text-xs tracking-[0.25em] uppercase mb-3"
                  style={{ color: focused === 'password' ? '#D4A853' : '#999', transition: 'color 0.2s' }}>
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder-gray-300"
                    style={{ color: '#111', caretColor: '#D4A853' }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="transition-opacity hover:opacity-100 opacity-40 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="fade-up flex items-center gap-2.5 py-3 px-4"
                  style={{ background: '#FEF2F2', borderLeft: '3px solid #EF4444' }}>
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14A7 7 0 0012 5z" />
                  </svg>
                  <p className="text-xs text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="fade-up fade-up-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn w-full py-4 font-black text-sm tracking-[0.15em] uppercase text-white flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Log In
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="fade-up fade-up-5 text-center text-xs mt-8" style={{ color: '#aaa' }}>
              No account?{' '}
              <Link href="/signup"
                className="font-bold transition-colors hover:underline"
                style={{ color: '#111' }}>
                Create one free →
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}