import React from "react";
import axios from "axios";
import Loader from "../../Components/Loader";
import './legal.css';
import {RedOutlineButton} from "../../Components/RedOutlineButton";
import NlpInsights from "../../Components/NlpInsights";

const DEFAULT_LEGAL_TEXT = "This Privacy Policy describes how OmniLex AI collects, uses, and discloses information when you use our services. We collect personal data that you provide directly to us when registering an account, including your email address and profile credentials. When you interact with our platform, we automatically collect log data such as your IP address, browser type, operating system, and access timestamps. We process this information to operate, maintain, and enhance the functionality of our natural language processing features. We do not sell your personal data to third parties. We may disclose personal information if required by law, subpoena, or legal proceeding, or if we determine in good faith that disclosure is necessary to protect our rights, prevent fraud, or ensure user safety. You retain the right to access, rectify, or request deletion of your personal data at any time by contacting privacy@omnilex.ai. We employ industry-standard encryption protocols and security controls to safeguard data against unauthorized access, destruction, or alteration.";

const Legal = () => {
    const [transcript, setTranscript] = React.useState(DEFAULT_LEGAL_TEXT);
    const [keyMatchedCaptions, setKeyMatchedCaptions] = React.useState([]);
    const [captions, setCaptions] = React.useState(DEFAULT_LEGAL_TEXT);
    const [topics, setTopics] = React.useState([]);
    const [keyNotes, setKeyNotes] = React.useState([]);
    const [summary, setSummary] = React.useState([]);
    const [keyMatchedCaptionFound, setKeyMatchedCaptionFound] = React.useState(true);
    const [vis1, setVis1] = React.useState(false);
    const [vis2, setVis2] = React.useState(false);
    const [loader, setLoader] = React.useState(false);
    const [summaryLoader, setSummaryLoader] = React.useState(false);
    const [knLoader, setKnLoader] = React.useState(false);

    const showFile = async (e) => {
        e.preventDefault();
        if (!e.target.files || e.target.files.length === 0) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            let text = evt.target.result;
            text = text.replace(/\r?\n|\r/g, " ");
            text = text.split('"').join('');
            setCaptions(text);
            setTranscript(text);
        };
        reader.readAsText(e.target.files[0]);
    };

    const zoomHandler = async () => {
        if (!transcript) {
            alert("Please select a document or privacy policy file first.");
            return;
        }
        setLoader(true);
        try {
            const payload = {
                text: transcript,
                word_count: 500
            };
            const res = await axios.post(`/api/ytb-summary-01`, payload);
            if (res.data && res.data.summary) {
                setTranscript(res.data.summary);
                const data = await getKeyElements(res.data.summary);
                setLoader(false);
                if (data) {
                    const topicLabels = (data['topics'] || []).map(topic => topic.label);
                    setTopics(topicLabels.slice(0, 5));
                    setSummary(data['mainSentences'] || []);
                    setKeyNotes(data['mainLemmas'] || []);
                }
            }
        } catch (err) {
            console.error("Error summarizing legal document:", err);
            setLoader(false);
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
            const matches = arr.map(item => item.lemma);
            setKeyMatchedCaptions(matches);
            setKeyMatchedCaptionFound(matches.length > 0);
        } catch (err) {
            console.error("Error in getKeyNotes:", err);
            setKnLoader(false);
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

    const update = (vis) => {
        setVis1(vis === 1);
        setVis2(vis === 2);
    };

    return (
        <div>
            <div className="container transcript">
                <div className="text-centre"><h1 className="color-dark">Legal & Policy Document Analyzer</h1></div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="inner">
                            <label htmlFor="legalFile">Legal Document / Privacy Policy (.txt file) *</label>
                            <input className="input" type="file" name="Legal Document" id="legalFile"
                                   accept=".txt,.md"
                                   onChange={async (e) => {
                                       await showFile(e);
                                   }}/>
                            <div className="d-flex gap-2 mt-2 flex-wrap">
                                <button type="button" className="button button-v2" onClick={zoomHandler}>
                                    Summarize & Analyze
                                </button>
                                <button type="button" className="button button-v3" onClick={() => {
                                    setCaptions(DEFAULT_LEGAL_TEXT);
                                    setTranscript(DEFAULT_LEGAL_TEXT);
                                }}>
                                    Load Sample Policy
                                </button>
                            </div>
                            {loader ? <Loader/> : ""}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="grid-item">
                            <header className="App-header">
                                {captions.length > 0 ? (
                                    <div className="transcript-legal" style={{maxHeight: '300px', overflowY: 'auto', padding: '15px', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #eee'}}>
                                        <p style={{fontSize: '14px', lineHeight: '1.6'}}>{captions.substring(0, 1500)}...</p>
                                    </div>
                                ) : (
                                    <div className="dummy-legal"/>
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
                            <div className="col-md-8">
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
                                        update(1);
                                    }}>
                                        Get Summary
                                    </RedOutlineButton>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {vis1 && (
                                <div className="col-md-12">
                                    <h2>Summary (Salient Clauses Highlighted)</h2>
                                    {summaryLoader ? <Loader/> : ""}
                                    {transcript.length > 0 ? <div>{getSummary()}</div> : ""}
                                </div>
                            )}

                            {vis2 && (
                                <div className="col-md-12">
                                    <h2>Key Legal Concepts & Entities</h2>
                                    {knLoader ? <Loader/> : ""}
                                    {keyMatchedCaptions.map((c, i) => (
                                        <div key={i} style={{display: "inline-block", margin: "4px"}}>
                                            <button className="button button-v3 button-sm" type="button">
                                                {c}
                                            </button>
                                        </div>
                                    ))}
                                    {!keyMatchedCaptionFound && !knLoader ? (
                                        <p className="text-muted">No specific key entities extracted.</p>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {transcript && (
                            <div className="row mt-4">
                                <div className="col-12">
                                    <NlpInsights text={transcript} title="Legal Risk & Contract Clause Intelligence" showLegal={true} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Legal;