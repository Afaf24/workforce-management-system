"use client";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

type Mode = "signin" | "register";
type Role = "employee" | "hr" | "deptmanager";

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [role, setRole] = useState<Role>("employee");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "register") {
      if (!fullName.trim()) return setError("Please enter your full name.");
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirm) return setError("Passwords do not match.");
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      setSuccess(true);
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  const roleConfig = [
    {
      key: "employee" as Role,
      label: "Employee",
      desc: "Clock in, request leave, view payslips",
      icon: "👤",
      color: "border-emerald-500 bg-emerald-50",
      dot: "bg-emerald-500",
    },
    {
      key: "deptmanager" as Role,
      label: "Dept. Manager",
      desc: "Manage team, assign tasks, approve leave",
      icon: "👥",
      color: "border-blue-500 bg-blue-50",
      dot: "bg-blue-500",
    },
    {
      key: "hr" as Role,
      label: "HR Manager",
      desc: "Full access, payroll, recruitment",
      icon: "🏢",
      color: "border-purple-500 bg-purple-50",
      dot: "bg-purple-500",
    },
  ];

  const selectedRole = roleConfig.find(r => r.key === role);

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
        <p className="text-gray-500 text-sm mb-1">Welcome, <strong>{fullName}</strong>.</p>
        <p className="text-gray-500 text-sm mb-6">
          A confirmation email has been sent to <strong>{email}</strong>.
          {role === "employee" && " Your HR Manager has been notified."}
          {role === "deptmanager" && " HR has been notified of your department manager account."}
        </p>
        <div className="rounded-lg bg-green-50 border border-green-100 p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-green-700 mb-2">
            {role === "hr" ? "✅ HR Manager account — full access" :
             role === "deptmanager" ? "✅ Department Manager account" :
             "✅ Employee account"}
          </p>
          <ul className="text-xs text-green-600 space-y-1">
            {role === "hr" && <>
              <li>• Full employee management & recruitment</li>
              <li>• Payroll, contracts, and performance</li>
              <li>• Company-wide announcements</li>
            </>}
            {role === "deptmanager" && <>
              <li>• Manage and assign tasks to your team</li>
              <li>• Approve or reject leave requests</li>
              <li>• Monitor team attendance & performance</li>
            </>}
            {role === "employee" && <>
              <li>• Personal attendance clock in/out</li>
              <li>• Leave request submission</li>
              <li>• AI HR Assistant access</li>
            </>}
          </ul>
        </div>
        <button
          onClick={() => { setSuccess(false); setMode("signin"); setFullName(""); setPassword(""); setConfirm(""); }}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors mb-3">
          Sign in now
        </button>
        <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 hidden sm:block">WMSystem</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">HR SYSTEM</p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">
              {mode === "signin" ? "Sign in." : "Create account."}
            </h1>
            <p className="text-gray-400 text-sm">
              {mode === "signin" ? "Access your HR portal." : "Join your organization."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {mode === "register" && (
              <div className="border-b border-gray-200 pb-1 focus-within:border-gray-900 transition-colors">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                <input type="text" placeholder="Jane Doe" value={fullName}
                  onChange={e => setFullName(e.target.value)} required
                  className="w-full bg-transparent text-gray-900 text-base placeholder:text-gray-300 focus:outline-none" />
              </div>
            )}

            <div className="border-b border-gray-200 pb-1 focus-within:border-gray-900 transition-colors">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full bg-transparent text-gray-900 text-base placeholder:text-gray-300 focus:outline-none" />
            </div>

            <div className="border-b border-gray-200 pb-1 focus-within:border-gray-900 transition-colors">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <div className="flex items-center gap-2">
                <input type={showPw ? "text" : "password"}
                  placeholder={mode === "register" ? "Min 8 characters" : "••••••••"}
                  value={password} onChange={e => setPassword(e.target.value)} required
                  className="flex-1 bg-transparent text-gray-900 text-base placeholder:text-gray-300 focus:outline-none" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-300 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="border-b border-gray-200 pb-1 focus-within:border-gray-900 transition-colors">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Confirm Password</label>
                <div className="flex items-center gap-2">
                  <input type={showCf ? "text" : "password"} placeholder="••••••••"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required
                    className={`flex-1 bg-transparent text-base placeholder:text-gray-300 focus:outline-none ${confirm && confirm !== password ? "text-red-500" : "text-gray-900"}`} />
                  <button type="button" onClick={() => setShowCf(!showCf)} className="text-gray-300 hover:text-gray-600 transition-colors">
                    {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm && confirm !== password && <p className="text-xs text-red-400 mt-1">Passwords do not match</p>}
                {confirm && confirm === password && <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>}
              </div>
            )}

            {/* Role selector — 3 options */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">I am registering as</label>
                <div className="space-y-2">
                  {roleConfig.map(({ key, label, desc, icon, color }) => (
                    <button key={key} type="button" onClick={() => setRole(key)}
                      className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left ${role === key ? color + " border-opacity-100" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${role === key ? "border-gray-900" : "border-gray-300"}`}>
                        {role === key && <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
                      </div>
                      <span className="text-lg">{icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${role === key ? "text-gray-900" : "text-gray-500"}`}>{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors uppercase tracking-wider">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                : mode === "signin" ? "Sign in" : `Create ${selectedRole?.label ?? ""} Account`}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            {mode === "signin" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); setError(null); }} className="text-gray-900 font-bold hover:underline">Create account</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("signin"); setError(null); }} className="text-gray-900 font-bold hover:underline">Sign in</button>
              </>
            )}
          </p>

          {mode === "signin" && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">Demo accounts</p>
              <div className="space-y-2">
                {[
                  { role: "HR Manager",    email: "hr.manager@company.com",   dot: "bg-purple-500" },
                  { role: "Dept. Manager", email: "dept.manager@company.com", dot: "bg-blue-500"   },
                  { role: "Employee",      email: "employee@company.com",      dot: "bg-emerald-500"},
                ].map(({ role: r, email: demoEmail, dot }) => (
                  <button key={demoEmail} type="button"
                    onClick={() => { setEmail(demoEmail); setPassword("Passw0rd!"); }}
                    className="flex items-center gap-3 w-full text-left py-1.5 hover:opacity-70 transition-opacity">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                    <span className="text-xs text-gray-400">{r}</span>
                    <span className="text-xs text-gray-300 ml-auto font-mono truncate">{demoEmail}</span>
                  </button>
                ))}
                <p className="text-xs text-gray-300 pt-1">Password: Passw0rd!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}