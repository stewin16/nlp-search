import React from "react";
import axios from "axios";
import Loader from "../../Components/Loader";
import './Zoom.css';
import {RedOutlineButton} from "../../Components/RedOutlineButton";
import Dictaphone from "../../Components/Dictaphone";
import {SimilarWords} from "../../Components/SimilarWords";
import {GenerateQuiz} from "../../Components/GenerateQuiz";
import NlpInsights from "../../Components/NlpInsights";
import McqQuiz from "../../Components/McqQuiz";
import ExecutiveSummary from "../../Components/ExecutiveSummary";
import _ from "lodash";

const SAMPLE_ZOOM_CAPTIONS = [
    {start: "00:00", text: "In today's lecture on Natural Language Processing, we will explore transformers and neural attention mechanisms."},
    {start: "00:15", text: "Attention allows models to dynamically weigh the relevance of each token in a sentence relative to all other tokens."},
    {start: "00:32", text: "Before self-attention, recurrent neural networks struggled with long-range dependencies because gradients vanished."},
    {start: "00:50", text: "The transformer architecture introduced positional encodings to preserve word order without sequential recurrence."},
    {start: "01:08", text: "Self-attention computes query, key, and value matrices to determine attention weights across the vocabulary."},
    {start: "01:25", text: "In modern architectures like BERT and GPT, multi-head attention enables the network to attend to information at different representation subspaces."},
    {start: "01:42", text: "Pre-training on massive corpora followed by fine-tuning on downstream tasks is now the standard paradigm in modern AI."},
    {start: "02:00", text: "Extractive summarization and token classification provide actionable insights into large scale lecture recordings."}
];
const DEFAULT_ZOOM_TRANSCRIPT = SAMPLE_ZOOM_CAPTIONS.map(s => s.text).join(" ");

const Zoom = () => {
    const [transcript, setTranscript] = React.useState(DEFAULT_ZOOM_TRANSCRIPT);
    const [matchedCaptions, setMatchedCaptions] = React.useState([]);
    const [keyMatchedCaptions, setKeyMatchedCaptions] = React.useState([]);
    const [captions, setCaptions] = React.useState(SAMPLE_ZOOM_CAPTIONS);
    const [phrase, setPhrase] = React.useState("");
    const [topics, setTopics] = React.useState([]);
    const [keyNotes, setKeyNotes] = React.useState([]);
    const [summary, setSummary] = React.useState([]);
    const [executiveSummary, setExecutiveSummary] = React.useState("");
    const [keyTakeaways, setKeyTakeaways] = React.useState([]);
    const [summaryStats, setSummaryStats] = React.useState({});
    const [mainSentences, setMainSentences] = React.useState([]);
    const [quiz, setQuiz] = React.useState([]);
    const [matchedCaptionFound, setMatchedCaptionFound] = React.useState(true);
    const [keyMatchedCaptionFound, setKeyMatchedCaptionFound] = React.useState(true);
    const [vis1, setVis1] = React.useState(false);
    const [vis2, setVis2] = React.useState(false);
    const [vis3, setVis3] = React.useState(false);
    const [vis4, setVis4] = React.useState(false);
    const [vis5, setVis5] = React.useState(false);
    const [loader, setLoader] = React.useState(false);
    const [summaryLoader, setSummaryLoader] = React.useState(false);
    const [spLoader, setSpLoader] = React.useState(false);
    const [knLoader, setKnLoader] = React.useState(false);
    const [saLoader, setSaLoader] = React.useState(false);
    const [quizLoader, setQuizLoader] = React.useState(false);
    const [overallSentiment, setOverallSentiment] = React.useState(0);
    const [speech, setSpeech] = React.useState("");

    const showFile = async (e) => {
        e.preventDefault();
        if (!e.target.files || e.target.files.length === 0) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            let text = evt.target.result;
            const times = text.match(/[0-9]?[0-9]:[0-9][0-9]:[0-9][0-9]/g) || text.match(/[0-9][0-9]:[0-9][0-9]/g) || [];
            let splitText = text.split(/[0-9]?[0-9]:[0-9][0-9]:[0-9][0-9]/g);
            if (splitText.length <= 1) {
                splitText = text.split(/[0-9][0-9]:[0-9][0-9]/g);
            }

            let cap = [];
            let fullTranscript = "";
            const len = Math.min(times.length, splitText.length);

            if (len > 0) {
                for (let i = 0; i < len; i++) {
                    const data = splitText[i].trim();
                    const start = times[i].trim();
                    if (data.length > 2 && start.length > 0) {
                        cap.push({
                            text: data,
                            start: start
                        });
                        fullTranscript += data + " ";
                    }
                }
            } else {
                // Raw text without timestamps
                const lines = text.split("\n").filter(l => l.trim().length > 0);
                lines.forEach((l, idx) => {
                    cap.push({
                        text: l.trim(),
                        start: `00:${String(idx * 5).padStart(2, '0')}`
                    });
                    fullTranscript += l.trim() + " ";
                });
            }

            setCaptions(cap);
            setTranscript(fullTranscript.trim());
        };
        reader.readAsText(e.target.files[0]);
    };

    const zoomHandler = async () => {
        if (!transcript) {
            alert("Please select a Zoom transcript file first.");
            return;
        }
        setLoader(true);
        try {
            const payload = {
                text: transcript,
                word_count: 250
            };
            const res = await axios.post(`/api/ytb-summary-01`, payload);
            if (res.data) {
                setExecutiveSummary(res.data.summary || "");
                setKeyTakeaways(res.data.key_takeaways || []);
                setSummaryStats(res.data.stats || {});
                const data = await getKeyElements(transcript);
                setLoader(false);
                if (data) {
                    const topicLabels = (data['topics'] || []).map(topic => topic.label);
                    setTopics(topicLabels.slice(0, 5));
                    setSummary(data['mainSentences'] || []);
                    setMainSentences(data['mainSentences'] || []);
                    setKeyNotes(data['mainLemmas'] || []);
                    setQuiz([]);
                }
            }
        } catch (err) {
            console.error("Error processing zoom transcript:", err);
            setLoader(false);
        }
    };

    const getKeyElements = async (text) => {
        try {
            const payload = {
                document: {
                    text: text
                }
            };
            const headers = {
                "accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            };
            const res = await axios.post(`/api/nlp/relevants`, payload, {headers});
            return res.data?.data;
        } catch (err) {
            console.error("Error in getKeyElements:", err);
            return null;
        }
    };

    const getSentimentAnalysis = async () => {
        setSaLoader(true);
        try {
            const payload = {
                document: {
                    text: transcript
                }
            };
            const headers = {
                "accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            };
            const res = await axios.post(`/api/nlp/sentiment`, payload, {headers});
            setSaLoader(false);
            const sentiment = res.data?.data?.sentiment || {};
            setOverallSentiment(sentiment.overall || 0);
        } catch (err) {
            console.error("Error in getSentimentAnalysis:", err);
            setSaLoader(false);
        }
    };

    const getKeyNotes = async () => {
        setKnLoader(true);
        try {
            const payload = {
                document: {
                    text: transcript
                }
            };
            const headers = {
                "accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            };
            const res = await axios.post(`/api/nlp/entities`, payload, {headers});
            setKnLoader(false);
            const arr = res.data?.data?.entities || [];
            const matches = [];

            captions.forEach(caption => {
                const capText = (caption.text || "").toLowerCase();
                for (let i = 0; i < arr.length; i++) {
                    const term = (arr[i].lemma || "").replace("_", " ").toLowerCase();
                    if (term && capText.includes(term)) {
                        matches.push({
                            ...caption,
                            matchedPhrase: arr[i].lemma
                        });
                        break;
                    }
                }
            });

            setKeyMatchedCaptions(matches);
            setKeyMatchedCaptionFound(matches.length > 0);
        } catch (err) {
            console.error("Error in getKeyNotes:", err);
            setKnLoader(false);
        }
    };

    const searchPhraseHandler = async () => {
        let englishLangPhrase = (phrase.trim() || speech.trim());
        if (englishLangPhrase.length === 0) {
            setMatchedCaptionFound(false);
            return;
        }
        setSpeech("");
        setPhrase("");
        setSpLoader(true);

        try {
            const lemmas = [englishLangPhrase];
            const data = await getKeyElements(englishLangPhrase);
            if (data && data['mainLemmas']) {
                data['mainLemmas'].forEach(lemma => {
                    if (lemma.value !== englishLangPhrase) lemmas.push(lemma.value);
                });
            }

            const similar_words = await SimilarWords([lemmas[0]]) || {};
            setSpLoader(false);

            const synonyms = similar_words[lemmas[0]]?.synms || [];
            const searchTerms = [...synonyms, ...lemmas].map(t => t.replace("_", " ").toLowerCase());

            const matches = [];
            captions.forEach(caption => {
                const capText = (caption.text || "").toLowerCase();
                for (let i = 0; i < searchTerms.length; i++) {
                    if (searchTerms[i] && capText.includes(searchTerms[i])) {
                        matches.push({
                            ...caption,
                            matchedPhrase: searchTerms[i]
                        });
                        break;
                    }
                }
            });

            setMatchedCaptions(matches);
            setMatchedCaptionFound(matches.length > 0);
        } catch (err) {
            console.error("Error in searchPhraseHandler:", err);
            setSpLoader(false);
        }
    };

    const getSummary = () => {
        if (!summary || summary.length === 0) {
            return <div><p className="fontsize-sm">{transcript}</p></div>;
        }

        const sortedSummary = [...summary].sort((a, b) => a.start - b.start);
        let prev = 0;
        const html = [];

        sortedSummary.forEach((s, idx) => {
            const start = Math.max(0, s.start);
            const end = Math.min(transcript.length, s.end);
            if (start > prev) {
                html.push(<span key={`norm-${idx}`}>{transcript.substring(prev, start)} </span>);
            }
            html.push(
                <span key={`high-${idx}`} className={'highlight'} style={{backgroundColor: '#ffe2ec', padding: '2px 4px', borderRadius: '3px'}}>
                    {transcript.substring(start, end)}
                </span>
            );
            prev = end;
        });

        if (prev < transcript.length) {
            html.push(<span key="tail">{transcript.substring(prev)}</span>);
        }

        return <div style={{lineHeight: '1.8', fontSize: '15px'}}>{html}</div>;
    };

    const getQuiz = async () => {
        if (quiz.length > 0) return;
        setQuizLoader(true);
        try {
            const questions = await GenerateQuiz(transcript, keyNotes, "local-nlp-token");
            setQuiz(questions || []);
        } catch (err) {
            console.error("Error in getQuiz:", err);
        } finally {
            setQuizLoader(false);
        }
    };

    const update = (vis) => {
        setVis1(vis === 1);
        setVis2(vis === 2);
        setVis3(vis === 3);
        setVis4(vis === 4);
        setVis5(vis === 5);
    };

    const handleSpeech = (res) => {
        setSpeech(res);
    };

    return (
        <div>
            <div className="container transcript">
                <div className="text-centre"><h1 className="color-dark">Zoom Lecture Analyzer</h1></div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="inner">
                            <label htmlFor="zoomFile">Zoom Transcript (.txt / transcript file) *</label>
                            <input className="input" type="file" name="Zoom Transcript" id="zoomFile"
                                   accept=".txt,.vtt"
                                   onChange={async (e) => {
                                       await showFile(e);
                                   }}/>
                            <div className="d-flex gap-2 mt-2 flex-wrap">
                                <button type="button" className="button button-v2" onClick={zoomHandler}>
                                    Summarize & Analyze
                                </button>
                                <button type="button" className="button button-v3" onClick={() => {
                                    const sample = [
                                        {start: "00:00", text: "In today's lecture on Natural Language Processing, we will explore transformers and neural attention mechanisms."},
                                        {start: "00:15", text: "Attention allows models to dynamically weigh the relevance of each token in a sentence relative to all other tokens."},
                                        {start: "00:32", text: "Before self-attention, recurrent neural networks struggled with long-range dependencies because gradients vanished."},
                                        {start: "00:50", text: "The transformer architecture introduced positional encodings to preserve word order without sequential recurrence."},
                                        {start: "01:08", text: "Self-attention computes query, key, and value matrices to determine attention weights across the vocabulary."},
                                        {start: "01:25", text: "In modern architectures like BERT and GPT, multi-head attention enables the network to attend to information at different representation subspaces."},
                                        {start: "01:42", text: "Pre-training on massive corpora followed by fine-tuning on downstream tasks is now the standard paradigm in modern AI."},
                                        {start: "02:00", text: "Extractive summarization and token classification provide actionable insights into large scale lecture recordings."}
                                    ];
                                    setCaptions(sample);
                                    setTranscript(sample.map(s => s.text).join(" "));
                                }}>
                                    Load Sample Lecture
                                </button>
                            </div>
                            {loader ? <Loader/> : ""}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="grid-item">
                            <header className="App-header">
                                {captions.length > 0 ? (
                                    <div className="transcript-zoom" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                        {captions.map((cap, i) => (
                                            <div key={i} className="item mb-2">
                                                <p className="fontsize-xs start text-primary mb-1">{cap.start}</p>
                                                <p className="fontsize-sm text">{cap.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="dummy-zoom"/>
                                )}
                            </header>
                        </div>
                        {topics.length > 0 ? topics.map((topic, i) => (
                            <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                <span className="button button-v4 button-sm">#{topic}</span>
                            </div>
                        )) : ""}
                    </div>
                </div>

                {captions.length > 0 && transcript.length > 0 ? (
                    <div>
                        <div className="row" style={{marginBottom: "40px", marginTop: "20px"}}>
                            <h3 className="fontsize-md color-dark">Select Any</h3>
                            <div className="col-md-12">
                                <div className="inline me-2 mb-2">
                                    <RedOutlineButton onClick={() => {
                                        getKeyNotes();
                                        update(2);
                                    }}>
                                        Key Notes
                                    </RedOutlineButton>
                                </div>
                                <div className="inline me-2 mb-2">
                                    <RedOutlineButton onClick={() => {
                                        update(3);
                                    }}>
                                        Search Phrase
                                    </RedOutlineButton>
                                </div>
                                <div className="inline me-2 mb-2">
                                    <RedOutlineButton onClick={async () => {
                                        update(1);
                                        if (!executiveSummary && transcript) {
                                            setSummaryLoader(true);
                                            try {
                                                const res = await axios.post(`/api/ytb-summary-01`, {
                                                    text: transcript,
                                                    word_count: 250
                                                });
                                                if (res.data) {
                                                    setExecutiveSummary(res.data.summary || "");
                                                    setKeyTakeaways(res.data.key_takeaways || []);
                                                    setSummaryStats(res.data.stats || {});
                                                }
                                            } catch (e) {
                                                console.error("Summary error:", e);
                                            } finally {
                                                setSummaryLoader(false);
                                            }
                                        }
                                    }}>
                                        Get Summary
                                    </RedOutlineButton>
                                </div>
                                <div className="inline me-2 mb-2">
                                    <RedOutlineButton onClick={() => {
                                        getQuiz();
                                        update(5);
                                    }}>
                                        Generate Quiz
                                    </RedOutlineButton>
                                </div>
                                <div className="inline me-2 mb-2">
                                    <RedOutlineButton onClick={() => {
                                        getSentimentAnalysis();
                                        update(4);
                                    }}>
                                        Analyse Sentiment
                                    </RedOutlineButton>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {vis1 && (
                                <div className="col-md-12">
                                    {summaryLoader ? (
                                        <div className="text-center py-5">
                                            <Loader />
                                            <p className="text-muted mt-2">Generating executive lecture summary and key takeaways...</p>
                                        </div>
                                    ) : (
                                        <ExecutiveSummary
                                            summary={executiveSummary}
                                            keyTakeaways={keyTakeaways}
                                            transcript={transcript}
                                            mainSentences={mainSentences.length > 0 ? mainSentences : summary}
                                            captions={captions}
                                            stats={summaryStats}
                                            title="Zoom Lecture Intelligence Summary"
                                        />
                                    )}
                                </div>
                            )}

                            {vis2 && (
                                <div className="col-md-12">
                                    <h2>Key Notes & Topics</h2>
                                    {knLoader ? <Loader/> : ""}
                                    {keyMatchedCaptions.map((c, i) => (
                                        <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                            <button className="button button-v3 button-sm" type="button">
                                                {c.matchedPhrase} - {c.start}
                                            </button>
                                        </div>
                                    ))}
                                    {!keyMatchedCaptionFound && !knLoader ? (
                                        <p className="text-muted">No phrase matched directly in captions.</p>
                                    ) : null}
                                </div>
                            )}

                            {vis3 && (
                                <div className="col-md-12">
                                    <div>
                                        <h2>Search Phrase in Lecture</h2>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="zoomPhrase">Phrase *</label>
                                                <input className="input" type="text" name="Phrase"
                                                       id="zoomPhrase"
                                                       value={phrase}
                                                       placeholder="Enter Keyword"
                                                       onChange={(e) => setPhrase(e.target.value)}/>
                                            </div>
                                            <div className="col-md-6">
                                                <label>Try Speaking Instead</label>
                                                <Dictaphone handleSpeech={handleSpeech}/>
                                            </div>
                                            <div className="col-md-12 mt-2">
                                                <button className="button button-v2" type="button"
                                                        onClick={searchPhraseHandler}>
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                        {spLoader ? <Loader/> : ""}
                                        <div className="mt-3">
                                            {matchedCaptions.map((c, i) => (
                                                <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                                    <button className="button button-v3 button-sm" type="button">
                                                        {c.matchedPhrase} - {c.start} ({c.text})
                                                    </button>
                                                </div>
                                            ))}
                                            {!matchedCaptionFound && !spLoader ? (
                                                <p className="text-muted">Try with a different phrase.</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vis4 && (
                                <div className="col-md-12">
                                    <h2>Sentiment Analysis of Lecture</h2>
                                    {saLoader ? <Loader/> : ""}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h4 className="text-centre">Overall Lecture Tone</h4>
                                            <p className="fontsize-lg text-centre color-primary sentiment-score">
                                                {overallSentiment}
                                            </p>
                                            <p className="fontsize-xs text-center text-muted">
                                                -100 Most Critical / Negative &nbsp;|&nbsp; +100 Most Engaging / Positive
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vis5 && (
                                <div className="col-md-12">
                                    {quizLoader ? (
                                        <div className="text-center py-5">
                                            <Loader/>
                                            <p className="text-muted mt-2">Generating multiple-choice questions from Zoom lecture concepts...</p>
                                        </div>
                                    ) : (
                                        <McqQuiz
                                            questions={quiz}
                                            onRetake={() => {
                                                setQuiz([]);
                                                getQuiz();
                                            }}
                                            title="Zoom Lecture Comprehension Quiz (MCQ)"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {transcript && (
                            <div className="row mt-4">
                                <div className="col-12">
                                    <NlpInsights text={transcript} title="Zoom Lecture Intelligence & Study Tools" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Zoom;