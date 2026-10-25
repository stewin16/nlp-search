import './App.css';
import React from "react";
import Home from "./Pages/Home/Home";
import Zoom from "./Pages/Zoom/Zoom";
import {BrowserRouter as Router, Switch, Route, NavLink, Link} from 'react-router-dom';
import About from "./Pages/About/About";
import Legal from "./Pages/Legal/legal";

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <header className="floating-navbar-wrapper">
                    <nav className="navbar navbar-expand-lg floating-navbar">
                        <div className="container-fluid px-2 px-md-3">
                            <Link className="navbar-brand d-flex align-items-center" to="/">
                                <img src="/logo.png" height="32" className="d-inline-block align-top me-2" alt="OmniLex AI"/>
                                <span className="brand-text">OmniLex <span className="brand-accent">AI</span></span>
                            </Link>

                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false"
                                    aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            <div className="collapse navbar-collapse justify-content-end" id="navbarTogglerDemo03">
                                <ul className="navbar-nav align-items-center mt-2 mt-lg-0">
                                    <li className="nav-item">
                                        <NavLink exact className="nav-link custom-nav-link" activeClassName="active" to="/">YouTube Video</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link custom-nav-link" activeClassName="active" to="/zoom">Zoom Transcript</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link custom-nav-link" activeClassName="active" to="/legal">Legal Document</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link custom-nav-link" activeClassName="active" to="/about">About</NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </header>

                <main className="main-content-flow">
                    <Switch>
                        <Route exact path='/'>
                            <Home/>
                        </Route>
                        <Route exact path='/zoom'>
                            <Zoom/>
                        </Route>
                        <Route exact path='/legal'>
                            <Legal/>
                        </Route>
                        <Route exact path='/about'>
                            <About/>
                        </Route>
                    </Switch>
                </main>

                <footer className="footer">
                    <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="d-flex align-items-center">
                            <img src="/logo.png" height="22" className="d-inline-block align-top me-2" alt="OmniLex AI"/>
                            <span className="text-muted small">© 2026 OmniLex AI • Multimodal Video & Document NLP Intelligence</span>
                        </div>
                        <div className="footer-links">
                            <Link to="/about" className="text-muted text-decoration-none small me-3">About</Link>
                            <Link to="/legal" className="text-muted text-decoration-none small">Legal</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
};

export default App;
