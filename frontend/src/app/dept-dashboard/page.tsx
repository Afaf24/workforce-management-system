"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import type { LeaveRequest, EmployeeSummary } from "@/types";
import {
  addTask, getTasks, updateTaskStatus, deleteTask,
  addAnnouncement, getAnnouncements,
  type HRTask, type HRAnnouncement,
} from "@/lib/hr-store";
import {
  LayoutDashboard, Users, Clock, CalendarDays, CheckCircle2,
  XCircle, Plus, Send, Megaphone, LogOut, Building2, Bell,
  AlertCircle, ClipboardList, BarChart3, UserCheck, UserX,
  Star, Calendar, Trash2, ChevronRight, TrendingUp,
} from "lucide-react";
import Link from "next/link";

type Tab = "dashboard" | "employees" | "tasks" | "attendance" |
           "leave" | "performance" | "schedule" | "hire" |
           "reports" | "announcements";

const mockAttendance = [
  { name: "Omar Khalil",  status: "present", time: "08:58", role: "Engineering Manager" },
  { name: "Layla Hassan", status: "late",    time: "09:32", role: "Software Engineer"   },
  { name: "Ahmed Karim",  status: "absent",  time: "",      role: "Backend Developer"   },
];

const tabConfig: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "dashboard",      label: "Dashboard",         icon: LayoutDashboard },
  { key: "employees",      label: "My Team",           icon: Users           },
  { key: "tasks",          label: "Assign Tasks",      icon: ClipboardList   },
  { key: "attendance",     label: "Attendance",        icon: Clock           },
  { key: "leave",          label: "Leave Requests",    icon: CalendarDays    },
  { key: "performance",    label: "Performance",       icon: Star            },
  { key: "schedule",       label: "Schedule",          icon: Calendar        },
  { key: "hire",           label: "Request Hire",      icon: UserCheck       },
  { key: "reports",        label: "Reports",           icon: BarChart3       },
  { key: "announcements",  label: "Announcements",     icon: Megaphone       },
];

export default function DeptManagerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab,     setActiveTab]     = useState<Tab>("dashboard");
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [employees,     setEmployees]     = useState<EmployeeSummary[]>([]);
  const [tasks,         setTasks]         = useState<HRTask[]>([]);
  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>([]);

  // task form
  const [taskTitle,    setTaskTitle]    = useState("");
  const [taskDesc,     setTaskDesc]     = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskType,     setTaskType]     = useState<"task"|"project"|"training">("task");
  const [taskPriority, setTaskPriority] = useState<"high"|"medium"|"low">("medium");
  const [taskDue,      setTaskDue]      = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  // announcement form
  const [annTitle, setAnnTitle] = useState("");
  const [annBody,  setAnnBody]  = useState("");

  // hire request
  const [hireRole, setHireRole]   = useState("");
  const [hireDesc, setHireDesc]   = useState("");
  const [hireRequests, setHireRequests] = useState<{ role: string; desc: string; status: string }[]>([]);

  const sync = () => {
    setTasks(getTasks().filter(t => t.assignedByName === (user?.fullName ?? "")));
    setAnnouncements(getAnnouncements().filter(a => a.authorRole === "DeptManager"));
  };

  useEffect(() => {
    api.get<LeaveRequest[]>("/api/v1/leave/requests/pending").then(setPendingLeaves).catch(() => {});
    api.get<EmployeeSummary[]>("/api/v1/employees").then(setEmployees).catch(() => {});
    sync();
    window.addEventListener("hr_store_update", sync);
    return () => window.removeEventListener("hr_store_update", sync);
  }, [user?.fullName]);

  async function handleReview(id: string, approve: boolean) {
    try {
      await api.put(`/api/v1/leave/requests/${id}/review`, { approve, comment: approve ? "Approved" : "Rejected" });
      setPendingLeaves(p => p.filter(r => r.id !== id));
    } catch {}
  }

  function assignTask() {
    if (!taskTitle.trim() || !taskAssignee) return;
    const emp = employees.find(e => e.id === taskAssignee);
    addTask({
      title: taskTitle, description: taskDesc,
      assignedToEmployeeId: taskAssignee,
      assignedToName: emp?.fullName ?? "Unknown",
      assignedByName: user?.fullName ?? "Manager",
      assignedByRole: "DeptManager",
      type: taskType, priority: taskPriority, dueDate: taskDue || "No deadline",
    });
    setTaskTitle(""); setTaskDesc(""); setTaskAssignee("");
    setTaskDue(""); setTaskPriority("medium"); setShowTaskForm(false);
  }

  function publishAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) return;
    addAnnouncement({
      title: annTitle, body: annBody,
      tag: "Department", tagColor: "bg-blue-50 text-blue-600",
      authorName: user?.fullName ?? "Manager",
      authorRole: "DeptManager",
      targetDepartment: "Engineering", // department of the manager
    });
    setAnnTitle(""); setAnnBody("");
  }

  function submitHireRequest() {
    if (!hireRole.trim()) return;
    setHireRequests(prev => [...prev, { role: hireRole, desc: hireDesc, status: "Sent to HR" }]);
    setHireRole(""); setHireDesc("");
  }

  const myTasks = tasks;
  const pendingTasks = myTasks.filter(t => t.status === "pending").length;
  const doneTasks    = myTasks.filter(t => t.status === "done").length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-56 flex flex-col shrink-0 border-r border-gray-200 bg-white">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">HRSystem</p>
            <p className="text-xs text-gray-400">Dept. Manager</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <p className="px-2 text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">My Department</p>
          {tabConfig.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === key ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />{label}
              {key === "leave" && pendingLeaves.length > 0 && (
                <span className="ml-auto h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{pendingLeaves.length}</span>
              )}
              {key === "tasks" && pendingTasks > 0 && (
                <span className="ml-auto h-4 w-4 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">{pendingTasks}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
              {user?.fullName?.charAt(0) ?? "M"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-400">Dept. Manager</p>
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
              <h1 className="text-lg font-bold text-gray-900">Department Dashboard</h1>
              <p className="text-xs text-gray-400">Engineering Department · {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</p>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell className="h-4 w-4 text-gray-500" />
              {pendingLeaves.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Team Size",       value: employees.length || 3,  icon: Users,        color: "text-blue-600 bg-blue-50"     },
              { label: "Present",         value: mockAttendance.filter(a=>a.status==="present").length, icon: UserCheck, color: "text-emerald-600 bg-emerald-50"},
              { label: "Pending Leave",   value: pendingLeaves.length,    icon: CalendarDays, color: "text-orange-600 bg-orange-50" },
              { label: "Active Tasks",    value: pendingTasks,            icon: ClipboardList,color: "text-purple-600 bg-purple-50" },
              { label: "Tasks Done",      value: doneTasks,               icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50"},
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

          {/* ── DASHBOARD OVERVIEW ── */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Team Attendance Today</p>
                <div className="space-y-2">
                  {mockAttendance.map(a => (
                    <div key={a.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${a.status==="present"?"bg-emerald-500":a.status==="late"?"bg-orange-400":"bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.role}</p>
                      </div>
                      <span className={`text-xs font-semibold ${a.status==="present"?"text-emerald-600":a.status==="late"?"text-orange-500":"text-red-500"}`}>
                        {a.status==="present"?a.time:a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Tasks</p>
                {myTasks.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center py-4">No tasks assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {myTasks.slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${t.status==="done"?"bg-emerald-500":t.priority==="high"?"bg-red-500":t.priority==="medium"?"bg-orange-400":"bg-gray-300"}`} />
                        <p className={`text-xs flex-1 text-gray-700 ${t.status==="done"?"line-through":""}`}>{t.title}</p>
                        <span className="text-xs text-gray-400">{t.assignedToName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pending Approvals</p>
                {pendingLeaves.length === 0 ? (
                  <p className="text-xs text-gray-300 text-center py-4">All clear</p>
                ) : (
                  <div className="space-y-2">
                    {pendingLeaves.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{r.employeeName}</p>
                          <p className="text-xs text-gray-400">{r.leaveType} · {r.totalDays} days</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleReview(r.id, true)} className="rounded-lg bg-emerald-500 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">✓</button>
                          <button onClick={() => handleReview(r.id, false)} className="rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Team Performance</p>
                <div className="space-y-3">
                  {[
                    { name: "Omar Khalil",  score: 92 },
                    { name: "Layla Hassan", score: 85 },
                  ].map(e => (
                    <div key={e.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{e.name}</span>
                        <span className="text-gray-400">{e.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${e.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MY TEAM ── */}
          {activeTab === "employees" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">My Team — Engineering Department</h2>
              <div className="grid grid-cols-3 gap-4">
                {employees.map(e => (
                  <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">{e.fullName.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{e.fullName}</p>
                        <p className="text-xs text-gray-400">{e.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.isActive?"bg-emerald-50 text-emerald-700":"bg-gray-100 text-gray-500"}`}>
                        {e.isActive?"Active":"Inactive"}
                      </span>
                      <button onClick={() => { setTaskAssignee(e.id); setActiveTab("tasks"); setShowTaskForm(true); }}
                        className="text-xs text-purple-600 hover:underline">Assign Task</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TASKS ── */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Task Assignment</h2>
                <button onClick={() => setShowTaskForm(!showTaskForm)}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />Assign New Task
                </button>
              </div>

              {showTaskForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">New Task / Project / Training</p>
                  <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title..."
                    className="w-full border-b border-gray-100 pb-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-purple-300 transition-colors" />
                  <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description (optional)..." rows={2}
                    className="w-full text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none border-b border-gray-100 pb-2" />
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Assign To</label>
                      <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none">
                        <option value="">Select employee...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Type</label>
                      <select value={taskType} onChange={e => setTaskType(e.target.value as any)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none">
                        <option value="task">Task</option>
                        <option value="project">Project</option>
                        <option value="training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Priority</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Deadline</label>
                      <input type="date" value={taskDue} onChange={e => setTaskDue(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowTaskForm(false)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5">Cancel</button>
                    <button onClick={assignTask} disabled={!taskTitle.trim() || !taskAssignee}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-40 transition-colors">
                      <Send className="h-3.5 w-3.5" />Assign Task
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks board */}
              <div className="grid grid-cols-3 gap-4">
                {(["pending","inprogress","done"] as const).map(status => (
                  <div key={status} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${status==="pending"?"bg-yellow-50":status==="inprogress"?"bg-blue-50":"bg-emerald-50"}`}>
                      <p className="text-xs font-bold text-gray-700 capitalize">{status==="inprogress"?"In Progress":status.charAt(0).toUpperCase()+status.slice(1)}</p>
                      <span className="text-xs text-gray-400">{myTasks.filter(t=>t.status===status).length}</span>
                    </div>
                    <div className="p-3 space-y-2 min-h-32">
                      {myTasks.filter(t => t.status === status).map(t => (
                        <div key={t.id} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-xs font-semibold text-gray-800 flex-1">{t.title}</p>
                            <button onClick={() => deleteTask(t.id)} className="ml-1 text-gray-300 hover:text-red-400 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">→ {t.assignedToName}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${t.priority==="high"?"bg-red-50 text-red-600":t.priority==="medium"?"bg-orange-50 text-orange-600":"bg-gray-100 text-gray-400"}`}>
                              {t.priority}
                            </span>
                            <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value as any)}
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none">
                              <option value="pending">Pending</option>
                              <option value="inprogress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                          {t.dueDate !== "No deadline" && <p className="text-xs text-gray-300 mt-1">Due {t.dueDate}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {activeTab === "attendance" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Team Attendance — Today</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{["Employee","Role","Status","Clock In"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {mockAttendance.map(a => (
                    <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{a.role}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${a.status==="present"?"bg-emerald-50 text-emerald-700":a.status==="late"?"bg-orange-50 text-orange-700":"bg-red-50 text-red-700"}`}>
                          {a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-400 font-mono">{a.time||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── LEAVE REQUESTS ── */}
          {activeTab === "leave" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Team Leave Requests</h2>
              {pendingLeaves.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <CheckCircle2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-300">No pending leave requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.map(req => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{req.employeeName}</p>
                        <p className="text-xs text-gray-500">{req.leaveType} · {req.totalDays} day(s)</p>
                        <p className="text-xs text-gray-400">{new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}</p>
                        {req.reason && <p className="text-xs text-gray-400 italic mt-1">"{req.reason}"</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReview(req.id, true)} className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">
                          <CheckCircle2 className="h-3 w-3" />Approve
                        </button>
                        <button onClick={() => handleReview(req.id, false)} className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">
                          <XCircle className="h-3 w-3" />Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PERFORMANCE ── */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Team Performance Evaluation</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Omar Khalil",  score: 92, kpis: ["Code quality: 95","Delivery: 90","Teamwork: 91"] },
                  { name: "Layla Hassan", score: 85, kpis: ["Code quality: 88","Delivery: 82","Teamwork: 85"] },
                ].map(e => (
                  <div key={e.name} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">{e.name.charAt(0)}</div>
                      <div><p className="text-sm font-bold text-gray-900">{e.name}</p></div>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-3xl font-black text-gray-900">{e.score}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s<=Math.round(e.score/20)?"fill-yellow-400 text-yellow-400":"text-gray-200"}`} />)}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 mb-3">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${e.score}%` }} />
                    </div>
                    <div className="space-y-1">
                      {e.kpis.map(k => <p key={k} className="text-xs text-gray-500"><ChevronRight className="inline h-3 w-3 text-gray-300" />{k}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Department Schedule</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="grid grid-cols-5 gap-2">
                  {["Mon","Tue","Wed","Thu","Fri"].map((day, i) => (
                    <div key={day} className={`rounded-xl p-3 ${i===1?"bg-purple-50 border-2 border-purple-200":"bg-gray-50 border border-gray-100"}`}>
                      <p className="text-xs font-semibold text-gray-400 mb-1 text-center">{day}</p>
                      <p className={`text-xl font-black text-center mb-2 ${i===1?"text-purple-700":"text-gray-700"}`}>{7+i}</p>
                      {i === 2 && <p className="text-xs text-blue-500 text-center">Sprint Planning</p>}
                      {i === 4 && <p className="text-xs text-orange-500 text-center">Code Review</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REQUEST HIRE ── */}
          {activeTab === "hire" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Request New Hire from HR</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <input value={hireRole} onChange={e => setHireRole(e.target.value)} placeholder="Role needed (e.g. Senior Backend Developer)"
                  className="w-full border-b border-gray-100 pb-2 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-purple-300 transition-colors" />
                <textarea value={hireDesc} onChange={e => setHireDesc(e.target.value)} placeholder="Why do you need this hire? What skills are required?" rows={3}
                  className="w-full text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none border-b border-gray-100 pb-2" />
                <div className="flex justify-end">
                  <button onClick={submitHireRequest} disabled={!hireRole.trim()}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-40 transition-colors">
                    <Send className="h-3.5 w-3.5" />Send Request to HR
                  </button>
                </div>
              </div>
              {hireRequests.length > 0 && (
                <div className="space-y-2">
                  {hireRequests.map((r, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.role}</p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-900">Department Reports</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Team Attendance Report",  desc: "Attendance summary for the engineering team", icon: Clock,        color: "bg-blue-50 text-blue-600"   },
                  { title: "Task Progress Report",    desc: "Overview of assigned tasks and completion rates", icon: ClipboardList,color: "bg-purple-50 text-purple-600"},
                  { title: "Performance Summary",     desc: "Team performance scores and KPIs this quarter",  icon: TrendingUp,   color: "bg-orange-50 text-orange-600"},
                  { title: "Leave Utilization",       desc: "Leave taken vs. remaining for team members",    icon: CalendarDays, color: "bg-emerald-50 text-emerald-600"},
                ].map(r => (
                  <div key={r.title} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm cursor-pointer transition-shadow group">
                    <div className={`h-10 w-10 rounded-xl ${r.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <r.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                      <button className="text-xs text-purple-600 hover:underline mt-2">Generate →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS ── */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">📢 Announce to My Department Only</p>
                <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Announcement title..."
                  className="w-full border-b border-gray-100 pb-2 mb-3 text-sm font-semibold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-purple-300 transition-colors" />
                <textarea value={annBody} onChange={e => setAnnBody(e.target.value)} placeholder="Write your department announcement... Only your team members will see this."
                  rows={3} className="w-full text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none resize-none border-b border-gray-100 pb-3 mb-3" />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-300">Visible to: Engineering Department only</p>
                  <button onClick={publishAnnouncement} disabled={!annTitle.trim() || !annBody.trim()}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-40 transition-colors">
                    <Send className="h-3.5 w-3.5" />Publish to Department
                  </button>
                </div>
              </div>
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <Megaphone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No department announcements yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Department</span>
                        <span className="text-xs text-gray-300">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{a.title}</h3>
                      <p className="text-sm text-gray-600">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT PANEL ── */}
      <aside className="w-64 flex flex-col shrink-0 border-l border-gray-200 bg-white overflow-y-auto">

        {/* team attendance */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Team Status</p>
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
            </span>
          </div>
          <div className="space-y-2">
            {mockAttendance.map(a => (
              <div key={a.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`h-2 w-2 rounded-full shrink-0 ${a.status==="present"?"bg-emerald-500":a.status==="late"?"bg-orange-400":"bg-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{a.name}</p>
                </div>
                <span className={`text-xs font-semibold ${a.status==="present"?"text-emerald-600":a.status==="late"?"text-orange-500":"text-red-500"}`}>
                  {a.status==="present"?a.time:a.status.charAt(0).toUpperCase()+a.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* task progress */}
        <div className="border-b border-gray-100 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Task Progress</p>
          <div className="space-y-2">
            {(["pending","inprogress","done"] as const).map(s => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">{s==="inprogress"?"In Progress":s.charAt(0).toUpperCase()+s.slice(1)}</span>
                <span className={`text-xs font-bold ${s==="done"?"text-emerald-600":s==="inprogress"?"text-blue-600":"text-orange-500"}`}>
                  {myTasks.filter(t=>t.status===s).length}
                </span>
              </div>
            ))}
            {myTasks.length > 0 && (
              <div className="h-2 rounded-full bg-gray-100 mt-2">
                <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${(doneTasks/myTasks.length)*100}%` }} />
              </div>
            )}
            <p className="text-xs text-gray-400">{doneTasks} of {myTasks.length} tasks completed</p>
          </div>
        </div>

        {/* pending approvals */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pending Approvals</p>
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
                    <button onClick={() => handleReview(req.id, true)} className="flex-1 rounded-lg bg-emerald-500 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors">✓</button>
                    <button onClick={() => handleReview(req.id, false)} className="flex-1 rounded-lg bg-red-100 py-1 text-xs font-semibold text-red-600 hover:bg-red-200 transition-colors">✕</button>
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