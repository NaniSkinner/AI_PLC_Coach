# Phase 5: Frontend UI Development - Detailed Task List

**Duration:** 3-4 days
**Status:** 🔴 Not Started
**Prerequisites:** Phase 1 and 4 complete

---

## Task 5.1: Set Up shadcn/ui Components

### 5.1.1 Verify shadcn/ui Installation
- [ ] Check if `components.json` exists (should be from Phase 1)
- [ ] Check if `lib/utils.ts` exists
- [ ] Verify Tailwind is configured with shadcn

### 5.1.2 Install Required shadcn Components
- [ ] Install Button component:
  ```bash
  npx shadcn-ui@latest add button
  ```
- [ ] Install Input component:
  ```bash
  npx shadcn-ui@latest add input
  ```
- [ ] Install Card component:
  ```bash
  npx shadcn-ui@latest add card
  ```
- [ ] Install Dialog component:
  ```bash
  npx shadcn-ui@latest add dialog
  ```
- [ ] Install Badge component:
  ```bash
  npx shadcn-ui@latest add badge
  ```
- [ ] Install ScrollArea component:
  ```bash
  npx shadcn-ui@latest add scroll-area
  ```
- [ ] Install Skeleton component (for loading states):
  ```bash
  npx shadcn-ui@latest add skeleton
  ```

### 5.1.3 Verify Component Installation
- [ ] Check `components/ui/` directory
- [ ] Verify all 7 components installed
- [ ] Test import in a test file
- [ ] Run `npm run dev` to ensure no errors

### 5.1.4 Customize shadcn Theme (Optional)
- [ ] Open `app/globals.css`
- [ ] Adjust CSS variables for Solution Tree branding:
  ```css
  :root {
    --primary: 210 100% 50%; /* Solution Tree Blue #0066CC */
    --primary-foreground: 0 0% 100%;
    --secondary: 14 100% 60%; /* Orange accent */
  }
  ```
- [ ] Test theme changes

**Completion Criteria:**
- [ ] All shadcn components installed
- [ ] No installation errors
- [ ] Components verified working

---

## Task 5.2: Create ChatContainer Component

### 5.2.1 Create Component File
- [ ] Create file: `app/components/ChatContainer.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { useState, useEffect, useRef } from 'react';
  import { Message, ChatResponse } from '@/types';
  import MessageList from './MessageList';
  import ChatInput from './ChatInput';
  import TypingIndicator from './TypingIndicator';
  ```

### 5.2.2 Define Component State
- [ ] Create state management:
  ```typescript
  export default function ChatContainer({ sessionId }: { sessionId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  }
  ```

### 5.2.3 Implement Load Conversation
- [ ] Create useEffect to load existing conversation:
  ```typescript
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();

        if (data.messages) {
          setMessages(data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            citations: msg.citations || [],
            metadata: msg.metadata || {},
          })));
        }
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Failed to load conversation history');
      }
    }

    loadConversation();
  }, [sessionId]);
  ```

### 5.2.4 Implement Send Message Handler
- [ ] Create message sending function:
  ```typescript
  async function handleSendMessage(content: string) {
    if (!content.trim()) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ChatResponse = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: data.messageId,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(data.timestamp),
        citations: data.citations,
        metadata: data.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message. Please try again.');
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }
  ```

### 5.2.5 Implement Auto-Scroll
- [ ] Add scroll ref:
  ```typescript
  const messagesEndRef = useRef<HTMLDivElement>(null);
  ```
- [ ] Add scroll effect:
  ```typescript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  ```

### 5.2.6 Implement Component Layout
- [ ] Create render structure:
  ```typescript
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-st-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-heading font-bold text-st-blue-primary">
          AI PLC Virtual Coach
        </h1>
        <p className="text-sm text-st-gray-600">
          Expert guidance for Professional Learning Communities
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <MessageList messages={messages} />

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
  ```

### 5.2.7 Add Error Boundary
- [ ] Wrap component in error boundary (optional)
- [ ] Handle component-level errors gracefully

### 5.2.8 Test ChatContainer
- [ ] Create test page
- [ ] Verify messages load
- [ ] Test sending messages
- [ ] Test auto-scroll
- [ ] Test error states

### 5.2.9 Commit ChatContainer
- [ ] Stage file: `git add app/components/ChatContainer.tsx`
- [ ] Commit: `git commit -m "Add ChatContainer component with message handling"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] ChatContainer component created
- [ ] Loads existing conversation
- [ ] Sends messages to API
- [ ] Updates UI optimistically
- [ ] Auto-scrolls to new messages
- [ ] Error handling working

---

## Task 5.3: Create MessageList Component

### 5.3.1 Create Component File
- [ ] Create file: `app/components/MessageList.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { Message } from '@/types';
  import MessageBubble from './MessageBubble';
  ```

### 5.3.2 Implement MessageList Component
- [ ] Create component:
  ```typescript
  interface MessageListProps {
    messages: Message[];
  }

  export default function MessageList({ messages }: MessageListProps) {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-st-gray-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Welcome to your PLC Coach</p>
            <p className="text-sm">
              Ask me anything about implementing PLCs, analyzing data, designing interventions, and more.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    );
  }
  ```

### 5.3.3 Add Message Grouping (Optional)
- [ ] Group consecutive messages from same sender
- [ ] Reduce spacing between grouped messages
- [ ] Show timestamp only on last message in group

### 5.3.4 Add Virtualization (Optional for Performance)
- [ ] Install react-window: `npm install react-window`
- [ ] Implement virtualized list for 100+ messages
- [ ] Only render if performance is an issue

### 5.3.5 Test MessageList
- [ ] Test with 0 messages (empty state)
- [ ] Test with 1 message
- [ ] Test with 10+ messages
- [ ] Verify spacing and layout

### 5.3.6 Commit MessageList
- [ ] Stage file: `git add app/components/MessageList.tsx`
- [ ] Commit: `git commit -m "Add MessageList component with empty state"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] MessageList component created
- [ ] Displays messages correctly
- [ ] Shows empty state when no messages
- [ ] Proper spacing between messages

---

## Task 5.4: Create MessageBubble Component

### 5.4.1 Create Component File
- [ ] Create file: `app/components/MessageBubble.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { Message } from '@/types';
  import { formatDistanceToNow } from 'date-fns';
  import CitationPill from './CitationPill';
  ```
- [ ] Install date-fns if not already: `npm install date-fns`

### 5.4.2 Implement User Message Styling
- [ ] Create user message bubble:
  ```typescript
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="bg-st-blue-primary text-white rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className="text-xs text-st-gray-500 mt-1 text-right">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  }
  ```

### 5.4.3 Implement Assistant Message Styling
- [ ] Create assistant message bubble:
  ```typescript
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-st-gray-800">
              {message.content}
            </p>
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-st-gray-600 mb-2 font-semibold">
                Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <CitationPill key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}

          {/* Metadata (optional - for debugging) */}
          {message.metadata?.responseTime && (
            <p className="text-xs text-st-gray-400 mt-2">
              Response time: {message.metadata.responseTime}ms
            </p>
          )}
        </div>

        <p className="text-xs text-st-gray-500 mt-1">
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
  ```

### 5.4.4 Add Markdown Support (Optional)
- [ ] Install react-markdown: `npm install react-markdown`
- [ ] Replace plain text with markdown rendering
- [ ] Style markdown elements with Tailwind

### 5.4.5 Add Copy Button (Optional)
- [ ] Add copy-to-clipboard button for assistant messages
- [ ] Show toast on successful copy

### 5.4.6 Test MessageBubble
- [ ] Test user message rendering
- [ ] Test assistant message rendering
- [ ] Test with citations
- [ ] Test without citations
- [ ] Test long messages
- [ ] Test line breaks and formatting

### 5.4.7 Commit MessageBubble
- [ ] Stage file: `git add app/components/MessageBubble.tsx`
- [ ] Commit: `git commit -m "Add MessageBubble component with user/assistant styles"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] MessageBubble component created
- [ ] Different styles for user vs assistant
- [ ] Citations displayed correctly
- [ ] Timestamps formatted nicely
- [ ] Responsive and readable

---

## Task 5.5: Create ChatInput Component

### 5.5.1 Create Component File
- [ ] Create file: `app/components/ChatInput.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { useState, useRef, KeyboardEvent } from 'react';
  import { Button } from '@/components/ui/button';
  import { Send } from 'lucide-react';
  ```
- [ ] Install lucide-react: `npm install lucide-react`

### 5.5.2 Implement Component State
- [ ] Create state:
  ```typescript
  interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
  }

  export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  }
  ```

### 5.5.3 Implement Auto-Resize Textarea
- [ ] Add auto-resize logic:
  ```typescript
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to recalculate
      textareaRef.current.style.height = 'auto';
      // Set to scrollHeight
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);
  ```

### 5.5.4 Implement Send Handler
- [ ] Create send function:
  ```typescript
  function handleSend() {
    const message = input.trim();
    if (message && !disabled) {
      onSend(message);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }
  ```

### 5.5.5 Implement Keyboard Shortcuts
- [ ] Add Enter to send, Shift+Enter for new line:
  ```typescript
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  ```

### 5.5.6 Implement Character Counter
- [ ] Add character counter:
  ```typescript
  const maxLength = 2000;
  const remaining = maxLength - input.length;
  ```
- [ ] Display counter in UI

### 5.5.7 Implement Component Layout
- [ ] Create render:
  ```typescript
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about PLCs, data analysis, interventions..."
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-st-blue-primary min-h-[48px] max-h-[200px] disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={1}
          maxLength={maxLength}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-st-blue-primary hover:bg-st-blue-secondary h-12 px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Character counter */}
      <div className="flex justify-between items-center text-xs text-st-gray-500">
        <p>
          Press <kbd className="px-1 py-0.5 bg-gray-200 rounded">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift + Enter</kbd> for new line
        </p>
        <p className={remaining < 100 ? 'text-st-orange' : ''}>
          {remaining} characters remaining
        </p>
      </div>
    </div>
  );
  ```

### 5.5.8 Test ChatInput
- [ ] Test typing and sending
- [ ] Test Enter key
- [ ] Test Shift+Enter for new line
- [ ] Test disabled state
- [ ] Test character limit
- [ ] Test auto-resize

### 5.5.9 Commit ChatInput
- [ ] Stage file: `git add app/components/ChatInput.tsx`
- [ ] Commit: `git commit -m "Add ChatInput component with auto-resize and shortcuts"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] ChatInput component created
- [ ] Auto-resize textarea working
- [ ] Enter to send, Shift+Enter for new line
- [ ] Character counter functional
- [ ] Disabled state working

---

## Task 5.6: Create TypingIndicator Component

### 5.6.1 Create Component File
- [ ] Create file: `app/components/TypingIndicator.tsx`
- [ ] Add imports:
  ```typescript
  'use client';
  ```

### 5.6.2 Implement Typing Animation
- [ ] Create component with animated dots:
  ```typescript
  export default function TypingIndicator() {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-white border border-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-st-gray-600">Coach is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-st-blue-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

### 5.6.3 Add Custom Animation (Optional)
- [ ] Add custom CSS animation in globals.css:
  ```css
  @keyframes typing-dot {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }

  .animate-typing {
    animation: typing-dot 1.4s ease-in-out infinite;
  }
  ```

### 5.6.4 Test TypingIndicator
- [ ] Add to test page
- [ ] Verify animation works
- [ ] Test on different screen sizes

### 5.6.5 Commit TypingIndicator
- [ ] Stage file: `git add app/components/TypingIndicator.tsx`
- [ ] Commit: `git commit -m "Add TypingIndicator component with bounce animation"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] TypingIndicator component created
- [ ] Animated dots working
- [ ] Styled to match chat interface

---

## Task 5.7: Create CitationPill Component

### 5.7.1 Create Component File
- [ ] Create file: `app/components/CitationPill.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { useState } from 'react';
  import { Citation } from '@/types';
  import { Badge } from '@/components/ui/badge';
  import CitationModal from './CitationModal';
  ```

### 5.7.2 Implement CitationPill Component
- [ ] Create component:
  ```typescript
  interface CitationPillProps {
    citation: Citation;
  }

  export default function CitationPill({ citation }: CitationPillProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Truncate document name if too long
    const displayName = citation.sourceDocument.length > 40
      ? citation.sourceDocument.substring(0, 40) + '...'
      : citation.sourceDocument;

    return (
      <>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-st-blue-primary hover:text-white transition-colors border-st-blue-primary text-st-blue-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-xs">
            {displayName}
          </span>
        </Badge>

        <CitationModal
          citation={citation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }
  ```

### 5.7.3 Add Hover Effects
- [ ] Enhance hover state for better UX
- [ ] Add tooltip with full source name (optional)

### 5.7.4 Test CitationPill
- [ ] Test click to open modal
- [ ] Test hover effects
- [ ] Test with long document names
- [ ] Test with multiple citations

### 5.7.5 Commit CitationPill
- [ ] Stage file: `git add app/components/CitationPill.tsx`
- [ ] Commit: `git commit -m "Add CitationPill component with modal trigger"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] CitationPill component created
- [ ] Clickable to open modal
- [ ] Hover effects working
- [ ] Truncates long names

---

## Task 5.8: Create CitationModal Component

### 5.8.1 Create Component File
- [ ] Create file: `app/components/CitationModal.tsx`
- [ ] Add imports:
  ```typescript
  'use client';

  import { Citation } from '@/types';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from '@/components/ui/dialog';
  ```

### 5.8.2 Implement CitationModal Component
- [ ] Create component:
  ```typescript
  interface CitationModalProps {
    citation: Citation;
    isOpen: boolean;
    onClose: () => void;
  }

  export default function CitationModal({
    citation,
    isOpen,
    onClose,
  }: CitationModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-st-blue-primary">
              {citation.sourceDocument}
            </DialogTitle>
            <DialogDescription className="text-sm text-st-gray-600">
              {citation.author && `by ${citation.author}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Citation Details */}
            <div className="bg-st-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Source Information</h3>
              <dl className="space-y-2 text-sm">
                {citation.author && (
                  <div>
                    <dt className="inline font-medium">Author: </dt>
                    <dd className="inline">{citation.author}</dd>
                  </div>
                )}
                {citation.chapterOrSection && (
                  <div>
                    <dt className="inline font-medium">Section: </dt>
                    <dd className="inline">{citation.chapterOrSection}</dd>
                  </div>
                )}
                {citation.pageNumber && (
                  <div>
                    <dt className="inline font-medium">Page: </dt>
                    <dd className="inline">{citation.pageNumber}</dd>
                  </div>
                )}
                {citation.relevanceScore && (
                  <div>
                    <dt className="inline font-medium">Relevance: </dt>
                    <dd className="inline">{(citation.relevanceScore * 100).toFixed(1)}%</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* URL/Link if available */}
            {citation.url && (
              <div>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-st-blue-primary hover:underline text-sm"
                >
                  View full resource →
                </a>
              </div>
            )}

            {/* Additional Info */}
            <div className="text-xs text-st-gray-500">
              <p>
                This source was retrieved based on its relevance to your question.
                For complete context, refer to the full document.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```

### 5.8.3 Add Excerpt Display (Optional)
- [ ] If source excerpt is available, display it
- [ ] Add scrollable excerpt section

### 5.8.4 Test CitationModal
- [ ] Test opening and closing
- [ ] Test with all citation fields populated
- [ ] Test with minimal citation info
- [ ] Test on mobile (responsive)

### 5.8.5 Commit CitationModal
- [ ] Stage file: `git add app/components/CitationModal.tsx`
- [ ] Commit: `git commit -m "Add CitationModal component with source details"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] CitationModal component created
- [ ] Displays all citation information
- [ ] Opens and closes correctly
- [ ] Responsive design

---

## Task 5.9: Create Main Chat Page

### 5.9.1 Update Home Page
- [ ] Open `app/page.tsx`
- [ ] Replace landing page with session initialization

### 5.9.2 Implement Session Creation
- [ ] Create client component:
  ```typescript
  'use client';

  import { useEffect, useState } from 'react';
  import ChatContainer from '@/components/ChatContainer';

  export default function Home() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function initSession() {
        try {
          // Check for existing session in localStorage
          let existingSessionId = localStorage.getItem('plc-session-id');

          if (!existingSessionId) {
            // Create new session
            const response = await fetch('/api/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: 'demo-user' }),
            });

            if (!response.ok) {
              throw new Error('Failed to create session');
            }

            const data = await response.json();
            existingSessionId = data.sessionId;

            // Store in localStorage
            localStorage.setItem('plc-session-id', existingSessionId);
          }

          setSessionId(existingSessionId);
        } catch (err) {
          console.error('Session initialization error:', err);
          setError('Failed to initialize chat session');
        } finally {
          setIsLoading(false);
        }
      }

      initSession();
    }, []);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-st-blue-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-st-gray-600">Initializing coach...</p>
          </div>
        </div>
      );
    }

    if (error || !sessionId) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-600">
            <p>{error || 'Failed to start session'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-st-blue-primary text-white rounded hover:bg-st-blue-secondary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return <ChatContainer sessionId={sessionId} />;
  }
  ```

### 5.9.3 Add New Chat Button (Optional)
- [ ] Add button to start new conversation
- [ ] Clear localStorage and create new session
- [ ] Confirm before starting new chat

### 5.9.4 Test Main Page
- [ ] Test initial load
- [ ] Test session creation
- [ ] Test localStorage persistence
- [ ] Test error states

### 5.9.5 Commit Main Page
- [ ] Stage file: `git add app/page.tsx`
- [ ] Commit: `git commit -m "Update main page with chat interface and session management"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Main page uses ChatContainer
- [ ] Session auto-created
- [ ] Session persisted in localStorage
- [ ] Loading and error states handled

---

## Task 5.10: Responsive Design & Mobile Optimization

### 5.10.1 Test on Mobile Breakpoints
- [ ] Test at 320px width (iPhone SE)
- [ ] Test at 375px width (iPhone 12)
- [ ] Test at 768px width (iPad)
- [ ] Test at 1024px+ (Desktop)

### 5.10.2 Fix Mobile Issues
- [ ] Adjust padding/margins for small screens
- [ ] Ensure buttons are touch-friendly (min 44px)
- [ ] Fix textarea sizing on mobile
- [ ] Adjust message bubble max-width for mobile

### 5.10.3 Update Responsive Classes
- [ ] Use Tailwind responsive prefixes:
  ```typescript
  // Example: Adjust container width
  <div className="max-w-full md:max-w-4xl">

  // Example: Adjust message bubble width
  <div className="max-w-[95%] sm:max-w-[80%]">
  ```

### 5.10.4 Test Landscape Orientation
- [ ] Test on mobile landscape
- [ ] Ensure input remains accessible
- [ ] Adjust heights if needed

### 5.10.5 Add Touch Optimizations
- [ ] Ensure scrolling is smooth on iOS
- [ ] Add `-webkit-overflow-scrolling: touch` if needed
- [ ] Test pull-to-refresh doesn't break UI

### 5.10.6 Test on Real Devices
- [ ] Test on iPhone (if available)
- [ ] Test on Android (if available)
- [ ] Test on tablet

### 5.10.7 Document Responsive Behavior
- [ ] Note any mobile-specific quirks
- [ ] Document supported screen sizes

**Completion Criteria:**
- [ ] Works on 320px+ screens
- [ ] Touch targets are adequate
- [ ] Scrolling is smooth
- [ ] Layout adapts to screen size
- [ ] No horizontal scroll

---

## Task 5.11: Polish and Refinement

### 5.11.1 Add Loading Skeletons
- [ ] Show skeleton for messages while loading conversation
- [ ] Use shadcn Skeleton component
- [ ] Match message bubble layout

### 5.11.2 Improve Error Messages
- [ ] Make error messages user-friendly
- [ ] Add retry buttons where appropriate
- [ ] Don't expose technical details

### 5.11.3 Add Empty State Improvements
- [ ] Add suggested starting questions:
  ```typescript
  const suggestedQuestions = [
    "How do we identify essential standards?",
    "What's a data protocol?",
    "How do we schedule intervention time?",
    "What's the difference between Tier 2 and Tier 3?",
  ];
  ```
- [ ] Make suggestions clickable

### 5.11.4 Add Accessibility
- [ ] Add ARIA labels to buttons
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (if possible)
- [ ] Add focus indicators

### 5.11.5 Add Transitions
- [ ] Smooth fade-in for new messages
- [ ] Transition on hover states
- [ ] Smooth scroll behavior

### 5.11.6 Final Visual Polish
- [ ] Check all colors match Solution Tree branding
- [ ] Verify fonts are correct
- [ ] Ensure spacing is consistent
- [ ] Check border radii match design

### 5.11.7 Performance Optimization
- [ ] Lazy load components if needed
- [ ] Optimize re-renders
- [ ] Check bundle size
- [ ] Run Lighthouse audit

### 5.11.8 Browser Testing
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Fix any browser-specific issues

### 5.11.9 Commit Polish Updates
- [ ] Stage all changes: `git add .`
- [ ] Commit: `git commit -m "Polish UI with loading states, accessibility, and performance improvements"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Loading states polished
- [ ] Error handling improved
- [ ] Accessibility enhanced
- [ ] Transitions smooth
- [ ] Works in all major browsers
- [ ] Performance optimized

---

## Task 5.12: Final Phase 5 Verification

### 5.12.1 Test Complete User Flow
- [ ] Open application
- [ ] Session creates automatically
- [ ] Send first message
- [ ] Receive response with citations
- [ ] Click citation pill
- [ ] View citation details in modal
- [ ] Send follow-up message
- [ ] Verify context is maintained
- [ ] Refresh page
- [ ] Verify conversation persists

### 5.12.2 Test All Components
- [ ] ChatContainer renders correctly
- [ ] MessageList displays messages
- [ ] MessageBubble styles correctly
- [ ] ChatInput sends messages
- [ ] TypingIndicator shows during loading
- [ ] CitationPill opens modal
- [ ] CitationModal displays details

### 5.12.3 Mobile Testing
- [ ] Test on iPhone simulator
- [ ] Test on Android simulator
- [ ] Verify responsive design
- [ ] Check touch interactions

### 5.12.4 Cross-Browser Testing
- [ ] Chrome works
- [ ] Safari works
- [ ] Firefox works
- [ ] Edge works

### 5.12.5 Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (basic test)
- [ ] Focus indicators visible
- [ ] Color contrast acceptable

### 5.12.6 Performance Testing
- [ ] Run Lighthouse
- [ ] Check Performance score (target: 80+)
- [ ] Check Accessibility score (target: 90+)
- [ ] Check Best Practices score (target: 90+)

### 5.12.7 Deploy to Vercel
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Wait for Vercel deployment
- [ ] Test production deployment

### 5.12.8 Create Phase 5 Summary
- [ ] Create: `Docs/Phase_Summaries/Phase_5_Summary.md`
- [ ] Include:
  ```markdown
  # Phase 5 Summary

  **Completion Date:** [Date]
  **Duration:** [Hours/Days]

  ## Completed Tasks
  - 7 React components created
  - Chat interface fully functional
  - Citations working with modals
  - Mobile responsive design
  - Accessibility improvements
  - Cross-browser compatibility

  ## Deliverables
  - ChatContainer
  - MessageList
  - MessageBubble
  - ChatInput
  - TypingIndicator
  - CitationPill
  - CitationModal

  ## Metrics
  - Lighthouse Performance: [score]
  - Lighthouse Accessibility: [score]
  - Mobile responsive: Yes
  - Cross-browser: Chrome, Safari, Firefox, Edge

  ## Issues Encountered
  - [List any issues]

  ## Next Steps
  - Phase 6: Integration & Testing
  - Comprehensive end-to-end testing
  - 20 test scenarios
  ```

### 5.12.9 Update Documentation
- [ ] Update main README
- [ ] Update project status
- [ ] Document UI components

### 5.12.10 Final Commit
- [ ] Stage all: `git add .`
- [ ] Commit: `git commit -m "Complete Phase 5: Frontend UI Development"`
- [ ] Push: `git push origin main`
- [ ] Mark phase as complete

**Completion Criteria:**
- [ ] All components working
- [ ] Chat interface functional
- [ ] Citations display correctly
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Accessibility enhanced
- [ ] Deployed to production
- [ ] Documentation complete
- [ ] Ready for Phase 6

---

## Phase 5 Completion

**Status:** ⬜ Not Started → 🟢 Complete

**Completion Date:** _______________

**Total Time Spent:** _____ hours/days

**Components Created:**
1. ChatContainer
2. MessageList
3. MessageBubble
4. ChatInput
5. TypingIndicator
6. CitationPill
7. CitationModal

**Quality Metrics:**
- Lighthouse Performance: _____
- Lighthouse Accessibility: _____
- Mobile Responsive: Yes/No
- Cross-Browser Compatible: _____

**Notes:**
-

**Blockers Encountered:**
-

**Lessons Learned:**
-

**Ready for Phase 6:** [ ] Yes / [ ] No

---

## Quick Reference

### Key Components
```
app/components/ChatContainer.tsx     # Main chat wrapper
app/components/MessageList.tsx       # List of messages
app/components/MessageBubble.tsx     # Individual message
app/components/ChatInput.tsx         # Input field
app/components/TypingIndicator.tsx   # Loading indicator
app/components/CitationPill.tsx      # Citation badge
app/components/CitationModal.tsx     # Citation details
```

### Key Commands
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run lint               # Run linter
```

### Solution Tree Colors
- Primary Blue: #0066CC (`st-blue-primary`)
- Dark Blue: #004C99 (`st-blue-secondary`)
- Orange: #FF6B35 (`st-orange`)
- Gray Scale: `st-gray-50` to `st-gray-900`

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Next Steps
→ Proceed to Phase 6: Integration & Testing
