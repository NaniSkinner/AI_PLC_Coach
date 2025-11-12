# Phase 3: RAG Infrastructure & Indexing - Detailed Task List

**Duration:** 2-3 days
**Status:** 🔴 Not Started
**Prerequisites:** Phase 0, 1, and 2 complete

---

## Task 3.1: Create Pinecone Index

### 3.1.1 Verify Pinecone Account Access
- [ ] Log into Pinecone dashboard at https://app.pinecone.io
- [ ] Verify API key is available
- [ ] Check free tier limits (1 serverless index, 100K vectors)
- [ ] Note current cloud provider and region

### 3.1.2 Create Index Creation Script
- [ ] Create file: `scripts/create-pinecone-index.ts`
- [ ] Add imports:
  ```typescript
  import { Pinecone } from '@pinecone-database/pinecone';
  ```
- [ ] Add environment variable validation
- [ ] Add Pinecone client initialization

### 3.1.3 Configure Index Parameters
- [ ] Add index configuration:
  ```typescript
  await pinecone.createIndex({
    name: 'plc-coach-demo',
    dimension: 3072, // text-embedding-3-large
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });
  ```
- [ ] Index name: `plc-coach-demo`
- [ ] Dimension: 3072 (for text-embedding-3-large)
- [ ] Metric: cosine similarity
- [ ] Cloud: AWS (or your Pinecone environment)
- [ ] Region: us-east-1 (or your region)

### 3.1.4 Add Error Handling
- [ ] Check if index already exists
- [ ] Handle API errors gracefully
- [ ] Add retry logic for transient failures
- [ ] Log progress and status

### 3.1.5 Execute Index Creation
- [ ] Run: `npx tsx scripts/create-pinecone-index.ts`
- [ ] Verify success message
- [ ] Wait for index initialization (1-2 minutes)

### 3.1.6 Verify Index in Dashboard
- [ ] Open Pinecone dashboard
- [ ] Navigate to Indexes
- [ ] Verify `plc-coach-demo` exists
- [ ] Check configuration matches:
  - [ ] Dimension: 3072
  - [ ] Metric: cosine
  - [ ] Status: Ready
  - [ ] Vector count: 0 (empty for now)

### 3.1.7 Commit Index Creation Script
- [ ] Stage script: `git add scripts/create-pinecone-index.ts`
- [ ] Commit: `git commit -m "Add Pinecone index creation script"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Index created in Pinecone
- [ ] Script committed to Git
- [ ] Index shows as "Ready" in dashboard
- [ ] Configuration verified

---

## Task 3.2: Document Chunking Strategy

### 3.2.1 Define Chunking Parameters
- [ ] Document chunking strategy:
  - Target chunk size: 500 tokens (~2000 characters)
  - Overlap: 50 tokens (for context continuity)
  - Respect semantic boundaries (paragraphs > sentences)
  - Never split mid-sentence
  - Preserve metadata at chunk level

### 3.2.2 Install Token Counter
- [ ] Install js-tiktoken: `npm install js-tiktoken`
- [ ] Or use GPT-3-tokenizer: `npm install gpt-3-tokenizer`
- [ ] Verify installation in package.json

### 3.2.3 Create Chunking Script Structure
- [ ] Create file: `scripts/chunk-documents.ts`
- [ ] Add imports:
  ```typescript
  import fs from 'fs';
  import path from 'path';
  import { encode } from 'gpt-tokenizer';
  import matter from 'gray-matter';
  ```
- [ ] Install gray-matter: `npm install gray-matter`

### 3.2.4 Implement Document Reader
- [ ] Create function to read all markdown files:
  ```typescript
  function getAllDocuments(baseDir: string): Document[] {
    const documents: Document[] = [];
    // Recursively read all .md files
    // Parse frontmatter with gray-matter
    // Extract content and metadata
    return documents;
  }
  ```
- [ ] Read from `scripts/knowledge_base/`
- [ ] Parse YAML frontmatter
- [ ] Extract content body

### 3.2.5 Implement Smart Chunking Function
- [ ] Create chunking function:
  ```typescript
  function chunkDocument(doc: Document): Chunk[] {
    const chunks: Chunk[] = [];
    const paragraphs = doc.content.split('\n\n');
    let currentChunk = '';
    let currentTokens = 0;

    for (const paragraph of paragraphs) {
      const paraTokens = encode(paragraph).length;

      if (currentTokens + paraTokens > 500) {
        // Save current chunk
        chunks.push(createChunk(currentChunk, doc.metadata));

        // Start new chunk with overlap
        currentChunk = getOverlap(currentChunk, 50) + paragraph;
        currentTokens = encode(currentChunk).length;
      } else {
        currentChunk += '\n\n' + paragraph;
        currentTokens += paraTokens;
      }
    }

    // Save final chunk
    if (currentChunk) {
      chunks.push(createChunk(currentChunk, doc.metadata));
    }

    return chunks;
  }
  ```

### 3.2.6 Implement Overlap Function
- [ ] Create overlap function to preserve context:
  ```typescript
  function getOverlap(text: string, tokens: number): string {
    const encoded = encode(text);
    const overlapTokens = encoded.slice(-tokens);
    return decode(overlapTokens);
  }
  ```
- [ ] Takes last N tokens from previous chunk
- [ ] Ensures context continuity

### 3.2.7 Create Chunk Metadata Structure
- [ ] Define chunk interface:
  ```typescript
  interface Chunk {
    chunkId: string;
    content: string;
    metadata: {
      sourceDocument: string;
      author: string;
      section?: string;
      pageNumber?: number;
      criticalQuestion: 1 | 2 | 3 | 4 | null;
      topics: string[];
      tokenCount: number;
      chunkIndex: number;
      totalChunks: number;
    };
  }
  ```
- [ ] Generate unique chunkId (e.g., `doc-slug-001`)
- [ ] Preserve all source metadata
- [ ] Add chunk-specific metadata

### 3.2.8 Test Chunking with Sample Documents
- [ ] Run on 5 test documents first
- [ ] Verify chunk boundaries:
  - [ ] No mid-sentence splits
  - [ ] Reasonable chunk sizes (400-600 tokens)
  - [ ] Overlap working correctly
- [ ] Inspect output manually
- [ ] Check metadata preservation

### 3.2.9 Process Full Knowledge Base
- [ ] Run on all documents: `npx tsx scripts/chunk-documents.ts`
- [ ] Monitor progress logs
- [ ] Save chunks to JSON file: `scripts/chunks.json`
- [ ] Log statistics:
  - [ ] Total documents processed
  - [ ] Total chunks created
  - [ ] Average chunk size
  - [ ] Min/max chunk sizes

### 3.2.10 Validate Chunk Output
- [ ] Load `scripts/chunks.json`
- [ ] Verify chunk count: Should be 400-550 chunks
- [ ] Spot-check 10 random chunks:
  - [ ] Content is coherent
  - [ ] Metadata is complete
  - [ ] Token counts accurate
  - [ ] No encoding issues
- [ ] Check distribution by Critical Question:
  - [ ] Q1: 50-80 chunks
  - [ ] Q2: 80-120 chunks
  - [ ] Q3: 80-120 chunks
  - [ ] Q4: 40-60 chunks
  - [ ] General: 50-80 chunks

### 3.2.11 Commit Chunking Script and Output
- [ ] Stage files: `git add scripts/chunk-documents.ts scripts/chunks.json`
- [ ] Commit: `git commit -m "Implement document chunking with semantic boundaries"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Chunking script created
- [ ] 400-550 chunks generated
- [ ] Metadata preserved for all chunks
- [ ] No mid-sentence splits
- [ ] 50-token overlap implemented
- [ ] Output validated and committed

---

## Task 3.3: Embedding Generation

### 3.3.1 Create Embedding Script Structure
- [ ] Create file: `scripts/generate-embeddings.ts`
- [ ] Add imports:
  ```typescript
  import { OpenAI } from 'openai';
  import fs from 'fs';
  ```
- [ ] Load chunks from `scripts/chunks.json`

### 3.3.2 Initialize OpenAI Client
- [ ] Create OpenAI client:
  ```typescript
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
  ```
- [ ] Verify API key is loaded
- [ ] Test connection with simple request

### 3.3.3 Configure Embedding Parameters
- [ ] Model: `text-embedding-3-large`
- [ ] Dimensions: 3072
- [ ] Batch size: 100 (OpenAI supports up to 2048)
- [ ] Rate limit: 1 second between batches

### 3.3.4 Implement Batch Processing
- [ ] Create batch processing function:
  ```typescript
  async function generateEmbeddings(chunks: Chunk[]) {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: batch.map(c => c.content),
        dimensions: 3072,
      });

      // Add embeddings to chunks
      batch.forEach((chunk, idx) => {
        results.push({
          ...chunk,
          embedding: response.data[idx].embedding,
        });
      });

      console.log(`Processed ${i + batch.length} / ${chunks.length}`);

      // Rate limiting: 1 second between batches
      await sleep(1000);
    }

    return results;
  }
  ```

### 3.3.5 Add Error Handling and Retry Logic
- [ ] Wrap API calls in try-catch
- [ ] Implement exponential backoff:
  ```typescript
  async function generateWithRetry(input: string[], retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await openai.embeddings.create({...});
      } catch (error) {
        if (i === retries - 1) throw error;
        await sleep(1000 * Math.pow(2, i));
      }
    }
  }
  ```
- [ ] Handle rate limit errors (429)
- [ ] Handle transient network errors
- [ ] Log errors with context

### 3.3.6 Add Progress Tracking
- [ ] Log batch progress: "Processed X / Y"
- [ ] Calculate estimated time remaining
- [ ] Show percentage complete
- [ ] Save intermediate results every 100 chunks

### 3.3.7 Calculate Cost Estimate
- [ ] Count total tokens across all chunks
- [ ] Calculate cost: tokens × $0.13 / 1M
- [ ] Log estimate: "Estimated cost: $X.XX"
- [ ] Expected: ~$2-3 for 2,500 chunks

### 3.3.8 Execute Embedding Generation
- [ ] Run: `npx tsx scripts/generate-embeddings.ts`
- [ ] Monitor progress logs
- [ ] Estimated time: 5-10 minutes (500 chunks = 5 batches)
- [ ] Wait for completion
- [ ] Verify no errors

### 3.3.9 Save Embedded Chunks
- [ ] Save to: `scripts/embedded-chunks.json`
- [ ] Include original chunk data + embedding vector
- [ ] Verify file size (embeddings are large)
- [ ] Expected size: 10-20 MB

### 3.3.10 Validate Embeddings
- [ ] Load `scripts/embedded-chunks.json`
- [ ] Verify all chunks have embeddings
- [ ] Check embedding dimensions: all should be 3072
- [ ] Spot-check 5 embeddings:
  - [ ] No null values
  - [ ] Values are floats between -1 and 1
  - [ ] Length is exactly 3072

### 3.3.11 Commit Embedding Script
- [ ] Add to .gitignore: `scripts/embedded-chunks.json` (too large)
- [ ] Stage script: `git add scripts/generate-embeddings.ts`
- [ ] Update .gitignore: `git add .gitignore`
- [ ] Commit: `git commit -m "Add embedding generation script"`
- [ ] Push: `git push origin main`
- [ ] Note: Keep embedded-chunks.json locally only

**Completion Criteria:**
- [ ] Embeddings generated for all chunks
- [ ] All embeddings are 3072 dimensions
- [ ] No generation errors
- [ ] Output saved locally
- [ ] Script committed to Git
- [ ] Cost was within estimate ($2-3)

---

## Task 3.4: Upload to Pinecone

### 3.4.1 Create Upload Script
- [ ] Create file: `scripts/upload-to-pinecone.ts`
- [ ] Add imports:
  ```typescript
  import { Pinecone } from '@pinecone-database/pinecone';
  import fs from 'fs';
  ```
- [ ] Load embedded chunks from file

### 3.4.2 Initialize Pinecone Client
- [ ] Create Pinecone client:
  ```typescript
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pinecone.index('plc-coach-demo');
  ```
- [ ] Verify index exists
- [ ] Test connection

### 3.4.3 Format Vectors for Pinecone
- [ ] Transform chunks to Pinecone format:
  ```typescript
  const vectors = batch.map(chunk => ({
    id: chunk.metadata.chunkId,
    values: chunk.embedding,
    metadata: {
      content: chunk.content,
      sourceDocument: chunk.metadata.sourceDocument,
      author: chunk.metadata.author,
      section: chunk.metadata.section || '',
      criticalQuestion: chunk.metadata.criticalQuestion,
      topics: chunk.metadata.topics.join(', '),
      pageNumber: chunk.metadata.pageNumber,
      tokenCount: chunk.metadata.tokenCount,
    },
  }));
  ```
- [ ] ID: Use chunkId
- [ ] Values: Embedding vector (3072 dimensions)
- [ ] Metadata: Store searchable fields

### 3.4.4 Implement Batch Upload
- [ ] Create upload function:
  ```typescript
  async function uploadVectors(embeddedChunks: EmbeddedChunk[]) {
    const batchSize = 100;

    for (let i = 0; i < embeddedChunks.length; i += batchSize) {
      const batch = embeddedChunks.slice(i, i + batchSize);

      const vectors = batch.map(chunk => ({
        id: chunk.metadata.chunkId,
        values: chunk.embedding,
        metadata: { /* ... */ },
      }));

      await index.upsert(vectors);
      console.log(`Uploaded ${i + batch.length} / ${embeddedChunks.length}`);
    }
  }
  ```
- [ ] Batch size: 100 vectors per upsert
- [ ] Log progress after each batch

### 3.4.5 Add Error Handling
- [ ] Wrap upsert in try-catch
- [ ] Retry failed batches
- [ ] Log batch numbers for failed uploads
- [ ] Continue on error (don't stop entire upload)

### 3.4.6 Execute Upload
- [ ] Run: `npx tsx scripts/upload-to-pinecone.ts`
- [ ] Monitor progress logs
- [ ] Estimated time: 5-10 minutes
- [ ] Verify completion message

### 3.4.7 Verify Upload in Pinecone Dashboard
- [ ] Open Pinecone dashboard
- [ ] Navigate to `plc-coach-demo` index
- [ ] Check vector count: Should be 400-550
- [ ] Verify matches expected chunk count
- [ ] Check index statistics

### 3.4.8 Test Query Pinecone
- [ ] Create test query script
- [ ] Generate test embedding for "CFA data analysis"
- [ ] Query Pinecone with test embedding
- [ ] Verify results returned
- [ ] Check metadata is intact

### 3.4.9 Commit Upload Script
- [ ] Stage script: `git add scripts/upload-to-pinecone.ts`
- [ ] Commit: `git commit -m "Add Pinecone upload script"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] All vectors uploaded to Pinecone
- [ ] Vector count matches chunk count
- [ ] Metadata preserved
- [ ] Test query successful
- [ ] Script committed to Git

---

## Task 3.5: Retrieval System Implementation

### 3.5.1 Create Retrieval Module Directory
- [ ] Create directory: `app/lib/rag/`
- [ ] Create file: `app/lib/rag/retrieval.ts`
- [ ] Create file: `app/lib/rag/types.ts` (if needed)

### 3.5.2 Define Retrieval Types
- [ ] Create interfaces in `app/lib/rag/types.ts`:
  ```typescript
  export interface RetrievalResult {
    id: string;
    score: number;
    metadata: ChunkMetadata;
    content: string;
  }

  export interface RetrievalOptions {
    topK?: number;
    criticalQuestion?: 1 | 2 | 3 | 4;
    minScore?: number;
  }
  ```

### 3.5.3 Implement Query Embedding Function
- [ ] Create function to generate query embeddings:
  ```typescript
  async function generateQueryEmbedding(query: string): Promise<number[]> {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      dimensions: 3072,
    });

    return response.data[0].embedding;
  }
  ```

### 3.5.4 Implement Pinecone Query Function
- [ ] Create Pinecone query function:
  ```typescript
  async function queryPinecone(
    embedding: number[],
    options: RetrievalOptions
  ) {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const index = pinecone.index('plc-coach-demo');

    const queryResponse = await index.query({
      vector: embedding,
      topK: options.topK || 10,
      includeMetadata: true,
      includeValues: false,
    });

    return queryResponse.matches;
  }
  ```

### 3.5.5 Implement Reranking Logic
- [ ] Create reranking function:
  ```typescript
  function rerankResults(
    results: any[],
    options: RetrievalOptions
  ): RetrievalResult[] {
    return results
      .map(result => {
        let score = result.score;

        // Boost if Critical Question matches
        if (options.criticalQuestion &&
            result.metadata.criticalQuestion === options.criticalQuestion) {
          score *= 1.5;
        }

        // Boost core framework docs
        if (result.metadata.sourceDocument?.includes('core_framework')) {
          score *= 1.2;
        }

        // Boost research papers
        if (result.metadata.sourceDocument?.includes('research_paper')) {
          score *= 1.1;
        }

        return { ...result, adjustedScore: score };
      })
      .sort((a, b) => b.adjustedScore - a.adjustedScore);
  }
  ```

### 3.5.6 Implement Main Retrieval Function
- [ ] Create main retrieval pipeline:
  ```typescript
  export async function retrieveContext(
    query: string,
    options: RetrievalOptions = {}
  ): Promise<RetrievalResult[]> {
    const { topK = 5, criticalQuestion } = options;

    // 1. Generate query embedding
    const embedding = await generateQueryEmbedding(query);

    // 2. Query Pinecone (get 2x for reranking)
    const rawResults = await queryPinecone(embedding, {
      ...options,
      topK: topK * 2,
    });

    // 3. Rerank results
    const reranked = rerankResults(rawResults, options);

    // 4. Return top-k after reranking
    return reranked.slice(0, topK).map(r => ({
      id: r.id,
      score: r.adjustedScore,
      metadata: r.metadata,
      content: r.metadata.content,
    }));
  }
  ```

### 3.5.7 Add Error Handling
- [ ] Wrap API calls in try-catch
- [ ] Handle empty results
- [ ] Validate query input
- [ ] Log errors with context

### 3.5.8 Add Caching (Optional)
- [ ] Consider caching common queries
- [ ] Use in-memory cache or Redis
- [ ] Cache embeddings for repeated queries
- [ ] Set TTL: 1 hour

### 3.5.9 Test Retrieval Function
- [ ] Create test script: `scripts/test-retrieval-basic.ts`
- [ ] Test with sample queries:
  - [ ] "How do we analyze CFA data?"
  - [ ] "What interventions work for struggling students?"
  - [ ] "How to identify essential standards?"
- [ ] Log retrieved chunks
- [ ] Verify relevance scores
- [ ] Check metadata completeness

### 3.5.10 Commit Retrieval Module
- [ ] Stage files: `git add app/lib/rag/`
- [ ] Commit: `git commit -m "Implement RAG retrieval system with reranking"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Retrieval module created
- [ ] Query embedding generation working
- [ ] Pinecone queries successful
- [ ] Reranking logic implemented
- [ ] Returns relevant chunks
- [ ] Error handling robust

---

## Task 3.6: Testing Retrieval Quality

### 3.6.1 Create Test Scenarios
- [ ] Create file: `scripts/test-retrieval.ts`
- [ ] Define 20 test queries covering all Critical Questions:
  ```typescript
  const testQueries = [
    // Q1 Tests (5)
    {
      query: "How do we identify essential standards?",
      expectedCQ: 1,
      expectedTopics: ["essential standards", "curriculum"],
    },
    {
      query: "What criteria should we use to select priority standards?",
      expectedCQ: 1,
      expectedTopics: ["essential standards", "endurance", "leverage"],
    },
    {
      query: "How do we unwrap standards into learning targets?",
      expectedCQ: 1,
      expectedTopics: ["unwrapping standards", "learning targets"],
    },
    {
      query: "What's the difference between essential and supplemental standards?",
      expectedCQ: 1,
      expectedTopics: ["essential standards"],
    },
    {
      query: "How do we ensure vertical alignment of standards?",
      expectedCQ: 1,
      expectedTopics: ["vertical alignment", "essential standards"],
    },

    // Q2 Tests (7)
    {
      query: "How do we analyze CFA data?",
      expectedCQ: 2,
      expectedTopics: ["data analysis", "common formative assessment"],
    },
    {
      query: "What should we look for in item analysis?",
      expectedCQ: 2,
      expectedTopics: ["item analysis", "assessment"],
    },
    {
      query: "How do we design quality common formative assessments?",
      expectedCQ: 2,
      expectedTopics: ["common formative assessment", "assessment design"],
    },
    {
      query: "What's a data protocol and how do we use it?",
      expectedCQ: 2,
      expectedTopics: ["data protocol", "data analysis"],
    },
    {
      query: "How often should we give CFAs?",
      expectedCQ: 2,
      expectedTopics: ["common formative assessment", "frequency"],
    },
    {
      query: "What if CFA results show most students didn't learn it?",
      expectedCQ: 2,
      expectedTopics: ["data analysis", "intervention"],
    },
    {
      query: "How do we ensure our assessments are aligned to standards?",
      expectedCQ: 2,
      expectedTopics: ["assessment", "alignment"],
    },

    // Q3 Tests (6)
    {
      query: "What interventions work for struggling students?",
      expectedCQ: 3,
      expectedTopics: ["intervention", "systematic response"],
    },
    {
      query: "How do we build a pyramid of interventions?",
      expectedCQ: 3,
      expectedTopics: ["pyramid of interventions", "RTI"],
    },
    {
      query: "How do we schedule intervention time?",
      expectedCQ: 3,
      expectedTopics: ["intervention", "scheduling"],
    },
    {
      query: "What's the difference between Tier 2 and Tier 3?",
      expectedCQ: 3,
      expectedTopics: ["tiered interventions", "RTI"],
    },
    {
      query: "How do we monitor student progress in interventions?",
      expectedCQ: 3,
      expectedTopics: ["progress monitoring", "intervention"],
    },
    {
      query: "How do we communicate with parents about interventions?",
      expectedCQ: 3,
      expectedTopics: ["intervention", "parent communication"],
    },

    // Q4 Tests (2)
    {
      query: "What extension strategies work for advanced learners?",
      expectedCQ: 4,
      expectedTopics: ["extension", "enrichment"],
    },
    {
      query: "What's the difference between enrichment and acceleration?",
      expectedCQ: 4,
      expectedTopics: ["enrichment", "acceleration"],
    },
  ];
  ```

### 3.6.2 Implement Test Runner
- [ ] Create test execution function:
  ```typescript
  async function runRetrievalTests() {
    let passCount = 0;
    const results = [];

    for (const test of testQueries) {
      const retrieved = await retrieveContext(test.query, {
        topK: 5,
      });

      // Validate results
      const hasExpectedCQ = retrieved.some(r =>
        r.metadata.criticalQuestion === test.expectedCQ
      );

      const hasExpectedTopics = retrieved.some(r =>
        test.expectedTopics.some(topic =>
          r.metadata.topics?.includes(topic)
        )
      );

      const passed = hasExpectedCQ && hasExpectedTopics;
      if (passed) passCount++;

      results.push({
        query: test.query,
        expectedCQ: test.expectedCQ,
        passed,
        topResult: retrieved[0],
      });

      console.log(`\nQuery: ${test.query}`);
      console.log(`Expected CQ: ${test.expectedCQ}`);
      console.log(`Results:`);
      retrieved.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i+1}. ${r.metadata.sourceDocument} (CQ ${r.metadata.criticalQuestion}) - Score: ${r.score.toFixed(3)}`);
      });
      console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    }

    console.log(`\n\n=== SUMMARY ===`);
    console.log(`Passed: ${passCount} / ${testQueries.length}`);
    console.log(`Accuracy: ${(passCount / testQueries.length * 100).toFixed(1)}%`);

    return results;
  }
  ```

### 3.6.3 Add Timing Measurements
- [ ] Measure retrieval time for each query:
  ```typescript
  const startTime = Date.now();
  const results = await retrieveContext(query);
  const duration = Date.now() - startTime;
  console.log(`  Retrieval time: ${duration}ms`);
  ```
- [ ] Track average, p50, p95, p99
- [ ] Target: < 200ms average

### 3.6.4 Execute Retrieval Tests
- [ ] Run: `npx tsx scripts/test-retrieval.ts`
- [ ] Review output for each query
- [ ] Check pass/fail status
- [ ] Verify accuracy score

### 3.6.5 Analyze Test Results
- [ ] Calculate accuracy: passed / total
- [ ] Target: 85%+ accuracy
- [ ] Identify failing queries
- [ ] Analyze why queries failed:
  - [ ] No relevant chunks?
  - [ ] Metadata tagging issue?
  - [ ] Reranking logic problem?

### 3.6.6 Refine if Needed
- [ ] If accuracy < 85%:
  - [ ] Adjust reranking boost factors
  - [ ] Add more metadata filters
  - [ ] Review chunk metadata tags
  - [ ] Consider query preprocessing
  - [ ] Re-run tests

### 3.6.7 Save Test Results
- [ ] Export results to JSON: `scripts/retrieval-test-results.json`
- [ ] Include:
  - [ ] Test query
  - [ ] Expected CQ
  - [ ] Retrieved chunks (top 5)
  - [ ] Pass/fail status
  - [ ] Retrieval time

### 3.6.8 Document Test Results
- [ ] Create: `Docs/Retrieval_Test_Report.md`
- [ ] Include:
  - [ ] Overall accuracy score
  - [ ] Pass/fail breakdown by Critical Question
  - [ ] Average retrieval time
  - [ ] Sample successful retrievals
  - [ ] Sample failed retrievals
  - [ ] Recommendations for improvement

### 3.6.9 Commit Test Script and Results
- [ ] Stage files: `git add scripts/test-retrieval.ts Docs/Retrieval_Test_Report.md`
- [ ] Commit: `git commit -m "Add retrieval quality tests and report"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] 20 test queries created
- [ ] Tests executed successfully
- [ ] 85%+ accuracy achieved
- [ ] Average retrieval time < 200ms
- [ ] Test report documented
- [ ] Results committed to Git

---

## Task 3.7: Create RAG Pipeline Orchestrator

### 3.7.1 Create Orchestrator File
- [ ] Create file: `app/lib/rag/orchestrator.ts`
- [ ] Add imports for retrieval and generation modules

### 3.7.2 Implement Query Enhancement
- [ ] Create function to enhance query with history:
  ```typescript
  function enhanceQueryWithHistory(
    query: string,
    conversationHistory: Message[]
  ): string {
    if (conversationHistory.length === 0) {
      return query;
    }

    // Get last user message for context
    const lastUserMessage = conversationHistory
      .filter(m => m.role === 'user')
      .slice(-1)[0];

    // If query is very short, add context
    if (query.split(' ').length < 5 && lastUserMessage) {
      return `${lastUserMessage.content}\n\nFollow-up: ${query}`;
    }

    return query;
  }
  ```

### 3.7.3 Implement Context Assembly
- [ ] Create function to assemble context for LLM:
  ```typescript
  function assembleContext(params: {
    systemPrompt: string;
    conversationHistory: Message[];
    retrievedChunks: RetrievalResult[];
    userQuery: string;
  }) {
    const { systemPrompt, conversationHistory, retrievedChunks, userQuery } = params;

    // Format retrieved chunks
    const contextText = retrievedChunks
      .map((chunk, i) => {
        return `[Context ${i + 1}]
Source: ${chunk.metadata.sourceDocument}
Author: ${chunk.metadata.author}
${chunk.metadata.section ? `Section: ${chunk.metadata.section}` : ''}

${chunk.content}`;
      })
      .join('\n\n---\n\n');

    return {
      systemPrompt,
      context: contextText,
      conversationHistory: conversationHistory.slice(-5), // Last 5 messages
      userQuery,
    };
  }
  ```

### 3.7.4 Implement System Prompt Function
- [ ] Create function to get system prompt (placeholder for Phase 4):
  ```typescript
  function getSystemPrompt(): string {
    return `You are an expert Solution Tree PLC at Work® Associate with 15+ years of experience coaching educational leaders and collaborative teams.

Your coaching style is facilitative, framework-grounded, and inquiry-based. You ask powerful questions, provide actionable guidance, and always cite specific Solution Tree resources.

When responding:
1. Acknowledge the challenge empathetically
2. Ask clarifying questions to understand context
3. Connect to the PLC framework (Critical Questions, Big Ideas)
4. Provide actionable guidance with examples
5. Cite source documents in format: [Source: Book Title, Section]

Always ground responses in the PLC at Work framework and use the term "collaborative team" not "group" or "committee".`;
  }
  ```

### 3.7.5 Implement Main RAG Pipeline
- [ ] Create main orchestrator function:
  ```typescript
  export async function ragPipeline(
    userQuery: string,
    conversationHistory: Message[] = []
  ) {
    // 1. Preprocess query (enhance with history)
    const enhancedQuery = enhanceQueryWithHistory(
      userQuery,
      conversationHistory
    );

    // 2. Retrieve relevant chunks
    const chunks = await retrieveContext(enhancedQuery, {
      topK: 5,
    });

    // 3. Assemble context
    const context = assembleContext({
      systemPrompt: getSystemPrompt(),
      conversationHistory,
      retrievedChunks: chunks,
      userQuery,
    });

    // 4. Return prepared context (generation happens in Phase 4)
    return {
      retrievedChunks: chunks,
      context,
      enhancedQuery,
    };
  }
  ```

### 3.7.6 Add Metadata Tracking
- [ ] Track pipeline metadata:
  ```typescript
  const metadata = {
    retrievalTime: 0,
    chunksRetrieved: chunks.length,
    enhancedQuery: enhancedQuery !== userQuery,
    conversationContext: conversationHistory.length,
  };
  ```

### 3.7.7 Add Error Handling
- [ ] Wrap in try-catch
- [ ] Handle retrieval failures gracefully
- [ ] Provide fallback behavior
- [ ] Log errors with context

### 3.7.8 Test RAG Pipeline
- [ ] Create test script: `scripts/test-rag-pipeline.ts`
- [ ] Test with sample queries and history
- [ ] Verify chunks are retrieved
- [ ] Verify context is assembled correctly
- [ ] Check metadata is tracked

### 3.7.9 Commit Orchestrator
- [ ] Stage file: `git add app/lib/rag/orchestrator.ts`
- [ ] Commit: `git commit -m "Add RAG pipeline orchestrator"`
- [ ] Push: `git push origin main`

**Completion Criteria:**
- [ ] Orchestrator module created
- [ ] Query enhancement working
- [ ] Context assembly working
- [ ] Ready for LLM integration (Phase 4)
- [ ] Tests passing

---

## Task 3.8: Final Phase 3 Verification

### 3.8.1 Verify Pinecone Index
- [ ] Log into Pinecone dashboard
- [ ] Check index status: Should be "Ready"
- [ ] Verify vector count: 400-550 vectors
- [ ] Check index size and usage

### 3.8.2 Verify Local Files
- [ ] Check `scripts/chunks.json` exists
- [ ] Check `scripts/embedded-chunks.json` exists (locally)
- [ ] Verify both files are not in Git (check .gitignore)

### 3.8.3 Run All Scripts End-to-End
- [ ] Run chunking: `npx tsx scripts/chunk-documents.ts`
- [ ] Should see: "Already chunked" or regenerate if needed
- [ ] Run embedding: `npx tsx scripts/generate-embeddings.ts`
- [ ] Should skip if already done
- [ ] Run upload: `npx tsx scripts/upload-to-pinecone.ts`
- [ ] Should update existing vectors

### 3.8.4 Run Retrieval Tests
- [ ] Execute: `npx tsx scripts/test-retrieval.ts`
- [ ] Verify 85%+ accuracy
- [ ] Check average retrieval time < 200ms
- [ ] Ensure no errors

### 3.8.5 Test RAG Pipeline
- [ ] Execute: `npx tsx scripts/test-rag-pipeline.ts`
- [ ] Verify chunks retrieved
- [ ] Verify context assembled
- [ ] Check output format

### 3.8.6 Review All Code
- [ ] Check TypeScript types are correct
- [ ] Ensure error handling is comprehensive
- [ ] Verify logging is useful
- [ ] Check for any TODOs or hardcoded values

### 3.8.7 Update Documentation
- [ ] Update project README with Phase 3 status
- [ ] Document RAG architecture in `Docs/RAG_Architecture.md`:
  - [ ] Chunking strategy
  - [ ] Embedding model
  - [ ] Retrieval approach
  - [ ] Reranking logic
  - [ ] Performance metrics

### 3.8.8 Verify Environment Variables
- [ ] Check `.env.local` has all required keys:
  - [ ] OPENAI_API_KEY
  - [ ] PINECONE_API_KEY
  - [ ] PINECONE_ENVIRONMENT
- [ ] Verify Vercel has same vars configured

### 3.8.9 Run TypeScript Check
- [ ] Execute: `npm run type-check`
- [ ] Fix any type errors
- [ ] Ensure compilation successful

### 3.8.10 Create Phase 3 Summary
- [ ] Create: `Docs/Phase_Summaries/Phase_3_Summary.md`
- [ ] Include:
  ```markdown
  # Phase 3 Summary

  **Completion Date:** [Date]
  **Duration:** [Hours/Days]

  ## Completed Tasks
  - Pinecone index created: plc-coach-demo
  - Documents chunked: [count] chunks
  - Embeddings generated: 3072 dimensions
  - Vectors uploaded to Pinecone
  - Retrieval system implemented
  - RAG orchestrator created

  ## Metrics
  - Total chunks: [count]
  - Retrieval accuracy: [percentage]%
  - Average retrieval time: [ms]
  - Embedding cost: $[amount]

  ## Deliverables
  - Pinecone index with [count] vectors
  - Chunking script
  - Embedding script
  - Upload script
  - Retrieval module
  - RAG orchestrator
  - Test results report

  ## Issues Encountered
  - [List any issues and resolutions]

  ## Next Steps
  - Phase 4: Backend API Development
  - Integrate RAG pipeline with LLM
  - Create /api/chat endpoint
  ```
- [ ] Commit summary

### 3.8.11 Final Git Commit
- [ ] Stage all remaining changes: `git add .`
- [ ] Review staged files: `git status`
- [ ] Commit: `git commit -m "Complete Phase 3: RAG infrastructure and indexing"`
- [ ] Push: `git push origin main`

### 3.8.12 Mark Phase 3 Complete
- [ ] Update this file status to 🟢 Complete
- [ ] Update main implementation phases README
- [ ] Update project timeline
- [ ] Celebrate completion!

**Completion Criteria:**
- [ ] All Phase 3 tasks complete
- [ ] Pinecone index populated and tested
- [ ] Retrieval accuracy ≥ 85%
- [ ] Average retrieval time < 200ms
- [ ] RAG pipeline working end-to-end
- [ ] Documentation updated
- [ ] Ready to begin Phase 4

---

## Phase 3 Completion

**Status:** ⬜ Not Started → 🟢 Complete

**Completion Date:** _______________

**Total Time Spent:** _____ hours/days

**Statistics:**
- Pinecone Index: plc-coach-demo
- Total Chunks: _____
- Total Vectors: _____
- Retrieval Accuracy: _____%
- Average Retrieval Time: _____ms
- Embedding Cost: $_____

**Notes:**
-

**Blockers Encountered:**
-

**Lessons Learned:**
-

**Ready for Phase 4:** [ ] Yes / [ ] No

---

## Quick Reference

### Key Scripts
```bash
npx tsx scripts/create-pinecone-index.ts       # Create index
npx tsx scripts/chunk-documents.ts             # Chunk knowledge base
npx tsx scripts/generate-embeddings.ts         # Generate embeddings
npx tsx scripts/upload-to-pinecone.ts          # Upload to Pinecone
npx tsx scripts/test-retrieval.ts              # Test retrieval quality
npx tsx scripts/test-rag-pipeline.ts           # Test full pipeline
```

### Important Files
- `scripts/chunks.json` - Chunked documents (not in Git)
- `scripts/embedded-chunks.json` - Embedded chunks (not in Git)
- `app/lib/rag/retrieval.ts` - Retrieval module
- `app/lib/rag/orchestrator.ts` - RAG pipeline
- `Docs/Retrieval_Test_Report.md` - Test results

### Pinecone Details
- Index name: `plc-coach-demo`
- Dimensions: 3072
- Metric: cosine
- Vectors: 400-550

### Performance Targets
- Retrieval accuracy: ≥85%
- Average retrieval time: <200ms
- Embedding cost: ~$2-3

### Next Steps
→ Proceed to Phase 4: Backend API Development
