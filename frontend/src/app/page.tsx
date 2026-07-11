"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2, Users, Clock, CalendarDays, Bot, Shield,
  TrendingUp, CheckCircle, ArrowRight, Star, ChevronDown,
  ChevronUp, Zap, BarChart3, Globe, Lock, FileText,
  Bell, Menu, X, Sparkles, Play
} from "lucide-react";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return count;
}

const features = [
  { icon: Users, title: "Smart Employee Hub", desc: "Manage your entire workforce in one place. Add, edit, search, and view detailed employee profiles.", color: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/30" },
  { icon: Clock, title: "Real-Time Attendance", desc: "Clock in/out tracking with late detection, worked hours calculation, and monthly reports.", color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30" },
  { icon: CalendarDays, title: "Leave Management", desc: "Streamlined leave requests, multi-level approvals, and automatic balance tracking.", color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/30" },
  { icon: Bot, title: "AI HR Assistant", desc: "Ask anything about HR policies, leave balance, or attendance — instant accurate answers.", color: "from-orange-500 to-red-500", glow: "shadow-orange-500/30" },
  { icon: BarChart3, title: "Reports & Analytics", desc: "Generate attendance reports, leave summaries, and HR insights with one click.", color: "from-pink-500 to-rose-600", glow: "shadow-pink-500/30" },
  { icon: Shield, title: "Role-Based Access", desc: "HR Manager, Department Manager, Employee — each with exactly the right access.", color: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/30" },
];

const steps = [
  { step: "01", title: "Register Your Team", desc: "HR Managers and Employees register through separate dedicated portals, each with a tailored onboarding experience." },
  { step: "02", title: "Automate Workflows", desc: "Employees clock in/out, submit leave requests, and chat with the AI assistant instantly from any device." },
  { step: "03", title: "Track & Optimize", desc: "Managers review real-time attendance, approve leaves, and get AI-powered summaries to make smarter decisions." },
];

const testimonials = [
  { name: "Sara Ahmed", role: "HR Manager, TechCorp", text: "This system transformed how we handle HR. The AI assistant saves us hours every week answering policy questions.", rating: 5, color: "from-purple-500 to-indigo-600" },
  { name: "Omar Khalil", role: "Department Manager, StartupX", text: "Approving leave requests used to take days of back-and-forth. Now it takes 30 seconds from my phone.", rating: 5, color: "from-blue-500 to-cyan-600" },
  { name: "Layla Hassan", role: "Software Engineer, DevStudio", text: "I can check my leave balance, attendance history, and HR policies any time without bothering anyone in HR.", rating: 5, color: "from-emerald-500 to-teal-600" },
];

const faqs = [
  { q: "What roles does the system support?", a: "Three roles: HR Manager (full access), Department Manager (team management + approvals), and Employee (personal attendance, leaves, and AI assistant)." },
  { q: "How does the AI HR Assistant work?", a: "Powered by OpenAI GPT, grounded with your own HR data — leave balances, attendance records, and company HR policies — so answers are accurate and personalized." },
  { q: "Is my data secure?", a: "Yes. JWT authentication, role-based authorization, and bcrypt password hashing. No data is shared with third parties." },
  { q: "How does registration work?", a: "HR Managers and Employees register through separate dedicated pages. Welcome emails are sent automatically and HR is notified of new employee sign-ups." },
  { q: "How long does setup take?", a: "Under 10 minutes. Run the backend, start the frontend, and the database seeds automatically with demo accounts ready to use." },
];

function Particles({ count = 20 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: (i * 17.3) % 100,
      y: (i * 23.7) % 100,
      size: 2 + (i % 4),
      duration: 4 + (i % 6),
      delay: (i * 0.4) % 5,
      hue: 220 + (i * 7) % 60,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full opacity-0" style={{
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: `hsl(${p.hue} 80% 65%)`,
          animation: `particleFly ${p.duration}s ${p.delay}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function Counter({ target, suffix = "", active }: { target: number; suffix?: string; active: boolean }) {
  const n = useCountUp(target, active);
  return <>{n}{suffix}</>;
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const heroRef   = useInView(0.1);
  const featRef   = useInView(0.1);
  const stepsRef  = useInView(0.1);
  const testiRef  = useInView(0.1);
  const statsRef  = useInView(0.2);
  const ctaRef    = useInView(0.2);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse  = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes particleFly { 0%{transform:translateY(0) scale(1);opacity:0} 20%{opacity:0.6} 80%{opacity:0.4} 100%{transform:translateY(-80px) scale(0);opacity:0} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes orb { 0%,100%{transform:scale(1) translate(0,0)} 33%{transform:scale(1.1) translate(30px,-20px)} 66%{transform:scale(0.9) translate(-20px,15px)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes bounceSubtle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        .animate-grad    { background-size:300% 300%;animation:gradShift 8s ease infinite; }
        .animate-floatA  { animation:floatA 7s ease-in-out infinite; }
        .animate-floatB  { animation:floatB 9s ease-in-out infinite; }
        .animate-orb     { animation:orb 12s ease-in-out infinite; }
        .animate-spin-slow { animation:spinSlow 20s linear infinite; }
        .animate-bounce-subtle { animation:bounceSubtle 2s ease-in-out infinite; }
        .fade-up  { animation:fadeUp  0.7s ease both; }
        .fade-in  { animation:fadeIn  0.6s ease both; }
        .scale-in { animation:scaleIn 0.6s ease both; }
        .card-shine { position:relative;overflow:hidden; }
        .card-shine::after { content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%);animation:shimmer 3s 1s infinite; }
        .text-grad { background:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 40%,#06b6d4 80%,#3b82f6 100%);background-size:300% 300%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:gradShift 6s ease infinite; }
        .hover-lift { transition:transform 0.25s ease,box-shadow 0.25s ease; }
        .hover-lift:hover { transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.12); }
      `}</style>

      {/* cursor glow */}
      <div className="fixed pointer-events-none z-50 rounded-full hidden md:block" style={{
        width:400,height:400,
        left:mouse.x-200,top:mouse.y-200,
        background:"radial-gradient(circle,hsl(234 80% 60% / 0.06),transparent 70%)",
        transition:"left 0.12s ease,top 0.12s ease",
      }} />

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrollY>60?"bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100":"bg-transparent"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl overflow-hidden">
              <div className="absolute inset-0 animate-grad" style={{background:"linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)"}} />
              <div className="relative flex items-center justify-center h-full"><Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" /></div>
            </div>
            <span className="text-base sm:text-lg font-black text-gray-900">WMSystem</span>
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-500">
            {["features","how-it-works","testimonials","faq"].map(id=>(
              <a key={id} href={`#${id}`} className="hover:text-gray-900 transition-colors capitalize relative group">
                {id.replace("-"," ")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/login" className="relative overflow-hidden rounded-xl px-5 py-2 text-sm font-bold text-white card-shine" style={{background:"linear-gradient(135deg,#3b82f6,#8b5cf6)"}}>
              Get Started <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={()=>setMobileOpen(!mobileOpen)}>
            {mobileOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}
          </button>
        </div>
        {mobileOpen&&(
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {["features","how-it-works","faq"].map(id=>(
              <a key={id} href={`#${id}`} onClick={()=>setMobileOpen(false)} className="block text-sm font-medium text-gray-600 py-1 capitalize">{id.replace("-"," ")}</a>
            ))}
            <Link href="/login" onClick={()=>setMobileOpen(false)} className="block w-full rounded-xl bg-gray-900 px-4 py-2.5 text-center text-sm font-bold text-white">Sign In / Register</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 animate-grad" style={{background:"linear-gradient(135deg,#eff6ff 0%,#f5f3ff 40%,#ecfeff 80%,#eff6ff 100%)",backgroundSize:"400% 400%"}} />
          <div className="absolute -top-32 -left-32 w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-30 animate-orb" style={{background:"radial-gradient(circle,#6366f1,transparent 70%)"}} />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 sm:w-96 sm:h-96 rounded-full opacity-20 animate-orb" style={{background:"radial-gradient(circle,#06b6d4,transparent 70%)",animationDelay:"4s"}} />
        </div>

        <Particles count={20} />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[700px] sm:h-[700px] rounded-full border border-blue-200/30 animate-spin-slow -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full border border-purple-200/30 animate-spin-slow -z-10" style={{animationDirection:"reverse",animationDuration:"15s"}} />

        <div ref={heroRef.ref} className="mx-auto max-w-7xl px-4 sm:px-6 text-center relative z-10 py-16 sm:py-0">

          <h1 className={`mx-auto max-w-xs sm:max-w-2xl md:max-w-4xl lg:max-w-5xl text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.05] tracking-tight mb-4 sm:mb-6 ${heroRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.1s"}}>
            Built for Teams.{" "}
            <span className="text-grad">Powered</span>{" "}
            for Better WORKFORCE.
          </h1>

          <p className={`mx-auto max-w-sm sm:max-w-xl md:max-w-2xl text-base sm:text-lg md:text-xl text-gray-500 mb-8 sm:mb-10 leading-relaxed ${heroRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.25s"}}>
            Manage, track, and grow your team with powerful automation, real-time insights, and AI-powered support — all in one beautiful platform.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 ${heroRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.4s"}}>
            <Link href="/login"
              className="group relative overflow-hidden rounded-2xl px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-black text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all card-shine w-full sm:w-auto text-center"
              style={{background:"linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)"}}>
              <span className="relative flex items-center justify-center gap-2">
                Register / Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <button className="group rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold text-gray-700 hover:border-blue-300 hover:bg-white hover:scale-105 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-50 flex items-center justify-center">
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          <p className={`text-xs text-gray-400 mb-10 sm:mb-20 ${heroRef.visible?"fade-in":"opacity-0"}`} style={{animationDelay:"0.5s"}}>
            ✓ Free to use &nbsp;·&nbsp; ✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 10 minutes
          </p>

          {/* dashboard mockup — hidden on mobile */}
          <div className={`relative mx-auto max-w-5xl hidden sm:block ${heroRef.visible?"scale-in":"opacity-0"}`} style={{animationDelay:"0.65s"}}>
            <div className="animate-floatA rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/60 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400"/><span className="h-3 w-3 rounded-full bg-yellow-400"/><span className="h-3 w-3 rounded-full bg-emerald-400"/>
                <div className="ml-4 flex-1 rounded-md bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400 text-left">🔒 localhost:3000/dashboard</div>
              </div>
              <div className="flex h-72 bg-gray-50">
                <div className="w-44 flex flex-col p-3 gap-1 shrink-0" style={{background:"linear-gradient(180deg,#1e1b4b,#312e81)"}}>
                  <div className="flex items-center gap-2 px-2 py-2.5 mb-2">
                    <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center"><Building2 className="h-3.5 w-3.5 text-white"/></div>
                    <span className="text-xs font-black text-white">HRSystem</span>
                  </div>
                  {["Dashboard","Employees","Attendance","Leave Requests","AI Assistant"].map((item,i)=>(
                    <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${i===0?"bg-blue-600 text-white shadow":"text-white/50"}`}>
                      <div className="h-2.5 w-2.5 rounded bg-current opacity-70"/>{item}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  <p className="text-xs font-bold text-gray-700 mb-3">Welcome back, Sara 👋</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[{l:"Status",v:"Present",c:"bg-emerald-100 text-emerald-700"},{l:"Annual Leave",v:"18 days",c:"bg-blue-100 text-blue-700"},{l:"Sick Leave",v:"9 days",c:"bg-purple-100 text-purple-700"},{l:"Pending",v:"3 requests",c:"bg-red-100 text-red-700"}].map(({l,v,c})=>(
                      <div key={l} className="rounded-lg bg-white border border-gray-100 p-2.5 shadow-sm">
                        <p className="text-xs text-gray-400 mb-1">{l}</p>
                        <p className={`text-xs font-bold px-1.5 py-0.5 rounded-full inline-block ${c}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 rounded-lg bg-white border border-gray-100 p-2.5 shadow-sm">
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Attendance</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs"><span className="text-gray-400">In</span><span className="font-semibold text-emerald-600">09:02 AM</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-400">Status</span><span className="font-semibold text-emerald-600">Present</span></div>
                      </div>
                    </div>
                    <div className="col-span-2 rounded-lg bg-white border border-gray-100 p-2.5 shadow-sm">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Leave Balances</p>
                      {[{l:"Annual",p:86},{l:"Sick",p:90}].map(({l,p})=>(
                        <div key={l} className="mb-1.5">
                          <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-400">{l}</span><span className="font-medium">{p}%</span></div>
                          <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full" style={{width:`${p}%`,background:"linear-gradient(90deg,#3b82f6,#8b5cf6)"}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* floating cards */}
            <div className="animate-floatB absolute -left-10 top-10 rounded-xl bg-white border border-gray-200 shadow-xl p-3 hidden lg:flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-emerald-600"/></div>
              <div><p className="text-xs font-bold text-gray-800">Leave Approved!</p><p className="text-xs text-gray-400">Annual · 3 days</p></div>
            </div>
            <div className="animate-floatA absolute -right-10 top-6 rounded-xl bg-white border border-gray-200 shadow-xl p-3 hidden lg:flex items-center gap-2.5" style={{animationDelay:"1.5s"}}>
              <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center"><Bot className="h-5 w-5 text-blue-600"/></div>
              <div><p className="text-xs font-bold text-gray-800">AI Assistant</p><p className="text-xs text-gray-400">18 days remaining</p></div>
            </div>
            <div className="animate-floatB absolute -right-6 bottom-12 rounded-xl bg-white border border-gray-200 shadow-xl p-3 hidden lg:flex items-center gap-2.5" style={{animationDelay:"3s"}}>
              <div className="h-9 w-9 rounded-xl bg-purple-100 flex items-center justify-center"><Clock className="h-5 w-5 text-purple-600"/></div>
              <div><p className="text-xs font-bold text-gray-800">Clocked In</p><p className="text-xs text-gray-400">09:02 AM · Present</p></div>
            </div>
            <div className="absolute -inset-10 -z-10 rounded-3xl opacity-30" style={{background:"radial-gradient(ellipse,#6366f1 0%,transparent 70%)",filter:"blur(40px)"}}/>
          </div>

          <div className="mt-8 sm:mt-16 flex flex-col items-center gap-2 animate-bounce-subtle">
            <p className="text-xs text-gray-300 font-medium">Scroll to explore</p>
            <ChevronDown className="h-5 w-5 text-gray-300"/>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 sm:py-20 bg-white border-y border-gray-100">
        <div ref={statsRef.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-300 mb-8 sm:mb-12">Trusted by growing teams worldwide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              {target:12,suffix:"k+",label:"Active Employees Managed"},
              {target:98,suffix:"%",label:"Customer Satisfaction"},
              {target:3,suffix:"×",label:"Faster HR Processes"},
              {target:65,suffix:"%",label:"Reduction in Admin Work"},
            ].map(({target,suffix,label})=>(
              <div key={label} className="text-center hover-lift rounded-2xl p-4 sm:p-6 border border-gray-100 bg-gray-50 cursor-default">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 text-grad">
                  <Counter target={target} suffix={suffix} active={statsRef.visible}/>
                </p>
                <p className="text-xs sm:text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-28 bg-[#fafafa]">
        <div ref={featRef.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`text-center mb-12 sm:mb-16 ${featRef.visible?"fade-up":"opacity-0"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-xl mx-auto">One platform for all your HR needs — from onboarding to AI-powered support.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map(({icon:Icon,title,desc,color,glow},i)=>(
              <div key={title} className={`group hover-lift rounded-2xl bg-white border border-gray-100 p-5 sm:p-6 cursor-pointer ${featRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:`${i*0.08}s`}}>
                <div className={`inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} mb-4 shadow-lg ${glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white"/>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10 sm:mb-14">Problem & Solution</h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { label:"❌ The Problem", tag:"bg-red-50 text-red-600", border:"border-red-100", bg:"from-red-50/60 to-orange-50/40",
                items:["Spreadsheets for attendance tracking","Email chains for leave approvals","No single source of truth for HR","Employees don't know their leave balance"],
                iconBg:"bg-red-200 text-red-600", isX:true },
              { label:"✅ The Solution", tag:"bg-emerald-50 text-emerald-600", border:"border-emerald-100", bg:"from-emerald-50/60 to-teal-50/40",
                items:["One-click clock in/out with smart reports","Instant leave requests with auto-routing","Real-time HR dashboard for every role","AI assistant answers policy questions instantly"],
                iconBg:"bg-emerald-200 text-emerald-600", isX:false },
            ].map(({label,tag,border,bg,items,iconBg,isX})=>(
              <div key={label} className={`hover-lift rounded-2xl border-2 ${border} bg-gradient-to-br ${bg} p-6 sm:p-8`}>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold mb-5 sm:mb-6 ${tag}`}>{label}</span>
                <ul className="space-y-3">
                  {items.map(item=>(
                    <li key={item} className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                      <div className={`h-5 w-5 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                        {isX?<X className="h-3 w-3"/>:<CheckCircle className="h-3 w-3"/>}
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#fafafa]">
        <div ref={stepsRef.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`text-center mb-12 sm:mb-16 ${stepsRef.visible?"fade-up":"opacity-0"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">Set Up in Minutes</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"/>
            {steps.map(({step,title,desc},i)=>(
              <div key={step} className={`text-center ${stepsRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:`${i*0.15}s`}}>
                <div className="inline-flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl text-white text-xl sm:text-2xl font-black shadow-xl shadow-blue-500/30 hover-lift mx-auto mb-5 sm:mb-6" style={{width:64,height:64,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)"}}>
                  {step}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 sm:py-24 bg-white">
        <div ref={testiRef.ref} className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className={`text-center mb-10 sm:mb-14 ${testiRef.visible?"fade-up":"opacity-0"}`}>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Loved by Teams</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map(({name,role,text,rating,color},i)=>(
              <div key={name} className={`hover-lift rounded-2xl bg-white border border-gray-100 p-5 sm:p-6 ${testiRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:`${i*0.1}s`}}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({length:rating}).map((_,j)=><Star key={j} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"/>)}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 sm:mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-black`}>{name.charAt(0)}</div>
                  <div><p className="text-xs sm:text-sm font-bold text-gray-900">{name}</p><p className="text-xs text-gray-400">{role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 bg-[#fafafa]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10 sm:mb-14">Got Questions?</h2>
          <div className="space-y-3">
            {faqs.map(({q,a},i)=>(
              <div key={i} className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${openFaq===i?"border-blue-200 shadow-sm":"border-gray-100"}`}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="flex w-full items-center justify-between px-5 sm:px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-bold text-gray-900 pr-4">{q}</span>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${openFaq===i?"bg-blue-100 rotate-180":"bg-gray-100"}`}>
                    <ChevronDown className={`h-4 w-4 ${openFaq===i?"text-blue-600":"text-gray-400"}`}/>
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq===i?"max-h-40 opacity-100":"max-h-0 opacity-0"}`}>
                  <p className="px-5 sm:px-6 pb-4 text-xs sm:text-sm text-gray-500 leading-relaxed">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 relative overflow-hidden" ref={ctaRef.ref}>
        <div className="absolute inset-0 animate-grad" style={{background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 30%,#1d4ed8 60%,#0891b2 100%)"}}/>
        <Particles count={25}/>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className={`grid grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16 ${ctaRef.visible?"fade-up":"opacity-0"}`}>
            {[{target:80,suffix:"%",label:"HR time saved"},{target:3,suffix:"×",label:"faster approvals"},{target:65,suffix:"%",label:"fewer HR queries"}].map(({target,suffix,label})=>(
              <div key={label}>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-1"><Counter target={target} suffix={suffix} active={ctaRef.visible}/></p>
                <p className="text-xs sm:text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 ${ctaRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.2s"}}>
            Ready to simplify your HR?
          </h2>
          <p className={`text-white/50 mb-8 sm:mb-10 text-base sm:text-lg ${ctaRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.3s"}}>
            Start managing your team smarter today.
          </p>
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${ctaRef.visible?"fade-up":"opacity-0"}`} style={{animationDelay:"0.4s"}}>
            <Link href="/login" className="hover-lift inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-black text-blue-700 shadow-xl w-full sm:w-auto">
              Get Started Free <ArrowRight className="h-4 w-4"/>
            </Link>
            <Link href="/login" className="hover-lift inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold text-white hover:bg-white/20 transition-colors w-full sm:w-auto">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 animate-grad" style={{background:"linear-gradient(135deg,#3b82f6,#8b5cf6)"}}/>
                  <Building2 className="relative h-4 w-4 text-white m-auto mt-2"/>
                </div>
                <span className="font-black text-gray-900">HRSystem</span>
              </div>
              <p className="text-sm text-gray-400">AI-Powered HR Management for modern teams.</p>
            </div>
            {[
              {title:"Product",links:["Features","How it Works","Pricing","Changelog"]},
              {title:"Company",links:["About","Blog","Careers","Contact"]},
              {title:"Legal",links:["Privacy Policy","Terms","Security","Cookies"]},
            ].map(({title,links})=>(
              <div key={title}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3 sm:mb-4">{title}</p>
                <ul className="space-y-2">{links.map(l=><li key={l}><a href="#" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-300">© 2026 HRSystem. Graduation Project. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[Globe,Lock,FileText,Bell].map((Icon,i)=><Icon key={i} className="h-4 w-4 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"/>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
