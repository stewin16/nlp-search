"""
Automated Pytest Suite for Timeless AI NLP Backend
Tests all endpoints: Health, Extractive Summarization, WordNet Similar Words,
Expert.ai Emulation, Smart Quiz Generator, Readability, Action Items & Questions,
Flashcard Synthesis, and Legal Risk Analysis.
"""

import pytest
from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)

SAMPLE_TEXT = (
    "Artificial intelligence is transforming education, medicine, and engineering across the globe. "
    "Machine learning models allow computers to learn directly from unstructured data without explicit rules. "
    "Students must complete their assigned coding exercises before Friday midnight. "
    "What are the most promising breakthroughs in deep natural language processing? "
    "The vendor shall indemnify and hold harmless the customer from all liability, claims, and damages."
)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Timeless AI" in data["service"]


def test_extractive_summary():
    # Direct text payload
    res1 = client.post("/api/ytb-summary-01", json={"text": SAMPLE_TEXT, "word_count": 200})
    assert res1.status_code == 200
    assert "summary" in res1.json()
    assert len(res1.json()["summary"]) > 0

    # Nested document payload
    res2 = client.post("/api/ytb-summary-01", json={"document": {"text": SAMPLE_TEXT}})
    assert res2.status_code == 200
    assert "summary" in res2.json()


def test_similar_words():
    res = client.post("/api/ytb-similarwords-01", json={"words": ["intelligence", "student"]})
    assert res.status_code == 200
    data = res.json()
    assert "intelligence" in data
    assert "synms" in data["intelligence"]
    assert len(data["intelligence"]["synms"]) > 0


def test_nlp_relevants():
    res = client.post("/api/nlp/relevants", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    payload = res.json()["data"]
    assert "mainLemmas" in payload
    assert "mainSentences" in payload
    assert len(payload["mainLemmas"]) > 0


def test_nlp_sentiment():
    res = client.post("/api/nlp/sentiment", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    sentiment = res.json()["data"]["sentiment"]
    assert "overall" in sentiment
    assert isinstance(sentiment["overall"], (int, float))


def test_nlp_quiz():
    res = client.post("/api/nlp/quiz", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    questions = res.json().get("questions", [])
    assert len(questions) > 0
    q = questions[0]
    assert "sentence" in q
    assert "options" in q
    assert len(q["options"]) == 4


def test_readability():
    res = client.post("/api/nlp/readability", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    data = res.json()
    assert "score" in data
    assert "grade" in data
    assert "stats" in data
    assert data["stats"]["words"] > 0


def test_action_items():
    res = client.post("/api/nlp/action-items", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    data = res.json()
    assert "action_items" in data
    assert "questions" in data
    assert len(data["action_items"]) >= 1
    assert len(data["questions"]) >= 1


def test_flashcards():
    res = client.post("/api/nlp/flashcards", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    cards = res.json().get("flashcards", [])
    assert len(cards) > 0
    assert "term" in cards[0]
    assert "definition" in cards[0]


def test_legal_risk_analysis():
    res = client.post("/api/nlp/legal-analysis", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    data = res.json()
    assert "categories" in data
    assert data["total_risk_clauses"] >= 1
    # Indemnity clause should trigger Liability & Indemnity category
    cats = [c["category"] for c in data["categories"]]
    assert "Liability & Indemnity" in cats


def test_comprehensive_analysis():
    res = client.post("/api/nlp/comprehensive-analysis", json={"document": {"text": SAMPLE_TEXT}})
    assert res.status_code == 200
    data = res.json()
    assert "readability" in data
    assert "actions_and_questions" in data
    assert "flashcards" in data
    assert "legal_risk" in data
