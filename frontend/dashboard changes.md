# Feature: Intelligent Dashboard

## Feature ID

DASHBOARD-001

---

# Overview

Implement a production-ready Dashboard for Timetriq.

The Dashboard is the landing page after authentication.

Its purpose is to provide users with a complete overview of their work, workload, productivity, planning status, and recent activity.

This dashboard should NOT copy ClickUp directly.

Instead, it should use Timetriq's Work Intelligence philosophy while maintaining a clean enterprise UI.

Use Firebase Firestore as the single source of truth.

---

# Tech Stack

- React
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS
- shadcn/ui
- Recharts
- React Router

---

# Data Source

All dashboard widgets must use live Firestore data.

Never use mock data.

All calculations must be computed dynamically.

---

# Dashboard Layout

The dashboard consists of the following sections in order.

---

# 1. General Overview

Purpose

Display a welcome section that summarizes today's work.

Display

- Greeting
- Current Date
- Total planned work today
- Short productivity message

Example

Good Morning, Harish

You have 5 tasks planned today.
Estimated workload: 6 hours.

---

# 2. Total Tasks Card

Purpose

Display total number of tasks.

Calculate

All tasks belonging to current user.

Display

- Total Tasks
- Completed
- Pending
- Completion Percentage

Click Action

Navigate

/tasks

---

# 3. Overall Tasks

Purpose

Display recent active tasks.

Display

- Task Name
- Priority
- Status
- Due Date
- Estimated Hours
- Logged Hours

Limit

5 Tasks

Button

View All

Navigate

/tasks

---

# 4. Workload by Status

Purpose

Display workload distribution.

Chart

Pie Chart

Categories

- Todo
- In Progress
- Review
- Completed

Data

Count tasks by status.

Click Action

Open filtered Task page.

---

# 5. Daily Overview

Purpose

Summarize today's work.

Display

Today's

- Planned Hours
- Logged Hours
- Remaining Hours
- Number of Tasks
- Completed Tasks

Calculate dynamically.

---

# 6. Timesheet Widget

Purpose

Quick summary of logged time.

Display

- Total Logged Today
- Weekly Logged Hours
- Monthly Logged Hours

Button

View Timesheet

Click Action

Navigate

/timesheet

---

# Timesheet Page

Create dedicated page.

Display

Summary Cards

- Total Estimated Hours
- Total Logged Hours
- Remaining Hours
- Productivity
- Average Daily Hours

Below

Table

Columns

Task

Estimated

Logged

Remaining

Monday

Tuesday

Wednesday

Thursday

Friday

Saturday

Sunday

Total

Each day should show logged hours for that task.

Expand Row

Display

Work Sessions

Example

Monday

09:00 - 11:00

Implemented Authentication

Tuesday

02:00 - 04:00

Fixed Login Bugs

---

# 7. Work Done Today

Purpose

Display today's completed work.

Display

- Completed Tasks
- Logged Sessions
- Total Time Worked

Click

Navigate

/timesheet

filtered by Today.

---

# 8. Status Overview

Purpose

Display tasks grouped by status.

Sections

Todo

In Progress

Review

Completed

Display

Count

and

Percentage

---

# 9. Tasks Without Estimates

Purpose

Identify tasks missing estimated hours.

Display

Task Name

Priority

Due Date

Click

Open Task Details.

---

# 10. Task List

Purpose

Display latest tasks.

Columns

Task

Priority

Status

Estimated

Logged

Due Date

Progress

Limit

10 rows

Button

View All

---

# 11. Overdue Tasks

Purpose

Display tasks whose due date has passed.

Condition

status != Completed

AND

dueDate < Today

Display

Task

Due Date

Days Overdue

Priority

---

# 12. Unscheduled Tasks

Purpose

Display tasks without planning.

Condition

Missing

Start Date

or

Due Date

Display

Task Name

Priority

Created Date

---

# Navigation

Widget → Page

Total Tasks

→ Tasks

Overall Tasks

→ Tasks

Pie Chart

→ Filtered Tasks

Timesheet

→ Timesheet Page

Work Done Today

→ Today's Timesheet

Task List

→ Tasks

Overdue

→ Filtered Tasks

Unscheduled

→ Tasks

---

# Firebase Collections

Use existing collections.

tasks

timeLogs

users

No duplicate collections.

---

# Performance

Use parallel Firestore queries.

Memoize expensive calculations.

Do not re-fetch unnecessarily.

Use loading skeletons.

---

# Empty States

Every widget must handle

- No Tasks
- No Logged Time
- No Estimates
- No Overdue Tasks

Show meaningful illustrations.

---

# Error States

Gracefully handle

Firestore failures

Authentication failures

Permission failures

Network failures

---

# UI Requirements

Use enterprise design.

Spacing

24px

Rounded cards

Shadow

Responsive

Desktop

Tablet

Mobile

Use shadcn components consistently.

---

# Acceptance Criteria

✅ Dashboard loads using Firebase data

✅ Every widget calculates data dynamically

✅ Every widget supports loading state

✅ Every widget supports empty state

✅ Clicking widgets navigates correctly

✅ Timesheet page displays daily task-wise logged hours

✅ Charts update automatically

✅ Responsive on all devices

✅ Production-ready implementation

No mock data.

No placeholders.

No incomplete components.

Implement the entire dashboard as a cohesive Work Intelligence experience.