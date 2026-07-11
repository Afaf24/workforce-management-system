// ─── Types ──────────────────────────────────────────────────────────────────

export interface HRTask {
  id: string;
  title: string;
  description?: string;
  assignedToEmployeeId: string;
  assignedToName: string;
  assignedByName: string;
  assignedByRole: "HR" | "DeptManager";
  type: "task" | "project" | "training";
  priority: "high" | "medium" | "low";
  dueDate: string;
  status: "pending" | "inprogress" | "done";
  createdAt: string;
}

export interface HRAnnouncement {
  id: string;
  title: string;
  body: string;
  tag: string;
  tagColor: string;
  authorName: string;
  authorRole: "HR" | "DeptManager";
  targetDepartment?: string; // undefined = all employees
  createdAt: string;
}

export interface HRMeeting {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  description: string;
  createdByName: string;
  targetDepartment?: string;
  createdAt: string;
}

export interface HRApplication {
  id: string;
  name: string;
  position: string;
  email: string;
  status: "new" | "reviewing" | "interview" | "hired" | "rejected";
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event("hr_store_update"));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const getTasks = ()                         => read<HRTask>("hr_tasks");
export const saveTasks = (tasks: HRTask[])         => write("hr_tasks", tasks);

export function addTask(t: Omit<HRTask, "id" | "createdAt" | "status">) {
  const all = getTasks();
  all.unshift({ ...t, id: uid(), status: "pending", createdAt: new Date().toISOString() });
  saveTasks(all);
}

export function updateTaskStatus(id: string, status: HRTask["status"]) {
  saveTasks(getTasks().map(t => t.id === id ? { ...t, status } : t));
}
export function toggleTaskDone(id: string) {
  saveTasks(getTasks().map(t =>
    t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t
  ));
}
export function deleteTask(id: string) {
  saveTasks(getTasks().filter(t => t.id !== id));
}

export function getTasksForEmployee(employeeId: string) {
  return getTasks().filter(t => t.assignedToEmployeeId === employeeId);
}

// ─── Announcements ──────────────────────────────────────────────────────────

export const getAnnouncements = () => read<HRAnnouncement>("hr_announcements");

export function addAnnouncement(a: Omit<HRAnnouncement, "id" | "createdAt">) {
  const all = getAnnouncements();
  all.unshift({ ...a, id: uid(), createdAt: new Date().toISOString() });
  write("hr_announcements", all);
}

export function getAnnouncementsForEmployee(department?: string) {
  return getAnnouncements().filter(a =>
    !a.targetDepartment || a.targetDepartment === department
  );
}

// ─── Meetings ───────────────────────────────────────────────────────────────

export const getMeetings = () => read<HRMeeting>("hr_meetings");

export function addMeeting(m: Omit<HRMeeting, "id" | "createdAt">) {
  const all = getMeetings();
  all.unshift({ ...m, id: uid(), createdAt: new Date().toISOString() });
  write("hr_meetings", all);
}

export function getMeetingsForEmployee(department?: string) {
  return getMeetings().filter(m =>
    !m.targetDepartment || m.targetDepartment === department
  );
}

// ─── Applications ───────────────────────────────────────────────────────────

export const getApplications = () => read<HRApplication>("hr_applications");

export function addApplication(a: Omit<HRApplication, "id" | "createdAt">) {
  const all = getApplications();
  all.unshift({ ...a, id: uid(), status: "new", createdAt: new Date().toISOString() });
  write("hr_applications", all);
}

export function updateApplicationStatus(id: string, status: HRApplication["status"]) {
  write("hr_applications", getApplications().map(a => a.id === id ? { ...a, status } : a));
}