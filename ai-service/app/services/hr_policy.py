"""
Static HR policy reference text. In a larger system this might be retrieved via
a vector database (RAG), but for this graduation project a curated policy
document passed directly in the prompt is sufficient and easier to demo/grade.
"""

HR_POLICY_DOCUMENT = """
COMPANY HR POLICY SUMMARY

1. WORKING HOURS
   - Standard working hours are 9:00 AM to 5:00 PM, Sunday to Thursday.
   - Employees are considered late if they clock in after 9:15 AM.
   - A full work day is 8 hours; lunch break is unpaid and not counted.

2. ANNUAL LEAVE
   - Each employee is entitled to 21 paid annual leave days per calendar year.
   - Annual leave must be requested at least 3 working days in advance.
   - Unused annual leave does not carry over to the next year unless approved by HR.

3. SICK LEAVE
   - Each employee is entitled to 10 paid sick leave days per calendar year.
   - Sick leave longer than 2 consecutive days requires a medical certificate.

4. UNPAID LEAVE
   - Unpaid leave may be requested when annual and sick leave balances are exhausted.
   - Unpaid leave requires Department Manager and HR Manager approval.

5. MATERNITY / PATERNITY LEAVE
   - Maternity leave: up to 90 calendar days, fully paid.
   - Paternity leave: up to 5 working days, fully paid.

6. LEAVE APPROVAL PROCESS
   - Leave requests are submitted through the system and routed to the employee's
     direct manager for approval or rejection.
   - HR Managers can approve or reject any leave request.
   - Department Managers can approve or reject requests from their direct reports only.

7. ATTENDANCE
   - Employees must clock in and clock out daily through the system.
   - Three or more late clock-ins per month may result in an HR review meeting.
   - Unexplained absences are recorded as "Absent" and may affect leave balance review.

8. CODE OF CONDUCT
   - Employees are expected to maintain professionalism and respect in the workplace.
   - Harassment, discrimination, or misconduct should be reported to HR immediately.

9. REMOTE WORK
   - Remote work arrangements must be approved in advance by the employee's manager.
   - Attendance clock-in/out rules still apply when working remotely.
"""
