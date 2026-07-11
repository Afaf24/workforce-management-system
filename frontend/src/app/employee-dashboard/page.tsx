"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api-client";
import type { Attendance, LeaveBalance } from "@/types";
import {
  getTasksForEmployee, toggleTaskDone, getAnnouncements, getMeetings,
  type HRTask, type HRAnnouncement, type HRMeeting,
} from "@/lib/hr-store";
import {
  LayoutDashboard, User, Newspaper, FileText, Clock,
  CalendarDays, CheckCircle2, Bell, Building2, LogOut,
  Timer, Play, Square, Megaphone, Video,
} from "lucide-react";

export default function EmployeeDashboardPage() {
  const { user, logout } = useAuth();
  const [today,        setToday]        = useState<Attendance | null>(null);
  const [balances,     setBalances]     = useState<LeaveBalance[]>([]);
  const [isClockedIn,  setIsClockedIn]  = useState(false);
  const [clockInTime,  setClockInTime]  = useState<Date | null>(null);
  const [elapsed,      setElapsed]      = useState("00:00:00");
  const [isClocking,   setIsClocking]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [tasks,        setTasks]        = useState<HRTask[]>([]);
  const [announcements,setAnnouncements]= useState<HRAnnouncement[]>([]);
  const [meetings,     setMeetings]     = useState<HRMeeting[]>([]);
  const [rsvps,        setRsvps]        = useState<Record<string, string>>({});
  const [activeTab,    setActiveTab]    = useState<"feed" | "calendar">("feed");

  useEffect(() => {
    api.get<Attendance | null>("/api/v1/attendance/today").then(a => {
      setToday(a);
      if (a?.clockIn && !a?.clockOut) {
        setIsClockedIn(true);
        setClockInTime(new Date(a.clockIn));
      }
    }).catch(() => {});
    api.get<LeaveBalance[]>("/api/v1/leave/balances").then(setBalances).catch(() => {});

    // Load from shared store
    if (user?.employeeId) setTasks(getTasksForEmployee(user.employeeId));
    setAnnouncements(getAnnouncements());
    setMeetings(getMeetings());

    const sync = () => {
      if (user?.employeeId) setTasks(getTasksForEmployee(user.employeeId));
      setAnnouncements(getAnnouncements());
      setMeetings(getMeetings());
    };
    window.addEventListener("hr_store_update", sync);
    return () => window.removeEventListener("hr_store_update", sync);
  }, [user?.employeeId]);

  useEffect(() => {
    if (!isClockedIn || !clockInTime) return;
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
      const s = (diff % 60).toString().padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [isClockedIn, clockInTime]);

  async function handleClockIn() {
    setIsClocking(true); setError(null);
    try {
      const r = await api.post<Attendance>("/api/v1/attendance/clock-in", { notes: null });
      setToday(r); setIsClockedIn(true); setClockInTime(new Date(r.clockIn!));
    } catch (err) { setError(err instanceof ApiError ? err.message : "Failed"); }
    finally { setIsClocking(false); }
  }

  async function handleClockOut() {
    setIsClocking(true); setError(null);
    try {
      const r = await api.post<Attendance>("/api/v1/attendance/clock-out", { notes: null });
      setToday(r); setIsClockedIn(false);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Failed"); }
    finally { setIsClocking(false); }
  }

  function handleToggleTask(id: string) {
    toggleTaskDone(id);
    if (user?.employeeId) setTasks(getTasksForEmployee(user.employeeId));
  }

  const annualBalance  = balances.find(b => b.leaveType === "Annual");
  const pendingTasks   = tasks.filter(t => !t.done).length;
  const newAnnouncements = announcements.length;
  const upcomingMeetings = meetings.length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-56 flex flex-col shrink-0 border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">HRSystem</p>
            <p className="text-xs text-gray-400">Employee</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">My Space</p>
          {[
            { icon: LayoutDashboard, label: "My Dashboard",  active: true },
            { icon: User,            label: "My Profile",    href: "/settings" },
            { icon: Newspaper,       label: "Company Feed",  tab: "feed" },
            { icon: FileText,        label: "My Documents" },
          ].map(({ icon: Icon, label, active, href, tab }) =>
            href ? (
              <a key={label} href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <Icon className="h-4 w-4" />{label}
              </a>
            ) : (
              <button key={label}
                onClick={() => tab && setActiveTab(tab as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                <Icon className="h-4 w-4" />{label}
                {label === "Company Feed" && newAnnouncements > 0 && (
                  <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{newAnnouncements}</span>
                )}
              </button>
            )
          )}
          <div className="pt-4">
            <p className="px-2 text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">Quick Links</p>
            <a href="/leaves" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <CalendarDays className="h-4 w-4" />My Leaves
            </a>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <Bell className="h-4 w-4" />Notifications
              {pendingTasks > 0 && <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingTasks}</span>}
            </button>
          </div>
        </nav>
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
              {user?.fullName?.charAt(0) ?? "E"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">Employee</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors w-full">
            <LogOut className="h-3.5 w-3.5" />Log out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* top banner */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Welcome, {user?.fullName?.split(" ")[0]} 👋</h1>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</p>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="h-4 w-4 text-gray-500" />
              {(pendingTasks + newAnnouncements) > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Annual Leave Left", value: annualBalance ? `${annualBalance.remaining}d` : "—",      icon: CalendarDays, color: "text-blue-600 bg-blue-50"    },
              { label: "Today Status",      value: today?.status ?? "Not in",                                 icon: Clock,        color: today?.clockIn ? "text-emerald-600 bg-emerald-50" : "text-gray-400 bg-gray-50" },
              { label: "My Tasks",          value: `${pendingTasks} pending`,                                icon: CheckCircle2, color: pendingTasks>0?"text-orange-600 bg-orange-50":"text-emerald-600 bg-emerald-50" },
              { label: "Meetings",          value: `${upcomingMeetings} upcoming`,                           icon: Video,        color: "text-purple-600 bg-purple-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* workspace */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
            {[
              { key: "feed",     label: "Company Feed",  badge: newAnnouncements },
              { key: "calendar", label: "My Schedule",   badge: 0 },
            ].map(({ key, label, badge }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                {label}
                {!!badge && <span className="h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{badge}</span>}
              </button>
            ))}
          </div>

          {activeTab === "feed" && (
            <div className="space-y-4">
              {/* meetings from HR */}
              {meetings.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">📅 Meeting Invitations from HR</p>
                  <div className="space-y-3 mb-6">
                    {meetings.map(m => (
                      <div key={m.id} className="bg-white rounded-xl border border-orange-100 p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{m.title}</h3>
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Meeting</span>
                        </div>
                        <p className="text-xs text-gray-500">📅 {new Date(m.dateTime).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">📍 {m.location}</p>
                        {m.description && <p className="text-xs text-gray-400 mt-1 italic">"{m.description}"</p>}
                        <div className="flex gap-2 mt-3">
                          {["Yes","No","Maybe"].map(r => (
                            <button key={r}
                              onClick={() => setRsvps(prev => ({ ...prev, [m.id]: r.toLowerCase() }))}
                              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                rsvps[m.id] === r.toLowerCase()
                                  ? r==="Yes"?"bg-emerald-500 text-white":r==="No"?"bg-red-500 text-white":"bg-blue-500 text-white"
                                  : r==="Yes"?"bg-emerald-50 text-emerald-700 hover:bg-emerald-100":r==="No"?"bg-red-50 text-red-600 hover:bg-red-100":"bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}>
                              {rsvps[m.id] === r.toLowerCase() ? `✓ ${r}` : r}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* announcements from HR */}
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">📢 Company Announcements</p>
              {announcements.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                  <Megaphone className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">No announcements yet.</p>
                </div>
              ) : (
                announcements.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <Megaphone className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{a.authorName} · HR</p>
                          <p className="text-xs text-gray-300">{new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.tagColor}`}>{a.tag}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{a.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">My Schedule — This Week</p>
              <div className="grid grid-cols-5 gap-2">
                {["Mon","Tue","Wed","Thu","Fri"].map((day, i) => (
                  <div key={day} className={`rounded-xl p-3 text-center ${i===1?"bg-emerald-50 border-2 border-emerald-200":"bg-gray-50 border border-gray-100"}`}>
                    <p className="text-xs font-semibold text-gray-400 mb-1">{day}</p>
                    <p className={`text-lg font-black ${i===1?"text-emerald-700":"text-gray-700"}`}>{7+i}</p>
                    {i===1 && <p className="text-xs text-emerald-600 mt-1">Today</p>}
                    {meetings[i] && <p className="text-xs text-orange-500 mt-1 truncate">{meetings[i]?.title}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT PANEL ── */}
      <aside className="w-72 flex flex-col shrink-0 border-l border-gray-200 bg-white overflow-y-auto">

        {/* Tasks assigned by HR */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">My Tasks from HR</p>
            {pendingTasks > 0 && <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{pendingTasks}</span>}
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-300">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className={`flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors ${t.done?"opacity-40":""}`}>
                  <button onClick={() => handleToggleTask(t.id)}
                    className={`mt-0.5 h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${t.done?"border-emerald-500 bg-emerald-500":"border-gray-300 hover:border-emerald-400"}`}>
                    {t.done && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-gray-700 leading-relaxed ${t.done?"line-through":""}`}>{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs font-semibold ${t.priority==="high"?"text-red-500":t.priority==="medium"?"text-orange-500":"text-gray-400"}`}>{t.priority}</span>
                      {t.dueDate !== "No deadline" && <span className="text-xs text-gray-300">· Due {t.dueDate}</span>}
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">from {t.assignedByName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clock In/Out */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Attendance</p>
            {isClockedIn && <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live</span>}
          </div>
          {isClockedIn ? (
            <div className="text-center mb-3">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 border-4 border-emerald-200 mx-auto mb-2">
                <p className="text-emerald-700 font-black text-xs font-mono">{elapsed}</p>
              </div>
              <p className="text-xs text-gray-400">Shift timer</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-3 text-center mb-3">
              <Clock className="h-6 w-6 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-300">{today?.clockOut ? "Day complete" : "Not clocked in"}</p>
            </div>
          )}
          {today?.clockIn && (
            <div className="space-y-1 mb-3 text-xs">
              <div className="flex justify-between"><span className="text-gray-400">Clock In</span><span className="font-semibold text-gray-700 font-mono">{new Date(today.clockIn).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div>
              {today.clockOut && <div className="flex justify-between"><span className="text-gray-400">Clock Out</span><span className="font-semibold text-gray-700 font-mono">{new Date(today.clockOut).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></div>}
              {today.workedHours && <div className="flex justify-between"><span className="text-gray-400">Worked</span><span className="font-semibold text-gray-700">{today.workedHours}h</span></div>}
            </div>
          )}
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          {!today?.clockIn && (
            <button onClick={handleClockIn} disabled={isClocking}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors">
              <Play className="h-4 w-4" />{isClocking?"Clocking in...":"Clock In"}
            </button>
          )}
          {today?.clockIn && !today?.clockOut && (
            <button onClick={handleClockOut} disabled={isClocking}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition-colors">
              <Square className="h-4 w-4" />{isClocking?"Clocking out...":"Clock Out"}
            </button>
          )}
          {today?.clockOut && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">Day Complete!</span>
            </div>
          )}
        </div>

        {/* Upcoming meetings */}
        <div className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Upcoming Meetings</p>
          {meetings.length === 0 ? (
            <div className="text-center py-4">
              <Video className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-300">No meetings scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings.slice(0, 3).map(m => (
                <div key={m.id} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-800 mb-0.5">{m.title}</p>
                  <p className="text-xs text-gray-400 mb-0.5">{new Date(m.dateTime).toLocaleString()}</p>
                  <p className="text-xs text-gray-300 mb-2">📍 {m.location}</p>
                  <div className="flex gap-1.5">
                    {["Yes","No","Maybe"].map(r => (
                      <button key={r}
                        onClick={() => setRsvps(prev => ({ ...prev, [m.id]: r.toLowerCase() }))}
                        className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-colors ${
                          rsvps[m.id] === r.toLowerCase()
                            ? r==="Yes"?"bg-emerald-500 text-white":r==="No"?"bg-red-500 text-white":"bg-blue-500 text-white"
                            : r==="Yes"?"bg-emerald-50 text-emerald-700 hover:bg-emerald-100":r==="No"?"bg-red-50 text-red-600 hover:bg-red-100":"bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}>
                        {rsvps[m.id] === r.toLowerCase() ? `✓ ${r}` : r}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}