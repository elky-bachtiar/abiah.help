# Abiah.help AI - Frontend Features Specification (MVP)

**Version**: 1.0.1  
**Last Updated**: June 19, 2025  
**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Tavus CVI  
**Status**: Production MVP

---

### Feature Parity Matrix

| Feature                    | Web | PWA | Mobile App |
|----------------------------|-----|-----|------------|
| Video Consultation         | Yes | Yes | Yes        |
| Document Editing           | Yes | Yes | Yes        |
| Collaborative Editing      | Yes | Yes | Yes        |
| Push Notifications         | No  | Yes | Yes        |
| Offline Mode               | Partial | Yes | Yes     |
| Real-time Sync             | Yes | Yes | Yes        |

All core features are available on Web, PWA, and Mobile App unless otherwise noted. Some mobile-specific enhancements (e.g., native push notifications, offline mode) may have limited or alternative implementations in the PWA.

---

---

## 🚀 MVP Core Platform Features

### 1. Authentication & User Management
- **User Registration/Login** with email and password
- **Social Authentication** (Google, LinkedIn)
- **Password Reset** and email verification
- **User Profile Management** with avatar upload
- **Session Management** with secure token handling

### 2. Hero Section & Landing Page
- **Personalized Welcome Video** using Tavus API integration
  - https://tavus.video/e990cb0d94
  ```
  curl --request GET \
  --url https://tavusapi.com/v2/videos/e990cb0d94 \
  --header 'x-api-key: <api-key>'
  ```
  - Automatic greeting using user's first name when authenticated
  - Generic welcome greeting for non-authenticated visitors
  - **BEFORE THE VIDEO START**: Add Abiah Webm on top of the video:
    -- https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f/67b5222642c2133d9163ce80_newmike-transcode.webm
    EXAMPLE:
    ```
<div data-poster-url="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-poster-00001.jpg" data-video-urls="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.mp4,https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.webm" data-autoplay="true" data-loop="true" data-wf-ignore="true" class="demo-modal_lightbox-vid w-background-video w-background-video-atom"><video id="f333c155-c0a3-61de-70a0-f0bba5753842-video" autoplay="" loop="" style="background-image:url(&quot;https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-poster-00001.jpg&quot;)" muted="" playsinline="" data-wf-ignore="true" data-object-fit="cover"><source src="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.mp4" data-wf-ignore="true"><source src="https://cdn.prod.website-files.com/63b2f566abde4cad39ba419f%2F67b5222642c2133d9163ce80_newmike-transcode.webm" data-wf-ignore="true"></video></div>
```
- **CTA Button Below Hero Text** for starting video consultation
- **Feature Showcase Grid** highlighting platform capabilities
- **Responsive Design** optimized for all devices
- **Loading States** with smooth animations and transitions

### AI Video Consultations (Tavus Integration)

> **Frontend features interact with a unified AI orchestration API and do not depend on or assume any specific underlying model (OpenAI, Claude, etc.). Model selection and orchestration are handled entirely on the backend.**
- **Tavus CVI Integration** with Daily.co WebRTC
- **Essential Consultation Screens**:
  - Intro Loading screen with animated progress indicator
  - Introduction screen with persona preview
  - Settings for basic context customization
  - Active conversation with real-time interaction
  - Final summary screen with next steps
  - Error handling screen
- **Real-time Video/Audio Controls**:
  - Camera toggle (on/off)
  - Microphone mute/unmute
  - Session timer with countdown

### Collaborative Document Editing & Sharing
- Real-time collaborative editing with cursor sharing and presence indicators
- Comprehensive versioning system with comparison and restore features
- Granular permission controls and sharing options
- Powered by the Yjs CRDT library for real-time, conflict-free editing
- Synchronization handled via WebSockets, as described in the Technical Architecture Plan
- Detailed data models and API specification for collaboration features
  - Create Conversation Endpoint (`POST https://api.tavus.io/v2/conversations`)
  - End Conversation Endpoint (`POST https://api.tavus.io/v2/conversations/{id}/end`)
  - Proxy implementation via Supabase Edge Functions

### 4. Document Generation (Simplified MVP)
- **AI-Powered Document Creation**:
  - Business Plan generator (basic version)
  - Pitch Deck template
  - Executive Summary creator
- **Export Options**:
  - PDF download
  - Document sharing via link

### 5. Dashboard & Analytics (Simplified MVP)
- **User Dashboard**:
  - Recent activity feed
  - Quick action buttons
  - Document history
  - Consultation records
- **Usage Statistics**:
  - Minutes used in video consultations
  - Documents created
  - Session history

### 6. Onboarding
- The onboarding flow includes a persona selection/customization screen, allowing users to choose or personalize their AI mentor experience. This is reflected in both the UI/UX design and technical implementation plans.
- **Simple Onboarding Flow**:
  - Welcome video tutorial
  - Quick profile setup
  - Feature introduction tooltips

---

## 🎨 UI/UX Features

### Design System
- **Shadcn/ui Components** for consistent design
- **Tailwind CSS** for responsive styling
- **Framer Motion** for essential animations
- **Lucide React** for iconography
- **Custom Color Palette** with brand colors

### Responsive Design
- **Mobile-First Approach** with breakpoints
- **Desktop Experience** with enhanced features
- **Touch-Friendly Interface** for mobile devices

### Accessibility
- **WCAG 2.1 AA Compliance**
- **Screen Reader Support** for key elements
- **Keyboard Navigation**
- **Alternative Text** for images
- **Semantic HTML Structure**

---

## 🔧 Technical Features (MVP)

### State Management
- **Jotai Atomic State** for global state
- **React Query** for server state
- **Local Storage** for user preferences

### API Integration
- **Supabase Backend** for data management
- **Tavus API** for video consultations
  - **Create Conversation Endpoint** (`POST https://api.tavus.io/v2/conversations`)
    - Starts new AI mentor video conversations
    - Configurable with persona_id, greeting, context parameters
    - Used at the beginning of video consultations
  - **End Conversation Endpoint** (`POST https://api.tavus.io/v2/conversations/{id}/end`)
    - Properly terminates active conversations
  - **Get Video Endpoint** (`GET https://api.tavus.io/v2/videos/{id}`)
    - Retrieves video details for welcome message display
    - Used in hero section for personalized greeting
  - **Secure Proxy Implementation** using Supabase Edge Functions
    - Never exposes Tavus API keys in frontend code
    - Centralizes request/response handling

### Performance Optimizations
- **Code Splitting** for main application routes
- **Image Optimization** with responsive sizing
- **Lazy Loading** for below-the-fold content
- **Caching** for API responses and static assets

### Security (MVP Essentials)
- **Environment Variable Management** with clear frontend/backend separation
- **Tavus API Key Protection** via Supabase Edge Functions
- **HTTPS Enforcement** for all communications
- **Content Security Policy** for media embeds
- **XSS Protection** with proper input sanitization

### Testing and Quality
- **Unit Tests** for core components
- **Integration Tests** for main user flows
- **Accessibility Audits** with automated tools
- **Performance Monitoring** with web vitals tracking

---

## 📱 Progressive Web App Features (MVP)

### PWA Capabilities
- **Installable App Experience** on mobile and desktop
- **Offline Mode** for previously accessed documents
- **Push Notifications** for consultation reminders
- **Cache Strategy** for faster loading and offline access

### Mobile Optimizations
- **Touch-Optimized Controls** for video interface
- **Responsive Layouts** for all screen sizes
- **Adaptive Video Quality** based on network conditions
- **Device Camera/Microphone** optimized handling

---

## 🔄 Integration Points (MVP)

### Backend Services
- **Supabase Authentication** for user management
- **Supabase Database** for storing user data and documents
- **Supabase Edge Functions** for secure API proxying
- **Supabase Storage** for document assets

### External APIs
- **Tavus API** for AI video conversations
- **Daily.co API** for WebRTC video streaming
- **PDF Generation Service** for document export

---

## 🚢 Deployment Strategy

### Continuous Integration
- **GitHub Actions** for automated testing
- **Version Control** with feature branches

### Hosting
- **Vercel/Netlify** for frontend deployment
- **Supabase Cloud** for backend services

### Analytics
- **Basic Usage Metrics** via Plausible or Simple Analytics
- **Error Tracking** with Sentry
- **User Flow Analysis** with session recordings
