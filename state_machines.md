# Mode Boundary & Task State Machine Diagrams

> Derived from live backend source code. All corrections applied (crew claiming flow, reviewer rules, dependency locking).

---

## 1. Mode Boundary Diagram — Task Routing

```mermaid
flowchart TD
    START["🆕 Task Created"] --> CHECK1{"is_personal = true?"}

    CHECK1 -->|"YES"| PERSONAL["🟢 PERSONAL MODE"]
    PERSONAL --> P1["organization_id = NULL"]
    PERSONAL --> P2["team_id = NULL"]
    PERSONAL --> P3["crew_id = NULL"]
    PERSONAL --> P4["creator = assignee = user"]
    PERSONAL --> P5["Endpoint: POST /api/tasks/personal"]
    PERSONAL --> P6["Visible: only creator"]
    PERSONAL --> PFLOW["Flow: TODO → COMPLETED"]

    CHECK1 -->|"NO"| CHECK2{"crew_id != NULL?"}

    CHECK2 -->|"YES"| CREW["🔵 CREW MODE"]
    CREW --> C1["organization_id = NULL"]
    CREW --> C2["team_id = NULL"]
    CREW --> C3["is_personal = false"]
    CREW --> C4["assignee = NULL (unclaimed)"]
    CREW --> C5["Endpoint: POST /api/crews/{crewId}/tasks"]
    CREW --> C6["Visible: all crew members"]
    CREW --> CFLOW["Flow: TODO → claim → ASSIGNED → COMPLETED"]

    CHECK2 -->|"NO"| ORG["🔴 ORG MODE"]
    ORG --> O1["organization_id != NULL"]
    ORG --> O2["team_id = optional"]
    ORG --> O3["crew_id = NULL"]
    ORG --> O4["creator ≠ assignee (no self-assign)"]
    ORG --> O5["Endpoint: POST /api/tasks/assign"]
    ORG --> O6["Visible: org members per RBAC strategy"]
    ORG --> OFLOW["Flow: ASSIGNED → SUBMITTED → APPROVED/REJECTED"]

    style PERSONAL fill:#d4edda,stroke:#28a745,color:#000
    style CREW fill:#cce5ff,stroke:#0d6efd,color:#000
    style ORG fill:#f8d7da,stroke:#dc3545,color:#000
    style START fill:#fff3cd,stroke:#ffc107,color:#000
```

### Mutual Exclusivity Rules (enforced in `TaskAssignmentService`)

| Field | Personal | Crew | Org |
|---|:---:|:---:|:---:|
| `organization_id` | `NULL` | `NULL` | `NOT NULL` |
| `team_id` | `NULL` | `NULL` | optional |
| `crew_id` | `NULL` | `NOT NULL` | `NULL` |
| `is_personal` | `true` | `false` | `false` |
| `assignee` | `= creator` | `NULL` (unclaimed) | `≠ creator` |
| `initial_status` | `TODO` | `TODO` | `ASSIGNED` |

> [!IMPORTANT]
> These three modes are **mutually exclusive at the entity level**. A task belongs to exactly one mode. The `TaskAssignmentService` enforces this by nullifying cross-mode fields (e.g., crew task always sets `org=NULL`, `team=NULL`).

---

## 2. Task State Machine — Personal Mode

```mermaid
stateDiagram-v2
    direction LR

    [*] --> TODO : POST /api/tasks/personal
    TODO --> COMPLETED : POST /{taskId}/complete
    COMPLETED --> [*]

    note right of TODO
        creator = assignee = user
        No review pipeline
        No dependencies checked
    end note
```

**Rules**:
- Only the creator can complete
- No submit/approve/reject flow
- `COMPLETED` is terminal

---

## 3. Task State Machine — Crew Mode

```mermaid
stateDiagram-v2
    direction LR

    [*] --> TODO : POST /api/crews/{crewId}/tasks
    TODO --> ASSIGNED : POST /{taskId}/claim
    TODO --> COMPLETED : POST /{taskId}/complete-crew
    ASSIGNED --> COMPLETED : POST /{taskId}/complete-crew
    COMPLETED --> [*]

    note right of TODO
        assignee = NULL (unclaimed)
        Any crew member can claim
        First-taker wins (@Version lock)
    end note

    note right of ASSIGNED
        assignee = claimer
        Any crew member can complete
    end note

    note left of COMPLETED
        If completing from TODO,
        assignee auto-set to completer
        (implicit claim + complete)
    end note
```

**Rules**:
- **No review pipeline** — `submitTask()`, `approveTask()`, `rejectTask()` all block crew tasks
- Any crew member can claim or complete (flat structure, no hierarchy)
- Self-assign is allowed (unlike org mode)
- Creator CAN also complete their own task
- Dependencies are **creator-locked** (`canEditDependency` → creator + org admin/director only)

---

## 4. Task State Machine — Org Mode (Review Pipeline)

```mermaid
stateDiagram-v2
    direction LR

    [*] --> ASSIGNED : POST /api/tasks/assign

    ASSIGNED --> SUBMITTED : POST /{taskId}/submit (assignee)
    ASSIGNED --> ASSIGNED : PUT /{taskId}/reassign

    SUBMITTED --> APPROVED : POST /{taskId}/approve (reviewer)
    SUBMITTED --> REJECTED : POST /{taskId}/reject (reviewer + reason)
    SUBMITTED --> ASSIGNED : POST /{taskId}/recall (assignee)

    REJECTED --> SUBMITTED : POST /{taskId}/submit (re-submit)
    REJECTED --> ASSIGNED : PUT /{taskId}/reassign

    APPROVED --> [*]

    note right of ASSIGNED
        creator ≠ assignee (no self-assign)
        Dependencies checked before submit
    end note

    note right of SUBMITTED
        Assignee can recall (pull back)
        Reviewer = anyone with REVIEW perm
        EXCEPT the assignee
    end note

    note right of REJECTED
        rejection_reason NOT NULL
        (enforced: DTO @NotBlank + DB CHECK)
        Assignee can re-submit or
        manager can reassign
    end note
```

**Review Permission Rules**:

| Actor | Can Review? | Enforced By |
|---|:---:|---|
| **Assignor (creator)** | ✅ Yes | `EmployeeStrategy.canReview()` — no creator block |
| **Assignee** | ❌ No | `EmployeeStrategy.canReview()` — assignee blocked |
| **Org Manager+** | ✅ Yes | Must be same org as task |
| **Super Admin** | ❌ No | Privacy boundary — can't review org tasks |

---

## 5. Dependency Edit Permissions

```mermaid
flowchart LR
    DEP["DEPENDENCY_EDIT"] --> EVAL["CustomPermissionEvaluator"]
    EVAL --> CED["canEditDependency()"]

    CED --> CR{"Is creator?"}
    CR -->|"YES"| ALLOW["✅ ALLOWED"]

    CR -->|"NO"| CREW{"Is crew task?"}
    CREW -->|"YES"| DENY["❌ BLOCKED"]

    CREW -->|"NO"| ADMIN{"Is org Admin/Director?"}
    ADMIN -->|"YES"| ALLOW
    ADMIN -->|"NO"| DENY

    style ALLOW fill:#d4edda,stroke:#28a745,color:#000
    style DENY fill:#f8d7da,stroke:#dc3545,color:#000
```

> [!CAUTION]
> The **assignee** cannot edit dependencies. This is intentional — dependencies are "assignor-locked" per spec.

---

## 6. API Endpoint → State Transition Map

| Endpoint | Modes | From Status | To Status |
|---|---|---|---|
| `POST /api/tasks/personal` | Personal | — | `TODO` |
| `POST /api/crews/{crewId}/tasks` | Crew | — | `TODO` |
| `POST /api/tasks/assign` | Org | — | `ASSIGNED` |
| `POST /{id}/complete` | Personal | `TODO` | `COMPLETED` |
| `POST /{id}/claim` | Crew | `TODO` | `ASSIGNED` |
| `POST /{id}/complete-crew` | Crew | `TODO` or `ASSIGNED` | `COMPLETED` |
| `POST /{id}/submit` | Org | `ASSIGNED` or `REJECTED` | `SUBMITTED` |
| `POST /{id}/approve` | Org | `SUBMITTED` | `APPROVED` |
| `POST /{id}/reject` | Org | `SUBMITTED` | `REJECTED` |
| `POST /{id}/recall` | Org | `SUBMITTED` | `ASSIGNED` |
| `PUT /{id}/reassign` | Org | `ASSIGNED` or `REJECTED` | `ASSIGNED` |
