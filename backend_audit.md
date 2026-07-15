# TaskFlow Backend — Full Audit

> **Generated from**: Live source code analysis of all 13 controllers, 64 DTOs, 37 domain entities  
> **Last updated**: 2026-07-14

---

## Table of Contents

1. [Enums & Value Types](#1-enums--value-types)
2. [Auth API](#2-auth-api)
3. [User API](#3-user-api)
4. [Organization API](#4-organization-api)
5. [Organization Invites API](#5-organization-invites-api)
6. [Team API](#6-team-api)
7. [Crew API](#7-crew-api)
8. [Task API](#8-task-api)
9. [Project API](#9-project-api)
10. [Notification API](#10-notification-api)
11. [Dashboard API](#11-dashboard-api)
12. [Admin API (Super Admin)](#12-admin-api-super-admin)
13. [Role & Permission API](#13-role--permission-api)
14. [Task State Machine](#14-task-state-machine)
15. [Permission Model (RBAC)](#15-permission-model-rbac)
16. [Security Features](#16-security-features)

---

## 1. Enums & Value Types

### TaskStatus
```
TODO | ASSIGNED | SUBMITTED | APPROVED | REJECTED | COMPLETED
```

### TaskPriority
```
LOW | MEDIUM | HIGH | URGENT
```

### EvidenceType
```
LINK | GITHUB | SCREENSHOT | RECORDING | SNIPPET | NOTE
```

### CrewVisibility
```
INVITE_ONLY | PUBLIC_LINK
```

### CrewRole
```
CREATOR | MEMBER
```

### ChannelType
```
TEXT | VOICE
```

---

## 2. Auth API

**Base**: `POST /api/auth`

### `POST /api/auth/register`
**Auth**: None  
**Rate Limit**: 5 per IP / 60 min

**Request Body** (`RegisterRequestDTO`):
```json
{
  "username": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8, must contain letter + number)"
}
```

**Response** `201`:
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 1800,
  "refreshExpiresIn": 604800,
  "user": { /* UserResponseDTO */ }
}
```

---

### `POST /api/auth/login`
**Auth**: None  
**Rate Limit**: 10 per IP+username / 15 min, 50 per IP / 15 min

**Request Body** (`LoginRequestDTO`):
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response** `200` (`JwtResponseDTO`):
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string",
  "expiresIn": 1800,
  "refreshExpiresIn": 604800,
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "...",
    "avatarUrl": "...",
    "roles": ["EMPLOYEE"],
    "createdAt": "2026-01-01T00:00:00",
    "lastLoginAt": "2026-07-14T10:00:00",
    "emailNotificationsEnabled": true,
    "emailVerified": true
  }
}
```

**Business Logic**:
- Dual rate-limiting: per IP+username AND per IP
- Security audit events recorded for all outcomes
- Login time recorded in user profile
- `LockedException`, `DisabledException`, `AccountExpiredException`, `CredentialsExpiredException` handled distinctly

---

### `GET /api/auth/verify-email?token={token}`
**Auth**: None  
**Rate Limit**: 10 per IP / 15 min

**Response** `200`:
```json
{ "status": "verified" }
```

---

### `POST /api/auth/resend-verification`
**Auth**: None  
**Rate Limit**: 5 per IP+email / 60 min

**Request Body** (`ResendVerificationRequestDTO`):
```json
{ "email": "string" }
```

**Response** `200`:
```json
{ "message": "If the email exists and isn't verified, a verification email has been sent." }
```

**Business Logic**: Anti-enumeration — same response regardless of email existence.

---

### `POST /api/auth/refresh`
**Auth**: None  
**Rate Limit**: 30 per IP / 15 min

**Request Body** (`TokenRefreshRequestDTO`):
```json
{ "refreshToken": "string" }
```

**Response** `200`: Same as login (`JwtResponseDTO`)

**Business Logic**:
- Old token marked `used=true` atomically (not deleted)
- Device change detection (User-Agent mismatch → security audit event)
- Replay of used token → all sessions revoked

---

### `POST /api/auth/logout`
**Auth**: Bearer token  
**Rate Limit**: 20 per IP / 15 min

**Request Body**:
```json
{ "refreshToken": "string" }
```

**Response** `200`:
```json
{ "message": "Log out successful!" }
```

**Business Logic**:
- Refresh token deleted
- Access token added to denylist
- WebSocket force-disconnect

---

### `POST /api/auth/logout-all`
**Auth**: Bearer token  
**Rate Limit**: 20 per IP / 15 min

**Response** `200`:
```json
{ "message": "Signed out of all sessions successfully." }
```

**Business Logic**:
1. Increments `user.tokenVersion` → invalidates ALL access tokens
2. Deletes ALL refresh tokens → forces re-login on every device
3. Denylists current access token
4. Force-disconnects all WebSockets

---

### `POST /api/auth/forgot-password`
**Auth**: None

**Request Body** (`ForgotPasswordRequestDTO`):
```json
{ "email": "string" }
```

**Response** `200` (always same message — anti-enumeration):
```json
{ "message": "If that email exists, a reset link has been sent." }
```

---

### `POST /api/auth/reset-password`
**Auth**: None

**Request Body** (`ResetPasswordRequestDTO`):
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response** `200`:
```json
{ "message": "Password has been reset successfully. Please login with your new password." }
```

---

## 3. User API

**Base**: `/api/users`

### `GET /api/users/me`
**Auth**: Bearer token

**Response** `200` (`UserResponseDTO`):
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "fullName": "John Doe",
  "bio": "Developer",
  "avatarUrl": "https://...",
  "roles": ["EMPLOYEE"],
  "createdAt": "...",
  "lastLoginAt": "...",
  "emailNotificationsEnabled": true,
  "emailVerified": true
}
```

---

### `GET /api/users`
**Auth**: Bearer token

**Response** `200`: `List<UserResponseDTO>`

**Business Logic**:
- **Super Admin**: sees ALL users
- **Regular user**: sees only members of their own organization
- **No org**: returns only self

---

### `PUT /api/users/me`
**Auth**: Bearer token

**Request Body** (`UpdateProfileRequestDTO`):
```json
{
  "fullName": "string",
  "bio": "string",
  "avatarUrl": "string",
  "emailNotificationsEnabled": true
}
```

**Response** `200`: `UserResponseDTO`

---

### `POST /api/users/me/password`
**Auth**: Bearer token

**Request Body** (`ChangePasswordRequestDTO`):
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8)"
}
```

**Response** `200`: empty

---

### `GET /api/users/me/sessions`
**Auth**: Bearer token

**Response** `200`: `List<SessionDTO>`
```json
[
  {
    "tokenId": "uuid",
    "deviceInfo": "Mozilla/5.0...",
    "current": true
  }
]
```

---

### `DELETE /api/users/me/sessions/{tokenId}`
**Auth**: Bearer token  
**Response** `204`

---

## 4. Organization API

**Base**: `/api/organizations`

### `POST /api/organizations`
**Auth**: Authenticated

**Request Body** (`CreateOrganizationRequestDTO`):
```json
{
  "name": "string (required, 2-100 chars)",
  "description": "string (optional)"
}
```

**Response** `201` (`OrganizationResponseDTO`):
```json
{
  "id": 1,
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "...",
  "createdBy": "john",
  "createdAt": "...",
  "memberCount": 1
}
```

---

### `GET /api/organizations`
**Auth**: Authenticated  
**Response** `200`: `List<OrganizationResponseDTO>` (user's orgs only)

### `GET /api/organizations/{id}`
**Auth**: Authenticated  
**Response** `200`: `OrganizationResponseDTO`

---

### Members

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/{id}/members` | `InviteMemberRequestDTO { username, roleId }` | `201 OrganizationInviteDTO` |
| `GET` | `/{id}/members` | — | `200 List<MembershipResponseDTO>` |
| `DELETE` | `/{id}/members/{userId}` | — | `204` |
| `PUT` | `/{id}/members/{userId}/role` | `UpdateRoleRequestDTO { roleId }` | `200 MembershipResponseDTO` |

---

### Teams (nested under Org)

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/{id}/teams` | `CreateTeamRequestDTO { name, description }` | `201 TeamResponseDTO` |
| `GET` | `/{id}/teams` | — | `200 List<TeamResponseDTO>` |
| `GET` | `/teams/{teamId}` | — | `200 TeamResponseDTO` |
| `PUT` | `/teams/{teamId}` | `CreateTeamRequestDTO` | `200 TeamResponseDTO` |
| `DELETE` | `/teams/{teamId}` | — | `204` |
| `POST` | `/teams/{teamId}/members` | `TeamMemberRequestDTO { userId }` | `200 TeamResponseDTO` |
| `DELETE` | `/teams/{teamId}/members/{userId}` | — | `200 TeamResponseDTO` |

---

### Leave Requests

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/{id}/leave` | `LeaveReasonDTO { reason? }` | `201 LeaveRequestDTO` |
| `POST` | `/{id}/leave/{requestId}/approve` | — | `200 LeaveRequestDTO` |
| `POST` | `/{id}/leave/{requestId}/reject` | `LeaveRejectDTO { comment? }` | `200 LeaveRequestDTO` |
| `GET` | `/{id}/leave` | — | `200 List<LeaveRequestDTO>` |
| `GET` | `/{id}/leave/status` | — | `200 LeaveRequestDTO` |

---

### Roles (nested under Org)

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/{id}/roles` | — | `200 List<RoleResponseDTO>` |
| `POST` | `/{id}/roles` | `RoleCreateRequestDTO { name, description }` | `201 RoleResponseDTO` |
| `PUT` | `/{id}/roles/{roleId}` | `RoleUpdateRequestDTO` | `200 RoleResponseDTO` |
| `DELETE` | `/{id}/roles/{roleId}` | — | `204` |
| `PUT` | `/{id}/roles/{roleId}/permissions` | `AssignPermissionsRequestDTO { permissionIds }` | `200 Set<PermissionResponseDTO>` |

---

## 5. Organization Invites API

| Method | Path | Request | Response | Note |
|---|---|---|---|---|
| `POST` | `/api/organizations/{orgId}/invites` | `InviteMemberRequestDTO` | `201 OrganizationInviteDTO` | In-app invite |
| `POST` | `/api/organizations/{orgId}/invites/link` | `UpdateRoleRequestDTO { roleId }` | `201 OrganizationInviteDTO` | Shareable link |
| `GET` | `/api/invites` | — | `200 List<OrganizationInviteDTO>` | My pending invites |
| `POST` | `/api/invites/{inviteId}/accept` | — | `200 OrganizationInviteDTO` | Accept by ID |
| `POST` | `/api/invites/{inviteId}/decline` | — | `200 OrganizationInviteDTO` | Decline |
| `POST` | `/api/invites/token/{token}/accept` | — | `200 OrganizationInviteDTO` | Accept by token |

---

## 6. Team API

> Teams are managed through the Organization endpoints (see §4).

**TeamResponseDTO**:
```json
{
  "id": 1,
  "name": "Engineering",
  "description": "...",
  "organizationId": 1,
  "leadUsername": "john",
  "memberCount": 5
}
```

---

## 7. Crew API

**Base**: `/api/crews`

### CRUD

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/crews` | `CrewRequestDTO` | `201 CrewResponseDTO` |
| `GET` | `/api/crews` | — | `200 List<CrewResponseDTO>` |
| `GET` | `/api/crews/{crewId}` | — | `200 CrewResponseDTO` |
| `PUT` | `/api/crews/{crewId}` | `CrewRequestDTO` | `200 CrewResponseDTO` |
| `DELETE` | `/api/crews/{crewId}` | — | `204` |

**CrewRequestDTO**:
```json
{
  "name": "string (required)",
  "description": "string",
  "avatarUrl": "string",
  "visibility": "INVITE_ONLY | PUBLIC_LINK",
  "memberCap": 15
}
```

**CrewResponseDTO**:
```json
{
  "id": 1,
  "name": "Design Crew",
  "description": "...",
  "avatarUrl": "...",
  "visibility": "INVITE_ONLY",
  "memberCap": 15,
  "creatorUsername": "john",
  "memberCount": 3,
  "createdAt": "..."
}
```

---

### Members & Invites

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/{crewId}/members` | — | `200 List<CrewMemberDTO>` |
| `POST` | `/{crewId}/invite` | `{ "email": "string" }` | `200 CrewInviteDTO` |
| `POST` | `/{crewId}/invite/link` | — | `201 CrewInviteDTO` |
| `POST` | `/invites/{inviteId}/accept` | — | `200 CrewResponseDTO` |
| `DELETE` | `/{crewId}/members/{userId}` | — | `204` |
| `POST` | `/{crewId}/leave` | — | `204` |

---

### Projects

| Method | Path | Response |
|---|---|---|
| `GET` | `/{crewId}/projects` | `200 List<ProjectSummaryDTO>` |
| `POST` | `/{crewId}/projects/{projectId}` | `200` (share) |
| `DELETE` | `/{crewId}/projects/{projectId}` | `204` (unshare) |

---

### Channels

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/{crewId}/channels` | — | `200 List<CrewChannelDTO>` |
| `POST` | `/{crewId}/channels` | `CrewChannelRequestDTO { name, type }` | `201 CrewChannelDTO` |
| `DELETE` | `/{crewId}/channels/{channelId}` | — | `204` |

---

### Messages

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/{crewId}/channels/{channelId}/messages` | — | `200 List<CrewMessageDTO>` |
| `POST` | `/{crewId}/channels/{channelId}/messages` | `CrewMessageRequestDTO { content }` | `201 CrewMessageDTO` |
| `PUT` | `/{crewId}/channels/{channelId}/messages/{messageId}` | `CrewMessageRequestDTO` | `200 CrewMessageDTO` |
| `DELETE` | `/{crewId}/channels/{channelId}/messages/{messageId}` | — | `204` |
| `POST` | `/{crewId}/channels/{channelId}/messages/{messageId}/convert-to-task` | `ConvertToTaskRequestDTO` | `200 TaskResponseDTO` |

---

### Crew Tasks

### `POST /api/crews/{crewId}/tasks`
**Auth**: Authenticated (crew member)

**Request Body** (`CrewTaskRequestDTO`):
```json
{
  "title": "string (required)",
  "description": "string",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "dueDate": "2026-07-20",
  "tags": "string",
  "projectId": null
}
```

> ⚠️ **No `assignee` field** — crew tasks are unclaimed by design. Use `/claim` to take ownership.

**Response** `201` (`TaskResponseDTO`):
```json
{
  "id": 42,
  "title": "Design homepage",
  "currentStatus": "TODO",
  "assignee": null,
  "creator": "john",
  "crewId": 1,
  "crewName": "Design Crew"
}
```

**Business Logic**:
- Creator must be a crew member
- Task starts as `TODO` (unclaimed)
- `organization_id = NULL`, `team_id = NULL`, `is_personal = false`

---

## 8. Task API

**Base**: `/api/tasks`

### Core CRUD

| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Authenticated | `?scope=personal\|org\|crew&page=0&size=20` | `200 Page<TaskResponseDTO>` |
| `GET` | `/api/tasks/{taskId}` | `VIEW` | — | `200 TaskResponseDTO` |
| `PUT` | `/api/tasks/{taskId}` | `EDIT` | `TaskUpdateRequestDTO` | `200 TaskResponseDTO` |
| `DELETE` | `/api/tasks/{taskId}` | `DELETE` | — | `204` |

---

### Task Creation

#### `POST /api/tasks/assign` (Org Tasks Only)
**Permission**: `ASSIGN`

**Request Body** (`TaskRequestDTO`):
```json
{
  "title": "string (required)",
  "description": "string",
  "assigneeUsername": "string (required)",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "dueDate": "2026-07-20",
  "tags": "string",
  "isPersonal": false,
  "projectId": null,
  "crewId": null
}
```

> ⚠️ If `crewId` is set → throws error: *"Use POST /api/crews/{crewId}/tasks instead"*

**Response** `201`: `TaskResponseDTO` (status: `ASSIGNED`)

**Business Logic**:
- Self-assignment blocked for org tasks
- Assignee must be in same org as creator
- Super Admin can assign across orgs

---

#### `POST /api/tasks/personal` (Personal Tasks)
**Permission**: Authenticated

**Request Body**: Same `TaskRequestDTO` (assignee auto-set to creator)

**Response** `201`: `TaskResponseDTO` (status: `TODO`)

---

#### `POST /api/tasks/bulk-assign` (Bulk)
**Permission**: `ASSIGN`

**Request Body** (`BulkAssignRequestDTO`):
```json
{
  "title": "string",
  "description": "string",
  "teamId": 1,
  "assigneeUsernames": ["alice", "bob"],
  "dueDate": "2026-07-20",
  "tags": ["frontend", "urgent"]
}
```

**Response** `201`: `List<TaskResponseDTO>`

---

### Workflow Transitions

| Method | Path | Permission | From → To | Body | Notes |
|---|---|---|---|---|---|
| `POST` | `/{taskId}/submit` | `EDIT` | `ASSIGNED/REJECTED → SUBMITTED` | — | Blocks crew tasks; checks dependencies |
| `POST` | `/{taskId}/approve` | `REVIEW` | `SUBMITTED → APPROVED` | — | Blocks crew tasks; notifies downstream |
| `POST` | `/{taskId}/reject` | `REVIEW` | `SUBMITTED → REJECTED` | `RejectReasonDTO { reason (required) }` | Blocks crew tasks |
| `POST` | `/{taskId}/recall` | `EDIT` | `SUBMITTED → ASSIGNED` | — | Assignee pulls back submission |
| `POST` | `/{taskId}/complete` | `EDIT` | `TODO → COMPLETED` | — | Personal tasks only |
| `POST` | `/{taskId}/complete-crew` | `EDIT` | `TODO/ASSIGNED → COMPLETED` | — | Crew tasks only; auto-assigns if unclaimed |
| `POST` | `/{taskId}/claim` | `EDIT` | `TODO → ASSIGNED` | — | Crew tasks only; first-taker wins |
| `PUT` | `/{taskId}/reassign` | `REASSIGN` | stays `ASSIGNED` | `TaskReassignRequestDTO { assigneeId }` | — |
| `PUT` | `/{taskId}/archive` | `ARCHIVE` | toggle `archived` | — | — |

---

### Sub-Resources

#### Comments
| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `GET` | `/{taskId}/comments` | `VIEW` | `Pageable` | `200 Page<TaskCommentDTO>` |
| `POST` | `/{taskId}/comments` | `COMMENT` | `CommentRequestDTO { text, parentId? }` | `201 TaskCommentDTO` |

#### Checklists
| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `POST` | `/{taskId}/checklists` | `CHECKLIST_EDIT` | `ChecklistItemRequestDTO { text }` | `201 ChecklistItemDTO` |
| `POST` | `/{taskId}/checklists/{itemId}/toggle` | `CHECKLIST_EDIT` | — | `200 ChecklistItemDTO` |
| `DELETE` | `/{taskId}/checklists/{itemId}` | `CHECKLIST_EDIT` | — | `204` |
| `PUT` | `/{taskId}/checklists/order` | `CHECKLIST_EDIT` | `List<Long> itemIds` | `200` |

#### Dependencies
| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `POST` | `/{taskId}/dependencies` | `DEPENDENCY_EDIT` | `TaskDependencyRequestDTO { dependsOnId }` | `201` |
| `DELETE` | `/{taskId}/dependencies/{depId}` | `DEPENDENCY_EDIT` | — | `204` |

> ⚠️ `DEPENDENCY_EDIT` → routes to `canEditDependency()` → **creator + org admin/director only** (assignee blocked)

#### Evidence
| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `GET` | `/{taskId}/evidence` | `VIEW` | — | `200 List<TaskEvidenceDTO>` |
| `POST` | `/{taskId}/evidence` | `EDIT` | `TaskEvidenceRequestDTO { type, url, ... }` | `201 TaskEvidenceDTO` |
| `DELETE` | `/{taskId}/evidence/{evidenceId}` | `EDIT` | — | `204` |

#### History
| Method | Path | Permission | Response |
|---|---|---|---|
| `GET` | `/{id}/history` | `VIEW` | `200 Page<ActivityEventDTO>` |

---

### TaskResponseDTO (Full Shape)
```json
{
  "id": 1,
  "title": "Design homepage",
  "description": "...",
  "assignee": "alice",
  "creator": "john",
  "reviewer": "john",
  "currentStatus": "ASSIGNED",
  "priority": "HIGH",
  "dueDate": "2026-07-20",
  "tags": "frontend,design",
  "checklists": [{ "id": 1, "text": "Wireframe", "done": false, "sortOrder": 0 }],
  "blocks": [{ "id": 2, "title": "Deploy" }],
  "blockedBy": [{ "id": 3, "title": "API done" }],
  "createdAt": "...",
  "updatedAt": "...",
  "coverImageUrl": null,
  "rejectionReason": null,
  "isPersonal": false,
  "archived": false,
  "orgId": 1,
  "orgName": "Acme",
  "teamId": 2,
  "teamName": "Engineering",
  "projectId": 5,
  "projectName": "Website Redesign",
  "crewId": null,
  "crewName": null
}
```

---

## 9. Project API

**Base**: `/api/projects`

| Method | Path | Permission | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/projects` | Authenticated | — | `200 List<ProjectResponseDTO>` |
| `GET` | `/api/projects/{projectId}` | `Project:READ` | — | `200 ProjectResponseDTO` |
| `POST` | `/api/projects` | `Project:CREATE` | `ProjectRequestDTO` | `201 ProjectResponseDTO` |
| `PUT` | `/api/projects/{projectId}` | `Project:EDIT` | `ProjectRequestDTO` | `200 ProjectResponseDTO` |
| `DELETE` | `/api/projects/{projectId}` | `Project:DELETE` | — | `204` |

---

## 10. Notification API

**Base**: `/api/notifications`

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/api/notifications` | `Pageable (max 100)` | `200 Page<NotificationDTO>` |
| `GET` | `/api/notifications/unread/count` | — | `200 { "count": 5 }` |
| `PUT` | `/api/notifications/{id}/read` | — | `204` |
| `PUT` | `/api/notifications/read-all` | — | `204` |
| `DELETE` | `/api/notifications/{id}` | — | `204` |

---

## 11. Dashboard API

**Base**: `/api/dashboard`

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/stats` | — | `200 DashboardStatsDTO` |
| `GET` | `/activity` | `?page=0&size=20&includeComments=false` | `200 Page<ActivityEventDTO>` |
| `GET` | `/activity/task/{taskId}` | `VIEW` permission | `200 Page<ActivityEventDTO>` |
| `GET` | `/activity/export` | `?format=csv\|json&from=&to=` | File download |

---

## 12. Admin API (Super Admin)

**Base**: `/api/admin` — requires `SUPER_ADMIN` role

### Platform Management

| Method | Path | Response | Note |
|---|---|---|---|
| `GET` | `/organizations` | `200 List<OrganizationResponseDTO>` | See ALL orgs |
| `GET` | `/organizations/{id}` | `200 OrganizationResponseDTO` | Any org |
| `POST` | `/organizations/{id}/suspend` | `200 OrganizationResponseDTO` | Sets status=SUSPENDED |
| `POST` | `/organizations/{id}/activate` | `200 OrganizationResponseDTO` | Sets status=ACTIVE |
| `DELETE` | `/organizations/{id}` | `204` | Soft-delete (status=DELETED) |

### User Role Management

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/users/{userId}/roles` | — | `200 Set<RoleResponseDTO>` |
| `PUT` | `/users/{userId}/roles` | `List<String> roleNames` | `200 Set<RoleResponseDTO>` |

> ⚠️ Only `SUPER_ADMIN` can be assigned as a global role. Org roles go through membership.

---

## 13. Role & Permission API

**Base**: `/api/admin` — requires `ROLE_MANAGE` permission or `SUPER_ADMIN`

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/roles` | — | `200 List<RoleResponseDTO>` |
| `POST` | `/roles` | `RoleCreateRequestDTO` | `201 RoleResponseDTO` |
| `PUT` | `/roles/{id}` | `RoleUpdateRequestDTO` | `200 RoleResponseDTO` |
| `DELETE` | `/roles/{id}` | — | `204` |
| `GET` | `/permissions` | — | `200 List<PermissionResponseDTO>` |
| `GET` | `/roles/{id}/permissions` | — | `200 Set<PermissionResponseDTO>` |
| `PUT` | `/roles/{id}/permissions` | `AssignPermissionsRequestDTO { permissionIds }` | `200 Set<PermissionResponseDTO>` |

---

## 14. Task State Machine

### Personal Tasks
```
TODO ────────────────────────────────────→ COMPLETED
  (user marks done via POST /{taskId}/complete)
```

### Crew Tasks
```
TODO ──── claim ────→ ASSIGNED ──────────→ COMPLETED
  │   (POST /{taskId}/claim)    (POST /{taskId}/complete-crew)
  │
  └───── direct ─────────────────────────→ COMPLETED
         (POST /{taskId}/complete-crew — implicit claim)
```

### Org Tasks (Review Pipeline)
```
ASSIGNED ──── submit ────→ SUBMITTED ──── approve ────→ APPROVED
    ↑                         │   │
    │                         │   └──── reject + reason ──→ REJECTED
    │                         │                                │
    │                         └──── recall ────────────────────┘
    │                                                          │
    └──── reassign ────────────────────────────────────────────┘
```

### Review Rules
| Rule | Enforced |
|---|---|
| Assignee ≠ Reviewer | ✅ `EmployeeStrategy.canReview()` blocks assignee |
| Creator CAN review | ✅ No creator block (user-corrected spec) |
| Rejection reason required | ✅ `@NotBlank` on DTO + DB CHECK constraint |
| Crew tasks blocked from pipeline | ✅ Guards on `submitTask`, `approveTask`, `rejectTask` |

### Mutual Exclusivity
```
Personal:  org=NULL,  team=NULL, crew=NULL, creator=assignee
Crew:      org=NULL,  team=NULL, crew≠NULL
Org:       org≠NULL,  team=opt,  crew=NULL
```

---

## 15. Permission Model (RBAC)

### Permission Routing (`CustomPermissionEvaluator`)

| Permission Key | Routes To | Who Can |
|---|---|---|
| `EDIT` | `canEdit()` | Creator, Assignee, Org Admin+ |
| `VIEW` | `canViewTask()` | Creator, Assignee, Org members |
| `ASSIGN` | `canAssign()` | Org Manager+ |
| `REVIEW` | `canReview()` | Creator (assignor), Org Manager+ — **NOT assignee** |
| `REASSIGN` | `canReassign()` | Creator, Org Admin+ |
| `DELETE` | `canDelete()` | Creator, Org Admin+ |
| `ARCHIVE` | `canArchive()` | Creator, Org Manager+ |
| `COMMENT` | `canEdit()` | Same as EDIT |
| `CHECKLIST_EDIT` | `canEdit()` | Same as EDIT |
| `DEPENDENCY_EDIT` | `canEditDependency()` | **Creator only** + Org Admin/Director (assignee blocked) |
| `EVIDENCE_EDIT` | `canEdit()` | Same as EDIT |

### Strategy Pattern
- **`EmployeeStrategy`**: Enforces org membership, role hierarchy, crew membership
- **`SuperAdminStrategy`**: Only personal tasks (privacy boundary)

### Org Role Hierarchy
```
ADMIN > DIRECTOR > MANAGER > EMPLOYEE
```

---

## 16. Security Features

| Feature | Implementation |
|---|---|
| **Authentication** | JWT (access + refresh tokens) |
| **Token Denylist** | Caffeine cache for revoked access tokens |
| **Token Versioning** | `user.tokenVersion` incremented on password change / logout-all |
| **Refresh Token Rotation** | Old token marked `used=true`; replay → revoke all |
| **Device Change Detection** | User-Agent comparison during refresh |
| **Rate Limiting** | Bucket4j per-endpoint; per-IP and per-IP+key |
| **Password Policy** | Min 8 chars, letter + number required |
| **Email Verification** | Required before login |
| **Anti-Enumeration** | Same response for forgot-password/resend regardless of email existence |
| **RBAC** | `RoleStrategy` pattern with `CustomPermissionEvaluator` |
| **Audit Trail** | `SecurityAuditEvent` for auth, `TaskStatusHistory` for tasks |
| **WebSocket** | Real-time task updates via `RealtimeBroadcaster` |
| **Optimistic Locking** | `@Version` on Task entity for concurrent claim protection |
| **CSV Injection Prevention** | Prefixed `=`,`+`,`-`,`@` chars in export |
