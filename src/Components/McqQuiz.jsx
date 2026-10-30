import React, { useState } from "react";

const McqQuiz = ({ questions = [], onRetake, title = "Smart Comprehension Quiz (MCQ)" }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [viewMode, setViewMode] = useState("stepper"); // "stepper" or "all"

    if (!questions || questions.length === 0) {
        return (
            <div className="card shadow-sm border-0 rounded-4 p-4 text-center my-3" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }}>
                <p className="text-muted mb-0">No questions available yet. Click "Generate Quiz" to create questions from this lecture or document.</p>
            </div>
        );
    }

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    const correctCount = Object.entries(selectedAnswers).filter(([idx, answer]) => {
        const q = questions[Number(idx)];
        return q && answer.trim().toLowerCase() === q.answer.trim().toLowerCase();
    }).length;

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const handleSelectOption = (qIndex, option) => {
        if (selectedAnswers[qIndex]) return; // locked once answered
        setSelectedAnswers(prev => ({
            ...prev,
            [qIndex]: option
        }));
    };

    const handleReset = () => {
        setSelectedAnswers({});
        setCurrentIdx(0);
        if (onRetake) onRetake();
    };

    const renderQuestionCard = (q, qIndex) => {
        const selected = selectedAnswers[qIndex];
        const isAnswered = selected !== undefined;
        const isCorrect = isAnswered && selected.trim().toLowerCase() === q.answer.trim().toLowerCase();

        return (
            <div key={qIndex} className="card shadow-sm border-0 rounded-4 mb-4 p-4" style={{
                background: "linear-gradient(145deg, #ffffff, #fdf8fa)",
                border: isAnswered ? (isCorrect ? "2px solid #10b981" : "2px solid #ef4444") : "1px solid #f0e6eb",
                transition: "all 0.3s ease"
            }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge px-3 py-2 rounded-pill" style={{
                        backgroundColor: "#ffe2ec",
                        color: "#ff0560",
                        fontWeight: 600,
                        fontSize: "0.85rem"
                    }}>
                        Question {qIndex + 1} of {totalQuestions}
                    </span>
                    {q.category && (
                        <span className="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                            {q.category}
                        </span>
                    )}
                </div>

                <h4 className="fw-bold text-dark mb-3" style={{ fontSize: "1.15rem", lineHeight: "1.6" }}>
                    {q.prompt || q.question || q.sentence}
                </h4>

                <div className="row g-2 mt-2">
                    {q.options.map((opt, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isChosen = selected === opt;
                        const isTheCorrectAnswer = isAnswered && opt.trim().toLowerCase() === q.answer.trim().toLowerCase();

                        let btnBg = "#ffffff";
                        let btnBorder = "#e2e8f0";
                        let btnColor = "#334155";
                        let letterBg = "#f1f5f9";
                        let letterColor = "#475569";

                        if (isAnswered) {
                            if (isTheCorrectAnswer) {
                                btnBg = "#ecfdf5";
                                btnBorder = "#10b981";
                                btnColor = "#065f46";
                                letterBg = "#10b981";
                                letterColor = "#ffffff";
                            } else if (isChosen && !isCorrect) {
                                btnBg = "#fef2f2";
                                btnBorder = "#ef4444";
                                btnColor = "#991b1b";
                                letterBg = "#ef4444";
                                letterColor = "#ffffff";
                            }
                        }

                        return (
                            <div key={optIndex} className="col-12 col-md-6">
                                <button
                                    type="button"
                                    onClick={() => handleSelectOption(qIndex, opt)}
                                    disabled={isAnswered}
                                    className="w-100 text-start p-3 rounded-3 d-flex align-items-center position-relative"
                                    style={{
                                        backgroundColor: btnBg,
                                        border: `2px solid ${btnBorder}`,
                                        color: btnColor,
                                        cursor: isAnswered ? "default" : "pointer",
                                        transition: "all 0.2s ease",
                                        boxShadow: isChosen ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                                        fontWeight: isChosen || isTheCorrectAnswer ? 600 : 400
                                    }}
                                >
                                    <span
                                        className="d-inline-flex justify-content-center align-items-center rounded-circle me-3 flex-shrink-0"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            backgroundColor: letterBg,
                                            color: letterColor,
                                            fontWeight: 700,
                                            fontSize: "0.9rem"
                                        }}
                                    >
                                        {letter}
                                    </span>
                                    <span className="flex-grow-1" style={{ fontSize: "0.98rem" }}>
                                        {opt}
                                    </span>
                                    {isAnswered && isTheCorrectAnswer && (
                                        <span className="badge bg-success rounded-pill ms-2">✔ Correct</span>
                                    )}
                                    {isAnswered && isChosen && !isCorrect && (
                                        <span className="badge bg-danger rounded-pill ms-2">✖ Selected</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className="mt-3 p-3 rounded-3" style={{
                        backgroundColor: isCorrect ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                        borderLeft: `4px solid ${isCorrect ? "#10b981" : "#ef4444"}`
                    }}>
                        <div className="d-flex align-items-center mb-1">
                            <strong style={{ color: isCorrect ? "#065f46" : "#991b1b" }}>
                                {isCorrect ? "✔ Excellent! That is correct." : `✖ Incorrect. The correct answer is: "${q.answer}"`}
                            </strong>
                        </div>
                        {q.explanation && (
                            <p className="mb-0 text-muted small" style={{ fontStyle: "italic" }}>
                                {q.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mcq-quiz-container my-3">
            {/* Header Score & Progress Panel */}
            <div className="card shadow-sm border-0 rounded-4 p-3 mb-4" style={{
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                color: "#ffffff"
            }}>
                <div className="row align-items-center g-3">
                    <div className="col-12 col-md-6">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-danger rounded-pill px-3 py-1">Interactive MCQ</span>
                            <h3 className="mb-0 text-white fw-bold fs-5">{title}</h3>
                        </div>
                        <p className="text-secondary small mb-0">
                            Test your knowledge with multiple choice questions derived directly from the lecture material.
                        </p>
                    </div>

                    <div className="col-12 col-md-6 text-md-end">
                        <div className="d-inline-flex align-items-center gap-3 bg-dark bg-opacity-50 p-2 px-3 rounded-pill border border-secondary">
                            <div>
                                <span className="small text-secondary me-1">Progress:</span>
                                <strong className="text-light">{answeredCount}/{totalQuestions}</strong>
                            </div>
                            <div className="vr bg-secondary" />
                            <div>
                                <span className="small text-secondary me-1">Score:</span>
                                <strong style={{ color: scorePercentage >= 70 ? "#10b981" : scorePercentage >= 40 ? "#f59e0b" : "#ff0560" }}>
                                    {correctCount}/{answeredCount > 0 ? answeredCount : totalQuestions} ({answeredCount > 0 ? scorePercentage : 0}%)
                                </strong>
                            </div>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn btn-sm btn-outline-light rounded-pill px-2 py-0"
                                style={{ fontSize: "0.75rem" }}
                            >
                                ↺ Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="progress mt-3" style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.15)" }}>
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{
                            width: `${(answeredCount / totalQuestions) * 100}%`,
                            backgroundColor: "#ff0560"
                        }}
                    />
                </div>
            </div>

            {/* View Mode & Question Navigator Pills */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="d-flex gap-1 flex-wrap align-items-center">
                    <span className="small text-muted me-2">Jump to:</span>
                    {questions.map((_, i) => {
                        const isAns = selectedAnswers[i] !== undefined;
                        const isCurr = viewMode === "stepper" && currentIdx === i;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => {
                                    setCurrentIdx(i);
                                    setViewMode("stepper");
                                }}
                                className={`btn btn-sm rounded-circle p-0 ${isCurr ? 'btn-danger' : isAns ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                style={{ width: "28px", height: "28px", fontSize: "0.8rem", fontWeight: 600 }}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="btn-group btn-group-sm" role="group">
                    <button
                        type="button"
                        className={`btn ${viewMode === 'stepper' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setViewMode('stepper')}
                    >
                        Single Focus
                    </button>
                    <button
                        type="button"
                        className={`btn ${viewMode === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setViewMode('all')}
                    >
                        View All ({totalQuestions})
                    </button>
                </div>
            </div>

            {/* Questions Rendering */}
            {viewMode === "stepper" ? (
                <div>
                    {renderQuestionCard(questions[currentIdx], currentIdx)}

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill px-4"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                        >
                            ← Previous
                        </button>
                        <span className="text-muted small">
                            Question {currentIdx + 1} of {totalQuestions}
                        </span>
                        <button
                            type="button"
                            className="btn btn-danger rounded-pill px-4"
                            disabled={currentIdx === totalQuestions - 1}
                            onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {questions.map((q, idx) => renderQuestionCard(q, idx))}
                </div>
            )}

            {/* Completion Banner if all answered */}
            {answeredCount === totalQuestions && (
                <div className="card border-0 rounded-4 p-4 mt-4 text-center shadow" style={{
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "2px solid #86efac"
                }}>
                    <h3 className="fw-bold text-success mb-2">🎉 Quiz Complete!</h3>
                    <p className="fs-5 text-dark mb-3">
                        You scored <strong>{correctCount} out of {totalQuestions}</strong> ({scorePercentage}%)
                    </p>
                    <p className="text-secondary small mb-3">
                        {scorePercentage >= 80 ? "Outstanding comprehension! You have mastered the core concepts of this material."
                            : scorePercentage >= 60 ? "Good work! Review the highlighted transcript and summary for topics you missed."
                            : "Keep practicing! Explore the key notes and executive summary to solidify your understanding."}
                    </p>
                    <div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-success rounded-pill px-4 py-2 fw-semibold"
                        >
                            ↺ Retake Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default McqQuiz;
