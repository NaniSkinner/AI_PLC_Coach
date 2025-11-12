# Phase 4: Backend API Development - Detailed Task List

**Duration:** 3-4 days
**Status:** 🔴 Not Started
**Prerequisites:** Phase 1 and 3 complete

---

## Task 4.1: LLM Response Generation Module

### 4.1.1 Create Generation Module File
- [ ] Create file: `app/lib/rag/generation.ts`
- [ ] Add imports:
  ```typescript
  import { OpenAI } from 'openai';
  import { RetrievalResult } from './types';
  import { Message } from '@/types';
  ```

### 4.1.2 Define System Prompt
- [ ] Create comprehensive system prompt based on PRD Section 4.1.2:
  ```typescript
  const SYSTEM_PROMPT = `You are an expert Solution Tree PLC at Work® Associate with 15+ years of experience coaching educational leaders and collaborative teams.

Your coaching style is:

1. FACILITATIVE: Ask powerful questions that surface team thinking rather than immediately providing answers.

2. FRAMEWORK-GROUNDED: Every response is anchored in the Three Big Ideas (Focus on Learning, Collaborative Culture, Focus on Results) and guides teams through the Four Critical Questions.

3. INQUIRY-BASED: When a team presents a challenge, first ask clarifying questions:
   - "What data are you using to reach that conclusion?"
   - "How have you aligned this to your essential learning outcomes?"
   - "What have you tried so far?"

4. ACTIONABLE: After inquiry, provide specific, concrete next steps with clear rationale.

5. CITATION-CONSCIOUS: Reference specific Solution Tree resources to build credibility and enable follow-up learning.

YOUR COACHING PROCESS:
Step 1: Acknowledge the challenge empathetically
Step 2: Ask 1-2 clarifying questions to understand context
Step 3: Connect to the PLC framework (Which Critical Question? Which Big Idea?)
Step 4: Provide actionable guidance with specific examples
Step 5: Cite the source document [Source: Book Title, Section]

CRITICAL RULES:
- Never provide generic advice that could come from any AI
- Always ground responses in the PLC at Work framework
- Use the term "collaborative team" not "group" or "committee"
- Reference the Four Critical Questions by number
- Include at least one citation per substantive response
- Format citations as: [Source: Document Name, Section/Chapter]`;
  ```
- [ ] Save prompt as constant

### 4.1.3 Create Context Formatting Function
- [ ] Implement function to format retrieved chunks:
  ```typescript
  function formatChunksForPrompt(chunks: RetrievalResult[]): string {
    return chunks
      .map((chunk, index) => {
        return `[Context ${index + 1}]
Source: ${chunk.metadata.sourceDocument}
Author: ${chunk.metadata.author}
${chunk.metadata.section ? `Section: ${chunk.metadata.section}` : ''}
${chunk.metadata.pageNumber ? `Page: ${chunk.metadata.pageNumber}` : ''}
${chunk.metadata.criticalQuestion ? `Critical Question: ${chunk.metadata.criticalQuestion}` : ''}

Content:
${chunk.content}`;
      })
      .join('\n\n---\n\n');
  }
  ```

### 4.1.4 Implement Message Formatting
- [ ] Create function to format conversation history:
  ```typescript
  function formatConversationHistory(history: Message[]) {
    return history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }
  ```

### 4.1.5 Implement Main Generation Function
- [ ] Create generateResponse function:
  ```typescript
  export async function generateResponse(params: {
    userQuery: string;
    retrievedChunks: RetrievalResult[];
    conversationHistory: Message[];
  }): Promise<string> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT,
      },
      // Add conversation history
      ...formatConversationHistory(params.conversationHistory),
      // Add retrieved context
      {
        role: 'system' as const,
        content: `Relevant context from knowledge base:\n\n${formatChunksForPrompt(params.retrievedChunks)}`,
      },
      // Add user query
      {
        role: 'user' as const,
        content: params.userQuery,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return response.choices[0].message.content || '';
  }
  ```

### 4.1.6 Add Error Handling
- [ ] Wrap OpenAI call in try-catch
- [ ] Handle API errors gracefully
- [ ] Implement retry logic with exponential backoff:
  ```typescript
  async function generateWithRetry(
    messages: any[],
    retries = 3
  ): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await openai.chat.completions.create({...});
        return response.choices[0].message.content || '';
      } catch (error: any) {
        if (i === retries - 1) throw error;
        if (error.status === 429) {
          // Rate limit - wait longer
          await sleep(5000 * Math.pow(2, i));
        } else {
          await sleep(1000 * Math.pow(2, i));
        }
      }
    }
    throw new Error('Failed after retries');
  }
  ```

### 4.1.7 Add Token Counting (Optional)
- [ ] Track token usage:
  ```typescript
  const tokenUsage = response.usage;
  console.log(`Tokens used: ${tokenUsage?.total_tokens}`);
  ```
- [ ] Return metadata with token counts

### 4.1.8 Test Generation Function
- [ ] Create test script: `scripts/test-generation.ts`
- [ ] Load sample chunks from retrieval test
- [ ] Generate response for test query
- [ ] Verify response quality:
  - [ ] Appropriate coaching tone
  - [ ] References PLC framework
  - [ ] Includes citations
  - [ ] Actionable guidance

### 4.1.9 Commit Generation Module
- [ ] Stage file: `git add app/lib/rag/generation.ts`
- [ ] Commit: `git commit -m "Add LLM response generation module with GPT-4o"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Generation module created
- [ ] System prompt implemented
- [ ] Context formatting working
- [ ] GPT-4o responding correctly
- [ ] Error handling robust
- [ ] Test response quality verified

---

## Task 4.2: Citation Extraction Module

### 4.2.1 Create Citations Module
- [ ] Create file: `app/lib/rag/citations.ts`
- [ ] Add imports:
  ```typescript
  import { Citation } from '@/types';
  import { RetrievalResult } from './types';
  ```

### 4.2.2 Define Citation Patterns
- [ ] Define regex patterns for citation extraction:
  ```typescript
  const CITATION_PATTERNS = [
    /\[Source: ([^\]]+)\]/g,  // [Source: Book, Chapter]
    /\(Source: ([^\)]+)\)/g,  // (Source: Book, Chapter)
  ];
  ```

### 4.2.3 Implement Citation Extraction
- [ ] Create extraction function:
  ```typescript
  export function extractCitations(
    response: string,
    retrievedChunks: RetrievalResult[]
  ): { content: string; citations: Citation[] } {
    const citations: Citation[] = [];
    const seenSources = new Set<string>();

    // Try each pattern
    for (const pattern of CITATION_PATTERNS) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        const citationText = match[1];

        // Find matching chunk
        const matchingChunk = retrievedChunks.find(chunk =>
          citationText.toLowerCase().includes(
            chunk.metadata.sourceDocument.toLowerCase()
          )
        );

        if (matchingChunk && !seenSources.has(matchingChunk.id)) {
          citations.push({
            id: crypto.randomUUID(),
            sourceDocument: matchingChunk.metadata.sourceDocument,
            author: matchingChunk.metadata.author || 'Unknown',
            chapterOrSection: matchingChunk.metadata.section,
            pageNumber: matchingChunk.metadata.pageNumber,
            relevanceScore: matchingChunk.score,
          });
          seenSources.add(matchingChunk.id);
        }
      }
    }

    return { content: response, citations };
  }
  ```

### 4.2.4 Add Fallback Citation Logic
- [ ] If no citations found in text, add top retrieval results:
  ```typescript
  // If no citations found, add top 2 retrieved sources
  if (citations.length === 0 && retrievedChunks.length > 0) {
    const topChunks = retrievedChunks.slice(0, 2);
    topChunks.forEach(chunk => {
      citations.push({
        id: crypto.randomUUID(),
        sourceDocument: chunk.metadata.sourceDocument,
        author: chunk.metadata.author || 'Unknown',
        chapterOrSection: chunk.metadata.section,
        pageNumber: chunk.metadata.pageNumber,
        relevanceScore: chunk.score,
      });
    });
  }
  ```

### 4.2.5 Implement Citation Formatting
- [ ] Create function to format citations for display:
  ```typescript
  export function formatCitation(citation: Citation): string {
    let formatted = citation.sourceDocument;

    if (citation.author) {
      formatted += ` by ${citation.author}`;
    }

    if (citation.chapterOrSection) {
      formatted += `, ${citation.chapterOrSection}`;
    }

    if (citation.pageNumber) {
      formatted += `, p. ${citation.pageNumber}`;
    }

    return formatted;
  }
  ```

### 4.2.6 Add Citation Deduplication
- [ ] Ensure no duplicate citations:
  ```typescript
  function deduplicateCitations(citations: Citation[]): Citation[] {
    const seen = new Map<string, Citation>();

    for (const citation of citations) {
      const key = `${citation.sourceDocument}-${citation.chapterOrSection}`;
      if (!seen.has(key)) {
        seen.set(key, citation);
      }
    }

    return Array.from(seen.values());
  }
  ```

### 4.2.7 Test Citation Extraction
- [ ] Create test with sample response containing citations
- [ ] Verify citations are extracted correctly
- [ ] Test fallback when no explicit citations
- [ ] Verify deduplication works

### 4.2.8 Commit Citations Module
- [ ] Stage file: `git add app/lib/rag/citations.ts`
- [ ] Commit: `git commit -m "Add citation extraction and formatting module"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Citation extraction working
- [ ] Matches citations to source chunks
- [ ] Handles multiple citation formats
- [ ] Fallback logic for missing citations
- [ ] Deduplication working

---

## Task 4.3: Conversation Manager

### 4.3.1 Create Conversation Manager File
- [ ] Create file: `app/lib/conversation/manager.ts`
- [ ] Add imports:
  ```typescript
  import { sql } from '@vercel/postgres';
  import { Message, Conversation } from '@/types';
  ```

### 4.3.2 Create ConversationManager Class
- [ ] Implement class structure:
  ```typescript
  export class ConversationManager {
    async getContext(sessionId: string) {
      // Implementation
    }

    async addMessage(sessionId: string, message: Message) {
      // Implementation
    }

    async updateConversation(sessionId: string, updates: Partial<Conversation>) {
      // Implementation
    }
  }
  ```

### 4.3.3 Implement getContext Method
- [ ] Fetch conversation and recent messages:
  ```typescript
  async getContext(sessionId: string) {
    try {
      // Get conversation
      const conversationResult = await sql`
        SELECT * FROM conversations
        WHERE id = ${sessionId}
      `;

      if (conversationResult.rows.length === 0) {
        throw new Error('Conversation not found');
      }

      // Get recent messages (last 10)
      const messagesResult = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${sessionId}
        ORDER BY created_at DESC
        LIMIT 10
      `;

      // Reverse to get chronological order
      const messages = messagesResult.rows.reverse().map(row => ({
        id: row.id,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        timestamp: new Date(row.created_at),
        citations: row.citations || [],
        metadata: row.metadata || {},
      }));

      return {
        conversation: conversationResult.rows[0],
        recentMessages: messages,
      };
    } catch (error) {
      console.error('Error getting context:', error);
      throw error;
    }
  }
  ```

### 4.3.4 Implement addMessage Method
- [ ] Save message to database:
  ```typescript
  async addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) {
    try {
      const messageId = crypto.randomUUID();

      await sql`
        INSERT INTO messages (
          id,
          conversation_id,
          role,
          content,
          citations,
          metadata
        ) VALUES (
          ${messageId},
          ${sessionId},
          ${message.role},
          ${message.content},
          ${JSON.stringify(message.citations || [])},
          ${JSON.stringify(message.metadata || {})}
        )
      `;

      // Update conversation last_active_at and message_count
      await sql`
        UPDATE conversations
        SET
          last_active_at = NOW(),
          message_count = message_count + 1
        WHERE id = ${sessionId}
      `;

      return messageId;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
  ```

### 4.3.5 Implement updateConversation Method
- [ ] Update conversation metadata:
  ```typescript
  async updateConversation(
    sessionId: string,
    updates: { summary?: string }
  ) {
    try {
      if (updates.summary) {
        await sql`
          UPDATE conversations
          SET summary = ${updates.summary}
          WHERE id = ${sessionId}
        `;
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }
  ```

### 4.3.6 Add Message Summarization (Optional)
- [ ] Create method to summarize long conversations:
  ```typescript
  async summarizeIfNeeded(sessionId: string) {
    const messageCountResult = await sql`
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id = ${sessionId}
    `;

    const count = parseInt(messageCountResult.rows[0].count);

    if (count > 20) {
      // TODO: Generate summary using LLM
      // For now, skip
      console.log('Conversation has', count, 'messages - consider summarizing');
    }
  }
  ```

### 4.3.7 Add Error Handling
- [ ] Wrap all database operations in try-catch
- [ ] Handle connection errors
- [ ] Validate session IDs
- [ ] Check for SQL injection (using parameterized queries)

### 4.3.8 Test Conversation Manager
- [ ] Create test script: `scripts/test-conversation-manager.ts`
- [ ] Create test session
- [ ] Add test messages
- [ ] Fetch context
- [ ] Verify database persistence
- [ ] Check message ordering

### 4.3.9 Commit Conversation Manager
- [ ] Stage files: `git add app/lib/conversation/`
- [ ] Commit: `git commit -m "Add conversation manager for database operations"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Conversation manager created
- [ ] Fetches conversation context
- [ ] Saves messages to database
- [ ] Updates conversation metadata
- [ ] Error handling robust

---

## Task 4.4: /api/chat Endpoint

### 4.4.1 Update Chat Route File
- [ ] Open `app/api/chat/route.ts`
- [ ] Add imports:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { ragPipeline } from '@/lib/rag/orchestrator';
  import { generateResponse } from '@/lib/rag/generation';
  import { extractCitations } from '@/lib/rag/citations';
  import { ConversationManager } from '@/lib/conversation/manager';
  import { ChatRequest, ChatResponse, ErrorResponse } from '@/types';
  ```

### 4.4.2 Implement Request Validation
- [ ] Create validation function:
  ```typescript
  function validateChatRequest(body: any): body is ChatRequest {
    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return false;
    }
    if (!body.message || typeof body.message !== 'string') {
      return false;
    }
    if (body.message.length > 2000) {
      return false;
    }
    return true;
  }
  ```

### 4.4.3 Implement Main POST Handler
- [ ] Create POST handler:
  ```typescript
  export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
      // 1. Parse and validate request
      const body = await req.json();

      if (!validateChatRequest(body)) {
        return NextResponse.json(
          {
            error: 'INVALID_REQUEST',
            message: 'Missing or invalid sessionId or message',
            timestamp: new Date().toISOString(),
          } as ErrorResponse,
          { status: 400 }
        );
      }

      const { sessionId, message } = body;

      // 2. Get conversation context
      const conversationManager = new ConversationManager();
      const { recentMessages } = await conversationManager.getContext(sessionId);

      // 3. Save user message
      await conversationManager.addMessage(sessionId, {
        role: 'user',
        content: message,
      });

      // 4. Run RAG pipeline
      const { retrievedChunks } = await ragPipeline(
        message,
        recentMessages
      );

      // 5. Generate response
      const responseText = await generateResponse({
        userQuery: message,
        retrievedChunks,
        conversationHistory: recentMessages,
      });

      // 6. Extract citations
      const { content, citations } = extractCitations(
        responseText,
        retrievedChunks
      );

      const responseTime = Date.now() - startTime;

      // 7. Save assistant message
      const messageId = await conversationManager.addMessage(sessionId, {
        role: 'assistant',
        content,
        citations,
        metadata: {
          modelUsed: 'gpt-4o',
          responseTime,
          retrievedChunks: retrievedChunks.length,
          tokensUsed: 0, // TODO: Add token counting
        },
      });

      // 8. Return response
      const response: ChatResponse = {
        messageId,
        role: 'assistant',
        content,
        citations,
        metadata: {
          modelUsed: 'gpt-4o',
          responseTime,
          retrievedChunks: retrievedChunks.length,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json(response);

    } catch (error: any) {
      console.error('Chat API error:', error);

      const responseTime = Date.now() - startTime;

      return NextResponse.json(
        {
          error: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to generate response',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 500 }
      );
    }
  }
  ```

### 4.4.4 Add Rate Limiting (Optional)
- [ ] Install rate limiter: `npm install express-rate-limit`
- [ ] Or implement simple in-memory rate limiting
- [ ] Limit: 10 requests per minute per session
- [ ] Return 429 status if exceeded

### 4.4.5 Add Request Logging
- [ ] Log each request:
  ```typescript
  console.log('[Chat API] Request:', {
    sessionId,
    messageLength: message.length,
    timestamp: new Date().toISOString(),
  });
  ```
- [ ] Log response metadata:
  ```typescript
  console.log('[Chat API] Response:', {
    sessionId,
    responseTime,
    citationsCount: citations.length,
    chunksRetrieved: retrievedChunks.length,
  });
  ```

### 4.4.6 Test /api/chat Locally
- [ ] Start dev server: `npm run dev`
- [ ] Create test session first (via /api/sessions)
- [ ] Test with curl:
  ```bash
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "SESSION_ID",
      "message": "How do we analyze CFA data?"
    }'
  ```
- [ ] Verify response structure
- [ ] Check citations are included
- [ ] Verify message saved to database

### 4.4.7 Test Error Cases
- [ ] Test missing sessionId
- [ ] Test missing message
- [ ] Test message > 2000 characters
- [ ] Test invalid session ID
- [ ] Verify appropriate error responses

### 4.4.8 Commit Chat Endpoint
- [ ] Stage file: `git add app/api/chat/route.ts`
- [ ] Commit: `git commit -m "Implement /api/chat endpoint with RAG integration"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] /api/chat endpoint implemented
- [ ] Request validation working
- [ ] RAG pipeline integrated
- [ ] Response generation working
- [ ] Citations extracted
- [ ] Messages saved to database
- [ ] Error handling comprehensive
- [ ] Local testing successful

---

## Task 4.5: Session Management API

### 4.5.1 Update POST /api/sessions Route
- [ ] Open `app/api/sessions/route.ts`
- [ ] Replace placeholder with full implementation:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { sql } from '@vercel/postgres';

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const userId = body.userId || 'anonymous';

      const sessionId = crypto.randomUUID();

      await sql`
        INSERT INTO conversations (id, user_id)
        VALUES (${sessionId}, ${userId})
      `;

      return NextResponse.json({
        sessionId,
        userId,
        startedAt: new Date().toISOString(),
        messageCount: 0,
      });

    } catch (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
  }
  ```

### 4.5.2 Implement GET /api/sessions Route
- [ ] Add GET handler for listing sessions:
  ```typescript
  export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId') || 'anonymous';

      const result = await sql`
        SELECT * FROM conversations
        WHERE user_id = ${userId}
        ORDER BY last_active_at DESC
        LIMIT 20
      `;

      return NextResponse.json({
        sessions: result.rows,
      });

    } catch (error) {
      console.error('Session list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }
  }
  ```

### 4.5.3 Update GET /api/sessions/[id] Route
- [ ] Open `app/api/sessions/[id]/route.ts`
- [ ] Replace placeholder with full implementation:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { sql } from '@vercel/postgres';

  export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;

      // Get conversation
      const conversationResult = await sql`
        SELECT * FROM conversations
        WHERE id = ${id}
      `;

      if (conversationResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // Get all messages
      const messagesResult = await sql`
        SELECT * FROM messages
        WHERE conversation_id = ${id}
        ORDER BY created_at ASC
      `;

      return NextResponse.json({
        session: conversationResult.rows[0],
        messages: messagesResult.rows,
      });

    } catch (error) {
      console.error('Session fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }
  }
  ```

### 4.5.4 Add DELETE /api/sessions/[id] Route (Optional)
- [ ] Add DELETE handler:
  ```typescript
  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const { id } = params;

      // Messages will cascade delete due to FK constraint
      await sql`
        DELETE FROM conversations
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Session delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }
  }
  ```

### 4.5.5 Test Session Endpoints
- [ ] Test POST /api/sessions:
  ```bash
  curl -X POST http://localhost:3000/api/sessions \
    -H "Content-Type: application/json" \
    -d '{"userId": "test-user"}'
  ```
- [ ] Save returned sessionId
- [ ] Test GET /api/sessions:
  ```bash
  curl "http://localhost:3000/api/sessions?userId=test-user"
  ```
- [ ] Test GET /api/sessions/[id]:
  ```bash
  curl http://localhost:3000/api/sessions/SESSION_ID
  ```
- [ ] Test DELETE /api/sessions/[id] (if implemented)

### 4.5.6 Commit Session Management API
- [ ] Stage files: `git add app/api/sessions/`
- [ ] Commit: `git commit -m "Implement session management API endpoints"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] POST /api/sessions creates new session
- [ ] GET /api/sessions lists user sessions
- [ ] GET /api/sessions/[id] retrieves session with messages
- [ ] DELETE /api/sessions/[id] removes session (optional)
- [ ] All endpoints tested successfully
- [ ] Error handling for invalid IDs

---

## Task 4.6: End-to-End API Testing

### 4.6.1 Create E2E Test Script
- [ ] Create file: `scripts/test-api-e2e.ts`
- [ ] Add complete flow test:
  ```typescript
  async function testCompleteFlow() {
    console.log('=== End-to-End API Test ===\n');

    // 1. Create session
    console.log('1. Creating session...');
    const sessionResponse = await fetch('http://localhost:3000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user' }),
    });
    const session = await sessionResponse.json();
    console.log('   Session created:', session.sessionId);

    // 2. Send first message
    console.log('\n2. Sending first message...');
    const message1Response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        message: 'How do we identify essential standards?',
      }),
    });
    const response1 = await message1Response.json();
    console.log('   Response received (', response1.content.length, 'chars)');
    console.log('   Citations:', response1.citations.length);
    console.log('   Response time:', response1.metadata.responseTime, 'ms');

    // 3. Send follow-up message
    console.log('\n3. Sending follow-up message...');
    const message2Response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.sessionId,
        message: 'Can you give me an example for 5th grade math?',
      }),
    });
    const response2 = await message2Response.json();
    console.log('   Response received (', response2.content.length, 'chars)');

    // 4. Retrieve session
    console.log('\n4. Retrieving full session...');
    const sessionDataResponse = await fetch(
      `http://localhost:3000/api/sessions/${session.sessionId}`
    );
    const sessionData = await sessionDataResponse.json();
    console.log('   Messages in session:', sessionData.messages.length);

    console.log('\n=== Test Complete ===');
  }

  testCompleteFlow().catch(console.error);
  ```

### 4.6.2 Create Multiple Query Test
- [ ] Test with diverse queries:
  ```typescript
  const testQueries = [
    'How do we analyze CFA data?',
    'What interventions work for struggling students?',
    'How do we identify essential standards?',
    'What is the difference between Tier 2 and Tier 3?',
    'How do we build collaborative culture in our team?',
  ];

  for (const query of testQueries) {
    const response = await sendChatMessage(sessionId, query);
    console.log(`\nQuery: ${query}`);
    console.log(`Response time: ${response.metadata.responseTime}ms`);
    console.log(`Citations: ${response.citations.length}`);
    console.log(`First 100 chars: ${response.content.substring(0, 100)}...`);
  }
  ```

### 4.6.3 Test Performance Benchmarks
- [ ] Measure response times:
  ```typescript
  const times: number[] = [];

  for (let i = 0; i < 10; i++) {
    const start = Date.now();
    await sendChatMessage(sessionId, testQueries[i % testQueries.length]);
    const duration = Date.now() - start;
    times.push(duration);
  }

  times.sort((a, b) => a - b);
  console.log('\nPerformance Metrics:');
  console.log('  Average:', times.reduce((a, b) => a + b) / times.length, 'ms');
  console.log('  p50:', times[Math.floor(times.length * 0.5)], 'ms');
  console.log('  p95:', times[Math.floor(times.length * 0.95)], 'ms');
  console.log('  p99:', times[Math.floor(times.length * 0.99)], 'ms');
  ```

### 4.6.4 Test Error Handling
- [ ] Test invalid requests:
  ```typescript
  // Test missing sessionId
  await testInvalidRequest({});

  // Test missing message
  await testInvalidRequest({ sessionId: 'test' });

  // Test long message
  await testInvalidRequest({
    sessionId: 'test',
    message: 'x'.repeat(2001),
  });

  // Test invalid session ID
  await testInvalidRequest({
    sessionId: 'nonexistent-id',
    message: 'test',
  });
  ```

### 4.6.5 Run All E2E Tests
- [ ] Start dev server: `npm run dev`
- [ ] Run test: `npx tsx scripts/test-api-e2e.ts`
- [ ] Verify all tests pass
- [ ] Check response times meet targets (<3s p95)
- [ ] Verify citations always present

### 4.6.6 Document Test Results
- [ ] Create: `Docs/API_Test_Results.md`
- [ ] Include:
  - [ ] Test scenarios executed
  - [ ] Pass/fail status
  - [ ] Performance metrics
  - [ ] Sample request/response pairs
  - [ ] Error handling verification

### 4.6.7 Commit Test Scripts
- [ ] Stage files: `git add scripts/test-api-e2e.ts Docs/API_Test_Results.md`
- [ ] Commit: `git commit -m "Add end-to-end API tests and results"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] E2E test script created
- [ ] Complete flow tested (session → chat → retrieve)
- [ ] Multiple queries tested successfully
- [ ] Performance benchmarks measured
- [ ] Error handling verified
- [ ] All tests pass

---

## Task 4.7: Deploy and Test on Vercel

### 4.7.1 Commit All Changes
- [ ] Review all uncommitted changes: `git status`
- [ ] Stage remaining files: `git add .`
- [ ] Create comprehensive commit:
  ```bash
  git commit -m "Complete Phase 4: Backend API with RAG integration

  - Implement LLM response generation with GPT-4o
  - Add citation extraction and formatting
  - Create conversation manager for database operations
  - Implement /api/chat endpoint
  - Complete session management API
  - Add end-to-end testing
  "
  ```
- [ ] Push: `git push origin main`

### 4.7.2 Monitor Vercel Deployment
- [ ] Wait for auto-deployment to trigger
- [ ] Open Vercel dashboard
- [ ] Monitor build logs
- [ ] Verify deployment succeeds
- [ ] Check for any build warnings

### 4.7.3 Verify Environment Variables
- [ ] In Vercel dashboard, go to Settings → Environment Variables
- [ ] Verify all required variables are set:
  - [ ] OPENAI_API_KEY
  - [ ] PINECONE_API_KEY
  - [ ] PINECONE_ENVIRONMENT
  - [ ] POSTGRES_URL
  - [ ] POSTGRES_PRISMA_URL
  - [ ] POSTGRES_URL_NON_POOLING

### 4.7.4 Test Production Endpoints
- [ ] Get production URL from Vercel
- [ ] Test health check:
  ```bash
  curl https://your-app.vercel.app/api/health
  ```
- [ ] Test session creation:
  ```bash
  curl -X POST https://your-app.vercel.app/api/sessions \
    -H "Content-Type: application/json" \
    -d '{"userId": "production-test"}'
  ```
- [ ] Test chat endpoint with real query
- [ ] Verify response quality

### 4.7.5 Test Production Performance
- [ ] Send 5-10 test queries to production
- [ ] Measure response times
- [ ] Verify all responses include citations
- [ ] Check that responses are high quality

### 4.7.6 Check Production Logs
- [ ] In Vercel dashboard, go to Logs
- [ ] Review recent logs
- [ ] Check for any errors
- [ ] Verify requests are being logged properly

### 4.7.7 Update API Documentation
- [ ] Update `Docs/API_REFERENCE.md` with complete examples:
  ```markdown
  # API Reference

  ## Base URL
  - Development: http://localhost:3000
  - Production: https://your-app.vercel.app

  ## Endpoints

  ### Health Check
  **GET** `/api/health`

  Returns system status.

  **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "phase": "Phase 4 Complete"
  }
  ```

  ### Create Session
  **POST** `/api/sessions`

  **Request:**
  ```json
  {
    "userId": "user-123"
  }
  ```

  **Response:**
  ```json
  {
    "sessionId": "uuid",
    "userId": "user-123",
    "startedAt": "2024-01-01T00:00:00.000Z",
    "messageCount": 0
  }
  ```

  ### Send Chat Message
  **POST** `/api/chat`

  **Request:**
  ```json
  {
    "sessionId": "uuid",
    "message": "How do we analyze CFA data?"
  }
  ```

  **Response:**
  ```json
  {
    "messageId": "uuid",
    "role": "assistant",
    "content": "...",
    "citations": [...],
    "metadata": {
      "modelUsed": "gpt-4o",
      "responseTime": 2500,
      "retrievedChunks": 5
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

  [... continue with all endpoints ...]
  ```

### 4.7.8 Commit Documentation Updates
- [ ] Stage: `git add Docs/API_REFERENCE.md`
- [ ] Commit: `git commit -m "Update API documentation with complete examples"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] All changes committed and pushed
- [ ] Vercel deployment successful
- [ ] Production endpoints tested
- [ ] Response times acceptable
- [ ] Citations working in production
- [ ] Documentation updated

---

## Task 4.8: Final Phase 4 Verification

### 4.8.1 Verify All API Endpoints
- [ ] Test health check
- [ ] Test POST /api/sessions
- [ ] Test GET /api/sessions
- [ ] Test GET /api/sessions/[id]
- [ ] Test POST /api/chat
- [ ] All return expected responses

### 4.8.2 Verify RAG Pipeline Integration
- [ ] Send test query
- [ ] Verify retrieval happens (check logs)
- [ ] Verify response generation
- [ ] Verify citations extracted
- [ ] Verify context included

### 4.8.3 Verify Database Operations
- [ ] Create session → check database
- [ ] Send message → check messages table
- [ ] Verify conversation updated
- [ ] Check message ordering
- [ ] Verify JSON fields stored correctly

### 4.8.4 Verify Response Quality
- [ ] Send 10 diverse queries
- [ ] Evaluate responses:
  - [ ] Appropriate coaching tone
  - [ ] Framework-grounded advice
  - [ ] Citations present
  - [ ] Actionable guidance
  - [ ] No generic AI responses

### 4.8.5 Performance Validation
- [ ] Measure p95 response time
- [ ] Should be < 3 seconds
- [ ] If slower, identify bottleneck:
  - [ ] Retrieval time
  - [ ] LLM generation time
  - [ ] Database operations

### 4.8.6 Create Phase 4 Summary
- [ ] Create: `Docs/Phase_Summaries/Phase_4_Summary.md`
- [ ] Include:
  ```markdown
  # Phase 4 Summary

  **Completion Date:** [Date]
  **Duration:** [Hours/Days]

  ## Completed Tasks
  - LLM response generation with GPT-4o
  - Citation extraction module
  - Conversation manager
  - /api/chat endpoint
  - Session management API
  - End-to-end testing

  ## Deliverables
  - Working chat API
  - Session management system
  - Generation and citation modules
  - Test results

  ## Metrics
  - Average response time: [ms]
  - p95 response time: [ms]
  - Citation accuracy: 100%
  - Response quality: [rating]

  ## Issues Encountered
  - [List any issues and resolutions]

  ## Next Steps
  - Phase 5: Frontend UI Development
  - Build React components for chat interface
  ```

### 4.8.7 Review Code Quality
- [ ] Run type check: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Fix any warnings
- [ ] Check for console.logs to remove/improve
- [ ] Verify error handling is comprehensive

### 4.8.8 Update Project Documentation
- [ ] Update main README.md
- [ ] Update implementation phases status
- [ ] Update project timeline
- [ ] Document any architectural decisions

### 4.8.9 Final Commit and Push
- [ ] Stage all: `git add .`
- [ ] Commit: `git commit -m "Complete Phase 4 verification and documentation"`
- [ ] Push: `git push origin main`

### 4.8.10 Mark Phase 4 Complete
- [ ] Update this file status to 🟢 Complete
- [ ] Update main implementation phases README
- [ ] Celebrate completion!
- [ ] Ready to begin Phase 5

**Completion Criteria:**
- [ ] All API endpoints working
- [ ] RAG pipeline fully integrated
- [ ] Citations working 100% of time
- [ ] Response times < 3s (p95)
- [ ] Database operations stable
- [ ] Code quality high
- [ ] Documentation complete
- [ ] Production deployment stable

---

## Phase 4 Completion

**Status:** ⬜ Not Started → 🟢 Complete

**Completion Date:** _______________

**Total Time Spent:** _____ hours/days

**Performance Metrics:**
- Average Response Time: _____ms
- p50 Response Time: _____ms
- p95 Response Time: _____ms
- p99 Response Time: _____ms

**Quality Metrics:**
- Response Accuracy: _____%
- Citation Accuracy: 100%
- Queries Tested: _____

**Notes:**
-

**Blockers Encountered:**
-

**Lessons Learned:**
-

**Ready for Phase 5:** [ ] Yes / [ ] No

---

## Quick Reference

### Key Files
```
app/lib/rag/generation.ts      # LLM response generation
app/lib/rag/citations.ts       # Citation extraction
app/lib/conversation/manager.ts # Database operations
app/api/chat/route.ts          # Main chat endpoint
app/api/sessions/route.ts      # Session management
```

### Key Commands
```bash
npm run dev                          # Start development server
npm run type-check                   # Check TypeScript
npx tsx scripts/test-api-e2e.ts     # Run API tests
curl localhost:3000/api/health       # Test health endpoint
```

### API Endpoints
- POST /api/sessions - Create session
- GET /api/sessions - List sessions
- GET /api/sessions/[id] - Get session
- POST /api/chat - Send message
- GET /api/health - Health check

### Performance Targets
- Response time (p95): <3 seconds
- Citation accuracy: 100%
- Response relevance: High

### Next Steps
→ Proceed to Phase 5: Frontend UI Development
