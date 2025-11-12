# AI-Powered PLC Virtual Coach: System Architecture

**Version:** 1.0
**Date:** November 11, 2025
**Document Owner:** Engineering Team

---

## Table of Contents

1. [Overall System Architecture](#1-overall-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Phase-Specific Architecture](#3-phase-specific-architecture)
4. [Data Flow & Processing](#4-data-flow--processing)
5. [Component Specifications](#5-component-specifications)
6. [Security & Performance](#6-security--performance)

---

## 1. Overall System Architecture

### 1.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Web Browser (Any Device)                   │  │
│  │                                                               │  │
│  │  • Desktop: Chrome, Safari, Firefox, Edge                   │  │
│  │  • Mobile: iOS Safari, Android Chrome                       │  │
│  │  • Tablet: iPad, Android tablets                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTPS / WebSocket
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                            │
│                   (Global CDN + Edge Functions)                     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION LAYER                               │
│                  Next.js 14 (App Router + API Routes)               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React 18)                        │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Chat Interface Components:                            │  │  │
│  │  │  • ChatContainer    • MessageBubble                    │  │  │
│  │  │  • MessageList      • CitationPill                     │  │  │
│  │  │  • ChatInput        • TypingIndicator                  │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                    │
│                                │                                    │
│  ┌──────────────────────────────▼───────────────────────────────┐  │
│  │                    BACKEND (API Routes)                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  API Endpoints:                                        │  │  │
│  │  │  • POST   /api/chat       (Main coaching endpoint)    │  │  │
│  │  │  • POST   /api/sessions   (Create session)            │  │  │
│  │  │  • GET    /api/sessions/[id] (Get history)            │  │  │
│  │  │  • POST   /api/feedback   (Submit rating)             │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Business Logic:                                       │  │  │
│  │  │  • RAG Orchestrator    • Citation Extractor           │  │  │
│  │  │  • Context Manager     • Response Validator           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
         │                      │                      │
┌────────▼────────┐  ┌──────────▼──────────┐  ┌──────▼──────────┐
│   PINECONE      │  │    OPENAI API       │  │ VERCEL POSTGRES │
│  Vector Store   │  │                     │  │   Database      │
│                 │  │  • GPT-4o (Chat)    │  │                 │
│  • Index:       │  │  • text-embedding   │  │  Tables:        │
│    plc-coach    │  │    -3-large         │  │  • conversations│
│    -demo        │  │    (Embeddings)     │  │  • messages     │
│  • Dimension:   │  │                     │  │  • feedback     │
│    3072         │  │  Response time:     │  │                 │
│  • Metric:      │  │  ~1-2s avg          │  │  Connection:    │
│    cosine       │  │                     │  │  Pooled         │
│  • Vectors:     │  │                     │  │                 │
│    ~2,500       │  │                     │  │                 │
│                 │  │                     │  │                 │
│  Retrieval:     │  │                     │  │                 │
│  <200ms         │  │                     │  │                 │
└─────────────────┘  └─────────────────────┘  └─────────────────┘
```

### 1.2 System Architecture Layers

#### **Layer 1: Client Layer**
- **Technology:** Modern web browsers
- **Responsibility:** User interface rendering, user interaction, local state management
- **Communication:** HTTPS requests to API routes

#### **Layer 2: Edge Network**
- **Technology:** Vercel Edge Network (Cloudflare-powered)
- **Responsibility:** CDN caching, DDoS protection, SSL termination, geographic routing
- **Benefit:** Low latency worldwide, automatic scaling

#### **Layer 3: Application Layer**
- **Technology:** Next.js 14 (React 18 + Node.js serverless functions)
- **Components:**
  - **Frontend:** React components with Tailwind CSS
  - **Backend:** API Routes (serverless functions)
  - **Business Logic:** RAG pipeline, conversation management
- **Deployment:** Serverless on Vercel

#### **Layer 4: External Services**
- **Pinecone:** Vector database for semantic search
- **OpenAI:** LLM (GPT-4o) + Embeddings (text-embedding-3-large)
- **Vercel Postgres:** Relational database for conversations and metadata

---

## 2. Technology Stack

### 2.1 Complete Technology Matrix

| Category | Technology | Version | Purpose | Why Chosen |
|----------|-----------|---------|---------|------------|
| **Frontend Framework** | Next.js | 14.x | Full-stack React framework | Server components, App Router, API routes in one package |
| **UI Library** | React | 18.x | Component-based UI | Industry standard, great ecosystem |
| **Language** | TypeScript | 5.x | Type-safe JavaScript | Catch errors early, better DX |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS | Rapid development, consistent design |
| **UI Components** | shadcn/ui | Latest | Pre-built components | Beautiful, accessible, customizable |
| **LLM** | OpenAI GPT-4o | Latest | Response generation | Best reasoning, instruction following |
| **Embeddings** | text-embedding-3-large | Latest | Vector representations | 3072 dimensions, high quality |
| **Vector DB** | Pinecone | Serverless | Semantic search | Managed, fast, free tier sufficient |
| **Database** | Vercel Postgres | Latest | Conversation storage | Serverless, auto-scaling, Vercel integration |
| **RAG Framework** | LangChain.js | 0.1.x | RAG orchestration | Mature library, OpenAI integration |
| **Deployment** | Vercel | Latest | Hosting + CI/CD | Seamless Next.js deployment, edge functions |
| **Version Control** | Git + GitHub | Latest | Source control | Standard, CI/CD integration |

### 2.2 Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Jest** | Unit testing |
| **k6** | Load testing |
| **tsx** | TypeScript execution for scripts |

---

## 3. Phase-Specific Architecture

### Phase 0-1: Foundation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1: FOUNDATION                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Next.js 14 Application (Empty)              │   │
│  │                                                     │   │
│  │  • app/page.tsx (Hello World)                      │   │
│  │  • app/layout.tsx (Root layout)                    │   │
│  │  • Tailwind CSS configured                         │   │
│  │  • Environment variables set up                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Vercel Postgres Database                 │   │
│  │                                                     │   │
│  │  Tables Created:                                   │   │
│  │  • conversations (id, user_id, started_at, etc.)  │   │
│  │  • messages (id, conversation_id, role, content)  │   │
│  │  • feedback (id, message_id, rating)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Deliverable: Working Next.js app deployed to Vercel       │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**
- Empty Next.js application
- Database schema created
- Type definitions established
- Vercel deployment pipeline working

---

### Phase 2: Knowledge Base Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                PHASE 2: KNOWLEDGE BASE                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Knowledge Base (Local Files)               │   │
│  │                                                     │   │
│  │  scripts/knowledge_base/                           │   │
│  │  ├── 01_core_framework/       (10 docs)           │   │
│  │  ├── 02_research_papers/      (15 docs)           │   │
│  │  ├── 03_coaching_scenarios/   (15 docs)           │   │
│  │  ├── 04_assessment_resources/ (15 docs)           │   │
│  │  ├── 05_implementation_guides/ (10 docs)          │   │
│  │  ├── 06_case_studies/         (5 docs)            │   │
│  │  └── 07_data_examples/        (mock CSVs)         │   │
│  │                                                     │   │
│  │  Total: 50-70 documents                           │   │
│  │  Format: Markdown with YAML frontmatter           │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           │ Ready for Phase 3               │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Document Metadata Structure                 │   │
│  │                                                     │   │
│  │  ---                                               │   │
│  │  title: "Document Title"                           │   │
│  │  author: "Author Name"                             │   │
│  │  type: "core_framework"                            │   │
│  │  critical_question: 2                              │   │
│  │  topics: ["data", "assessment"]                    │   │
│  │  ---                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Deliverable: 50+ documents with complete metadata         │
└─────────────────────────────────────────────────────────────┘
```

**Key Components:**
- 50-70 documents organized by category
- Complete metadata on each document
- Mix of downloaded and generated content
- Ready for chunking and embedding

---

### Phase 3: RAG Infrastructure Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              PHASE 3: RAG INFRASTRUCTURE                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              INDEXING PIPELINE (Run Once)                  │ │
│  │                                                            │ │
│  │  Step 1: Document Chunking                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  scripts/chunk-documents.ts                          │ │ │
│  │  │                                                      │ │ │
│  │  │  Input: 50 documents (Markdown)                     │ │ │
│  │  │  Process:                                            │ │ │
│  │  │  • Split by paragraphs/sentences                    │ │ │
│  │  │  • Target: 500 tokens per chunk                     │ │ │
│  │  │  • Overlap: 50 tokens                               │ │ │
│  │  │  • Preserve metadata                                 │ │ │
│  │  │                                                      │ │ │
│  │  │  Output: ~2,500 chunks                              │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  Step 2: Embedding Generation                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  scripts/generate-embeddings.ts                      │ │ │
│  │  │                                                      │ │ │
│  │  │  For each chunk:                                     │ │ │
│  │  │  1. Send to OpenAI API                              │ │ │
│  │  │  2. Model: text-embedding-3-large                   │ │ │
│  │  │  3. Get 3072-dim vector                             │ │ │
│  │  │  4. Batch process (100 at a time)                   │ │ │
│  │  │                                                      │ │ │
│  │  │  Cost: ~$2.50 total                                 │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  Step 3: Vector Upload                                    │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  scripts/upload-to-pinecone.ts                       │ │ │
│  │  │                                                      │ │ │
│  │  │  For each embedded chunk:                            │ │ │
│  │  │  1. Format as Pinecone vector                       │ │ │
│  │  │  2. Include metadata                                 │ │ │
│  │  │  3. Batch upload (100 vectors/request)              │ │ │
│  │  │                                                      │ │ │
│  │  │  Result: Index populated                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  PINECONE VECTOR INDEX                     │ │
│  │                                                            │ │
│  │  Name: plc-coach-demo                                     │ │
│  │  Dimension: 3072                                          │ │
│  │  Metric: cosine similarity                                │ │
│  │  Vectors: ~2,500                                          │ │
│  │                                                            │ │
│  │  Each vector contains:                                    │ │
│  │  • id: "lbd-ch5-001"                                      │ │
│  │  • values: [0.123, -0.456, ...] (3072 floats)           │ │
│  │  • metadata:                                              │ │
│  │    - content: "chunk text..."                            │ │
│  │    - sourceDocument: "Learning by Doing"                 │ │
│  │    - author: "DuFour et al."                             │ │
│  │    - section: "Chapter 5"                                │ │
│  │    - criticalQuestion: 3                                 │ │
│  │    - topics: "intervention, systematic"                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              RETRIEVAL SYSTEM (Runtime)                    │ │
│  │                                                            │ │
│  │  app/lib/rag/retrieval.ts                                 │ │
│  │                                                            │ │
│  │  async function retrieveContext(query) {                  │ │
│  │    1. Generate query embedding (OpenAI)                   │ │
│  │    2. Query Pinecone (top-10)                             │ │
│  │    3. Rerank by metadata boost factors                    │ │
│  │    4. Return top-5 chunks                                 │ │
│  │  }                                                         │ │
│  │                                                            │ │
│  │  Performance: <200ms average                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Deliverable: Populated Pinecone index + retrieval system       │
└──────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- Document chunking script
- Embedding generation script
- Pinecone upload script
- Retrieval system module
- Test queries validated

---

### Phase 4: Backend API Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                 PHASE 4: BACKEND API                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              /api/chat (Main Endpoint)                     │ │
│  │                                                            │ │
│  │  POST /api/chat                                           │ │
│  │  Input: { sessionId, message }                            │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Step 1: Get Conversation Context                    │ │ │
│  │  │                                                      │ │ │
│  │  │  • Fetch from Postgres                              │ │ │
│  │  │  • Last 5 messages                                   │ │ │
│  │  │  • Summary (if exists)                               │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Step 2: RAG Pipeline                                │ │ │
│  │  │                                                      │ │ │
│  │  │  app/lib/rag/orchestrator.ts:                       │ │ │
│  │  │                                                      │ │ │
│  │  │  A. Query Enhancement                                │ │ │
│  │  │     • Add conversation context                       │ │ │
│  │  │     • Extract key entities                           │ │ │
│  │  │                                                      │ │ │
│  │  │  B. Retrieval                                        │ │ │
│  │  │     • Generate query embedding (OpenAI)             │ │ │
│  │  │     • Query Pinecone (vector search)                │ │ │
│  │  │     • Rerank results                                 │ │ │
│  │  │     • Return top-5 chunks                            │ │ │
│  │  │                                                      │ │ │
│  │  │  C. Context Assembly                                 │ │ │
│  │  │     • System prompt (persona)                        │ │ │
│  │  │     • Conversation history                           │ │ │
│  │  │     • Retrieved chunks                               │ │ │
│  │  │     • User query                                     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Step 3: LLM Generation                              │ │ │
│  │  │                                                      │ │ │
│  │  │  app/lib/rag/generation.ts:                         │ │ │
│  │  │                                                      │ │ │
│  │  │  • Send to OpenAI GPT-4o                            │ │ │
│  │  │  • Temperature: 0.7                                  │ │ │
│  │  │  • Max tokens: 1000                                  │ │ │
│  │  │  • Response time: ~1-2s                              │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Step 4: Citation Extraction                         │ │ │
│  │  │                                                      │ │ │
│  │  │  app/lib/rag/citations.ts:                          │ │ │
│  │  │                                                      │ │ │
│  │  │  • Parse [Source: ...] patterns                     │ │ │
│  │  │  • Match to retrieved chunks                         │ │ │
│  │  │  • Format citation objects                           │ │ │
│  │  │  • Validate citations                                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Step 5: Save to Database                            │ │ │
│  │  │                                                      │ │ │
│  │  │  • Insert message to Postgres                        │ │ │
│  │  │  • Update conversation last_active_at               │ │ │
│  │  │  • Log metadata                                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                           │                                │ │
│  │                           ▼                                │ │
│  │  Output: { messageId, content, citations, metadata }     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Other API Endpoints                           │ │
│  │                                                            │ │
│  │  POST   /api/sessions          Create new session         │ │
│  │  GET    /api/sessions/[id]     Get conversation history   │ │
│  │  POST   /api/feedback          Submit rating/feedback     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Deliverable: Working chat API with RAG integration             │
└──────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- `/api/chat` endpoint with full RAG pipeline
- Conversation context management
- Citation extraction and validation
- Session management endpoints
- Error handling and logging

---

### Phase 5: Frontend UI Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   PHASE 5: FRONTEND UI                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Component Hierarchy                           │ │
│  │                                                            │ │
│  │  app/page.tsx (Main Page)                                 │ │
│  │    │                                                       │ │
│  │    └─ ChatContainer                                        │ │
│  │         │                                                  │ │
│  │         ├─ Header                                          │ │
│  │         │   ├─ Logo                                        │ │
│  │         │   └─ UserAvatar                                  │ │
│  │         │                                                  │ │
│  │         ├─ MessageList                                     │ │
│  │         │   └─ MessageBubble[] (map over messages)        │ │
│  │         │       ├─ UserMessage                             │ │
│  │         │       │   └─ Text content                        │ │
│  │         │       │                                          │ │
│  │         │       └─ AssistantMessage                        │ │
│  │         │           ├─ Text content                        │ │
│  │         │           ├─ CitationPill[]                      │ │
│  │         │           └─ Timestamp                           │ │
│  │         │                                                  │ │
│  │         ├─ TypingIndicator (conditional)                   │ │
│  │         │                                                  │ │
│  │         └─ ChatInput                                       │ │
│  │             ├─ Textarea (with char counter)                │ │
│  │             └─ SendButton                                  │ │
│  │                                                            │ │
│  │  Modals:                                                   │ │
│  │    └─ CitationModal (opens on citation click)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              State Management                              │ │
│  │                                                            │ │
│  │  ChatContainer.tsx:                                        │ │
│  │                                                            │ │
│  │  const [messages, setMessages] = useState<Message[]>([])  │ │
│  │  const [isLoading, setIsLoading] = useState(false)        │ │
│  │  const [sessionId, setSessionId] = useState<string>()     │ │
│  │                                                            │ │
│  │  Flow:                                                     │ │
│  │  1. User types message                                     │ │
│  │  2. ChatInput calls onSend(message)                       │ │
│  │  3. ChatContainer:                                         │ │
│  │     a. Add user message to state                          │ │
│  │     b. Set isLoading = true                               │ │
│  │     c. POST to /api/chat                                  │ │
│  │     d. Add assistant response to state                    │ │
│  │     e. Set isLoading = false                              │ │
│  │  4. MessageList re-renders with new messages              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Styling (Tailwind + Solution Tree)            │ │
│  │                                                            │ │
│  │  Colors:                                                   │ │
│  │  • Primary Blue: #0066CC (st-blue-primary)                │ │
│  │  • Orange Accent: #FF6B35 (st-orange)                     │ │
│  │  • Green: #28A745 (st-green)                              │ │
│  │  • Gray shades: 50, 100, 300, 700, 900                    │ │
│  │                                                            │ │
│  │  Message Bubbles:                                          │ │
│  │  • User: Blue background, white text, right-aligned       │ │
│  │  • Assistant: White background, bordered, left-aligned    │ │
│  │  • Rounded corners with asymmetric tail                   │ │
│  │                                                            │ │
│  │  Responsive:                                               │ │
│  │  • Mobile: 320px+ (stacked, full width)                   │ │
│  │  • Tablet: 768px+ (sidebar if needed)                     │ │
│  │  • Desktop: 1024px+ (centered, max-width)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Deliverable: Fully functional chat interface with branding     │
└──────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- 7 React components (ChatContainer, MessageList, MessageBubble, ChatInput, TypingIndicator, CitationPill, CitationModal)
- State management with React hooks
- Solution Tree branding applied
- Mobile responsive design

---

## 4. Data Flow & Processing

### 4.1 End-to-End Data Flow (User Query to Response)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

USER: "Our 8th-grade math team scored 40% below proficiency on CFAs.
       What next?"
   │
   │ 1. User types message
   ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatInput Component                                        │
│  • Validates input (max 2000 chars)                        │
│  • Calls onSend(message)                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
   2. Event handler          │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatContainer Component                                    │
│  • Add user message to state (optimistic update)           │
│  • Set isLoading = true (show typing indicator)            │
│  • POST /api/chat { sessionId, message }                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
   3. HTTP POST              │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  /api/chat Route Handler                                    │
│  • Validate request                                         │
│  • Start timer (for response time tracking)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
   4. Get context            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ConversationManager                                        │
│  • Query Postgres:                                          │
│    SELECT * FROM conversations WHERE id = sessionId         │
│    SELECT * FROM messages WHERE conversation_id = sessionId │
│      ORDER BY created_at DESC LIMIT 5                       │
│  • Return: { summary, recentMessages }                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
   5. RAG pipeline           │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  RAG Orchestrator (app/lib/rag/orchestrator.ts)            │
│                                                             │
│  A. Query Enhancement                                       │
│     Input: "Our 8th-grade math team scored 40%..."         │
│     + Recent messages context                               │
│     Output: Enhanced query                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  B. Embedding Generation (OpenAI API)                       │
│     Model: text-embedding-3-large                           │
│     Input: "Our 8th-grade math team scored 40%..."         │
│     Output: [0.123, -0.456, 0.789, ...] (3072 floats)     │
│     Time: ~100ms                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  C. Vector Search (Pinecone)                                │
│     Query: vector + top_k=10 + include_metadata=true        │
│     Returns:                                                │
│     [                                                       │
│       {                                                     │
│         id: "lbd-ch5-003",                                 │
│         score: 0.92,                                        │
│         metadata: {                                         │
│           content: "When teams analyze CFA data...",       │
│           sourceDocument: "Learning by Doing",             │
│           section: "Chapter 5: Critical Question 3",       │
│           criticalQuestion: 3                               │
│         }                                                   │
│       },                                                    │
│       ... (9 more)                                          │
│     ]                                                       │
│     Time: ~150ms                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  D. Reranking                                               │
│     Boost factors:                                          │
│     • critical_question_match: 1.5x (if CQ=3 detected)     │
│     • document_type_core: 1.3x (core texts prioritized)   │
│     • recency: 1.1x (newer content slight boost)           │
│                                                             │
│     Top 5 after reranking:                                  │
│     1. lbd-ch5-003 (score: 0.92 * 1.5 = 1.38)             │
│     2. cca-ch7-012 (score: 0.89)                           │
│     3. rti-guide-004 (score: 0.87)                         │
│     4. case-study-ms-math (score: 0.85)                    │
│     5. lbd-ch5-007 (score: 0.83)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
   6. LLM generation         │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LLM Response Generation (OpenAI GPT-4o)                    │
│                                                             │
│  Context assembly:                                          │
│  • System prompt (Solution Tree persona)                   │
│  • Conversation history (last 5 messages)                  │
│  • Retrieved chunks (top 5, formatted)                     │
│  • User query                                               │
│                                                             │
│  Request:                                                   │
│  {                                                          │
│    model: "gpt-4o",                                        │
│    messages: [                                              │
│      { role: "system", content: SYSTEM_PROMPT },          │
│      { role: "user", content: prevMsg1 },                 │
│      { role: "assistant", content: prevResp1 },           │
│      ...                                                    │
│      { role: "system", content: "Context: [chunks]" },    │
│      { role: "user", content: currentQuery }              │
│    ],                                                       │
│    temperature: 0.7,                                        │
│    max_tokens: 1000                                         │
│  }                                                          │
│                                                             │
│  Response: "That's a common challenge, and it shows..."    │
│            [Source: Learning by Doing, Chapter 5]          │
│  Time: ~1500ms                                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
   7. Citation extraction    │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Citation Extractor (app/lib/rag/citations.ts)             │
│                                                             │
│  • Parse response for [Source: ...] patterns               │
│  • Match to retrieved chunks                                │
│  • Format citation objects:                                 │
│    {                                                        │
│      id: "cite-1",                                         │
│      sourceDocument: "Learning by Doing",                  │
│      author: "DuFour et al.",                              │
│      chapterOrSection: "Chapter 5",                        │
│      relevanceScore: 0.92                                  │
│    }                                                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
   8. Save to database       │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Postgres Insert                                            │
│  INSERT INTO messages (                                     │
│    conversation_id, role, content, citations, metadata     │
│  ) VALUES (                                                 │
│    sessionId, 'assistant', responseText,                   │
│    JSON(citations), JSON(metadata)                         │
│  )                                                          │
│                                                             │
│  UPDATE conversations SET last_active_at = NOW()           │
│  WHERE id = sessionId                                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
   9. HTTP response          │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  API Response to Client                                     │
│  {                                                          │
│    messageId: "msg-123",                                   │
│    role: "assistant",                                      │
│    content: "That's a common challenge...",                │
│    citations: [...],                                        │
│    metadata: {                                              │
│      modelUsed: "gpt-4o",                                  │
│      tokensUsed: 1250,                                     │
│      responseTime: 2340,  // ms                            │
│      retrievedChunks: 5                                    │
│    },                                                       │
│    timestamp: "2025-11-11T14:30:03Z"                       │
│  }                                                          │
│  Status: 200 OK                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
   10. UI update             │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  ChatContainer Component                                    │
│  • Add assistant message to state                          │
│  • Set isLoading = false (hide typing indicator)           │
│  • Auto-scroll to bottom                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
   11. Render               │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  User sees response:                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Coach: That's a common challenge, and it shows the │   │
│  │ power of your team's commitment to Question 2...   │   │
│  │                                                     │   │
│  │ [Source: Learning by Doing, Chapter 5]             │   │
│  │                                                     │   │
│  │ 2:30 PM                                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

TOTAL TIME: ~2.5 seconds (well under 3s target)
```

### 4.2 Performance Budget

| Step | Component | Target Time | Notes |
|------|-----------|-------------|-------|
| 1-2 | User input → API call | <50ms | Client-side, instant |
| 3-4 | Database query | <50ms | Pooled connection, indexed |
| 5A | Query enhancement | <10ms | String manipulation |
| 5B | Embedding generation | ~100ms | OpenAI API call |
| 5C | Vector search | ~150ms | Pinecone query |
| 5D | Reranking | <10ms | Local computation |
| 6 | LLM generation | ~1500ms | GPT-4o API call (largest) |
| 7 | Citation extraction | <10ms | Regex parsing |
| 8 | Database insert | <50ms | Single insert + update |
| 9-11 | HTTP + render | <50ms | Network + React render |
| **TOTAL** | | **~2000ms** | **Well under 3s target** |

---

## 5. Component Specifications

### 5.1 Backend Components

#### RAG Orchestrator
- **File:** `app/lib/rag/orchestrator.ts`
- **Responsibility:** Coordinate entire RAG pipeline
- **Inputs:** User query, conversation history
- **Outputs:** Retrieved chunks, assembled context
- **Dependencies:** Retrieval module, Context assembler

#### Retrieval Module
- **File:** `app/lib/rag/retrieval.ts`
- **Responsibility:** Query Pinecone and return relevant chunks
- **Inputs:** Enhanced query string
- **Outputs:** Top-5 chunks with metadata
- **External:** Pinecone SDK, OpenAI SDK (embeddings)

#### Generation Module
- **File:** `app/lib/rag/generation.ts`
- **Responsibility:** Generate response using GPT-4o
- **Inputs:** Assembled context
- **Outputs:** LLM response text
- **External:** OpenAI SDK (completions)

#### Citation Extractor
- **File:** `app/lib/rag/citations.ts`
- **Responsibility:** Parse and validate citations
- **Inputs:** LLM response, retrieved chunks
- **Outputs:** Array of Citation objects

#### Conversation Manager
- **File:** `app/lib/conversation/manager.ts`
- **Responsibility:** Manage conversation state and history
- **Inputs:** Session ID
- **Outputs:** Conversation context
- **External:** Vercel Postgres

### 5.2 Frontend Components

#### ChatContainer
- **File:** `app/components/ChatContainer.tsx`
- **Props:** `sessionId: string`
- **State:** `messages`, `isLoading`, `error`
- **Responsibility:** Main chat coordinator

#### MessageList
- **File:** `app/components/MessageList.tsx`
- **Props:** `messages: Message[]`
- **Responsibility:** Render message history with scrolling

#### MessageBubble
- **File:** `app/components/MessageBubble.tsx`
- **Props:** `message: Message`
- **Responsibility:** Render individual message with styling

#### ChatInput
- **File:** `app/components/ChatInput.tsx`
- **Props:** `onSend: (msg: string) => void`, `disabled: boolean`
- **Responsibility:** Text input with validation and char counter

#### CitationPill
- **File:** `app/components/CitationPill.tsx`
- **Props:** `citation: Citation`
- **Responsibility:** Inline citation badge

#### CitationModal
- **File:** `app/components/CitationModal.tsx`
- **Props:** `citation: Citation`, `isOpen: boolean`, `onClose: () => void`
- **Responsibility:** Full citation details in modal

---

## 6. Security & Performance

### 6.1 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Edge Protection (Vercel)
├─ DDoS mitigation
├─ SSL/TLS termination
└─ Rate limiting (Vercel Edge)

Layer 2: Application Security
├─ Input validation (zod schemas)
├─ SQL injection prevention (parameterized queries)
├─ XSS prevention (React escaping + sanitization)
└─ CSRF protection (SameSite cookies)

Layer 3: API Security
├─ Rate limiting (10 req/min per session)
├─ Request size limits (2KB max message)
├─ Timeout limits (10s max per request)
└─ Error message sanitization (no stack traces in prod)

Layer 4: Data Security
├─ Environment variables (never exposed to client)
├─ API keys stored securely (Vercel env vars)
├─ Database credentials managed by Vercel
└─ No PII stored (demo mode, mock users)

Layer 5: Dependency Security
├─ npm audit (regular scans)
├─ Dependabot alerts
└─ Minimal dependencies
```

### 6.2 Performance Optimizations

#### Client-Side
- **Code splitting:** React lazy loading for modals
- **Memoization:** `useMemo` for expensive computations
- **Virtualization:** Virtual scrolling for long message lists
- **Debouncing:** Input events debounced

#### Server-Side
- **Connection pooling:** Postgres connections reused
- **Caching:** Frequent queries cached (Vercel Edge)
- **Streaming:** Consider streaming responses for long generations
- **Batch processing:** Multiple embeddings in one API call

#### Database
- **Indexes:** On `conversation_id`, `user_id`, `created_at`
- **Query optimization:** LIMIT used, SELECT only needed columns
- **Archival:** Old conversations archived after 30 days (future)

#### External APIs
- **Retry logic:** Exponential backoff for transient failures
- **Timeout limits:** 5s for embeddings, 10s for completions
- **Error handling:** Graceful degradation if API unavailable

---

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT PIPELINE                        │
└─────────────────────────────────────────────────────────────┘

Developer Workflow:
┌──────────────┐
│  Local Dev   │  npm run dev (localhost:3000)
└──────┬───────┘
       │
       │ git commit
       │ git push origin main
       ▼
┌──────────────┐
│   GitHub     │  Repository: ai-plc-virtual-coach
└──────┬───────┘
       │
       │ Webhook triggers Vercel
       ▼
┌──────────────────────────────────────────────────────────┐
│                    Vercel Build                          │
│                                                          │
│  1. Install dependencies (npm install)                  │
│  2. Run TypeScript check (tsc --noEmit)                 │
│  3. Build Next.js app (next build)                      │
│  4. Generate serverless functions                        │
│  5. Deploy to Vercel Edge Network                       │
│                                                          │
│  Build time: ~2-3 minutes                               │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Deployment successful
       ▼
┌──────────────────────────────────────────────────────────┐
│              Vercel Production Environment               │
│                                                          │
│  • URL: https://ai-plc-coach.vercel.app                │
│  • Region: Global (edge functions)                      │
│  • Environment variables: Set in dashboard              │
│  • Database: Vercel Postgres (auto-connected)          │
│                                                          │
│  Health check: GET /api/health                          │
└──────────────────────────────────────────────────────────┘

Rollback Strategy:
- Vercel maintains last 10 deployments
- Instant rollback via dashboard or CLI
- Zero-downtime deployments
```

---

## 8. Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                   MONITORING STACK                          │
└─────────────────────────────────────────────────────────────┘

Vercel Analytics (Built-in):
├─ Page views
├─ API response times
├─ Error rates
├─ Geographic distribution
└─ Core Web Vitals

Custom Logging:
├─ API request/response logs
├─ RAG pipeline timing breakdowns
├─ LLM token usage tracking
└─ Citation validation results

Performance Metrics:
├─ Response time (p50, p95, p99)
├─ Retrieval time
├─ LLM generation time
├─ Database query time
└─ Error rate by endpoint

PostHog (Optional - Analytics):
├─ User behavior tracking
├─ Feature usage
├─ Conversation length
└─ Citation click rates

Alerts (Vercel):
├─ Error rate > 5%
├─ Response time > 5s (p95)
├─ Build failures
└─ Database connection issues
```

---

**END OF ARCHITECTURE DOCUMENT**

This architecture supports:
- ✅ 10+ concurrent users
- ✅ <3s response time (p95)
- ✅ 99.5%+ uptime
- ✅ Global edge deployment
- ✅ Scalable to 1000s of users
- ✅ Serverless cost efficiency
