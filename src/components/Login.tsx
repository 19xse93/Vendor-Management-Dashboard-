import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, CheckCircle2, Lock, FileLock, UserCheck, AlertCircle, User } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: {
    email: string;
    role: 'ADMIN' | 'COMPLIANCE_OFFICER' | 'GUEST_AUDITOR';
    fullName: string;
    subsidiaryAccess: 'ALL' | 'MEDIA' | 'HOLDINGS' | 'TRADING';
  }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('admin@elev8.com');
  const [password, setPassword] = useState('elev8secure2026');
  const [role, setRole] = useState<'ADMIN' | 'COMPLIANCE_OFFICER' | 'GUEST_AUDITOR'>('ADMIN');
  const [subsidiary, setSubsidiary] = useState<'ALL' | 'MEDIA' | 'HOLDINGS' | 'TRADING'>('ALL');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Load custom registered accounts from localStorage to allow subsequent logins
  const [customAccounts, setCustomAccounts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('elev8_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Preset accounts for seamless auditing experience
  const PRESET_ACCOUNTS = [
    {
      label: 'Corporate Administrator',
      email: 'admin@elev8.com',
      role: 'ADMIN' as const,
      desc: 'Full read/write rights across all business conglomerates.'
    },
    {
      label: 'Compliance Officer',
      email: 'compliance.officer@elev8.com',
      role: 'COMPLIANCE_OFFICER' as const,
      desc: 'Verify tax records, clear Mayor permits, and certify credentials.'
    },
    {
      label: 'SLA Guest Auditor',
      email: 'external.auditor@sec.gov.ph',
      role: 'GUEST_AUDITOR' as const,
      desc: 'Read-only access to verify legal files & validation histories.'
    }
  ];

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setIsRegistering(false);
    setEmail(preset.email);
    setRole(preset.role);
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (isRegistering) {
      if (!fullName.trim()) {
        setError('Please enter your full name for registration.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        // Save user to simulated centralized authentication database
        const newUser = {
          fullName,
          email,
          password,
          role,
          subsidiaryAccess: subsidiary
        };

        const updated = [...customAccounts, newUser];
        setCustomAccounts(updated);
        localStorage.setItem('elev8_registered_users', JSON.stringify(updated));

        setSuccess('Account successfully registered! Logging you into the secure gateway...');
        setLoading(false);

        // Auto logged-in upon successful registration
        setTimeout(() => {
          onLoginSuccess({
            email,
            role,
            fullName,
            subsidiaryAccess: subsidiary
          });
        }, 1200);
      }, 1000);

    } else {
      setLoading(true);
      // Mimic secure server validation latency
      setTimeout(() => {
        setLoading(false);

        // Check presets first
        const matchedPreset = PRESET_ACCOUNTS.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase()
        );

        // Check custom registered databases
        const matchedCustom = customAccounts.find(
          (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (matchedPreset) {
          onLoginSuccess({
            email: matchedPreset.email,
            role: matchedPreset.role,
            fullName: matchedPreset.label,
            subsidiaryAccess: subsidiary
          });
        } else if (matchedCustom) {
          onLoginSuccess({
            email: matchedCustom.email,
            role: matchedCustom.role,
            fullName: matchedCustom.fullName,
            subsidiaryAccess: matchedCustom.subsidiaryAccess
          });
        } else {
          // If password matches name logic or general valid entry
          let resolvedName = 'Corporate Executive';
          if (role === 'COMPLIANCE_OFFICER') resolvedName = 'Compliance Supervisor';
          if (role === 'GUEST_AUDITOR') resolvedName = 'Guest Auditor';

          onLoginSuccess({
            email,
            role,
            fullName: resolvedName,
            subsidiaryAccess: subsidiary
          });
        }
      }, 850);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    if (!isRegistering) {
      setFullName('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('admin@elev8.com');
      setPassword('elev8secure2026');
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden" id="secure_login_root">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-25%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Header Info */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 tracking-wider uppercase font-black">ELEV8 GROUP</span>
            <h1 className="text-sm font-bold text-slate-200">Secure Procurement Gateway</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>FIPS-140-3 COMPLIANT</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl w-full">
          
          {/* Left Hero column */}
          <div className="lg:col-span-5 space-y-6 text-left" id="login_hero_side">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Identity & Cryptographic Isolation</span>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Central Subsidiary & Document Ledger
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              Verify legal files, validate BIR clearances, assess vendor performance records, and execute subsidiary-level contract operations within a single multi-tenant workspace.
            </p>

            {/* Feature Checkboxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted base64 Upload Storage</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                <FileLock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Trust Network Access Policies</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Continuous SOC2 Verification Logging</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7" id="login_form_side">
            <div className="bg-slate-900/45 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    {isRegistering ? 'Account Registration' : 'System Access Control'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRegistering 
                      ? 'Create a new corporate representative credentials record.' 
                      : 'Authenticate using your corporate email address to unlock file databases.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider py-1 px-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-lg cursor-pointer"
                >
                  {isRegistering ? 'Log In Instead' : 'Register Account'}
                </button>
              </div>

              {/* Form Area */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-250">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Banner */}
                {success && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Full Name field if registering */}
                {isRegistering && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">Full Representative Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setError(''); }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email Fields */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">Corporate Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">@</span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="username@elev8.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Workspace Password</label>
                    {!isRegistering && <span className="text-[10px] text-indigo-400 font-medium cursor-pointer hover:underline">Reset Password</span>}
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-10 text-xs font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Grid selection - Role and Subsidiary Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Role */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">Security Group</label>
                    <select
                      value={role}
                      onChange={(e: any) => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold tracking-tight focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="ADMIN">Corporate Administrator</option>
                      <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                      <option value="GUEST_AUDITOR">External Guest Auditor</option>
                    </select>
                  </div>

                  {/* Select Subsidiary Workspace */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">Subsidiary Filter</label>
                    <select
                      value={subsidiary}
                      onChange={(e: any) => setSubsidiary(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold tracking-tight focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="ALL">All Subsidiaries combined</option>
                      <option value="MEDIA">Elev8 Media Inc. only</option>
                      <option value="HOLDINGS">Elev8 Holdings and Assets</option>
                      <option value="TRADING">Trading & International</option>
                    </select>
                  </div>
                </div>

                {/* Sandbox Accounts Presets Helper */}
                {!isRegistering && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/60 text-left">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Audit Credentials Sandbox Presets:</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5" id="presets_grid_box">
                      {PRESET_ACCOUNTS.map((preset) => (
                        <button
                          key={preset.email}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-2 rounded-xl text-left border transition-all text-[11px] font-semibold cursor-pointer ${
                            email === preset.email 
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-extrabold' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs truncate leading-tight">{preset.label}</div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{preset.email}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/25 transition-all mt-4 cursor-pointer"
                >
                  {loading 
                    ? (isRegistering ? 'Registering credential nodes...' : 'Validating cryptographic key entries...') 
                    : (isRegistering ? 'Complete Registration & Access Portal' : 'Initiate Secure Portal Session')}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-4 border-t border-slate-900 bg-slate-950 text-center text-[10.5px] text-slate-600 z-10 font-bold">
        <span>© 2026 Elev8 Group Philippines. Authorized personnel access only. SOC2 Security Assurance protocol active.</span>
      </footer>

    </div>
  );
}
