# 🛡️ GuardForce - Security Management System

A comprehensive **monorepo** containing both **mobile (React Native)** and **web (React)** applications for security management, built with **TypeScript**, **Supabase**, and **shared services**.

---

## 🏗️ **Project Structure**

```
📁 guard-services-monorepo/
├── 📱 packages/mobile/          # React Native Mobile App
├── 🌐 packages/web/            # React Web Dashboard  
├── 📦 packages/shared/         # Shared Services & Types
├── 🖥️ App.tsx                  # Original Single-File App (Legacy)
├── 🎨 components/              # Original Components (Legacy)
├── 📊 supabase/                # Backend Edge Functions
└── 📋 package.json             # Monorepo Workspace Config
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 9+
- Expo CLI for mobile development
- Supabase account (optional, has fallback mock data)

### **Installation & Setup**
```bash
# 1. Install all dependencies
npm install

# 2. Start both applications simultaneously
npm run dev

# Or start individually:
npm run dev:web      # Start web app (http://localhost:5173)
npm run dev:mobile   # Start mobile app (Expo)
```

### **Build for Production**
```bash
npm run build:web     # Build web app
npm run build:mobile  # Build mobile app
```

---

## 📱 **Mobile App** (`/packages/mobile/`)

**React Native + Expo** application optimized for security guards in the field.

### **Features**
- ✅ **Native GPS Tracking** with real-time location sharing
- ✅ **QR Code Checkpoint Scanning** with camera access
- ✅ **Incident Reporting** with photo/video upload
- ✅ **Push Notifications** for emergency alerts
- ✅ **Offline Mode** with data sync when reconnected
- ✅ **Biometric Authentication** (Face ID/Fingerprint)
- ✅ **Emergency Panic Button** with location broadcast
- ✅ **One-handed Operation** optimized UI

### **Screens**
- `LoginScreen` - Authentication with biometric support
- `DashboardScreen` - Guard overview and quick actions
- `GPSTrackingScreen` - Real-time location sharing
- `IncidentsScreen` - Report and view incidents
- `CheckpointsScreen` - QR scanning and patrol routes
- `ProfileScreen` - User settings and preferences

### **Technologies**
- **React Native** + **Expo** for cross-platform development
- **Expo Location** for GPS tracking
- **Expo Camera** + **Expo Barcode Scanner** for QR codes
- **React Navigation** for screen management
- **TypeScript** for type safety

---

## 🌐 **Web App** (`/packages/web/`)

**React + Vite** dashboard for administrators, supervisors, and HR management.

### **Features**
- ✅ **Role-Based Dashboard** (Admin/Supervisor/HR/Guard views)
- ✅ **Real-time GPS Monitoring** with live maps
- ✅ **Comprehensive Analytics** with charts and reports
- ✅ **User Management** with role assignment
- ✅ **Incident Management** with detailed tracking
- ✅ **HR Management** with payroll and scheduling
- ✅ **Dark/Light Theme** with system preference detection
- ✅ **Responsive Design** (tablet to desktop)

### **Pages**
- `LoginPage` - Web authentication with demo accounts
- `DashboardPage` - Overview with KPIs and charts
- `IncidentsPage` - Incident management and tracking
- `GPSTrackingPage` - Live location monitoring
- `AnalyticsPage` - Performance metrics and reports
- `UserManagementPage` - User accounts and permissions
- `HRPage` - HR management (coming soon)
- `SettingsPage` - System settings (coming soon)

### **Technologies**
- **React** + **Vite** for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Recharts** for data visualization
- **React Router** for navigation

---

## 📦 **Shared Package** (`/packages/shared/`)

**Common services and types** used by both mobile and web applications.

### **Services**
- `authService` - Authentication management
- `gpsService` - Location tracking and geofencing
- `incidentService` - Incident reporting and management
- `apiClient` - Centralized API communication

### **Types**
- `User` - User profiles and roles
- `Incident` - Incident reports and status
- `LocationData` - GPS coordinates and tracking
- `CheckpointScan` - Patrol checkpoint data

### **Utilities**
- `permissions` - Role-based access control
- `constants` - Shared configuration values

---

## 🗄️ **Backend** (`/supabase/`)

**Supabase Edge Functions** providing serverless backend services.

### **Features**
- ✅ **Authentication** - User registration and login
- ✅ **Real-time Database** - Live data synchronization
- ✅ **File Storage** - Photo/video uploads
- ✅ **Edge Functions** - Custom API endpoints
- ✅ **Row Level Security** - Data access control

### **Database Tables**
- `users` - User profiles and authentication
- `incidents` - Incident reports and tracking
- `locations` - GPS location history
- `checkpoints` - Patrol checkpoint definitions
- `checkpoint_scans` - Checkpoint scan records

---

## 👥 **User Roles & Permissions**

### **🛡️ Guard**
- View assigned patrol routes
- Scan checkpoints and submit reports
- Report incidents with photos
- Share real-time location
- Emergency panic button access

### **👨‍💼 Supervisor**
- Monitor guard activities
- Assign patrol routes
- Review incident reports
- Access live GPS tracking
- Approve/reject reports

### **👥 HR Manager**
- Employee management
- Payroll and scheduling
- Training compliance tracking
- Performance reviews
- Leave management

### **⚙️ Administrator**
- Full system access
- User management
- System configuration
- Analytics and reporting
- Security settings

---

## 🔧 **Environment Setup**

### **Required Environment Variables**
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
TWILIO_API_KEY=your_twilio_key (for SMS)
```

### **Demo Accounts**
- **Admin**: `admin@company.com` / `password123`
- **HR**: `hr@company.com` / `password123`
- **Supervisor**: `supervisor@company.com` / `password123`
- **Guard**: `guard@company.com` / `password123`

---

## 📊 **Key Features Comparison**

| Feature | Mobile App | Web Dashboard |
|---------|------------|---------------|
| GPS Tracking | ✅ Real-time sharing | ✅ Live monitoring |
| Incident Reporting | ✅ Field reporting | ✅ Management view |
| Checkpoint Scanning | ✅ QR code scanner | ✅ Route management |
| User Management | ❌ | ✅ Full CRUD |
| Analytics | ❌ | ✅ Comprehensive |
| Offline Mode | ✅ Full support | ❌ |
| Push Notifications | ✅ Native alerts | ✅ Browser notifications |
| Camera Access | ✅ Photo/Video | ❌ |
| Panic Button | ✅ Hardware button | ❌ |

---

## 🛠️ **Development Scripts**

```bash
# Development
npm run dev              # Start both apps
npm run dev:web          # Start web app only
npm run dev:mobile       # Start mobile app only

# Building
npm run build            # Build web app
npm run build:web        # Build web app
npm run build:mobile     # Build mobile app

# Quality
npm run lint             # Lint all packages
npm run type-check       # TypeScript checking
npm run test             # Run tests (when implemented)

# Utilities
npm run clean            # Clean build artifacts
npm run setup            # Initial setup
```

---

## 🚀 **Deployment**

### **Web App**
- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag-and-drop build folder
- **AWS S3**: Static hosting with CloudFront

### **Mobile App**
- **Expo EAS**: `npx eas build` and `npx eas submit`
- **App Store**: iOS deployment
- **Google Play**: Android deployment

### **Backend**
- **Supabase**: Managed hosting
- **Self-hosted**: Docker deployment available

---

## 🔄 **Migration from Legacy**

If you're currently using the single-file `App.tsx`, here's how to migrate:

1. **Backup your current setup**
2. **Use the monorepo structure** for better scalability
3. **Import your existing components** into the appropriate packages
4. **Update imports** to use shared services
5. **Test both mobile and web** applications

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 **Support**

- 📧 **Email**: support@guardforce.com
- 📖 **Documentation**: [docs.guardforce.com](https://docs.guardforce.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/company/guard-services/issues)
- 💬 **Discord**: [Community Server](https://discord.gg/guardforce)

---

## 🏆 **Credits**

Built with ❤️ by the GuardForce team using:
- [React](https://reactjs.org/) & [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Expo](https://expo.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**📱 Ready to secure your operations? Get started with GuardForce today!** 🛡️