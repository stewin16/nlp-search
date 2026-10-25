import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Loader from "./Loader";

export const NlpInsights = ({ text, title = "Advanced NLP Intelligence", showLegal = false }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState("readability");
    const [revealedCards, setRevealedCards] = useState({});

    // Speech Synthesis State
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const synthRef = useRef(null);

    const [selectedVoice, setSelectedVoice] = useState(null);

    const pickIndianFemaleVoice = () => {
        if (!synthRef.current) return null;
        const voices = synthRef.current.getVoices() || [];
        
        // 1. Look for Indian English female voice (Heera, Neerja, Priya, Veena, Raveena, Ananya, etc.)
        const indianFemale = voices.find(v => 
            (v.lang === 'en-IN' || v.lang === 'en_IN') && 
            /female|woman|heera|neerja|priya|veena|raveena|ananya|aditi/i.test(v.name)
        );
        if (indianFemale) return indianFemale;

        // 2. Look for any English (India) voice
        const anyIndian = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN');
        if (anyIndian) return anyIndian;

        // 3. Look for any clear female English voice as graceful fallback
        const englishFemale = voices.find(v => 
            v.lang.startsWith('en') && /female|woman|zira|samantha|karen|victoria/i.test(v.name)
        );
        return englishFemale || voices[0] || null;
    };

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            synthRef.current = window.speechSynthesis;
            const updateVoice = () => {
                const voice = pickIndianFemaleVoice();
                if (voice) setSelectedVoice(voice);
            };
            updateVoice();
            if (synthRef.current.onvoiceschanged !== undefined) {
                synthRef.current.onvoiceschanged = updateVoice;
            }
        }
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const playSpeech = (contentToRead) => {
        if (!synthRef.current) {
            alert("Speech synthesis is not supported on your browser.");
            return;
        }
        synthRef.current.cancel();
        const readContent = contentToRead || text;
        if (!readContent) return;

        const utterance = new SpeechSynthesisUtterance(readContent.slice(0, 1500));
        
        const voice = selectedVoice || pickIndianFemaleVoice();
        if (voice) {
            utterance.voice = voice;
        }
        utterance.lang = "en-IN";
        utterance.pitch = 1.05;
        utterance.rate = speechRate;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);

        synthRef.current.speak(utterance);
    };

    const pauseSpeech = () => {
        if (synthRef.current && synthRef.current.speaking) {
            synthRef.current.pause();
            setIsPlayingAudio(false);
        }
    };

    const stopSpeech = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsPlayingAudio(false);
        }
    };

    const analyzeText = async () => {
        if (!text || text.trim().length === 0) {
            alert("No text available to analyze. Please fetch or paste content first.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/api/nlp/comprehensive-analysis", {
                document: { text }
            });
            setData(res.data);
            if (showLegal && res.data?.legal_risk?.total_risk_clauses > 0) {
                setActiveTab("legal");
            } else if (res.data?.flashcards?.length > 0) {
                setActiveTab("flashcards");
            } else {
                setActiveTab("readability");
            }
        } catch (err) {
            console.error("Error analyzing NLP insights:", err);
            alert("Failed to compute NLP insights. Please ensure backend is reachable.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCard = (id) => {
        setRevealedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const exportData = (format = "markdown") => {
        if (!data && !text) return;
        const read = data?.readability;
        const actions = data?.actions_and_questions?.action_items || [];
        const questions = data?.actions_and_questions?.questions || [];
        const cards = data?.flashcards || [];

        let output = "";
        let mimeType = "text/plain";
        let extension = "txt";

        if (format === "json") {
            output = JSON.stringify({
                timestamp: new Date().toISOString(),
                readability: read,
                flashcards: cards,
                actions: actions,
                questions: questions,
                raw_text_preview: text.slice(0, 500)
            }, null, 2);
            mimeType = "application/json";
            extension = "json";
        } else if (format === "markdown") {
            mimeType = "text/markdown";
            extension = "md";
            output += `# Timeless AI - NLP Intelligence & Study Guide\n\n`;
            output += `*Generated automatically on ${new Date().toLocaleDateString()}*\n\n`;
            
            if (read) {
                output += `## Readability & Complexity\n`;
                output += `- **Reading Ease:** ${read.score}/100 (${read.label})\n`;
                output += `- **Grade Level:** ${read.grade}\n`;
                output += `- **Word Count:** ${read.stats.words} words\n`;
                output += `- **Estimated Reading Time:** ${read.stats.reading_time_min} mins\n`;
                output += `- **Lexical Diversity:** ${read.stats.lexical_diversity}%\n\n`;
            }

            if (cards.length > 0) {
                output += `## Key Concept Flashcards\n`;
                cards.forEach((c, idx) => {
                    output += `### ${idx + 1}. ${c.term}\n**Definition/Insight:** ${c.definition}\n\n`;
                });
            }

            if (actions.length > 0) {
                output += `## Action Items & Deadlines\n`;
                actions.forEach(a => {
                    output += `- [ ] [${a.priority.toUpperCase()}] ${a.text}\n`;
                });
                output += `\n`;
            }

            if (questions.length > 0) {
                output += `## Discussion Questions\n`;
                questions.forEach(q => {
                    output += `- ${q.text}\n`;
                });
                output += `\n`;
            }
        } else {
            output += `TIMELESS AI - STUDY GUIDE & INTELLIGENCE REPORT\n`;
            output += `Date: ${new Date().toLocaleDateString()}\n\n`;
            if (read) {
                output += `READABILITY: ${read.score}/100 (${read.label}), Grade: ${read.grade}\n\n`;
            }
            if (cards.length > 0) {
                output += `FLASHCARDS:\n`;
                cards.forEach(c => {
                    output += `- ${c.term}: ${c.definition}\n`;
                });
                output += `\n`;
            }
            if (actions.length > 0) {
                output += `ACTION ITEMS:\n`;
                actions.forEach(a => {
                    output += `- [${a.priority}] ${a.text}\n`;
                });
            }
        }

        const blob = new Blob([output], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `timeless-ai-report-${Date.now()}.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card shadow-sm border-0 rounded-4 my-4 p-4" style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 0, 86, 0.15)",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.06)"
        }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge rounded-pill bg-danger" style={{ background: "#ff0056" }}>NEW NLP</span>
                    <h4 className="m-0 fw-bold" style={{ color: "#222" }}>{title}</h4>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Audio Synthesizer quick controls */}
                    <div className="btn-group bg-light rounded-pill p-1 border">
                        <button
                            className={`btn btn-sm rounded-pill px-3 fw-semibold ${isPlayingAudio ? 'btn-danger text-white' : 'btn-outline-dark'}`}
                            onClick={() => (isPlayingAudio ? pauseSpeech() : playSpeech())}
                            title="Listen to content via Text-to-Speech"
                        >
                            {isPlayingAudio ? "Pause Audio" : "Listen (TTS)"}
                        </button>
                        {isPlayingAudio && (
                            <button className="btn btn-sm btn-light rounded-pill px-2" onClick={stopSpeech}>
                                Stop
                            </button>
                        )}
                    </div>

                    <button
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold"
                        onClick={analyzeText}
                        disabled={loading}
                    >
                        {loading ? "Analyzing..." : (data ? "Refresh Insights" : "Run Deep NLP Analysis")}
                    </button>

                    {data && (
                        <div className="dropdown d-inline-block">
                            <button
                                className="btn btn-sm btn-dark rounded-pill px-3 fw-semibold dropdown-toggle"
                                type="button"
                                id="exportDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                onClick={() => exportData("markdown")}
                            >
                                Export Notes (.md)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isPlayingAudio && (
                <div className="alert alert-light border d-flex align-items-center justify-content-between p-2 mb-3 rounded-3" style={{ background: "#fff5f8" }}>
                    <div className="d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-danger" role="status"/>
                        <span className="small text-danger fw-bold">AI Voice Synthesizer Active: Reading text...</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted">Speed:</span>
                        {[0.8, 1.0, 1.25].map(rate => (
                            <button
                                key={rate}
                                className={`btn btn-xs py-0 px-2 rounded ${speechRate === rate ? 'btn-danger' : 'btn-outline-secondary'}`}
                                onClick={() => setSpeechRate(rate)}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {loading && <div className="text-center py-4"><Loader /></div>}

            {data && !loading && (
                <div>
                    {/* Navigation Pills */}
                    <ul className="nav nav-pills gap-2 mb-3 border-bottom pb-2">
                        <li className="nav-item">
                            <button
                                className={`nav-link rounded-pill py-1 px-3 ${activeTab === 'readability' ? 'active' : 'text-dark'}`}
                                style={activeTab === 'readability' ? { background: '#ff0056' } : {}}
                                onClick={() => setActiveTab('readability')}
                            >
                                Readability & Metrics
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link rounded-pill py-1 px-3 ${activeTab === 'flashcards' ? 'active' : 'text-dark'}`}
                                style={activeTab === 'flashcards' ? { background: '#ff0056' } : {}}
                                onClick={() => setActiveTab('flashcards')}
                            >
                                Flashcards ({data.flashcards?.length || 0})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link rounded-pill py-1 px-3 ${activeTab === 'actions' ? 'active' : 'text-dark'}`}
                                style={activeTab === 'actions' ? { background: '#ff0056' } : {}}
                                onClick={() => setActiveTab('actions')}
                            >
                                Actions & Questions ({data.actions_and_questions?.total_actions + data.actions_and_questions?.total_questions || 0})
                            </button>
                        </li>
                        {showLegal && (
                            <li className="nav-item">
                                <button
                                    className={`nav-link rounded-pill py-1 px-3 ${activeTab === 'legal' ? 'active' : 'text-dark'}`}
                                    style={activeTab === 'legal' ? { background: '#ff0056' } : {}}
                                    onClick={() => setActiveTab('legal')}
                                >
                                    Clause Risk Matrix ({data.legal_risk?.total_risk_clauses || 0})
                                </button>
                            </li>
                        )}
                    </ul>

                    {/* Tab 1: Readability & Metrics */}
                    {activeTab === 'readability' && data.readability && (
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="p-3 rounded-3 bg-light text-center h-100 border">
                                    <span className="text-muted small text-uppercase fw-bold">Reading Ease</span>
                                    <div className="display-5 fw-bold my-2" style={{ color: '#ff0056' }}>
                                        {data.readability.score}
                                    </div>
                                    <span className={`badge bg-${data.readability.badge} py-1 px-2`}>
                                        {data.readability.label}
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 rounded-3 bg-light text-center h-100 border">
                                    <span className="text-muted small text-uppercase fw-bold">Grade Level</span>
                                    <div className="display-5 fw-bold my-2 text-dark">
                                        {data.readability.grade}
                                    </div>
                                    <span className="text-muted small">
                                        Flesch-Kincaid Index: {data.readability.grade_num}
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 rounded-3 bg-light h-100 border">
                                    <span className="text-muted small text-uppercase fw-bold d-block mb-2">Pacing & Complexity</span>
                                    <div className="small d-flex justify-content-between py-1 border-bottom">
                                        <span>Reading Time:</span>
                                        <strong>~{data.readability.stats.reading_time_min} mins</strong>
                                    </div>
                                    <div className="small d-flex justify-content-between py-1 border-bottom">
                                        <span>Speaking Time:</span>
                                        <strong>~{data.readability.stats.speaking_time_min} mins</strong>
                                    </div>
                                    <div className="small d-flex justify-content-between py-1 border-bottom">
                                        <span>Lexical Diversity:</span>
                                        <strong>{data.readability.stats.lexical_diversity}%</strong>
                                    </div>
                                    <div className="small d-flex justify-content-between py-1">
                                        <span>Avg Sentence:</span>
                                        <strong>{data.readability.stats.avg_sentence_len} words</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Flashcards */}
                    {activeTab === 'flashcards' && (
                        <div className="row g-3">
                            {data.flashcards?.length === 0 ? (
                                <p className="text-muted text-center py-3">No distinct definitions detected in this snippet.</p>
                            ) : (
                                data.flashcards.map(c => {
                                    const isRev = revealedCards[c.id];
                                    return (
                                        <div className="col-md-6" key={c.id}>
                                            <div
                                                className="p-3 rounded-3 border h-100 shadow-sm"
                                                style={{
                                                    background: isRev ? "#fff0f5" : "#ffffff",
                                                    cursor: "pointer",
                                                    transition: "all 0.25s ease"
                                                }}
                                                onClick={() => toggleCard(c.id)}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="badge rounded-pill bg-secondary small">Concept #{c.id}</span>
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <button
                                                            className="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                playSpeech(`${c.term}. ${c.definition}`);
                                                            }}
                                                            title="Speak card aloud"
                                                        >
                                                            Listen
                                                        </button>
                                                        <span className="small text-danger fw-bold">
                                                            {isRev ? "Hide Answer [-]" : "Click to Reveal [+]"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <h5 className="fw-bold mb-2 text-dark">{c.term}</h5>
                                                {isRev ? (
                                                    <p className="mb-0 text-secondary small border-top pt-2">
                                                        {c.definition}
                                                    </p>
                                                ) : (
                                                    <p className="mb-0 text-muted small fst-italic">
                                                        [Tap to reveal definition and contextual explanation]
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Tab 3: Actions & Questions */}
                    {activeTab === 'actions' && (
                        <div className="row g-3">
                            <div className="col-md-6">
                                <h6 className="fw-bold text-danger border-bottom pb-2">
                                    Actionable Items & Next Steps ({data.actions_and_questions?.action_items?.length || 0})
                                </h6>
                                {data.actions_and_questions?.action_items?.length === 0 ? (
                                    <p className="text-muted small">No direct imperative directives or deadlines detected.</p>
                                ) : (
                                    <ul className="list-group list-group-flush small">
                                        {data.actions_and_questions.action_items.map(a => (
                                            <li className="list-group-item d-flex align-items-start gap-2 px-0" key={a.id}>
                                                <span className={`badge bg-${a.priority === 'High' ? 'danger' : 'primary'} rounded-pill mt-1`}>
                                                    {a.priority}
                                                </span>
                                                <span>{a.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="col-md-6">
                                <h6 className="fw-bold text-dark border-bottom pb-2">
                                    Questions & Discussion Points ({data.actions_and_questions?.questions?.length || 0})
                                </h6>
                                {data.actions_and_questions?.questions?.length === 0 ? (
                                    <p className="text-muted small">No questions found in this transcript.</p>
                                ) : (
                                    <ul className="list-group list-group-flush small">
                                        {data.actions_and_questions.questions.map(q => (
                                            <li className="list-group-item px-0" key={q.id}>
                                                <strong className="text-danger me-1">Q:</strong>
                                                <span>{q.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Legal Risk Matrix */}
                    {activeTab === 'legal' && showLegal && (
                        <div>
                            {data.legal_risk?.categories?.length === 0 ? (
                                <p className="text-muted text-center py-3">No high-risk contractual clauses detected.</p>
                            ) : (
                                <div className="row g-3">
                                    {data.legal_risk.categories.map(cat => (
                                        <div className="col-md-6" key={cat.category}>
                                            <div className="p-3 rounded-3 border bg-light h-100">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="fw-bold m-0">{cat.category}</h6>
                                                    <span className={`badge bg-${cat.badge}`}>
                                                        {cat.severity} Risk ({cat.count})
                                                    </span>
                                                </div>
                                                <ul className="list-unstyled small mb-0">
                                                    {cat.clauses.map((cl, i) => (
                                                        <li key={i} className="p-2 mb-1 bg-white rounded border">
                                                            "{cl.sentence}"
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NlpInsights;
