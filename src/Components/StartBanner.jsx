import React from "react";
import { Link } from "react-router-dom";
import NeuralHologram3D from "./NeuralHologram3D";

export const StartBanner = () => {
    return (
        <div id="home">
            <div className="container home-container">
                <div className="row align-items-center">
                    <div className="col-lg-6 col-md-12 hero-text-col">
                        <span className="hero-badge">
                            MULTIMODAL NLP INTELLIGENCE ENGINE
                        </span>
                        <h1 className="hero-title">
                            Cogni<span className="hero-accent">Text</span>
                        </h1>
                        <p className="hero-tagline">
                            <i>Next-Generation Semantic Intelligence for Video, Audio & Documents</i>
                        </p>
                        <p className="hero-desc">
                            Transform hours of YouTube lectures, Zoom recordings, and complex legal agreements
                            into instant extractive summaries, interactive quizzes, clause risk analyses,
                            and Indian female voice-narrated insights.
                        </p>
                        <div className="hero-chips-wrap">
                            <span className="hero-chip">YouTube Video NLP</span>
                            <span className="hero-chip">Zoom Transcripts</span>
                            <span className="hero-chip">Legal Risk Matrix</span>
                            <span className="hero-chip">Indian Voice TTS</span>
                            <span className="hero-chip">TextRank Engine</span>
                        </div>
                        <div className="hero-cta-wrap">
                            <a href="#getstarted" className="button button-v2">
                                Analyze YouTube Video
                            </a>
                            <Link to="/zoom" className="button button-v3">
                                Zoom Analyzer
                            </Link>
                            <Link to="/legal" className="button button-v3">
                                Legal Analyzer
                            </Link>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-12 hero-visual-col direct-3d-col">
                        <NeuralHologram3D />
                    </div>
                </div>
            </div>
        </div>
    );
};