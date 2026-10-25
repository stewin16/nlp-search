# `Timeless AI` — Intelligent Video & Document NLP

An intelligent NLP platform designed to instantly extract high-value insights, summaries, readability metrics, study flashcards, and actionable tasks from YouTube lectures, Zoom meetings, and legal documents.

![Timeless AI Architecture](public/logo.png)

---

## Key Features

### 1. YouTube Video Lecture Intelligence
- **Real-Time Captions & Transcript Fetching**: Direct closed-caption retrieval via `youtube-transcript-api` with automatic punctuation and sentence boundaries.
- **Extractive TextRank Summarization**: Identifies the most salient sentences across long tutorials and university lectures.
- **Timestamp Navigation**: Click any extracted sentence to jump directly to that exact second in the video player.
- **Audience Comment Sentiment Analysis**: NLTK VADER sentiment scoring with positivity, negativity, and neutral distributions visual charts.
- **Auto-Generated Comprehension Quizzes**: Synthesizes multiple-choice questions by masking keywords and using WordNet for intelligent distractors.

### 2. Zoom Meeting & Lecture Transcript Analyzer
- **Multi-Speaker Transcript Parsing**: Upload `.vtt`, `.txt`, or paste raw transcripts directly.
- **Action Items & Question Detection**: Scans transcripts for imperative directives, assignment deadlines, homework, and questions.
- **Interactive Flashcards**: Automatically extracts high-recall definitions and concepts with tap-to-reveal answers and voice playback.

### 3. Legal Document & Contract Clause Analyzer
- **Clause Risk Matrix**: Categorizes high-risk contractual clauses (Liability & Indemnity, Termination, Data Protection & Privacy, IP, Governing Law).
- **Readability & Complexity Gauge**: Flesch-Kincaid grade level, Flesch Reading Ease score, lexical diversity, and estimated reading/speaking times.

### 4. Web Speech AI Voice Synthesizer (TTS)
- **Audio Playback**: Listen to the extracted summary, key flashcards, or transcripts with play, pause, stop, and adjustable playback speeds (0.8x, 1.0x, 1.25x).

### 5. Multi-Format Export
- **One-Click Export**: Download study guides and analysis reports as Markdown (`.md`), JSON (`.json`), or Plain Text (`.txt`).

---

## Architecture & Technology Stack

- **Frontend**:
 - React 17 + Vite 8 (ultra-fast compilation, HMR)
 - Bootstrap 5 + Modern Glassmorphism CSS design system
 - Chart.js for sentiment distribution and readability visualization
 - Web Speech API for native browser audio narration

- **Backend**:
 - Python 3.11+ / 3.12+ FastAPI backend (`backend/server.py`)
 - NLTK NLP Toolkit:
 - `punkt` & `averaged_perceptron_tagger` for tokenization and POS tagging
 - `wordnet` & `omw-1.4` for lemmas, hypernyms, hyponyms, and synonyms
 - `vader_lexicon` for sentiment polarity classification
 - `youtube-transcript-api` for real-time video transcript retrieval
 - `pytest` test suite with 100% endpoint coverage

---

## How to Run Locally

### One-Click Launch (Recommended)

Double-click `run_all.bat` or execute in PowerShell:

```powershell
.\run_all.ps1
```

This starts:
- **FastAPI NLP Backend**: `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`)
- **Vite React Web App**: `http://localhost:3000`

---

### Manual Launch

#### 1. Backend Server Setup
```bash
# Activate virtualenv (or create one: python -m venv .venv)
.\.venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn nltk youtube-transcript-api pydantic httpx pytest

# Start FastAPI server
python -m uvicorn backend.server:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Web App Setup
```bash
# In the project root:
npm install

# Start Vite dev server on port 3000
npm start
# or: npm run dev
```

---

## Running Automated Tests

Run the backend test suite:

```bash
.\.venv\Scripts\pytest
```

All 11 endpoint and integration tests will execute against the FastAPI server.

---

## Key API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Health status and service information |
| `/api/ytb-t01` | `GET` | YouTube caption retrieval and extractive summary |
| `/api/ytb-summary-01` | `POST` | Extractive sentence summarization |
| `/api/ytb-similarwords-01` | `POST` | WordNet synonyms, antonyms, and related concepts |
| `/api/nlp/relevants` | `POST` | Main topics, key lemmas, and salience scores |
| `/api/nlp/entities` | `POST` | Named entities and technical keyword extraction |
| `/api/nlp/sentiment` | `POST` | NLTK VADER compound sentiment analysis |
| `/api/nlp/quiz` | `POST` | Dynamic multiple-choice quiz generator |
| `/api/nlp/readability` | `POST` | Flesch-Kincaid grade level and readability metrics |
| `/api/nlp/action-items` | `POST` | Extraction of questions, tasks, and deadlines |
| `/api/nlp/flashcards` | `POST` | High-recall study flashcard synthesis |
| `/api/nlp/legal-analysis` | `POST` | Contractual clause risk categorization |
| `/api/nlp/comprehensive-analysis` | `POST` | Unified deep NLP intelligence pipeline |

---

## License
MIT License • Built with Timeless AI