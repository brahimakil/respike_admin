# Respike Admin Panel

A modern, responsive admin dashboard built with React, TypeScript, and Firebase.

## 🎨 Features

- ✅ **Modern UI/UX** - Clean, professional design with smooth animations
- 🔐 **Authentication** - Complete login/register flow with Firebase
- 🛡️ **Protected Routes** - Route guards prevent unauthorized access
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight** - Built with Vite for optimal performance
- 🎯 **Type-Safe** - Full TypeScript support
- 🔄 **State Management** - Zustand for simple, efficient state management

## 🏗️ Architecture

### Folder Structure

```
src/
├── components/           # Reusable components
│   ├── ProtectedRoute.tsx  # Route guard for authenticated users
│   └── PublicRoute.tsx     # Route guard for guests only
│
├── config/              # Configuration files
│   └── firebase.ts      # Firebase initialization
│
├── pages/               # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   └── Dashboard.tsx   # Main dashboard
│
├── services/            # API & business logic
│   ├── api.ts          # Axios instance with interceptors
│   └── auth.service.ts # Authentication service
│
├── store/               # State management
│   └── authStore.ts    # Authentication state (Zustand)
│
├── App.tsx             # Main app with routing
├── App.css            # Global styles
├── main.tsx           # Application entry
└── index.css          # Base CSS
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Copy the example file
cp .env.example .env
```

3. Configure your `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

See `ENV_SETUP.md` for detailed instructions.

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎯 Core Features

### Authentication Flow

1. **Registration**
   - User fills in email, password, and name
   - Firebase creates the account
   - User is automatically logged in
   - Redirected to dashboard

2. **Login**
   - User enters credentials
   - Firebase validates the user
   - Token is stored in local storage
   - Redirected to dashboard

3. **Protected Routes**
   - Dashboard requires authentication
   - Unauthorized users redirected to login
   - Auth state persists across sessions

4. **Auto-redirect**
   - Logged-in users can't access login/register
   - They're automatically redirected to dashboard

### Route Guards

#### ProtectedRoute
Wraps components that require authentication:
```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

#### PublicRoute
Wraps components that should only be accessible when logged out:
```tsx
<Route path="/login" element={
  <PublicRoute>
    <Login />
  </PublicRoute>
} />
```

### State Management

Using Zustand for lightweight, efficient state management:

```typescript
const { user, isAuthenticated, setUser, logout } = useAuthStore();
```

State persists to localStorage automatically.

## 🎨 Design System

### Color Palette

- **Primary**: #6366f1 (Indigo)
- **Secondary**: #8b5cf6 (Purple)
- **Success**: #10b981 (Green)
- **Danger**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)

### Components

All components follow a consistent design language:
- 12px border radius
- Smooth transitions (0.3s ease)
- Subtle shadows for depth
- Responsive breakpoints at 768px

## 📦 Dependencies

### Core
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing

### Firebase
- **firebase** - Authentication & database

### State & API
- **Zustand** - State management
- **Axios** - HTTP client

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
```

## 📱 Responsive Design

The admin panel is fully responsive:

### Desktop (> 768px)
- Full sidebar navigation
- Multi-column grid layouts
- Optimal spacing and typography

### Mobile (≤ 768px)
- Collapsible sidebar
- Single-column layouts
- Touch-friendly buttons
- Optimized spacing

## 🔒 Security

- Firebase Authentication for secure login
- JWT tokens for API requests
- Protected routes with route guards
- Automatic token refresh
- Secure environment variable handling

## 🎯 Best Practices

1. **File Organization**
   - Max 800 lines per file
   - Logical component separation
   - Clear naming conventions

2. **TypeScript**
   - Strict mode enabled
   - Proper type definitions
   - No `any` types where avoidable

3. **Performance**
   - Lazy loading for routes
   - Optimized bundle size
   - Efficient re-renders

4. **Accessibility**
   - Semantic HTML
   - Keyboard navigation
   - ARIA labels where needed

## 🔄 Future Enhancements

Planned features:
- [ ] User management
- [ ] Role-based access control
- [ ] Dark mode toggle
- [ ] Advanced analytics
- [ ] Real-time notifications
- [ ] Multi-language support

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

## 🤝 Contributing

1. Follow the established file structure
2. Keep components under 800 lines
3. Use TypeScript strictly
4. Follow the design system
5. Write clean, documented code

## 📄 License

This project is private and proprietary.
