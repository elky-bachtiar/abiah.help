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
> **Custom LLM Integration**: Frontend supports enhanced Tavus integration with custom LLM personas for industry-specific mentorship.
> **Conversation Context**: Frontend displays conversation history and context awareness for personalized mentorship experiences.
- **Tavus CVI Integration** with Daily.co WebRTC and Custom LLM support
- **Context-Aware Consultations** with conversation history integration
- **Essential Consultation Screens**:
  - Intro Loading screen with animated progress indicator
  - Introduction screen with persona preview and custom LLM selection
  - Pre-conversation context display showing relevant conversation history
  - Settings for basic context customization and persona configuration
  - Active conversation with real-time interaction (powered by custom LLM)
  - Context indicators showing AI's awareness of previous conversations
  - Final summary screen with next steps and AI insights
  - Post-conversation insights and progress tracking
  - Error handling screen with custom LLM fallback options
- **Real-time Video/Audio Controls**:
  - Camera toggle (on/off)
  - Microphone mute/unmute
  - Session timer with countdown
  - Custom LLM persona indicator and switching
  - AI response quality feedback

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

### 4. Conversation History & Context Management
- **Conversation History Interface**:
  - Comprehensive conversation history with search and filtering
  - Session summaries with key topics and insights
  - Timeline view of user's mentorship journey
  - Progress tracking across multiple conversations
- **Context Display Components**:
  - Pre-conversation context summary
  - Real-time context indicators during consultations
  - AI awareness display ("I remember we discussed...")
  - Progress visualization and goal tracking
- **Insights Dashboard**:
  - Automatically generated conversation insights
  - Goal progress tracking and milestone celebrations
  - Conversation themes and pattern analysis
  - Personalized recommendations for next sessions
- **Context Management**:
  - User context profile editing and customization
  - Conversation export and data management
  - Privacy controls for conversation storage
  - Context sharing and collaboration features

### 5. Document Generation (Simplified MVP)
- **AI-Powered Document Creation**:
  - Business Plan generator (basic version)
  - Pitch Deck template
  - Executive Summary creator
- **Export Options**:
  - PDF download
  - Document sharing via link

### 6. Enhanced Dashboard & Analytics
- **Context-Aware Dashboard**:
  - Recent activity feed with conversation context
  - Quick action buttons for continuing previous conversations
  - Document history linked to conversation sessions
  - Consultation records with insights and progress tracking
- **Usage Statistics & Insights**:
  - Minutes used in video consultations
  - Documents created and their connection to conversations
  - Session history with conversation themes
  - Progress metrics and goal completion rates
  - AI relationship strength indicators

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
    - Enhanced with custom LLM URL configuration
    - Automatic persona-to-model mapping (GPT-4/Claude)
    - Used at the beginning of video consultations
  - **End Conversation Endpoint** (`POST https://api.tavus.io/v2/conversations/{id}/end`)
    - Properly terminates active conversations
  - **Get Video Endpoint** (`GET https://api.tavus.io/v2/videos/{id}`)
    - Retrieves video details for welcome message display
    - Used in hero section for personalized greeting
  - **Secure Proxy Implementation** using Supabase Edge Functions
    - Never exposes Tavus API keys in frontend code
    - Enhanced `/tavus-api-llm` endpoint for custom LLM support
    - Custom LLM configuration via headers
    - Centralizes request/response handling
    - Intelligent fallback to standard Tavus if custom LLM fails

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

---

## 📋 Implementation Plan - Business Plan Document Management

The Plan
1. User Authentication and Authorization
The system already has an authentication and user management system in place. For bachtiare@gmail.com, this user would need to be registered within the system. Access to documents and features will be tied to their authenticated session and associated permissions.

2. Document Storage and Generation
The system will generate business plan documents using its AI-powered engine. These generated documents will be stored securely, likely within Supabase Storage, with a logical structure that can be mapped to /users/{user_email}/documents/business-plan/ on the backend. The frontend will interact with API endpoints that abstract this storage location.

3. In-Browser Document Viewer
This involves enhancing the document display capabilities to provide a rich, interactive viewing experience.

Modify src/pages/Documents.tsx: This page will serve as the entry point for viewing generated documents. It should list the user's documents and allow selection for viewing.
Enhance src/components/documents/DocumentPreview.tsx: This component will be responsible for rendering the generated business plan documents directly in the browser.
It should parse the document content (which is likely JSON or Markdown from the AI generation) and render it into a readable HTML format.
Ensure clear readability with appropriate typography, spacing, and layout.
Implement clear organization and indexing of document sections, possibly by generating a table of contents or navigation sidebar based on the document's structure.
Update src/types/Documents.ts: Ensure the Document interface includes fields necessary for structured content and section metadata.
4. PDF Generation/Export Capability
This feature will allow users to download their generated business plans as PDFs.

Modify src/components/documents/ExportOptions.tsx: This component will contain the button for triggering PDF generation and download.
Refine src/utils/pdfGenerator.ts: This utility will take the rendered HTML content from the DocumentPreview component and convert it into a PDF. It should ensure that the PDF output maintains the clear readability and organization of the in-browser viewer.
Update src/api/documents.ts: Add an endpoint or modify an existing one to trigger the PDF generation process on the backend (if complex server-side rendering is required) or to handle the client-side PDF generation and download.
5. Progress Tracking Implementation
This is a new core feature that will track and visualize the user's progress through the business plan document.

Update Database Schema (Backend):
You'll need a mechanism to store which sections of a document a user has reviewed. This could be a new JSONB field within the documents table (e.g., progress_data JSONB) or a new table like document_progress that links user_id, document_id, and completed_sections. For an MVP, adding a progress_data field to the documents table is simpler.
The progress_data field would store an array of section IDs that have been marked as reviewed or completed by the user.
Modify src/components/documents/DocumentPreview.tsx:
Section Interaction: Implement a way for users to mark sections as "reviewed" or "complete." This could be a checkbox next to each section heading, or an automatic trigger when a user scrolls past a certain percentage of a section.
Progress Calculation: Based on the total number of sections in a document and the number of marked/reviewed sections, calculate the completion percentage.
Auto-Save Progress: Implement event listeners (e.g., on section completion, or on a timed interval) to automatically save the user's progress to the backend via an API call.
Create src/components/documents/ProgressBar.tsx: Develop a new reusable UI component to display a visual progress bar. This component will take the calculated completion percentage as a prop.
Integrate Progress Bar:
Add the ProgressBar.tsx component to the DocumentPreview.tsx component, typically at the top of the document viewer.
Consider adding it to the DocumentCard components in the dashboard (src/components/dashboard/DocumentHistory.tsx) to show progress at a glance.
Update src/api/documents.ts: Add an API endpoint (e.g., PATCH /api/documents/:id/progress) to update the progress_data for a specific document.
Update src/types/Documents.ts: Add the progress_data field to the Document interface and define its structure.
6. Document Access and Permissions
The existing authentication system will handle user login. Permissions for reading, tracking progress, and downloading will be enforced on the backend, with the frontend reflecting these rights.

Backend Authorization (Conceptual): Ensure your Supabase Row Level Security (RLS) policies or backend API logic restrict document access to the owner (user_id) and any explicitly shared collaborators.
Frontend Display: The frontend will simply attempt to fetch the document. If the user bachtiare@gmail.com is authenticated and has the correct user_id associated with the document, the document will load. If not, an error or "access denied" message will be displayed.
Feature Enablement: Buttons for PDF download and progress tracking will be enabled by default for the document owner. If sharing features are implemented later, these could be conditionally enabled based on shared permissions.
