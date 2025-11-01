# Design Document

## Overview

The Code Snippet Manager is a single-page application (SPA) built with React.js that provides a modern, responsive interface for managing code snippets. The application uses Firebase as a Backend-as-a-Service (BaaS) for authentication, real-time database operations, and cloud storage. Tailwind CSS provides utility-first styling for a clean, responsive UI.

### Technology Stack

- **Frontend Framework**: React.js 18+ with functional components and hooks
- **State Management**: React Context API with useReducer for global state
- **Backend Services**: Firebase (Authentication, Firestore, Cloud Functions)
- **Styling**: Tailwind CSS 3+ with custom configuration
- **Syntax Highlighting**: Prism.js or Highlight.js
- **Language Detection**: highlight.js auto-detection
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router v6 for client-side navigation

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI Layer   │  │  State Mgmt  │  │   Services   │  │
│  │ (Components) │◄─┤   (Context)  │◄─┤   (Firebase) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Firebase Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │  Firestore   │  │Cloud Functions│ │
│  │              │  │   Database   │  │               │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

The application follows a modular component structure:

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── MainLayout.jsx
│   ├── snippets/
│   │   ├── SnippetList.jsx
│   │   ├── SnippetCard.jsx
│   │   ├── SnippetDetail.jsx
│   │   ├── SnippetEditor.jsx
│   │   └── CodeDisplay.jsx
│   ├── search/
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   └── SearchResults.jsx
│   ├── collections/
│   │   ├── CollectionTree.jsx
│   │   ├── CollectionItem.jsx
│   │   └── CollectionManager.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── AuthGuard.jsx
│   └── shared/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
├── contexts/
│   ├── AuthContext.jsx
│   ├── SnippetContext.jsx
│   └── UIContext.jsx
├── services/
│   ├── firebase.js
│   ├── authService.js
│   ├── snippetService.js
│   └── searchService.js
├── hooks/
│   ├── useSnippets.js
│   ├── useSearch.js
│   ├── useKeyboard.js
│   └── useClipboard.js
├── utils/
│   ├── languageDetector.js
│   ├── syntaxHighlighter.js
│   ├── validators.js
│   └── exportImport.js
└── App.jsx
```

## Components and Interfaces

### Core Components

#### 1. SnippetEditor Component

Handles creation and editing of snippets with real-time preview.

**Props:**

```typescript
interface SnippetEditorProps {
  snippet?: Snippet;
  onSave: (snippet: Snippet) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
}
```

**Features:**

- Code textarea with tab support
- Language selector dropdown
- Metadata input fields (title, description, tags)
- Real-time syntax highlighting preview
- Auto-save draft functionality

#### 2. SnippetList Component

Displays snippets in a virtualized list for performance.

**Props:**

```typescript
interface SnippetListProps {
  snippets: Snippet[];
  onSelect: (snippetId: string) => void;
  selectedId?: string;
  viewMode: "grid" | "list";
}
```

**Features:**

- Virtual scrolling for large collections
- Grid and list view modes
- Quick action buttons (copy, edit, delete)
- Lazy loading of snippet content

#### 3. SearchBar Component

Provides search input with autocomplete and filters.

**Props:**

```typescript
interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}
```

**Features:**

- Debounced search input
- Filter dropdown for language, tags, date
- Keyboard shortcut activation (Ctrl/Cmd + K)
- Recent searches history

#### 4. CollectionTree Component

Hierarchical navigation for snippet collections.

**Props:**

```typescript
interface CollectionTreeProps {
  collections: Collection[];
  onSelect: (collectionId: string) => void;
  onCreateCollection: (parentId: string, name: string) => void;
  selectedId?: string;
}
```

**Features:**

- Expandable/collapsible tree structure
- Drag-and-drop snippet organization
- Context menu for collection operations
- Nested collection support (up to 5 levels)

### Service Layer

#### Firebase Service

Initializes and configures Firebase services.

```javascript
// services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

#### Snippet Service

Handles all snippet CRUD operations.

```javascript
// services/snippetService.js
class SnippetService {
  async createSnippet(userId, snippetData);
  async updateSnippet(snippetId, updates);
  async deleteSnippet(snippetId);
  async getSnippet(snippetId);
  async getUserSnippets(userId, options);
  async searchSnippets(userId, query, filters);
  async shareSnippet(snippetId, userIds, permissions);
}
```

#### Auth Service

Manages user authentication and session.

```javascript
// services/authService.js
class AuthService {
  async signUp(email, password);
  async signIn(email, password);
  async signInWithGoogle();
  async signOut();
  async resetPassword(email);
  onAuthStateChanged(callback);
}
```

## Data Models

### Firestore Collections Structure

#### Users Collection

```
users/{userId}
  - email: string
  - displayName: string
  - photoURL: string
  - createdAt: timestamp
  - preferences: {
      theme: string
      defaultLanguage: string
      keyboardShortcuts: object
    }
```

#### Snippets Collection

```
snippets/{snippetId}
  - userId: string (owner)
  - title: string
  - description: string
  - code: string
  - language: string
  - tags: array<string>
  - collectionId: string (reference)
  - metadata: {
      usageNotes: string
      dependencies: string
      author: string
    }
  - sharing: {
      isShared: boolean
      sharedWith: array<{userId: string, permission: string}>
    }
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastEditedBy: string
```

#### Collections Collection

```
collections/{collectionId}
  - userId: string (owner)
  - name: string
  - parentId: string | null
  - path: array<string> (for hierarchy)
  - isTeamCollection: boolean
  - teamMembers: array<string>
  - createdAt: timestamp
  - order: number
```

#### Tags Collection (for autocomplete)

```
tags/{tagId}
  - name: string
  - userId: string
  - usageCount: number
  - lastUsed: timestamp
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Snippets access control
    match /snippets/{snippetId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.auth.uid in resource.data.sharing.sharedWith
      );
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Collections access control
    match /collections/{collectionId} {
      allow read, write: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        request.auth.uid in resource.data.teamMembers
      );
    }

    // Tags are user-specific
    match /tags/{tagId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### TypeScript Interfaces

```typescript
interface Snippet {
  id: string;
  userId: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  collectionId: string | null;
  metadata: {
    usageNotes: string;
    dependencies: string;
    author: string;
  };
  sharing: {
    isShared: boolean;
    sharedWith: Array<{
      userId: string;
      permission: "read" | "write";
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy: string;
}

interface Collection {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  path: string[];
  isTeamCollection: boolean;
  teamMembers: string[];
  createdAt: Date;
  order: number;
}

interface SearchFilters {
  languages: string[];
  tags: string[];
  collections: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: "light" | "dark";
  defaultLanguage: string;
  keyboardShortcuts: Record<string, string>;
}
```

## Error Handling

### Error Categories

1. **Authentication Errors**

   - Invalid credentials
   - Session expired
   - Network connectivity issues

2. **Database Errors**

   - Permission denied
   - Document not found
   - Write conflicts

3. **Validation Errors**
   - Invalid input format
   - Missing required fields
   - Character limit exceeded

### Error Handling Strategy

```javascript
// utils/errorHandler.js
class ErrorHandler {
  static handle(error, context) {
    const errorType = this.categorizeError(error);

    switch (errorType) {
      case "AUTH_ERROR":
        return this.handleAuthError(error);
      case "PERMISSION_ERROR":
        return this.handlePermissionError(error);
      case "NETWORK_ERROR":
        return this.handleNetworkError(error);
      case "VALIDATION_ERROR":
        return this.handleValidationError(error);
      default:
        return this.handleUnknownError(error);
    }
  }

  static showToast(message, type) {
    // Display user-friendly error message
  }
}
```

### User Feedback

- Display toast notifications for errors
- Provide retry mechanisms for network failures
- Show inline validation errors in forms
- Log errors to console in development mode
- Implement error boundaries for React components

## Testing Strategy

### Unit Testing

**Tools**: Vitest, React Testing Library

**Coverage Areas:**

- Utility functions (language detection, validators, export/import)
- Custom hooks (useSnippets, useSearch, useClipboard)
- Service layer functions (snippetService, authService)

**Example Test:**

```javascript
describe("languageDetector", () => {
  it("should detect JavaScript code correctly", () => {
    const code = "const x = 10;";
    expect(detectLanguage(code)).toBe("javascript");
  });
});
```

### Integration Testing

**Tools**: Vitest, Firebase Emulator Suite

**Coverage Areas:**

- Firebase authentication flow
- Firestore CRUD operations
- Search and filter functionality
- Import/export operations

**Example Test:**

```javascript
describe("SnippetService", () => {
  it("should create and retrieve a snippet", async () => {
    const snippet = await snippetService.createSnippet(userId, snippetData);
    const retrieved = await snippetService.getSnippet(snippet.id);
    expect(retrieved.title).toBe(snippetData.title);
  });
});
```

### Component Testing

**Tools**: Vitest, React Testing Library

**Coverage Areas:**

- Component rendering with different props
- User interactions (clicks, keyboard input)
- State updates and side effects
- Accessibility compliance

**Example Test:**

```javascript
describe("SnippetEditor", () => {
  it("should call onSave with correct data when save button is clicked", async () => {
    const onSave = vi.fn();
    render(<SnippetEditor onSave={onSave} mode="create" />);

    await userEvent.type(screen.getByLabelText("Title"), "Test Snippet");
    await userEvent.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Snippet",
      })
    );
  });
});
```

### End-to-End Testing

**Tools**: Playwright or Cypress

**Coverage Areas:**

- Complete user workflows (signup → create snippet → search → share)
- Cross-browser compatibility
- Responsive design on different screen sizes
- Performance benchmarks

### Performance Testing

**Metrics to Monitor:**

- Initial page load time (target: < 2 seconds)
- Time to interactive (target: < 3 seconds)
- Search response time (target: < 1 second)
- Firestore read/write latency

**Tools:**

- Lighthouse for performance audits
- React DevTools Profiler for component performance
- Firebase Performance Monitoring

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                      Header                              │
│  [Logo] [Search Bar............] [User Menu]            │
├──────────────┬──────────────────────────────────────────┤
│              │                                           │
│   Sidebar    │          Main Content Area               │
│              │                                           │
│ Collections  │  ┌─────────────────────────────────┐    │
│ - Personal   │  │                                 │    │
│   - Work     │  │     Snippet List / Detail       │    │
│   - Utils    │  │                                 │    │
│ - Shared     │  │                                 │    │
│              │  └─────────────────────────────────┘    │
│ [+ New]      │                                           │
│              │                                           │
└──────────────┴──────────────────────────────────────────┘
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          700: "#1d4ed8",
        },
        code: {
          bg: "#1e1e1e",
          text: "#d4d4d4",
        },
      },
      fontFamily: {
        mono: ["Fira Code", "Consolas", "Monaco", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

### Responsive Breakpoints

- **Mobile**: < 768px (single column, hamburger menu)
- **Tablet**: 768px - 1024px (collapsible sidebar)
- **Desktop**: > 1024px (full layout with sidebar)

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Open search
- `Ctrl/Cmd + N`: New snippet
- `Ctrl/Cmd + S`: Save current snippet
- `Ctrl/Cmd + C`: Copy snippet code
- `Ctrl/Cmd + /`: Show keyboard shortcuts help
- `Arrow Keys`: Navigate snippet list
- `Esc`: Close modals/dialogs

## Performance Optimizations

### Frontend Optimizations

1. **Code Splitting**: Lazy load routes and heavy components
2. **Virtual Scrolling**: Use react-window for large snippet lists
3. **Memoization**: Use React.memo and useMemo for expensive computations
4. **Debouncing**: Debounce search input (300ms delay)
5. **Image Optimization**: Use WebP format for user avatars
6. **Bundle Size**: Tree-shake unused code, analyze with webpack-bundle-analyzer

### Backend Optimizations

1. **Firestore Indexing**: Create composite indexes for common queries
2. **Pagination**: Implement cursor-based pagination (25 items per page)
3. **Caching**: Cache frequently accessed snippets in localStorage
4. **Batch Operations**: Use Firestore batch writes for bulk operations
5. **Query Optimization**: Limit query results, use where clauses efficiently

### Caching Strategy

```javascript
// Local storage cache for snippets
const CACHE_KEY = "snippets_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CacheService {
  static set(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_KEY}_${key}`, JSON.stringify(cacheData));
  }

  static get(key) {
    const cached = localStorage.getItem(`${CACHE_KEY}_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      this.remove(key);
      return null;
    }

    return data;
  }

  static remove(key) {
    localStorage.removeItem(`${CACHE_KEY}_${key}`);
  }
}
```

## Security Considerations

### Authentication Security

- Use Firebase Authentication with secure token management
- Implement password strength requirements (min 8 characters, mixed case, numbers)
- Enable email verification for new accounts
- Implement rate limiting for login attempts
- Use HTTPS only for all communications

### Data Security

- Enforce Firestore security rules for all operations
- Sanitize user input to prevent XSS attacks
- Validate all data on both client and server side
- Encrypt sensitive data before storage
- Implement proper CORS configuration

### Privacy

- Store minimal user data
- Provide data export functionality
- Implement account deletion with data cleanup
- Display privacy policy and terms of service
- Comply with GDPR requirements for EU users

## Deployment Strategy

### Build Process

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Hosting Options

**Recommended**: Firebase Hosting

Benefits:

- Integrated with Firebase services
- Global CDN
- Automatic SSL certificates
- Easy deployment with Firebase CLI

**Deployment Steps:**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Deploy to production
firebase deploy --only hosting
```

### Environment Variables

```env
# .env.production
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### CI/CD Pipeline

Use GitHub Actions for automated deployment:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: your-project-id
```

## Future Enhancements

### Phase 2 Features

1. **VS Code Extension**: Direct integration with VS Code
2. **AI-Powered Suggestions**: Recommend similar snippets
3. **Version History**: Track snippet changes over time
4. **Code Execution**: Run snippets in sandboxed environment
5. **Markdown Support**: Rich text descriptions with code blocks
6. **Dark/Light Theme Toggle**: User preference for UI theme
7. **Advanced Analytics**: Usage statistics and insights
8. **Mobile App**: Native iOS/Android applications
9. **Browser Extension**: Quick snippet access from any webpage
10. **API Access**: RESTful API for third-party integrations

### Scalability Considerations

- Implement Cloud Functions for complex operations
- Use Firestore subcollections for better data organization
- Consider migrating to Cloud SQL for advanced querying needs
- Implement full-text search with Algolia or Elasticsearch
- Add CDN caching for static assets
- Monitor and optimize Firestore costs as user base grows
