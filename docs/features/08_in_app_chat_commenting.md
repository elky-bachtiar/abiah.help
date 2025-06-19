NEW FEATURE REQUEST:
Add In-App Chat and Document Commenting to the Abiah.help platform.

## 🗂️ PLAN: IN-APP CHAT & COMMENTING - COLLABORATIVE COMMUNICATION

> Create a robust in-app communication system with both real-time chat and contextual document commenting to facilitate collaboration and knowledge sharing

### Feature Category
REQUIREMENTS:

- [ ] **Real-time Chat**:
  - [ ] Direct messaging between users
  - [ ] Document-specific chat rooms
  - [ ] Typing indicators
  - [ ] Read receipts
  - [ ] Rich text formatting
- [ ] **Document Commenting**:
  - [ ] Contextual in-line comments 
  - [ ] Comment threads/replies
  - [ ] Comment resolution
  - [ ] @mentions
  - [ ] Text highlighting
- [ ] **Notification Integration**:
  - [ ] New message alerts
  - [ ] @mention notifications
  - [ ] Comment activity notifications

FILES TO MODIFY/CREATE:

- `src/components/chat/ChatProvider.tsx` - Chat context provider
- `src/components/chat/ChatWindow.tsx` - Main chat interface component
- `src/components/chat/MessageBubble.tsx` - Individual message component
- `src/components/chat/ChatInput.tsx` - Message composition component
- `src/components/chat/ChatList.tsx` - List of active chats/conversations
- `src/components/comments/CommentProvider.tsx` - Comment context provider
- `src/components/comments/CommentMarker.tsx` - Visual indicator for comments
- `src/components/comments/CommentThread.tsx` - Thread of comments on a section
- `src/components/comments/CommentInput.tsx` - Comment composition component
- `src/components/comments/CommentSidebar.tsx` - Sidebar showing all comments
- `src/hooks/useChat.tsx` - Hook for chat functionality
- `src/hooks/useComments.tsx` - Hook for comment functionality
- `src/api/chat.ts` - Chat API endpoints
- `src/api/comments.ts` - Comments API endpoints
- `src/types/Chat.ts` - Chat type definitions
- `src/types/Comments.ts` - Comment type definitions
- `src/pages/documents/DocumentViewer.tsx` - Update to include commenting
- `src/utils/mentionHelpers.ts` - Utilities for @mention functionality

### Priority & Complexity
- **Priority**: MEDIUM
- **Complexity**: HIGH
- **Estimated Dev Time**: 5 days
- **Dependencies**: Authentication system, Document system, Notifications system

---

## 🎯 GOAL

### Primary Objectives
- [ ] Enable real-time communication between users
- [ ] Facilitate collaborative document review and feedback
- [ ] Create contextual discussions tied to specific content
- [ ] Support @mentions for directed communication
- [ ] Integrate with notification system for timely alerts

### Business Impact
- [ ] **Collaboration**: Increase multi-user document collaboration by 40%
- [ ] **Engagement**: Extend average session duration by 35%
- [ ] **Feedback Quality**: Improve document quality through iterative feedback
- [ ] **Team Value**: Position platform for future team/enterprise features
- [ ] **Retention**: Increase recurring user sessions by 25%

### Technical Goals
- [ ] **Realtime**: Message delivery in <500ms
- [ ] **Scalability**: Support up to 50 concurrent users in a document
- [ ] **Storage**: Efficient comment/chat history with pagination
- [ ] **Offline Support**: Queue messages/comments during connectivity issues
- [ ] **Performance**: Minimal impact on document rendering performance

---

## ✅ Success Criteria

### Measurable Outcomes
- [ ] **Message Delivery**: >99% successful message delivery rate
- [ ] **Comment Activity**: Average of 5+ comments per document
- [ ] **Response Time**: Average response to comments within 24 hours
- [ ] **Collaboration**: 30% increase in multi-user document editing sessions

### Acceptance Criteria
- [ ] **Chat Interface**: Clean, intuitive chat window with conversation history
- [ ] **Commenting UI**: Non-intrusive comment markers with expandable threads
- [ ] **Rich Text**: Support for basic formatting (bold, italic, links)
- [ ] **Realtime Updates**: Messages and comments appear instantly for all users
- [ ] **Mentions**: @username functionality in both chat and comments
- [ ] **Notifications**: Integrated alerts for new messages and @mentions
- [ ] **Mobile Support**: Fully responsive chat and comment interfaces
- [ ] **Offline Handling**: Message queueing during connectivity issues

---

## 🌐 Research & Best Practices

### Sources Reviewed
- [ ] [Google Docs Commenting System](https://support.google.com/docs/answer/65129)
- [ ] [Figma Comments Implementation](https://help.figma.com/hc/en-us/articles/360041068574-Add-comments-to-files)
- [ ] [Slack Real-Time Messaging API](https://api.slack.com/rtm)
- [ ] [Socket.io Documentation](https://socket.io/docs/v4/)
- [ ] [Draft.js Rich Text Implementation](https://draftjs.org/)
- [ ] [Web Components - Mentions](https://github.com/tiptap/tiptap/blob/main/packages/extension-mention/README.md)

### Key Findings
- **Best Practice 1**: Use WebSockets for real-time communication
- **Best Practice 2**: Implement optimistic UI updates with eventual consistency
- **Best Practice 3**: Store chat/comments in NoSQL format for flexibility
- **UX Consideration**: Integrate comments as non-disruptive overlays
- **Performance Optimization**: Lazy-load historical messages/comments
- **Design Pattern**: Differentiate between persistent comments and ephemeral chat

### Technology Stack
- **Primary**: React + TypeScript, WebSockets (Socket.io)
- **Supporting**: Supabase Realtime for WebSocket communication
- **Rich Text**: Draft.js or TipTap
- **State Management**: Jotai atoms for local state
- **Storage**: Supabase tables for persistence
- **Offline**: Service Workers for offline message queueing

---

## 📋 Implementation Details

### Data Models

- **Message**
  ```typescript
  interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    content_type: 'text' | 'rich_text' | 'image' | 'file';
    rich_content?: Record<string, any>; // For rich text JSON structure
    created_at: Date;
    updated_at?: Date;
    delivered: boolean;
    read_by: Array<{
      user_id: string;
      read_at: Date;
    }>;
    mentions: string[]; // User IDs mentioned
    attachments?: Array<{
      id: string;
      type: string;
      url: string;
      name: string;
      size: number;
    }>;
  }
  ```

- **Conversation**
  ```typescript
  interface Conversation {
    id: string;
    type: 'direct' | 'document' | 'group';
    document_id?: string; // For document-specific conversations
    participants: string[]; // User IDs
    created_at: Date;
    updated_at: Date;
    last_message?: {
      content: string;
      sender_id: string;
      sent_at: Date;
    };
    metadata?: Record<string, any>;
  }
  ```

- **Comment**
  ```typescript
  interface Comment {
    id: string;
    document_id: string;
    user_id: string;
    parent_id?: string; // For threaded replies
    content: string;
    rich_content?: Record<string, any>;
    position: {
      x: number;
      y: number;
    } | {
      start_offset: number;
      end_offset: number;
      element_id?: string;
    };
    created_at: Date;
    updated_at?: Date;
    resolved: boolean;
    resolved_by?: string;
    resolved_at?: Date;
    mentions: string[]; // User IDs mentioned
    reactions?: Record<string, string[]>; // Emoji reaction to user IDs
  }
  ```

### API Endpoints

#### Chat API
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get single conversation
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get messages (paginated)
- `POST /api/conversations/:id/messages` - Send new message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

#### Comments API
- `GET /api/documents/:id/comments` - Get document comments
- `POST /api/documents/:id/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `PUT /api/comments/:id/resolve` - Resolve comment
- `POST /api/comments/:id/replies` - Reply to comment

### WebSocket Events
- `message:new` - New message received
- `message:updated` - Message was edited
- `message:deleted` - Message was deleted
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `comment:new` - New comment added
- `comment:updated` - Comment was updated
- `comment:resolved` - Comment was resolved
- `comment:deleted` - Comment was deleted

### Component Architecture
```
ChatProvider
├── ChatWindow
│   ├── ChatHeader
│   ├── MessageList
│   │   └── MessageBubble
│   └── ChatInput
├── ChatSidebar
│   └── ConversationList
│       └── ConversationItem
└── ChatNotifications

CommentProvider
├── CommentMarkers
│   └── CommentMarker
├── CommentSidebar
│   └── CommentThread
│       └── Comment
└── CommentInput
```

---

## 🖼️ UI/UX Design

### Chat Interface
- **Chat Window**: Fixed or floating window for conversation
- **Message Bubbles**: Left/right alignment based on sender
- **Input Area**: Expandable input with rich text controls
- **Attachment Support**: Drag-and-drop file upload
- **Typing Indicator**: Subtle animation when user is typing
- **Read Receipts**: Small indicators for message status

### Comment Interface
- **Comment Markers**: Small, non-intrusive indicators in document margins
- **Comment Threads**: Expandable threads for conversation
- **Highlight**: Text highlight for selection-based comments
- **Sidebar**: Collapsible sidebar showing all comments
- **Resolution**: Checkbox to mark comments as resolved
- **Filtering**: Options to filter by resolved/unresolved, author, date

### User Experience Flows
1. **Starting a Chat**:
   - Select user from directory
   - System creates conversation if not exists
   - Focus on chat input
   
2. **Document Chat**:
   - Automatic document-specific chat room
   - All document viewers see the same conversation
   
3. **Adding a Comment**:
   - Select text or click position in document
   - Comment input appears
   - Submit creates visible marker
   
4. **Responding to Comments**:
   - Click marker to expand thread
   - Type in reply input
   - Thread updates in real-time for all users

### Mobile Considerations
- **Chat**: Fullscreen overlay on small screens
- **Comments**: Bottom sheet interface on mobile
- **Touch**: Larger tap targets for comment markers

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Test message formatting and rendering
- [ ] Test comment positioning calculation
- [ ] Test @mention parsing and highlighting
- [ ] Test read status tracking

### Integration Tests
- [ ] Test WebSocket connection and reconnection
- [ ] Test conversation creation flow
- [ ] Test comment threading and replies
- [ ] Test notification integration

### E2E Tests
- [ ] Complete message sending and receiving flow
- [ ] Document commenting end-to-end workflow
- [ ] Offline functionality and message queueing
- [ ] Multi-user simultaneous commenting scenario

### Performance Tests
- [ ] Message delivery latency measurement
- [ ] Comment rendering impact on document performance
- [ ] WebSocket connection handling under poor network conditions
- [ ] Database query performance with large message/comment history

---

## 📝 Documentation

### Developer Documentation
- WebSocket integration guide
- Adding new message types
- Comment positioning system
- @mention implementation details
- Extending the rich text capabilities

### User Documentation
- How to start conversations
- Adding and resolving comments
- Using @mentions
- Rich text formatting options
- Managing notification preferences for chat/comments

---

## 🚀 Deployment & Rollout

### Deployment Strategy
- Deploy behind feature flag
- Enable chat functionality first
- Add document commenting in second phase
- Enable @mentions and advanced features in third phase

### Rollout Phases
1. Internal testing with development team
2. Alpha release with basic chat functionality
3. Beta release with document commenting
4. Limited release to select customers
5. Full production release

### Migration Considerations
- Create database migrations for new tables
- Add WebSocket server configuration
- Update notification templates for chat events

---

## 🔍 Monitoring & Observability

### Key Metrics
- [ ] **Message Latency**: Time from send to receive
- [ ] **Message Volume**: Total messages per day/user
- [ ] **Comment Activity**: Comments per document
- [ ] **Resolution Rate**: % of comments marked resolved
- [ ] **WebSocket Connections**: Active connections and disconnection rate
- [ ] **Error Rate**: Failed message sends or comment saves

### Logging
- [ ] WebSocket connection events
- [ ] Message delivery status
- [ ] Comment creation and resolution events
- [ ] Performance timing for critical operations

### Alerting
- [ ] WebSocket server disconnections above threshold
- [ ] Message delivery failures above 1%
- [ ] Database query performance degradation
- [ ] API endpoint latency exceeding 500ms
