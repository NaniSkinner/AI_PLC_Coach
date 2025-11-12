// Core Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  metadata?: MessageMetadata;
}

// Citation Types
export interface Citation {
  id: string;
  sourceDocument: string;
  author: string;
  chapterOrSection?: string;
  pageNumber?: number;
  url?: string;
  relevanceScore: number;
}

// Conversation Types
export interface Conversation {
  id: string;
  userId: string;
  startedAt: Date;
  lastActiveAt: Date;
  summary?: string;
  messageCount: number;
}

// Metadata Types
export interface MessageMetadata {
  modelUsed?: string;
  tokensUsed?: number;
  responseTime?: number;
  retrievedChunks?: number;
  ragScores?: number[];
}

export interface ChunkMetadata {
  chunkId: string;
  sourceDocument: string;
  author: string;
  section?: string;
  pageNumber?: number;
  criticalQuestion?: 1 | 2 | 3 | 4;
  topics: string[];
  tokenCount: number;
}

// API Request/Response Types
export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  messageId: string;
  role: 'assistant';
  content: string;
  citations: Citation[];
  metadata: MessageMetadata;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

// RAG Pipeline Types
export interface RetrievalResult {
  id: string;
  score: number;
  metadata: ChunkMetadata;
  content: string;
}

export interface EmbeddingResult {
  embedding: number[];
  chunkId: string;
}

// Session Types
export interface SessionCreateRequest {
  userId: string;
}

export interface SessionResponse {
  sessionId: string;
  userId: string;
  createdAt: string;
}

// Feedback Types
export interface FeedbackRequest {
  messageId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface FeedbackResponse {
  feedbackId: string;
  messageId: string;
  acknowledged: boolean;
}
