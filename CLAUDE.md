# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
npm run dev          # Start Vite dev server on http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** as the build tool for fast HMR
- **Jotai** for atomic state management (used by Tavus video components)
- **React Router v6** for client-side routing
- **TanStack Query** for server state and API calls
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **React Hook Form + Zod** for form validation

### Key Integrations

#### Tavus Video API
- Video consultations use Tavus CVI (Conversational Video Interface)
- API calls are proxied through Supabase Edge Functions for security
- Never expose TAVUS_API_KEY in frontend code
- Two main endpoints:
  - `POST /tavus-api` - Generic proxy for Tavus API calls
  - `POST /tavus-webhook` - Handles Tavus webhook events (transcription ready)
- Frontend uses `/api/createConversation.ts` and `/api/endConversation.ts`

#### Supabase Backend
- Authentication (email/password + OAuth)
- PostgreSQL database
- Edge Functions for serverless APIs
- Real-time subscriptions for live updates
- File storage for user uploads

#### Daily.co WebRTC
- Handles actual video/audio streaming
- Integrated with Tavus for video consultations
- Used in components under `/components/video/`

### State Management Patterns

#### Jotai Atoms (src/store/)
- `auth.ts` - Authentication state
- `conversation.ts` - Active video conversation state
- `videoStore.ts` - Video session management
- `settings.ts` - User preferences
- `tokens.ts` - API token management

Key pattern: Atoms are used for global state that needs to be accessed across multiple components.

#### Component-Level State
- Use `useState` for local UI state
- Use React Query for server data
- Use React Hook Form for form state

### API Layer Structure

#### Frontend API Clients (src/api/)
All API calls go through these abstraction layers:
- `conversationApi.ts` - Conversation history and management
- `createConversation.ts` - Start new Tavus conversations
- `endConversation.ts` - End active conversations
- `documents.ts` - Document generation
- `profile.ts` - User profile management
- `stripe.ts` - Payment integration
- `team.ts` - Team management

#### Supabase Edge Functions (supabase/functions/)
- `tavus-api/` - Proxy for Tavus API calls
- `tavus-webhook/` - Handles Tavus webhook events
- `send-email/` - Email notifications
- `stripe-webhook/` - Stripe payment webhooks
- `custom-llm/` - Custom LLM integrations

### Video Consultation Flow

1. User initiates consultation from Dashboard
2. Frontend calls `createConversation` API
3. Edge Function proxies to Tavus API with secure credentials
4. Tavus returns conversation details
5. Frontend navigates to `/consultation` with conversation data
6. Video component renders using Daily.co integration
7. When ended, `endConversation` is called
8. Tavus sends webhook to `tavus-webhook` function
9. Webhook saves transcript and updates conversation status

### Database Schema Key Tables

Based on Edge Function code:
- `conversations` - Video consultation sessions
- `conversation_transcripts` - Saved transcripts from Tavus
- `conversation_events` - Webhook event log
- `document_generation_opportunities` - AI-detected document needs
- `document_generation_requests` - Pending document generation

### Environment Variables Required

Frontend (.env):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase Edge Functions:
```
TAVUS_API_KEY=your_tavus_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Design System

Brand colors defined in Tailwind config and context doc:
- Primary: #2A2F6D (Professional blue)
- Secondary: #F9B94E (Warm gold)
- Neutral: #5B5F77 (Supporting gray)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

Typography: Inter font family

### Component Patterns

#### Page Components
Located in `src/pages/`, follow pattern:
- Use `useAuth` hook for authentication checks
- Implement loading states with `LoadingSpinner`
- Handle errors with toast notifications (Sonner)
- Mobile-responsive by default

#### Reusable Components
Located in `src/components/`:
- `ui/` - Base components (Button, Card, Input)
- `layout/` - Page structure (Header, Footer)
- `video/` - Video consultation components
- `documents/` - Document generation UI
- Form components use React Hook Form

### Current Feature Branch: tavus-webhook

This branch implements comprehensive Tavus webhook handling with conversation analysis:

#### Enhanced Webhook Processing
- **All Event Types**: Handles system, application, and conversation events
- **Real-time Updates**: Live conversation state changes via Supabase broadcast
- **Advanced Analysis**: AI-powered conversation analysis with insights and quality metrics
- **Tool Call Support**: Logs and processes LLM tool executions during conversations

#### Database Schema Enhancements
- **New Tables**: `conversation_utterances`, `conversation_tool_calls`, timing fields
- **Analysis Storage**: Conversation quality scores, sentiment analysis, topic extraction
- **Real-time Support**: Enhanced RLS policies for webhook service role access

#### Frontend Features
- **Live Updates**: Real-time conversation status via Supabase subscriptions
- **Rich Analysis Display**: Quality metrics, sentiment, insights in transcript view
- **Enhanced History**: Quality indicators and analysis data in conversation cards

### Security Considerations

1. API keys are never exposed in frontend code
2. All Tavus API calls go through Edge Functions
3. Use Supabase RLS for database security
4. Validate all user inputs with Zod schemas
5. CORS headers configured in Edge Functions

## Tavus Integration Implementation

### Complete Tavus CVI Integration
This project includes a comprehensive implementation of Tavus Conversational Video Interface with:

#### Webhook Event Handling (100% Coverage)
- **System Events**: `replica_joined`, `shutdown` (conversation lifecycle)
- **Application Events**: `transcription_ready`, `recording_ready`, `perception_analysis`
- **Conversation Events**: `utterance`, `tool_call`, speaking state changes, perception events, live interaction protocols

#### Real-time Live Monitoring Components
- **LiveConversationMonitor**: Complete dashboard showing conversation state, speaking indicators, tool calls, perception events
- **SpeakingStateIndicator**: Visual indicators for user/AI speaking states (3 variants: minimal, compact, detailed)
- **ToolExecutionNotification**: Real-time notifications for LLM tool executions with progress tracking
- **LiveUtteranceStream**: Live message display showing conversation as it happens
- **VisualContextFeedback**: UI for Tavus perception analysis results and visual context detection

#### Advanced Webhook Processing
- **Signature Verification**: HMAC-SHA256 webhook authentication
- **Retry Logic**: Exponential backoff for failed webhook processing
- **Error Handling**: Comprehensive error logging and failure tracking
- **Real-time Broadcasting**: Live updates via Supabase channels

#### LLM Tools Integration
- **Document Generation**: Pitch decks, business plans, market analysis
- **Tool Call Logging**: Complete tracking of AI tool executions
- **Custom LLM Routing**: Persona-specific AI responses (fintech, healthtech, b2b-saas, enterprise)
- **Post-conversation Analysis**: Automatic conversation quality scoring and insights

#### Database Schema
Enhanced with comprehensive tables for:
- `conversation_events` - All webhook events
- `conversation_transcripts` - Full transcripts with analysis
- `conversation_utterances` - Real-time message tracking
- `conversation_tool_calls` - LLM tool execution log
- `conversation_perception_events` - Visual context analysis
- `conversation_interaction_events` - Live interaction protocols
- `webhook_processing_failures` - Error tracking and manual review

#### Implementation Files
- `supabase/functions/tavus-webhook/index.ts` - Enhanced webhook handler (1066 lines)
- `src/components/conversation/LiveConversationMonitor.tsx` - Real-time monitoring dashboard
- `src/components/conversation/SpeakingStateIndicator.tsx` - Speaking state UI components
- `src/components/conversation/ToolExecutionNotification.tsx` - Tool execution notifications
- `src/components/conversation/LiveUtteranceStream.tsx` - Live message streaming
- `src/components/conversation/VisualContextFeedback.tsx` - Perception analysis UI
- `src/hooks/useLiveConversationMonitor.ts` - Real-time monitoring hook
- `supabase/migrations/20250625000000_conversation_events_enhancement.sql` - Database schema
- `supabase/migrations/20250625000001_perception_and_interaction_events.sql` - Additional tables

#### Key Features
- **100% Event Coverage**: All Tavus webhook events are handled and processed
- **Live Monitoring**: Users can see real-time conversation state during calls
- **AI Tool Integration**: Seamless LLM tool execution with visual feedback
- **Advanced Analysis**: Conversation quality scoring, sentiment analysis, topic extraction
- **Production Ready**: Includes error handling, retry logic, security measures

This implementation provides a complete foundation for Tavus CVI integration with enterprise-grade webhook handling, real-time monitoring, and advanced AI capabilities.

For detailed implementation guide, see: `/TAVUS_IMPLEMENTATION_GUIDE.md`