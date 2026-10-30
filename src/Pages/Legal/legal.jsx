import React from "react";
import axios from "axios";
import Loader from "../../Components/Loader";
import './legal.css';
import {RedOutlineButton} from "../../Components/RedOutlineButton";
import NlpInsights from "../../Components/NlpInsights";

const DEFAULT_LEGAL_TEXT = `MASTER SERVICE AGREEMENT AND PRIVACY POLICY

1. Overview and Acceptance of Terms
This Master Service Agreement and Privacy Policy governs the access and utilization of CogniText AI multimodal NLP intelligence services. By accessing the platform, subscribing to our API endpoints, or uploading enterprise datasets, you agree to comply with all terms set forth herein. If you do not agree with these stipulations, you must immediately discontinue use and cancel your account.

2. Personal Data Protection and Privacy Controls
CogniText processes personal data in accordance with modern data privacy standards, including GDPR and CCPA requirements. We collect personal data that users provide directly during account registration, including administrative contact email addresses, billing coordinates, and access credentials. When interacting with our services, automated systems log IP addresses, browser types, and session timestamps. We deploy industry-standard encryption protocols and security controls across all database infrastructure. We do not sell personal data to third parties. We may disclose personal data to certified cloud hosting partners strictly under confidentiality obligations, or when required by legal proceeding or subpoena.

3. Intellectual Property Rights and Ownership
All software algorithms, natural language pipelines, proprietary models, user interfaces, trademarks, and documentation associated with CogniText are the exclusive intellectual property of CogniText AI and its licensors. CogniText grants the client a non-exclusive, non-transferable, revocable license to utilize our search, summarization, and transcription features for authorized internal business purposes. The client retains sole ownership and copyright over all proprietary documents, Zoom audio files, and text corpora uploaded to the system.

4. Limitation of Liability and Indemnification
To the maximum extent permitted by applicable law, neither party shall be held liable for any indirect, incidental, punitive, or consequential damages arising out of the performance or failure of the AI search models. In no event shall the total aggregate liability of CogniText exceed the amount paid by the customer in the twelve months preceding the dispute. The customer agrees to defend, indemnify, and hold harmless CogniText and its officers against any third-party claims, liabilities, damages, or losses resulting from unauthorized data transmission or willful breach of these terms.

5. Termination and Service Cancellation
Either party may terminate this agreement without cause upon thirty (30) days written notice. In the event of a material breach, CogniText reserves the right to immediately suspend or execute cancellation of user access without prior formal notice. Upon termination, client access credentials will be revoked, and all cached text files, transcripts, and temporary embeddings will be permanently destroyed within sixty (60) days unless retention is required by statute.

6. Governing Law, Dispute Resolution, and Arbitration
This agreement shall be interpreted and governed by the laws of the jurisdiction in which CogniText AI is incorporated, without regard to conflict of law principles. Any dispute or claim arising out of or relating to this agreement shall be submitted to binding arbitration conducted before a neutral arbitration tribunal. Both parties agree that any court or legal proceeding shall take place exclusively within competent regional commercial courts.

7. Action Items and Compliance Next Steps
The compliance officer must review the external audit report quarterly.
The administrative team should update all API encryption keys every six months.
The enterprise customer must notify CogniText immediately upon discovering any unauthorized security breach.`;

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
            const raw = evt.target.result || "";
            const text = raw.replace(/\r\n/g, "\n").trim();
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

        return <div style={{lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap'}}>{html}</div>;
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
                                    <div className="transcript-legal" style={{maxHeight: '340px', overflowY: 'auto', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit'}}>
                                        <p style={{fontSize: '14px', lineHeight: '1.7', color: '#1e293b', margin: 0}}>
                                            {captions.length > 2500 ? captions.substring(0, 2500) + "\n\n[... Remaining content loaded for analysis ...]" : captions}
                                        </p>
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