'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const features = [
  { icon: '💬', label: 'Ask & Answer', desc: 'Exchange knowledge with peers' },
  { icon: '⭐', label: 'Build Rep', desc: 'Earn points for helping others' },
  { icon: '🏷️', label: 'Organized', desc: 'Tags, threads, and categories' },
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'student', department: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (formData.role !== 'student' && !formData.department.trim()) { setError('Department is required for staff roles'); return; }
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE}/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        role: formData.role,
        department: formData.department,
      });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      await login({ username: formData.username, password: formData.password });
      router.push('/');
    } catch (err: any) {
      const d = err.response?.data;
      if (!err.response) setError('Cannot connect to server.');
      else if (typeof d === 'object' && d !== null) setError((Object.values(d).flat()[0] as string) || 'Signup failed.');
      else setError(`Signup failed (${err.response.status}).`);
    } finally {
      setLoading(false);
    }
  };

  const strength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const strengthMeta = [
    null,
    { label: 'Weak', color: '#ef4444', bg: 'bg-red-500', width: 'w-1/3' },
    { label: 'Good', color: '#f59e0b', bg: 'bg-amber-400', width: 'w-2/3' },
    { label: 'Strong', color: '#22c55e', bg: 'bg-emerald-500', width: 'w-full' },
  ];
  const pwMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const pwMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .signup-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #fafaf8;
        }

        /* ─── LEFT PANEL ─── */
        .panel-left {
          display: none;
          width: 42%;
          background: #0f0f0e;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          padding: 3rem;
        }

        @media (min-width: 1024px) {
          .panel-left { display: flex; }
        }

        .panel-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .panel-glow {
          position: absolute;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(255,220,120,0.08) 0%, transparent 70%);
          bottom: -100px;
          right: -120px;
          pointer-events: none;
        }

        .panel-logo {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-mark {
          width: 40px;
          height: 40px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-mark span {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: #0f0f0e;
          line-height: 1;
        }

        .logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .panel-main {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2.5rem;
        }

        .panel-headline {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 3vw, 2.75rem);
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .panel-headline em {
          font-style: normal;
          color: #fbbf24;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: background 0.2s;
        }

        .feature-item:hover {
          background: rgba(255,255,255,0.07);
        }

        .feature-icon {
          font-size: 20px;
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-text-label {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          letter-spacing: 0.01em;
        }

        .feature-text-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 1px;
        }

        .panel-footer {
          position: relative;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.02em;
        }

        /* ─── RIGHT PANEL ─── */
        .panel-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .form-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          margin-bottom: 2.5rem;
        }

        @media (min-width: 1024px) {
          .mobile-logo { display: none; }
        }

        .mobile-logo-mark {
          width: 36px;
          height: 36px;
          background: #0f0f0e;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-logo-mark span {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
        }

        .mobile-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: #0f0f0e;
          letter-spacing: -0.02em;
        }

        .form-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 2rem;
          color: #0f0f0e;
          letter-spacing: -0.035em;
          line-height: 1;
          margin-bottom: 6px;
        }

        .form-sub {
          font-size: 14px;
          color: #9ca3af;
          font-weight: 400;
          margin-bottom: 2rem;
        }

        .step-indicators {
          display: flex;
          gap: 6px;
          margin-bottom: 2rem;
        }

        .step-dot {
          height: 3px;
          border-radius: 99px;
          background: #e5e7eb;
          flex: 1;
          transition: background 0.3s;
        }

        .step-dot.active {
          background: #0f0f0e;
        }

        .fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .field-input-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #0f0f0e;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input::placeholder {
          color: #d1d5db;
          font-weight: 400;
        }

        .field-input:focus {
          border-color: #0f0f0e;
          box-shadow: 0 0 0 3px rgba(15,15,14,0.06);
        }

        .field-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.06);
        }

        .field-input.success {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.06);
        }

        .field-input.has-suffix {
          padding-right: 46px;
        }

        .field-suffix {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eye-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .eye-btn:hover { color: #374151; }

        .check-badge {
          width: 20px;
          height: 20px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .strength-bar-track {
          height: 3px;
          background: #f3f4f6;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 8px;
        }

        .strength-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }

        .strength-meta {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .strength-label {
          font-size: 11px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
        }

        .field-hint {
          font-size: 12px;
          font-weight: 500;
          margin-top: 4px;
        }

        .hint-error { color: #ef4444; }
        .hint-success { color: #22c55e; }

        .error-box {
          background: #fff5f5;
          border: 1.5px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .error-icon {
          width: 18px;
          height: 18px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-text {
          font-size: 13px;
          font-weight: 500;
          color: #dc2626;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #0f0f0e;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s;
          margin-top: 4px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1f1f1d;
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .sign-in-link {
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
          margin-top: 1.25rem;
        }

        .sign-in-link a {
          font-weight: 700;
          color: #0f0f0e;
          text-decoration: none;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.01em;
        }

        .sign-in-link a:hover {
          text-decoration: underline;
        }

        /* Two-column layout for username/email on wider screens */
        @media (min-width: 520px) {
          .field-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0.25rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #f0f0ef;
        }

        .divider-label {
          font-size: 11px;
          font-weight: 600;
          color: #d1d5db;
          letter-spacing: 0.05em;
          font-family: 'Syne', sans-serif;
        }
      `}</style>

      <div className="signup-root">
      
        <div className="panel-left">
          <div className="panel-noise" />
          <div className="panel-glow" />

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
        font-family: 'Syne', sans-serif;
        
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
      font-family: 'Syne', sans-serif;
    "
  >
    CampusQA
  </span>
</Link>

          <div className="panel-main">
            <p className="panel-headline">
              Your campus.<br />
              <em>Your</em> knowledge<br />
              network.
            </p>

            <div className="feature-list">
              {features.map(f => (
                <div key={f.label} className="feature-item">
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <div className="feature-text-label">{f.label}</div>
                    <div className="feature-text-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="panel-footer">By signing up you agree to our Terms of Service and Privacy Policy.</p>
        </div>

      
        <div className="panel-right">
          <div className={`form-card ${mounted ? 'visible' : ''}`}>
          
            <Link href="/" className="mobile-logo">
              <div className="mobile-logo-mark"><span>Q</span></div>
              <span className="mobile-logo-name">CampusQA</span>
            </Link>

            <h1 className="form-heading">Create account</h1>
            <p className="form-sub">Free forever. No credit card needed.</p>

            
            <div className="step-indicators">
              {['username', 'email', 'password', 'confirmPassword'].map(f => (
                <div key={f} className={`step-dot ${formData[f as keyof typeof formData] ? 'active' : ''}`} />
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="fields">
                
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <div className="field-input-wrap">
                      <input
                        className={`field-input ${formData.username ? (formData.username.length >= 3 ? 'success' : '') : ''} ${focusedField === 'username' ? '' : ''}`}
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="your_handle"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Email</label>
                    <div className="field-input-wrap">
                      <input
                        className="field-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@uni.edu"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="field-group">
                  <label className="field-label">I am a</label>
                  <div className="field-input-wrap">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('role')}
                      onBlur={() => setFocusedField(null)}
                      className={`field-input ${focusedField === 'role' ? 'success' : ''}`}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty Member</option>
                      <option value="hod">Head of Department</option>
                      <option value="dean">Dean</option>
                    </select>
                  </div>
                </div>

                {/* Department (only for staff) */}
                {formData.role !== 'student' && (
                  <div className="field-group">
                    <label className="field-label">Department</label>
                    <div className="field-input-wrap">
                      <input
                        className="field-input"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('department')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. Computer Science"
                        required={formData.role !== 'student'}
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div className="field-input-wrap">
                    <input
                      className={`field-input has-suffix ${
                        formData.password && strength === 1 ? 'error' : formData.password && strength === 3 ? 'success' : ''
                      }`}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                    />
                    <div className="field-suffix">
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>
                  {formData.password && strengthMeta[strength] && (
                    <>
                      <div className="strength-bar-track">
                        <div
                          className={`strength-bar-fill ${strengthMeta[strength]!.bg}`}
                          style={{ width: strengthMeta[strength]!.width === 'w-1/3' ? '33%' : strengthMeta[strength]!.width === 'w-2/3' ? '66%' : '100%' }}
                        />
                      </div>
                      <div className="strength-meta">
                        <span className="strength-label" style={{ color: strengthMeta[strength]!.color }}>
                          {strengthMeta[strength]!.label}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                
                <div className="field-group">
                  <label className="field-label">Confirm Password</label>
                  <div className="field-input-wrap">
                    <input
                      className={`field-input has-suffix ${pwMismatch ? 'error' : pwMatch ? 'success' : ''}`}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                    />
                    {pwMatch && (
                      <div className="field-suffix">
                        <div className="check-badge"><CheckIcon /></div>
                      </div>
                    )}
                  </div>
                  {pwMismatch && <p className="field-hint hint-error">Passwords don't match</p>}
                  {pwMatch && <p className="field-hint hint-success">Passwords match</p>}
                </div>

                
                {error && (
                  <div className="error-box">
                    <div className="error-icon">
                      <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      </svg>
                    </div>
                    <span className="error-text">{error}</span>
                  </div>
                )}

                
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <><div className="spinner" />Creating account…</>
                  ) : (
                    'Create Account →'
                  )}
                </button>
              </div>
            </form>

            <p className="sign-in-link">
              Already have an account?{' '}
              <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}