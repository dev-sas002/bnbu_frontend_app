import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bnbLogo from '@/assets/images/bnb_logo.webp';
import { isDemoMode } from '@/demo/demoBaseQuery';
import { useLoginMutation } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { acknowledgeSessionExpiry, setSession } from '@/store/slices/authSlice';
import { Button, Field, Input } from '@/ui';
import { AnalyzerIcon, EyeIcon, EyeOffIcon, LeaseIcon, RegulationIcon } from '@/ui/icons';

/** Only used when VITE_DEMO_MODE is on; the demo transport accepts anything. */
const DEMO_EMAIL = 'dana.reyes@bnbu.example';
const DEMO_PASSWORD = 'demo';

const HIGHLIGHTS = [
  {
    icon: LeaseIcon,
    title: 'LeaseGuard AI',
    body: 'Upload a lease and get the clauses that matter, with a chat over the document.',
  },
  {
    icon: RegulationIcon,
    title: 'RegAdvisor AI',
    body: 'Ask whether a city allows short-term rentals and keep the answer on file.',
  },
  {
    icon: AnalyzerIcon,
    title: 'Rental Analyzer',
    body: 'Price a spreadsheet of listings against market ADR and occupancy.',
  },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem('rememberMe') === 'true'
  );
  // In demo mode there is no backend to reject anything, so the form is
  // pre-filled and the banner below says plainly what is going on.
  const demo = isDemoMode();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const wasSessionExpired = useAppSelector((state) => state.auth.sessionExpired);

  useEffect(() => {
    // Only the email is remembered. The password used to be written to
    // localStorage in clear text and read back here, which left the user's
    // credentials readable by any script on the origin.
    localStorage.removeItem('password');
    if (rememberMe) {
      const savedEmail = localStorage.getItem('email');
      if (savedEmail) setEmail(savedEmail);
    }
  }, [rememberMe]);

  useEffect(() => {
    if (!demo) return;
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }, [demo]);

  const handleRememberMeChange = () => {
    setRememberMe((previous) => {
      const next = !previous;
      if (next) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
      }
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const missingEmail = !email;
    const missingPassword = !password;
    setEmailError(missingEmail ? 'Please enter a valid email' : '');
    setPasswordError(missingPassword ? 'Password is required' : '');
    if (missingEmail || missingPassword) return;

    try {
      const result = await login({ email, password }).unwrap();
      // Both halves of the pair are kept: the refresh token is what lets an
      // expired access token be replaced without bouncing the user out.
      dispatch(setSession({ access: result.access, refresh: result.refresh }));
      dispatch(acknowledgeSessionExpiry());

      if (rememberMe) {
        localStorage.setItem('email', email);
      } else {
        localStorage.removeItem('email');
      }

      const returnTo = (location.state as { from?: string } | null)?.from;
      navigate(returnTo && returnTo !== '/' ? returnTo : '/dashboard');
    } catch {
      setEmailError('Failed to log in');
      setPasswordError('Please check your credentials and try again');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Form column */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[52%] lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Log in</h1>
          <p className="mt-2 text-sm text-ink-subtle">
            Welcome back. Enter your details to open the console.
          </p>

          {demo && (
            <p className="mt-5 rounded-md bg-info-bg px-3 py-2.5 text-sm text-info-fg">
              <strong className="font-semibold">Demo mode.</strong> Every response comes from
              seeded fixtures — no API is contacted. Sign in with the pre-filled details.
            </p>
          )}

          {wasSessionExpired && (
            <p
              role="status"
              className="mt-5 rounded-md bg-caution-bg px-3 py-2.5 text-sm text-caution-fg"
            >
              Your session ended. Sign in again to pick up where you left off.
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <Field label="Email" required error={emailError || null}>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field label="Password" required error={passwordError || null}>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pr-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide the password' : 'Reveal the password'}
                  className="absolute inset-y-0 right-0 flex items-center rounded px-3 text-ink-subtle transition-colors hover:text-ink"
                >
                  {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 rounded border-line-strong text-brand-600 accent-brand-600"
                />
                Remember me
              </label>
              <span className="text-sm text-ink-subtle" title="Contact an administrator to reset a password">
                Forgot your password?
              </span>
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>

      {/* Brand column. This replaced a 2.5 MB marketing render that was the
          single largest asset in the build and said nothing about the product. */}
      <aside className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-ink px-14 lg:flex">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
        />

        <div className="relative max-w-md">
          <img src={bnbLogo} alt="bnb University" className="h-7 w-auto" />
          <p className="mt-8 text-2xl font-semibold leading-snug text-white">
            Every lease, regulation and deal for your short-term rental portfolio, in one console.
          </p>

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                  <Icon />
                </span>
                <span>
                  <span className="block text-base font-medium text-white">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-white/55">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Login;
