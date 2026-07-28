# Feature: Enterprise Domain Restricted Authentication

## Feature ID

AUTH-002

---

# Overview

Implement enterprise-grade authentication for Timetriq.

Instead of allowing any Firebase user to access the application, only users belonging to approved company domains should be authenticated.

For the initial implementation, only the following domain is allowed:

```
verveadvisory.com
```

This feature should work with both:

- Email & Password Authentication
- Google Authentication

Unauthorized users must never gain access to protected pages.

---

# Objective

Transform Timetriq from a public authentication model into an organization-restricted application.

The application should behave similarly to internal enterprise tools where only company employees can log in.

---

# Tech Stack

- React
- TypeScript
- Firebase Authentication
- Firestore
- React Router
- Tailwind CSS
- shadcn/ui

---

# Functional Requirements

## 1. Allowed Domain Configuration

Do NOT hardcode the domain throughout the project.

Create a reusable configuration.

Example

```
src/config/auth.ts
```

```ts
export const AUTH_CONFIG = {
    allowedDomains: [
        "verveadvisory.com"
    ]
}
```

All authentication validation must use this configuration.

---

## 2. Email Password Registration

Before creating a Firebase account

Validate

```
email.endsWith("@verveadvisory.com")
```

If validation fails

Do NOT create the account.

Display

```
Only Verve Advisory email accounts are allowed.
```

---

## 3. Email Password Login

After Firebase authentication

Validate the authenticated user's email.

If the email belongs to an unauthorized domain

Immediately

- Sign Out
- Clear session
- Redirect Login
- Show error toast

---

## 4. Google Authentication

After successful Google Sign In

Retrieve

```
user.email
```

Validate the email domain.

If unauthorized

- Logout immediately
- Prevent dashboard access
- Redirect Login
- Display

```
Access denied.

Please sign in using your Verve Advisory account.
```

---

## 5. Authentication Context

Whenever authentication state changes

Validate

Current user domain.

If invalid

Immediately remove the session.

This validation should happen inside the Auth Provider instead of individual pages.

---

## 6. Protected Routes

Every protected route must verify

- user exists
- user email exists
- user belongs to allowed domain

If not

Redirect Login.

Unauthorized users should never briefly see protected pages.

---

## 7. Session Validation

Whenever the application starts

Validate

- Current Firebase user
- Allowed domain

If invalid

Logout automatically.

---

## 8. Firestore User Document

When a new authorized user signs in

Automatically create a user profile if one does not exist.

Example

```
users/

uid

displayName

email

photoURL

role

createdAt

lastLogin

```

Example document

```json
{
  "displayName": "John Doe",
  "email": "john@verveadvisory.com",
  "role": "employee",
  "createdAt": "...",
  "lastLogin": "..."
}
```

---

## 9. Login Screen

Update the authentication page.

Heading

```
Welcome to Timetriq
```

Subtitle

```
Sign in using your Verve Advisory account.
```

Footer

```
Only @verveadvisory.com email accounts are permitted.
```

---

## 10. Error Handling

Use shadcn/ui Toasts.

Standardize errors.

Examples

```
Only Verve Advisory accounts are allowed.

Unauthorized email domain.

Access denied.

Please sign in using your company account.
```

---

# Firebase Integration

Use existing Firebase project.

Do NOT change authentication provider configuration.

Integrate with existing

- Firebase Auth
- Firestore
- Auth Context

---

# Security Requirements

Validation must happen

✅ Before Registration

✅ After Login

✅ On Google Sign In

✅ Inside Auth Provider

✅ Before Rendering Protected Routes

Frontend validation alone is NOT sufficient.

---

# Code Requirements

Create reusable utilities.

Example

```
src/utils/auth.ts
```

```ts
export function isAllowedDomain(email: string) {
    ...
}
```

Avoid duplicated logic.

---

# UX Requirements

When access is denied

- Logout immediately
- Remove loading state
- Redirect Login
- Show Toast
- Never expose Dashboard

---

# Future Scalability

Design the implementation so additional domains can be added without modifying authentication logic.

Example

```ts
allowedDomains: [
    "verveadvisory.com",
    "company2.com",
    "company3.com"
]
```

---

# Acceptance Criteria

- Email registration restricted to approved domains
- Email login restricted to approved domains
- Google login restricted to approved domains
- Unauthorized users automatically logged out
- Protected routes validate domain
- User profile automatically created in Firestore
- Enterprise login messaging added
- Reusable validation utilities implemented
- Production-ready code
- No duplicated authentication logic

---

# Expected Outcome

Timetriq behaves like an internal enterprise application where only employees with approved company email addresses can access the platform, while remaining scalable for future multi-organization support.