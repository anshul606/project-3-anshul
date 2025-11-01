# Code Snippet Manager

A web-based application built with React.js, Firebase, and Tailwind CSS that provides developers with a centralized, searchable, and well-organized repository for storing and managing code snippets.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Sidebar, MainLayout
│   ├── snippets/        # Snippet components
│   ├── search/          # Search and filter components
│   ├── collections/     # Collection management
│   ├── auth/            # Authentication components
│   └── shared/          # Reusable UI components
├── contexts/            # React Context providers
├── services/            # Firebase and API services
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── test/                # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Add your Firebase configuration to `.env`

### Firebase Setup

This application uses Firebase for authentication and database. Follow these steps to set up Firebase:

1. **Create a Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Firestore Database and Authentication

2. **Deploy Firestore Security Rules and Indexes**

   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Deploy security rules and indexes
   firebase deploy --only firestore:rules,firestore:indexes
   ```

3. **Configure Environment Variables**
   - Copy your Firebase config from Firebase Console
   - Update the `.env` file with your Firebase credentials

For detailed setup instructions, see [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)

### Firebase Emulator (Optional)

For local development and testing, you can use the Firebase Emulator:

```bash
# Start the Firebase Emulator
npm run emulator

# Or use Firebase CLI directly
firebase emulators:start
```

The emulator will run on:

- Firestore: http://localhost:8080
- Auth: http://localhost:9099
- Emulator UI: http://localhost:4000

To use the emulator in development, set `VITE_USE_FIREBASE_EMULATOR=true` in your `.env` file.

### Development

Start the development server:

```bash
npm run dev
```

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with UI:

```bash
npm run test:ui
```

## Database Structure

The application uses four main Firestore collections:

- **users**: User profiles and preferences
- **snippets**: Code snippets with metadata and sharing info
- **collections**: Hierarchical collections for organizing snippets
- **tags**: User-specific tags with usage statistics

For detailed database structure and security rules, see [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)

## Features (Planned)

- Store and organize code snippets
- Syntax highlighting for 20+ languages
- Search and filter by language, tags, and keywords
- Hierarchical collections and tagging system
- Team collaboration and sharing
- Import/export functionality
- Keyboard shortcuts
- Responsive design
