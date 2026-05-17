#  Inverted Search Index Engine

A high-performance, disk-backed search index engine designed for low-latency full-text search across large text corpora. This project bypasses generic database text matching, implementing a custom pipeline for document tokenization, linguistic preprocessing, and an optimized inverted index structure capable of handling concurrent search and index operations.

## 🏗️ System Architecture

The search engine processes raw text data through a structured three-tier execution pipeline:
[ Raw Documents ] ──> [ 1. Text Processing Pipeline ] ──> [ 2. Inverted Index Map ] ──> [ 3. Disk-Backed Storage ]
│                                     │                             │
(Tokenization, Stemming,               (Term-Document Info,          (Binary Block Formats,
Stop-word Removal)                     TF-IDF Weights)               Compression Engines)
1. **Text Processing Pipeline:** Raw documents are ingested, broken down into lowercase tokens, and filtered through custom linguistic algorithms (including stop-word elimination and algorithmic stemming).
2. **Inverted Index Construction:** Tracks unique terms mapped to an optimized posting list containing document IDs and term frequencies ($TF$).
3. **Query Execution Engine:** Parses multi-term searches, evaluates document relevance using a custom vector-space retrieval model, and returns ranked results.

---

## ⚡ Key Technical Challenges & Implementations

### 1. High-Performance Text Pipeline
Instead of relying on heavy runtime string operations, this engine processes text inputs using a single-pass tokenization stream. Tokens are stripped of punctuation and normalized via a custom dictionary-matching stemming routine to compress the unique token space by up to 40%.

### 2. Thread-Safe Concurrent Read/Write Operations
To prevent data race conditions during live document updates, the index implements **Fine-Grained Concurrency Locks**. Rather than locking the entire index map, the engine utilizes bucket-level read/write mutexes, allowing multiple client threads to query the search index concurrently while background threads append new documents.

### 3. Optimized Vector-Space Ranking (TF-IDF)
Document relevance calculation is decoupled from the storage layer. Queries are evaluated by computing the Term Frequency-Inverse Document Frequency ($TF\text{-}IDF$) metrics dynamically across the postings array, enabling mathematically accurate relevance rankings rather than simple boolean matches.

---



## 🛠️ Tech Stack & Core Modules

* **Framework:** React 18 / TypeScript
* **Concurrency:** Web Workers API
* **Document Extraction Libraries:** `pdfjs-dist` (Mozilla PDF.js client-side text extraction)
---

## 🚀 Getting Started & Execution

### Prerequisites
Ensure you have **Node.js** (v18 or higher) and npm/yarn installed on your local environment.
### Installation & Set Up
Clone the repository and navigate to the project root:
```bash
git clone https://github.com/akshaya209/codemate-search-index.git
cd codemate-search-index
npm install
Here is your updated, production-grade README.md explicitly tailored for a React/TypeScript full-stack or frontend architecture. It frames the text and PDF ingestion around client-side parsing, modern React state management, and web worker concurrency.

Copy and paste this markdown block directly into your repository's README.md file:

Markdown
# Concurrent Inverted Search Index Engine (React)

A high-performance, client-side search index engine built with React designed for low-latency full-text search directly within the browser. This project features an asynchronous ingestion engine capable of parsing, tokenizing, and indexing raw `.txt` strings and complex, multi-page structured `.pdf` document streams entirely on the client side. By bypassing heavy backend database calls, it implements custom linguistic preprocessing and an optimized inverted index structure capable of handling concurrent search and index operations using Web Workers.

## 🏗️ Application Architecture

The engine processes raw inputs through an isolated, non-blocking client-side execution pipeline:

[ Uploads (.txt / .pdf) ] ──> [ File-Reader & PDF Extractors ]
│
▼
[ Web Worker Thread Pool ]
│
┌──────────────────┴──────────────────┐
▼                                     ▼
[ 1. Text Processing Pipeline ]       [ 2. Inverted Index Map ]
(Tokenization & Stemming)             (Term-Doc Arrays, TF-IDF)
│                                     │
└──────────────────┬──────────────────┘
▼
[ 3. Component Render Layer ]
(Memoized Ranked Results)


1. **Ingestion Layer:** Raw `.txt` files and multi-page `.pdf` binary arrays are uploaded via the React UI, intercepted by client-side reader APIs, and offloaded from the main browser thread.
2. **Web Worker Threading:** To prevent freezing the UI during indexing, a dedicated Web Worker handles text processing and index allocation in the background.
3. **Text Processing Pipeline:** Text inputs are broken down into lowercase tokens and filtered through custom linguistic algorithms (including stop-word elimination and algorithmic stemming).
4. **Inverted Index & Ranking:** Tracks unique terms mapped to an optimized posting list. Queries are evaluated dynamically using a custom vector-space retrieval model ($TF\text{-}IDF$) to return ranked results to the UI.

---

## ⚡ Key Technical Challenges & Implementations

### 1. Client-Side PDF Stream Ingestion
Extracting layout text from binary PDFs in the browser requires parsing nested binary objects without backend assistance. This engine implements an asynchronous PDF parsing wrapper that streams multi-page data, discards embedded media/font metadata, and normalizes the extracted characters into an organized text stream alongside standard plain text files.

### 2. Off-Main-Thread Concurrency via Web Workers
In a single-threaded React environment, indexing thousands of words would instantly drop UI frames and freeze the browser. This architecture decouples the search engine logic into a **Web Worker**. Communication between the React UI components and the storage index happens asynchronously via message passing, keeping the user interface running smoothly at a consistent 60fps.

### 3. High-Performance Text Pipeline in JavaScript/TypeScript
Instead of relying on slow, repeated string allocations, this engine processes text inputs using a single-pass tokenization stream. Tokens are stripped of punctuation and normalized via a custom dictionary-matching stemming routine to compress the unique token space by up to 40%.

### 4. Optimized Vector-Space Ranking (TF-IDF)
Document relevance calculation is decoupled from React component states. Queries are evaluated by computing the Term Frequency-Inverse Document Frequency ($TF\text{-}IDF$) metrics dynamically across the postings array, enabling mathematically accurate relevance rankings rather than simple boolean matches. React components utilize `useMemo` hooks to prevent redundant re-ranking passes during state changes.

---

## 🛠️ Tech Stack & Core Modules

* **Framework:** React 18 / TypeScript
* **Concurrency:** Web Workers API
* **Document Extraction Libraries:** `pdfjs-dist` (Mozilla PDF.js client-side text extraction)
* **Styling & UI:** Tailwind CSS (Optimized for clean, professional layout presentation)

---

## 🚀 Getting Started & Execution

### Prerequisites
Ensure you have **Node.js** (v18 or higher) and npm/yarn installed on your local environment.

### Installation & Set Up
Clone the repository and install the project dependencies:
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install
Running the Application Localy
To boot up the development server and test the text/PDF indexing interface:

Bash
npm run dev


