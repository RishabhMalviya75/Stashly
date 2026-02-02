# Stashly

A centralized platform for saving, organizing, and retrieving your digital resources - bookmarks, AI prompts, code snippets, documents, and notes.

## Features

- **Unified Resource Hub**: Single platform for all digital resource types
- **Context Preservation**: Personal annotations to remember why you saved something
- **Intelligent Organization**: Folder hierarchies with powerful search and filtering
- **Type-Specific Features**: Tailored functionality for each resource type
- **Quick Capture**: Minimal friction to save resources

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router v6
- React Hook Form
- Axios
- Lucide React (icons)

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Express Session with connect-mongo
- Bcrypt.js for password hashing
- Helmet, CORS, Rate Limiting for security

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/http-snehal/Stashly.git
cd Stashly
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:
```bash
# In server/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

5. Start the development servers:

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

6. Open http://localhost:3000 in your browser

## Project Structure

```
Stashly/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API functions
│   │   └── styles/         # Global CSS
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose schemas
│   └── routes/             # API routes
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

## Roadmap

- [x] Week 1: Project Setup & Authentication
- [x] Week 2: Core Resource Management (CRUD)
- [x] Week 3: UI Implementation (Sidebar, Forms)
- [x] Week 4: Search & Polish

## Upcoming Features

### 🚀 Team Collaboration & Resource Sharing (Notion-style)

A major upcoming feature set focused on enabling multi-user collaboration and shared resource management:

#### Shared Workspaces
- **Team Environments**: Create workspaces where multiple users can collaborate
- **Shared Resource Libraries**: Resources uploaded by one team member are accessible to all members
- **Workspace Invitations**: Invite users to join your workspace via email or link

#### Permissions & Access Control
- **Role-based Access**: Admin, Editor, Viewer roles for team members
- **Resource-level Permissions**: Control who can view, edit, or delete specific resources
- **Private vs Shared**: Toggle resources between personal and team-visible

#### Real-time Collaboration
- **Activity Feed**: See what team members have recently added or modified
- **Comments & Annotations**: Discuss resources with team members
- **Notifications**: Get notified when resources are shared with you

#### Team Management
- **Team Dashboard**: Overview of team activity and shared resources
- **Member Management**: Add/remove team members, assign roles
- **Usage Analytics**: Track team engagement with shared resources

> 💡 **Inspiration**: This feature set is inspired by Notion's collaborative workspace model, adapted for resource/bookmark management.

---

## License

MIT
