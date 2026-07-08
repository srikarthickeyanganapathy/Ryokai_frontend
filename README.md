# Ryokai

Ryokai is an enterprise-grade task management system designed to help engineering teams ship features faster with comprehensive tracking, dependencies, and real-time collaboration.

## Features

- **Dynamic Kanban Board**: Seamless drag-and-drop task management built on `@dnd-kit`.
- **Advanced Task Modals**: Deep task inspection with dependencies, checklists, and activity history.
- **Global Command Palette**: Lightning-fast navigation and actions via `⌘K` or `Ctrl+K`.
- **Real-time Notifications**: Drawer-based notification system for mentions, approvals, and deadlines.
- **Comprehensive Permissions**: Role-based access control (Admin, Manager, Member).
- **Beautiful Glassmorphic UI**: Built with Tailwind CSS and Framer Motion, featuring an interactive `AuroraBackground`.
- **Theme Support**: First-class light, dark, and system theme integration.
- **Accessibility & Performance First**: Fully WCAG AA compliant with keyboard shortcuts, focus traps, ARIA attributes, and heavy component virtualization (`@tanstack/react-virtual`).

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS v4
- Framer Motion (Animations)
- Zustand (Local UI State)
- TanStack Query (Server State Management)
- React Router (Routing)
- Lucide React (Icons)
- React Hook Form + Zod (Validation)

**Backend (Not included in this repo):**
- Spring Boot (Java)
- Spring Security
- PostgreSQL

## Getting Started

### Prerequisites
- Node.js v18+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ryokai-frontend.git
cd ryokai-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Keyboard Shortcuts
- `⌘K` or `Ctrl+K`: Open Command Palette
- `C`: Open Command Palette (when not focusing an input)
- `/`: Open Command Palette
- `G` then `H`: Go to Home/Dashboard
- `G` then `B`: Go to Board
- `G` then `T`: Go to Team
- `Escape`: Close any open modal or drawer

## Performance Goals

- **Lighthouse Score:** 90+ across Performance, Accessibility, Best Practices, and SEO.
- **Optimized Rendering:** Critical components like `TaskCard` are memoized, and heavy lists are virtualized.
- **Lazy Loading:** All major routes and heavy modals are dynamically imported.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
