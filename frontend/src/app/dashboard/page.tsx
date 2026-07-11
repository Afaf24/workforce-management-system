"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import type { LeaveRequest, EmployeeSummary } from "@/types";
import {
  addAnnouncement, getAnnouncements, addMeeting, getMeetings,
  getApplications, addApplication, updateApplicationStatus,
  type HRAnnouncement, type HRMeeting, type HRApplication,
} from "@/lib/hr-store";
import {
  Users, Clock, CalendarDays, Bell, CheckCircle2, XCircle,
  Plus, Send, LayoutDashboard, Megaphone, LogOut, Building2,
  Search, AlertCircle, UserCheck, UserX, Video, FileText,
  Briefcase, GraduationCap, BarChart3, Settings, Shield,
  BookOpen, DollarSign, ClipboardList, UserPlus, Trash2,
  ChevronRight, TrendingUp, Star,
} from "lucide-react";
import Link from "next/link";

type Tab = "announcements" | "recruitment" | "onboarding" | "payroll" |
           "leave" | "attendance" | "performance" | "training" |
           "contracts" | "departments" | "reports" | "policies";

const mockAttendance = [
  { name: "Omar Khalil",  status: "present", time: "08:58", dept: "Engineering" },
  { name: "Layla Hassan", status: "late",    time: "09:32", dept: "Engineering" },
  { name: "Yusuf Ali",    status: "absent",  time: "",      dept: "Finance"     },
  { name: "Nour Saleh",   status: "present", time: "08:45", dept: "HR"          },
  { name: "Ahmed Karim",  status: "leave",   time: "",      dept: "Marketing"   },
];

const mockPolicies = [
  { title: "Remote Work Policy",        updated: "Jan 2026", status: "Active" },
  { title: "Code of Conduct",           updated: "Dec 2025", status: "Active" },
  { title: "Annual Leave Policy",       updated: "Jan 2026", status: "Active" },
  { title: "Anti-Harassment Policy",    updated: "Nov 2025", status: "Review" },
];

const mockPayroll = [
  { name: "Omar Khalil",  dept: "Engineering", base: 8500, bonus: 500,  deduction: 200, net: 8800 },
  { name: "Layla Hassan", dept: "Engineering", base: 7200, bonus: 300,  deduction: 150, net: 7350 },
  { name: "Sara Ahmed",   dept: "HR",          base: 9000, bonus: 1000, deduction: 250, net: 9750 },
];

const tabConfig: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "announcements", label: "Announcements",    icon: Megaphone     },
  { key: "recruitment",   label: "Recruitment",      icon: UserPlus      },
  { key: "onboarding",    label: "Onboarding",       icon: GraduationCap },
  { key: "payroll",       label: "Payroll",          icon: DollarSign    },
  { key: "leave",         label: "Leave Mgmt",       icon: CalendarDays  },
  { key: "attendance",    label: "Attendance",       icon: Clock         },
  { key: "performance",   label: "Performance",      icon: Star          },
  { key: "training",      label: "Training",         icon: BookOpen      },
  { key: "contracts",     label: "Contracts",        icon: FileText      },
  { key: "departments",   label: "Departments",      icon: Building2     },
  { key: "reports",       label: "Reports",          icon: BarChart3     },
  { key: "policies",      label: "Policies",         icon: Shield        },
];

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const [activeTab,     setActiveTab]     = useState<Tab>("announcements");
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [employees,     setEmployees]     = useState<EmployeeSummary[]>([]);
  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>([]);
  const [meetings,      setMeetings]      = useState<HRMeeting[]>([]);
  const [applications,  setApplications]  = useState<HRApplication[]>([]);

  // announcement form
  const [annTitle,  setAnnTitle]  = useState("");
  const [annBody,   setAnnBody]   = useState("");
  const [annTag,    setAnnTag]    = useState("General");

  // meeting form
  const [mTitle, setMTitle] = useState("");
  const [mDate,  setMDate]  = useState("");
  const [mLoc,   setMLoc]   = useState("");
  const [mDesc,  setMDesc]  = useState("");

  // recruitment form
  const [rName, setRName]  = useState("");
  const [rPos,  setRPos]   = useState("");
  const [rEmail,setREmail] = useState("");
  const [showAppForm, setShowAppForm] = useState(false);

  const sync = () => {
    setAnnouncements(getAnnouncements());
    setMeetings(getMeetings());
    setApplications(getApplications());
  };

  useEffect(() => {
    api.get<LeaveRequest[]>("/api/v1/leave/requests/pending").then(setPendingLeaves).catch(() => {});
    api.get<EmployeeSummary[]>("/api/v1/employees").then(setEmployees).catch(() => {});
    sync();
    window.addEventListener("hr_store_update", sync);
    return () => window.removeEventListener("hr_store_update", sync);
  }, []);

  async function handleReview(id: string, approve: boolean) {
    try {
      await api.put(`/api/v1/leave/requests/${id}/review`, { approve, comment: approve ? "Approved" : "Rejected" });
      setPendingLeaves(p => p.filter(r => r.id !== id));
    } catch {}
  }

  function publishAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) return;
    const colors: Record<string, string> = {
      General: "bg-blue-50 text-blue-600", Important: "bg-red-50 text-red-600",
      Holiday: "bg-emerald-50 text-emerald-600", Benefits: "bg-purple-50 text-purple-600",
      Meeting: "bg-orange-50 text-orange-600",
    };
    addAnnouncement({ title: annTitle, body: annBody, tag: annTag,
      tagColor: colors[annTag] ?? "bg-gray-50 text-gray-600",
      authorName: user?.fullName ?? "HR", authorRole: "HR" });
    setAnnTitle(""); setAnnBody(""); setAnnTag("General");
  }

  function publishMeeting() {
    if (!mTitle.trim() || !mDate) return;
    addMeeting({ title: mTitle, dateTime: mDate, location: mLoc || "TBD",
      description: mDesc, createdByName: user?.fullName ?? "HR" });
    setMTitle(""); setMDate(""); setMLoc(""); setMDesc("");
  }

  function addApplicant() {
    if (!rName.trim() || !rPos.trim()) return;
    addApplication({ name: rName, position: rPos, email: rEmail, status: "new" });
    setRName(""); setRPos(""); setREmail(""); setShowAppForm(false);
  }

  const present = mockAttendance.filter(a => a.status === "present").length;
  const late    = mockAttendance.filter(a => a.status === "late").length;
  const absent  = mockAttendance.filter(a => a.status === "absent").length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-56 flex flex-col shrink-0 border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">HRSystem</p>
            <p className="text-xs text-gray-400">HR Manager</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <p className="px-2 text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">HR Operations</p>
          {tabConfig.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === key ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />{label}
              {key === "leave" && pendingLeaves.length > 0 && (
                <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingLeaves.length}</span>
              )}
              {key === "recruitment" && applications.filter(a => a.status === "new").length > 0 && (
                <span className="ml-auto h-4 w-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">{applications.filter(a => a.status === "new").length}</span>
              )}
            </button>
          ))}
          <div className="pt-3">
            <p className="px-2 text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">System</p>
            <Link href="/employees" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
              <Users className="h-3.5 w-3.5" />Manage Employees
            </Link>
            <button onClick={() => setActiveTab("departments")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
              <Settings className="h-3.5 w-3.5" />Roles & Permissions
            </button>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
              {user?.fullName?.charAt(0) ?? "H"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">HR Manager</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition-colors">
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
              <h1 className="text-lg font-bold text-gray-900">HR Manager Dashboard</h1>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-gray-400" />
                <input placeholder="Search..." className="bg-transparent text-xs focus:outline-none w-32 placeholder:text-gray-300" />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="h-4 w-4 text-gray-500" />
                {pendingLeaves.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Employees",      value: employees.length || 3, icon: Users,         color: "text-blue-600 bg-blue-50"    },
              { label: "Present Today",  value: present + late,         icon: UserCheck,     color: "text-emerald-600 bg-emerald-50"},
              { label: "Absent Today",   value: absent,                 icon: UserX,         color: "text-red-500 bg-red-50"      },
              { label: "Pending Leave",  value: pendingLeaves.length,   icon: AlertCircle,   color: "text-orange-600 bg-orange-50" },
              { label: "Applicants",     value: applications.length,    icon: UserPlus,      color: "text-purple-600 bg-purple-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3">
                <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* workspace */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── ANNOUNCEMENTS ── */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">📢 Broadcast to All Employees & Department Managers</p>
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="w-full border-b border-gray-100 pb-2 mb-3 text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-300 transition-colors" />
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)}
                  placeholder="Write your announcement... Reaches ALL employees and department managers instantly."
                  rows={3} className="w-full text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none border-b border-gray-100 pb-2 mb-3" />
                <div className="flex items-center justify-between">
                  <select value={annTag} onChange={e => setAnnTag(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none">
                    {["General","Important","Holiday","Benefits","Policy","Meeting"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button onClick={publishAnnouncement} disabled={!annTitle.trim() || !annBody.trim()}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                    <Send className="h-3.5 w-3.5" />Publish to Everyone
                  </button>
                </div>
              </div>

              {/* Meeting creator */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">📅 Schedule Meeting</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="Meeting title..."
                    className="col-span-2 border-b border-gray-100 pb-1 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none" />
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Date & Time</label>
                    <input type="datetime-local" value={mDate} onChange={e => setMDate(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Location / Link</label>
                    <input value={mLoc} onChange={e => setMLoc(e.target.value)} placeholder="Room or Zoom"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none placeholder:text-gray-300" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={publishMeeting} disabled={!mTitle.trim() || !mDate}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                    <Send className="h-3.5 w-3.5" />Send Meeting to All
                  </button>
                </div>
              </div>

              {/* Published list */}
              {announcements.filter(a => a.authorRole === "HR").length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No announcements published yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                 {announcements.filter(a => a.authorRole === "HR").map(a => (
  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.tagColor}`}>{a.tag}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-300">{new Date(a.createdAt).toLocaleString()}</span>
        <button
          onClick={() => {
            const updated = getAnnouncements().filter(x => x.id !== a.id);
            localStorage.setItem("hr_announcements", JSON.stringify(updated));
            setAnnouncements(getAnnouncements());
          }}
          className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
          title="Delete announcement">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <h3 className="text-sm font-bold text-gray-900 mb-1">{a.title}</h3>
    <p className="text-sm text-gray-600">{a.body}</p>
  </div>
))}
                </div>
              )}
            </div>
          )}

          {/* ── RECRUITMENT ── */}
          {activeTab === "recruitment" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Recruitment Pipeline</h2>
                <button onClick={() => setShowAppForm(!showAppForm)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Add Applicant
                </button>
              </div>

              {showAppForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <input value={rName} onChange={e => setRName(e.target.value)} placeholder="Full name"
                      className="border-b border-gray-200 pb-1 text-sm focus:outline-none placeholder:text-gray-300" />
                    <input value={rPos} onChange={e => setRPos(e.target.value)} placeholder="Position applied"
                      className="border-b border-gray-200 pb-1 text-sm focus:outline-none placeholder:text-gray-300" />
                    <input value={rEmail} onChange={e => setREmail(e.target.value)} placeholder="Email"
                      className="border-b border-gray-200 pb-1 text-sm focus:outline-none placeholder:text-gray-300" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAppForm(false)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5">Cancel</button>
                    <button onClick={addApplicant} disabled={!rName.trim() || !rPos.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">
                      Add Applicant
                    </button>
                  </div>
                </div>
              )}

              {applications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <UserPlus className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-300">No applicants yet. Add your first one.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{["Name","Position","Email","Status","Action"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {applications.map(a => (
                        <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{a.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{a.email}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              a.status==="new"?"bg-blue-50 text-blue-600":
                              a.status==="reviewing"?"bg-yellow-50 text-yellow-700":
                              a.status==="interview"?"bg-purple-50 text-purple-700":
                              a.status==="hired"?"bg-emerald-50 text-emerald-700":
                              "bg-red-50 text-red-600"}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select value={a.status} onChange={e => updateApplicationStatus(a.id, e.target.value as any)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none">
                              {["new","reviewing","interview","hired","rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ONBOARDING ── */}
          {activeTab === "onboarding" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Onboarding Checklist</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Layla Hassan", role: "Software Engineer", dept: "Engineering", start: "June 1, 2026",
                    steps: ["Send welcome email","Create system accounts","Assign workstation","IT setup","Team introduction","Complete HR paperwork","Health & safety training","Role-specific training"] },
                ].map(emp => (
                  <div key={emp.name} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{emp.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.role} · {emp.dept}</p>
                        <p className="text-xs text-gray-300">Started {emp.start}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {emp.steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${i < 4 ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                            {i < 4 && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <p className={`text-xs ${i < 4 ? "line-through text-gray-400" : "text-gray-700"}`}>{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: "50%" }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">50% complete</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYROLL ── */}
          {activeTab === "payroll" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Payroll — {new Date().toLocaleString("default",{month:"long",year:"numeric"})}</h2>
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
                  <Send className="h-3.5 w-3.5" />Run Payroll
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Employee","Department","Base Salary","Bonus","Deductions","Net Pay","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {mockPayroll.map(p => (
                      <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{p.dept}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">${p.base.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600">+${p.bonus}</td>
                        <td className="px-4 py-3 text-sm text-red-500">-${p.deduction}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">${p.net.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button className="text-xs text-blue-600 hover:underline">Generate Payslip</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── LEAVE MANAGEMENT ── */}
          {activeTab === "leave" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Leave Management</h2>
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <CheckCircle2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-300">All leave requests are resolved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map(req => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{req.employeeName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{req.leaveType} · {req.totalDays} day(s)</p>
                        <p className="text-xs text-gray-400">{new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}</p>
                        {req.reason && <p className="text-xs text-gray-400 italic mt-1">"{req.reason}"</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReview(req.id, true)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">
                          <CheckCircle2 className="h-3 w-3" />Approve
                        </button>
                        <button onClick={() => handleReview(req.id, false)}
                          className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">
                          <XCircle className="h-3 w-3" />Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500" />{present} Present</span>
                <span className="flex items-center gap-1.5 text-orange-500 font-semibold"><span className="h-2 w-2 rounded-full bg-orange-400" />{late} Late</span>
                <span className="flex items-center gap-1.5 text-red-500 font-semibold"><span className="h-2 w-2 rounded-full bg-red-400" />{absent} Absent</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Employee","Department","Status","Clock In"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {mockAttendance.map(a => (
                      <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{a.dept}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            a.status==="present"?"bg-emerald-50 text-emerald-700":
                            a.status==="late"?"bg-orange-50 text-orange-700":
                            a.status==="leave"?"bg-purple-50 text-purple-700":
                            "bg-red-50 text-red-700"}`}>
                            {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400 font-mono">{a.time||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Performance Management — Q3 2026</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "Omar Khalil", score: 92, trend: "+5%", rating: "Excellent" },
                  { name: "Layla Hassan", score: 85, trend: "+2%", rating: "Good" },
                  { name: "Sara Ahmed", score: 95, trend: "+8%", rating: "Outstanding" },
                ].map(e => (
                  <div key={e.name} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">{e.name.charAt(0)}</div>
                      <div><p className="text-sm font-bold text-gray-900">{e.name}</p><p className="text-xs text-gray-400">{e.rating}</p></div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-3xl font-black text-gray-900">{e.score}</p>
                      <span className="text-xs text-emerald-600 font-semibold">{e.trend}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${e.score}%` }} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(e.score/20) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRAINING ── */}
          {activeTab === "training" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Training Programs</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Health & Safety Awareness", assigned: 3, completed: 2, due: "Jul 31, 2026" },
                  { title: "Data Privacy & GDPR",       assigned: 3, completed: 1, due: "Aug 15, 2026" },
                  { title: "Leadership Essentials",     assigned: 1, completed: 0, due: "Sep 1, 2026"  },
                  { title: "Time Management Mastery",   assigned: 2, completed: 2, due: "Completed"    },
                ].map(t => (
                  <div key={t.title} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Due: {t.due}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-blue-400 shrink-0" />
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 mb-2">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${(t.completed/t.assigned)*100}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{t.completed} of {t.assigned} completed</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTRACTS ── */}
          {activeTab === "contracts" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Contracts & Documents</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{["Employee","Document Type","Date Issued","Status","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[
                      { emp: "Omar Khalil",  type: "Employment Contract", date: "Mar 2021", status: "Signed"  },
                      { emp: "Layla Hassan", type: "Employment Contract", date: "Jun 2023", status: "Pending" },
                      { emp: "Layla Hassan", type: "NDA Agreement",       date: "Jun 2023", status: "Signed"  },
                      { emp: "Sara Ahmed",   type: "Employment Contract", date: "Jan 2022", status: "Signed"  },
                    ].map((c, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.emp}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{c.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{c.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status==="Signed"?"bg-emerald-50 text-emerald-700":"bg-yellow-50 text-yellow-700"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-xs text-blue-600 hover:underline">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS ── */}
          {activeTab === "departments" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Departments & Positions</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "Engineering",     head: "Omar Khalil",  count: 8, positions: ["Senior Engineer","Backend Dev","Frontend Dev","DevOps"] },
                  { name: "Human Resources", head: "Sara Ahmed",   count: 3, positions: ["HR Manager","HR Specialist","Recruiter"] },
                  { name: "Finance",         head: "Yusuf Ali",    count: 4, positions: ["Finance Manager","Accountant","Analyst"] },
                ].map(d => (
                  <div key={d.name} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">Head: {d.head}</p>
                        <p className="text-xs text-gray-400">{d.count} employees</p>
                      </div>
                      <Building2 className="h-5 w-5 text-blue-300" />
                    </div>
                    <div className="space-y-1">
                      {d.positions.map(p => (
                        <div key={p} className="flex items-center gap-2 text-xs text-gray-500">
                          <ChevronRight className="h-3 w-3 text-gray-300" />{p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Reports & Analytics</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Monthly Attendance Report",  desc: "Full attendance breakdown by employee and department", icon: Clock,        color: "bg-blue-50 text-blue-600"    },
                  { title: "Leave Utilization Report",   desc: "Leave taken vs. remaining balances across the company", icon: CalendarDays, color: "bg-purple-50 text-purple-600" },
                  { title: "Payroll Summary Report",     desc: "Total payroll costs, bonuses, and deductions",          icon: DollarSign,   color: "bg-emerald-50 text-emerald-600"},
                  { title: "Performance Overview",       desc: "Average performance scores and trends by department",   icon: TrendingUp,   color: "bg-orange-50 text-orange-600" },
                  { title: "Headcount Report",           desc: "Current employee count by department and role",         icon: Users,        color: "bg-indigo-50 text-indigo-600" },
                  { title: "Training Completion Report", desc: "Training modules completed vs. assigned",               icon: GraduationCap,color: "bg-pink-50 text-pink-600"    },
                ].map(r => (
                  <div key={r.title} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm cursor-pointer transition-shadow group">
                    <div className={`h-10 w-10 rounded-xl ${r.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <r.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                      <button className="text-xs text-blue-600 hover:underline mt-2">Generate Report →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── POLICIES ── */}
          {activeTab === "policies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Company Policies</h2>
                <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Add Policy
                </button>
              </div>
              <div className="space-y-3">
                {mockPolicies.map(p => (
                  <div key={p.title} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-400">Updated {p.updated}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.status==="Active"?"bg-emerald-50 text-emerald-700":"bg-yellow-50 text-yellow-700"}`}>{p.status}</span>
                      <button className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button className="text-xs text-blue-600 hover:underline">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT PANEL ── */}
      <aside className="w-64 flex flex-col shrink-0 border-l border-gray-200 bg-white overflow-y-auto">

        {/* live attendance */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Attendance</p>
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </span>
          </div>
          <div className="space-y-2">
            {mockAttendance.map(a => (
              <div key={a.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`h-2 w-2 rounded-full shrink-0 ${a.status==="present"?"bg-emerald-500":a.status==="late"?"bg-orange-400":a.status==="leave"?"bg-purple-400":"bg-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.dept}</p>
                </div>
                <span className={`text-xs font-semibold ${a.status==="present"?"text-emerald-600":a.status==="late"?"text-orange-500":a.status==="leave"?"text-purple-500":"text-red-500"}`}>
                  {a.status==="present"?a.time:a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* pending approvals */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Leave Approvals</p>
            {pendingLeaves.length > 0 && <span className="h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{pendingLeaves.length}</span>}
          </div>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-3">
              <CheckCircle2 className="h-6 w-6 text-gray-200 mx-auto mb-1" />
              <p className="text-xs text-gray-300">All clear</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingLeaves.slice(0, 3).map(req => (
                <div key={req.id} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-xs font-semibold text-gray-800">{req.employeeName}</p>
                  <p className="text-xs text-gray-400 mb-2">{req.leaveType} · {req.totalDays} day(s)</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleReview(req.id, true)}
                      className="flex-1 rounded-lg bg-emerald-500 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">✓</button>
                    <button onClick={() => handleReview(req.id, false)}
                      className="flex-1 rounded-lg bg-red-100 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* recent announcements */}
        <div className="p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Recent Announcements</p>
          {announcements.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-3">None yet</p>
          ) : (
            <div className="space-y-2">
              {announcements.slice(0, 3).map(a => (
                <div key={a.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="text-xs font-semibold text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 truncate">{a.body.slice(0, 50)}...</p>
                  <p className="text-xs text-gray-300 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}