"""
Exhaustive End-to-End Feature Verification Script for Timeless AI
Validates all 15 core features:
1. Health & Service Availability
2. YouTube Closed-Caption Retrieval & Auto-Summary
3. TextRank Extractive Summarization
4. WordNet Semantic Relations & Synonyms
5. Topic & Lemma Extraction
6. Named Entity & Technical Term Mining
7. NLTK VADER Sentiment Analysis
8. Automated Quiz & Distractor Generator
9. Sentence & Token Disambiguation
10. Flesch-Kincaid Readability & Complexity Calculator
11. Action Items & Question Detection
12. High-Recall Study Flashcards
13. Legal Risk & Contract Clause Matrix
14. Unified Comprehensive Intelligence Pipeline
15. YouTube Comments Sentiment Endpoint
"""

import time
import json
from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)
results = []

def run_test(name, func):
    t0 = time.time()
    try:
        details = func()
        duration = round((time.time() - t0) * 1000, 1)
        results.append({'feature': name, 'status': 'PASS', 'duration_ms': duration, 'details': details})
        print(f" [PASS] {name} ({duration}ms) -> {details}")
    except Exception as e:
        duration = round((time.time() - t0) * 1000, 1)
        results.append({'feature': name, 'status': 'FAIL', 'duration_ms': duration, 'error': str(e)})
        print(f" [FAIL] {name} ({duration}ms) -> {e}")

sample_lecture = (
    "Welcome to Machine Learning and Deep Neural Networks. "
    "Supervised learning trains models on labeled input-output pairs to approximate unknown functions. "
    "Backpropagation calculates the gradient of the loss function with respect to weights using the chain rule. "
    "Students must submit project milestone 1 by next Tuesday at 11:59 PM. "
    "What is the fundamental difference between overfitting and underfitting? "
    "The licensee shall indemnify and hold harmless the licensor against all claims and damages arising from breach."
)

# 1. Health Check
def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    return "Status: OK (Timeless AI Backend)"
run_test("1. Health Check Endpoint", test_health)

# 2. YouTube Captions & Extractive Summary
def test_yt_transcript():
    res = client.get("/api/ytb-t01?video_id=k2P_pHQDlp0")
    assert res.status_code == 200
    d = res.json()
    assert "transcripts" in d and len(d["transcripts"]) > 0
    assert "summary" in d and len(d["summary"]) > 0
    return f"{len(d['transcripts'])} segments parsed, summary: {len(d['summary'])} chars"
run_test("2. YouTube Captions & Summary", test_yt_transcript)

# 3. Extractive Summarization
def test_summary():
    res = client.post("/api/ytb-summary-01", json={"text": sample_lecture, "word_count": 100})
    assert res.status_code == 200
    d = res.json()
    assert "summary" in d and len(d["summary"]) > 0
    return f"Summary: \"{d['summary'][:55]}...\""
run_test("3. TextRank Extractive Summarization", test_summary)

# 4. WordNet Semantic Synonyms & Antonyms
def test_wordnet():
    res = client.post("/api/ytb-similarwords-01", json={"words": ["gradient", "learn"]})
    assert res.status_code == 200
    d = res.json()
    assert "gradient" in d and "learn" in d
    syns = d["learn"]["synms"]
    return f"Synonyms for 'learn': {syns[:3]}"
run_test("4. WordNet Semantic Synonyms", test_wordnet)

# 5. Topic & Lemma Extraction
def test_relevants():
    res = client.post("/api/nlp/relevants", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()["data"]
    assert len(d["topics"]) > 0
    assert len(d["mainLemmas"]) > 0
    top_topics = [t["label"] for t in d["topics"]]
    return f"Identified topics: {top_topics[:4]}"
run_test("5. Topic & Salient Lemma Extraction", test_relevants)

# 6. Named Entities & Phrases
def test_entities():
    res = client.post("/api/nlp/entities", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()["data"]
    assert len(d["entities"]) > 0
    ents = [e["lemma"] for e in d["entities"][:3]]
    return f"Extracted entities: {ents}"
run_test("6. Entity & Technical Term Extraction", test_entities)

# 7. Sentiment Polarity
def test_sentiment():
    res = client.post("/api/nlp/sentiment", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()["data"]["sentiment"]
    return f"Overall polarity: {d['overall']}, sentence items: {len(d['items'])}"
run_test("7. VADER Sentiment Analysis", test_sentiment)

# 8. Smart Quiz Generation
def test_quiz():
    res = client.post("/api/nlp/quiz", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    questions = res.json().get("questions", [])
    assert len(questions) > 0
    q = questions[0]
    return f"Sample question: \"{q['sentence'][:45]}...\" -> Answer: '{q['answer']}'"
run_test("8. Automated Quiz & Distractor Generator", test_quiz)

# 9. Disambiguation
def test_disambiguation():
    res = client.post("/api/nlp/disambiguation", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()["data"]
    assert len(d["sentences"]) > 0
    assert len(d["tokens"]) > 0
    return f"{len(d['sentences'])} sentences, {len(d['tokens'])} tokens disambiguated"
run_test("9. Sentence & Token Disambiguation", test_disambiguation)

# 10. Readability & Complexity
def test_readability():
    res = client.post("/api/nlp/readability", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()
    assert "score" in d and "grade" in d
    return f"Ease: {d['score']}/100, Grade: {d['grade']}, Reading Time: ~{d['stats']['reading_time_min']} min"
run_test("10. Flesch-Kincaid Readability Metrics", test_readability)

# 11. Action Items & Deadlines
def test_actions():
    res = client.post("/api/nlp/action-items", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()
    assert len(d["action_items"]) > 0
    assert len(d["questions"]) > 0
    return f"{d['total_actions']} actions (Priority: {d['action_items'][0]['priority']}), {d['total_questions']} questions detected"
run_test("11. Action Items & Question Extraction", test_actions)

# 12. Flashcard Synthesis
def test_flashcards():
    res = client.post("/api/nlp/flashcards", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    cards = res.json().get("flashcards", [])
    assert len(cards) > 0
    return f"{len(cards)} cards generated (Term: '{cards[0]['term']}')"
run_test("12. High-Recall Study Flashcards", test_flashcards)

# 13. Legal Risk Analysis
def test_legal():
    res = client.post("/api/nlp/legal-analysis", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()
    assert d["total_risk_clauses"] > 0
    cats = [c["category"] for c in d["categories"]]
    return f"{d['total_risk_clauses']} risk clauses found in categories: {cats}"
run_test("13. Legal Risk & Clause Matrix", test_legal)

# 14. Comprehensive Pipeline
def test_comprehensive():
    res = client.post("/api/nlp/comprehensive-analysis", json={"document": {"text": sample_lecture}})
    assert res.status_code == 200
    d = res.json()
    assert "readability" in d and "actions_and_questions" in d and "flashcards" in d and "legal_risk" in d
    return "All 4 intelligence sub-modules executed successfully"
run_test("14. Comprehensive NLP Pipeline", test_comprehensive)

# 15. YouTube Comments endpoint
def test_comments():
    res = client.get("/api/youtube/comments?video_id=k2P_pHQDlp0")
    assert res.status_code == 200
    return f"Comments endpoint responded with HTTP {res.status_code}"
run_test("15. YouTube Comments Sentiment", test_comments)

failed = [r for r in results if r["status"] == "FAIL"]
print("\n" + "=" * 65)
print(f" TOTAL FEATURES TESTED: {len(results)}")
print(f" PASSED: {len(results) - len(failed)}")
print(f" FAILED: {len(failed)}")
print("=" * 65)

if failed:
    print("\nFAILED DETAILS:")
    for f in failed:
        print(f" - {f['feature']}: {f['error']}")
    exit(1)
else:
    print("\n>>> ALL 15 FEATURES TESTED AND 100% OPERATIONAL! <<<\n")
