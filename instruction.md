# COLUMN_SPECIFICATION.md

# Timetriq - Column Specification

## Purpose

This document defines every column required for the Timetriq Workload Planning platform.

Each column includes:
- Purpose
- Data Type
- Required/Optional
- Validation
- UI Component
- Backend Field
- Business Rules

---

# Task Information

## Task ID

Purpose:
Unique identifier for every task.

Type:
String (Auto Generated)

UI:
Hidden

Backend:
UUID / Firestore Document ID

---

## Task Title

Purpose:
Short name describing the task.

Type:
String

Required:
Yes

Validation:
- Minimum 3 characters
- Maximum 100 characters

UI:
Single Line Textbox

Backend:
title

Example:
Build Login Page

---

## Description

Purpose:
Detailed explanation of the task.

Type:
Text

Required:
Optional

UI:
Textarea

Backend:
description

---

## Project

Purpose:
Task belongs to which project.

Type:
Dropdown

Required:
Yes

UI:
Select

Backend:
projectId

Example:
Timetriq MVP

---

## Assigned To

Purpose:
Owner responsible for completing the task.

Type:
User Reference

Required:
Yes

UI:
User Selector

Backend:
assignedUserId

---

## Status

Purpose:
Current progress of the task.

Type:
Dropdown

Values:
- Todo
- In Progress
- Review
- Completed
- Blocked

Required:
Yes

Backend:
status

---

## Priority

Purpose:
Importance of the task.

Values:
- Low
- Medium
- High
- Critical

Backend:
priority

---

# Planning Information

## Estimated Hours

Purpose:
Estimated effort required to complete the task.

Type:
Number

Required:
Yes

Validation:
Must be greater than zero.

Backend:
estimatedHours

Example:
12

---

## Actual Hours

Purpose:
Total hours logged against the task.

Type:
Calculated

Editable:
No

Calculation:
Sum of all Time Entries

Backend:
actualHours

---

## Remaining Hours

Purpose:
Hours left to complete the task.

Type:
Calculated

Formula:
Estimated Hours - Actual Hours

Backend:
remainingHours

---

## Variance

Purpose:
Difference between planned and actual effort.

Formula:
Actual Hours - Estimated Hours

Positive:
Over Budget

Negative:
Under Budget

Backend:
variance

---

# Dates

## Start Date

Purpose:
Planned task start.

Type:
Date

Backend:
startDate

---

## Due Date

Purpose:
Expected completion date.

Type:
Date

Backend:
dueDate

---

## Completed Date

Purpose:
Actual completion date.

Type:
Date

Backend:
completedDate

Automatically set when Status becomes Completed.

---

# Workload

## Daily Planned Hours

Purpose:
Business Engine distributes Estimated Hours across working days.

Editable:
No

Backend:
Calculated

---

## Capacity Used

Purpose:
Percentage of daily capacity consumed.

Formula:
Planned Hours / Daily Capacity

Backend:
capacityUsed

---

## Capacity Remaining

Purpose:
Available working hours for the day.

Formula:
Daily Capacity - Planned Hours

Backend:
remainingCapacity

---

# Progress

## Progress %

Purpose:
Task completion percentage.

Formula:
Actual Hours / Estimated Hours × 100

Maximum:
100%

Backend:
progress

---

# Time Tracking

## Today's Logged Hours

Purpose:
Hours logged today.

Backend:
todayHours

---

## Total Logged Entries

Purpose:
Number of time entries recorded.

Backend:
entryCount

---

# Metadata

## Created By

Purpose:
User who created the task.

Auto Generated

Backend:
createdBy

---

## Created At

Purpose:
Creation timestamp.

Auto Generated

Backend:
createdAt

---

## Updated At

Purpose:
Last modified timestamp.

Auto Generated

Backend:
updatedAt

---

# UI Mapping

| Section | Fields |
|---------|--------|
| Basic Information | Title, Description, Project |
| Assignment | Assigned To, Priority, Status |
| Planning | Estimated Hours, Start Date, Due Date |
| Tracking | Actual Hours, Remaining Hours, Progress |
| Capacity | Daily Planned Hours, Capacity Used, Capacity Remaining |
| Metadata | Created By, Created At, Updated At |

---

# Business Rules

- Estimated Hours must always be greater than 0.
- Actual Hours are calculated only from Time Entries.
- Remaining Hours cannot be edited manually.
- Progress is calculated automatically.
- Variance is calculated automatically.
- Capacity is calculated by the Business Engine.
- Users cannot modify calculated fields directly.
- Every task belongs to exactly one project.
- Every task has one owner.
- Date validation must ensure Due Date is not earlier than Start Date.

---

# Implementation Order

Phase 1
- Task Title
- Description
- Project
- Assigned To
- Status
- Priority

Phase 2
- Estimated Hours
- Start Date
- Due Date

Phase 3
- Time Tracking
- Actual Hours
- Remaining Hours
- Progress

Phase 4
- Capacity
- Variance
- Dashboard
- Reports

---

# Final Principle

Only store source data in the database.

The Business Engine should calculate:
- Actual Hours
- Remaining Hours
- Progress
- Variance
- Capacity
- Workload

The frontend should only display these calculated values.