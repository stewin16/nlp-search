import React from "react";
import './Home.css';
import axios from "axios";
import YoutubeIFrame from "../../Components/YoutubeIFrame";
import Loader from "../../Components/Loader";
import Chart from "chart.js";
import {StartBanner} from "../../Components/StartBanner";
import {RedOutlineButton} from "../../Components/RedOutlineButton";
import Dictaphone from "../../Components/Dictaphone";
import {SimilarWords} from "../../Components/SimilarWords";
import {GenerateQuiz} from "../../Components/GenerateQuiz";
import NlpInsights from "../../Components/NlpInsights";
import McqQuiz from "../../Components/McqQuiz";
import ExecutiveSummary from "../../Components/ExecutiveSummary";
import _ from "lodash";

const Home = () => {
    const [token, setToken] = React.useState("local-nlp-token");
    const [matchedCaptions, setMatchedCaptions] = React.useState([]);
    const [keyMatchedCaptions, setKeyMatchedCaptions] = React.useState([]);
    const [captions, setCaptions] = React.useState([]);
    const [url, setUrl] = React.useState("https://www.youtube.com/watch?v=k2P_pHQDlp0");
    const [videoId, setVideoId] = React.useState("");
    const [phrase, setPhrase] = React.useState("");
    const [topics, setTopics] = React.useState([]);
    const [transcript, setTranscript] = React.useState("");
    const [startTime, setStartTime] = React.useState(0);
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
    const [errorMessage, setErrorMessage] = React.useState("");

    const chartRef = React.useRef(null);

    const getToken = async () => {
        return "Bearer local-nlp-token";
    };

    const getTranscriptHandler = async () => {
        setErrorMessage("");
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            const vid = match[2];
            setVideoId(vid);
            setLoader(true);
            try {
                const res = await axios.get(`/api/ytb-t01?video_id=${vid}`);
                setLoader(false);
                const fullText = res.data.full_transcript || res.data.summary || "";
                setTranscript(fullText);
                setExecutiveSummary(res.data.summary || "");
                setKeyTakeaways(res.data.key_takeaways || []);
                setSummaryStats(res.data.stats || {});
                setCaptions(res.data.transcripts || []);

                const keyData = await getKeyElements(fullText);
                if (keyData) {
                    const extractedTopics = (keyData['topics'] || []).map(t => t.label);
                    setTopics(extractedTopics.slice(0, 5));
                    setSummary(keyData['mainSentences'] || []);
                    setMainSentences(keyData['mainSentences'] || []);
                    setKeyNotes(keyData['mainLemmas'] || []);
                    if (!res.data.summary && keyData['summary']) {
                        setExecutiveSummary(keyData['summary']);
                        setKeyTakeaways(keyData['keyTakeaways'] || []);
                        setSummaryStats(keyData['stats'] || {});
                    }
                    setQuiz([]);
                }
            } catch (err) {
                console.error("Error fetching video transcript:", err);
                setLoader(false);
                setErrorMessage("Unable to fetch transcript for this video. Please verify the URL.");
            }
        } else {
            alert("Invalid YouTube URL. Please enter a valid YouTube video link.");
            setVideoId("");
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
                    const lemmaTerm = (arr[i].lemma || "").replace("_", " ").toLowerCase();
                    if (lemmaTerm && capText.includes(lemmaTerm)) {
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

    const getSentimentAnalysis = async () => {
        setSaLoader(true);
        try {
            const res = await axios.get(`/api/youtube/comments?video_id=${videoId}`);
            setSaLoader(false);

            const sentiment = res.data?.sentiment || {};
            const sentimentsArray = sentiment.items || [];
            setOverallSentiment(sentiment.overall || 0);

            const chartData = [
                _.meanBy(_.filter(sentimentsArray, o => o.sentiment < -8), o => o.sentiment) || 0,
                _.meanBy(_.filter(sentimentsArray, o => o.sentiment < 0 && o.sentiment >= -8), o => o.sentiment) || 0,
                _.meanBy(_.filter(sentimentsArray, o => o.sentiment < 3 && o.sentiment >= 0), o => o.sentiment) || 0,
                _.meanBy(_.filter(sentimentsArray, o => o.sentiment < 8 && o.sentiment >= 3), o => o.sentiment) || 0,
                _.meanBy(_.filter(sentimentsArray, o => o.sentiment >= 8), o => o.sentiment) || 0
            ];

            const ctx = document.getElementById("sa-chart");
            if (ctx) {
                if (chartRef.current) {
                    chartRef.current.destroy();
                }
                chartRef.current = new Chart(ctx, {
                    type: "pie",
                    data: {
                        labels: ["Don't even think about it", "Not Good", "Okaish", "Good", "Awesome"],
                        datasets: [
                            {
                                label: "Sentiment Score Distribution",
                                data: chartData.map(val => Math.abs(val) || 1),
                                backgroundColor: [
                                    "#cfcece",
                                    "#f3e5ea",
                                    "#fdaac8",
                                    "#F9679C",
                                    "#ff0560"
                                ],
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        legend: {
                            position: 'bottom'
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Error in getSentimentAnalysis:", err);
            setSaLoader(false);
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
            const questions = await GenerateQuiz(transcript, keyNotes, token);
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
            <StartBanner/>
            <div className="container transcript" id="getstarted">
                <div className="text-centre"><h1 className="color-dark">Get Started</h1></div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="inner">
                            <label htmlFor="youtubeUrl">Youtube URL *</label>
                            <input className="input" type="url" name="Youtube Url" id="youtubeUrl" value={url}
                                   placeholder="e.g. https://www.youtube.com/watch?v=k2P_pHQDlp0"
                                   onChange={(e) => setUrl(e.target.value)}/>
                            <div className="d-flex gap-2 mt-2 flex-wrap">
                                <button type="button" className="button button-v2" onClick={getTranscriptHandler}>
                                    Get Video
                                </button>
                                <button type="button" className="button button-v3" onClick={() => {
                                    setUrl("https://www.youtube.com/watch?v=k2P_pHQDlp0");
                                }}>
                                    Load Sample 1 (PyTorch)
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => {
                                    setUrl("https://www.youtube.com/watch?v=aircAruvnKk");
                                }}>
                                    Sample 2 (Neural Nets)
                                </button>
                            </div>
                            {loader ? <Loader/> : ""}
                            {errorMessage ? <p className="text-danger mt-2">{errorMessage}</p> : null}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="grid-item">
                            <header className="App-header">
                                {videoId.length === 11 ?
                                    <YoutubeIFrame videoId={videoId} startTimeInSeconds={Math.floor(startTime)}/> :
                                    <div className="dummy"/>}
                            </header>
                        </div>
                        {topics.length > 0 ? topics.map((topic, i) => (
                            <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                <span className="button button-v4 button-sm">#{topic}</span>
                            </div>
                        )) : ""}
                    </div>
                </div>

                {videoId.length > 0 && transcript.length > 0 ? (
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
                                    <RedOutlineButton onClick={() => {
                                        update(1);
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
                                    <ExecutiveSummary
                                        summary={executiveSummary}
                                        keyTakeaways={keyTakeaways}
                                        transcript={transcript}
                                        mainSentences={mainSentences.length > 0 ? mainSentences : summary}
                                        captions={captions}
                                        stats={summaryStats}
                                        onSeek={(time) => setStartTime(time)}
                                        title="YouTube Video Lecture Intelligence Summary"
                                    />
                                </div>
                            )}

                            {vis2 && (
                                <div className="col-md-12">
                                    <h2>Key Notes & Clickable Moments</h2>
                                    {knLoader ? <Loader/> : ""}
                                    {keyMatchedCaptions.map((c, i) => (
                                        <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                            <button className="button button-v3 button-sm"
                                                    onClick={() => setStartTime(c.start)}
                                                    type="button">
                                                {c.matchedPhrase} - {Math.floor(c.start)}s
                                            </button>
                                        </div>
                                    ))}
                                    {!keyMatchedCaptionFound && !knLoader ? (
                                        <p className="text-muted">No key phrase moments directly matched in captions.</p>
                                    ) : null}
                                </div>
                            )}

                            {vis3 && (
                                <div className="col-md-12">
                                    <div>
                                        <h2>Search Phrase in Captions</h2>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label htmlFor="phrase">Phrase *</label>
                                                <input className="input" type="text" name="Phrase"
                                                       id="phrase"
                                                       value={phrase}
                                                       placeholder="Enter Keyword or Concept"
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
                                                    <button className="button button-v3 button-sm"
                                                            onClick={() => setStartTime(c.start)}
                                                            type="button">
                                                        {c.matchedPhrase} - {Math.floor(c.start)}s ({c.text})
                                                    </button>
                                                </div>
                                            ))}
                                            {!matchedCaptionFound && !spLoader ? (
                                                <p className="text-muted">No captions matched your query. Try a different phrase.</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vis4 && (
                                <div className="col-md-12">
                                    <h2>Sentiment Analysis of Audience Comments</h2>
                                    {saLoader ? <Loader/> : ""}
                                    <div className="row">
                                        <div className="col-md-7">
                                            <canvas id="sa-chart" width="400" height="250"/>
                                        </div>
                                        <div className="col-md-5">
                                            <h4 className="text-centre">Overall Sentiment</h4>
                                            <p className="fontsize-lg text-centre color-primary sentiment-score">
                                                {overallSentiment}
                                            </p>
                                            <p className="fontsize-xs text-right">
                                                -100 Most Negative <br/> +100 Most Positive
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
                                            <p className="text-muted mt-2">Generating multiple-choice questions from lecture concepts...</p>
                                        </div>
                                    ) : (
                                        <McqQuiz
                                            questions={quiz}
                                            onRetake={() => {
                                                setQuiz([]);
                                                getQuiz();
                                            }}
                                            title="Smart Lecture Comprehension Quiz (MCQ)"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {transcript && (
                            <div className="row mt-4">
                                <div className="col-12">
                                    <NlpInsights text={transcript} title="Video Lecture Deep NLP Intelligence" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Home;
