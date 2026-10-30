import axios from "axios";
import {SimilarWords} from "./SimilarWords";

export const GenerateQuiz = async (transcript, keyNotes, token) => {
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

        // Try direct high-accuracy NLP quiz generator first
        const directRes = await axios.post(`/api/nlp/quiz`, payload, {headers});
        if (directRes.data && directRes.data.questions && directRes.data.questions.length > 0) {
            return directRes.data.questions.map((q, idx) => ({
                id: q.id || idx + 1,
                prompt: q.prompt || q.question || `Fill in the blank: "${q.sentence}"`,
                sentence: q.sentence,
                answer: q.answer,
                options: q.options || [],
                explanation: q.explanation || `Derived from lecture text.`,
                category: q.category || 'Key Concept'
            }));
        }

        // Fallback to disambiguation tokens endpoint
        const res = await axios.post(`/api/nlp/disambiguation`, payload, {headers});
        const data = res.data?.data;
        if (!data) return [];

        const sentences = data['sentences'] || [];
        const phrases = data['phrases'] || [];
        const tokens = data['tokens'] || [];
        const quiz = {};
        const keyWords = [];

        sentences.forEach(sentence => {
            const sentence_text = transcript.substring(sentence['start'], sentence['end']);
            let flag = false;
            for (let p in sentence['phrases']) {
                const phrase = phrases[sentence['phrases'][p]];
                for (let t in phrase['tokens']) {
                    const key = tokens[phrase['tokens'][t]];
                    let lemma = key['lemma'];
                    let lemma_key = lemma.replace(/\s+/g, '-').toLowerCase();
                    if (!(lemma_key in quiz) && lemmaExists(lemma) && lemma.length > 2 && sentence_text.length > 40) {
                        let question = transcript.substring(sentence['start'], sentence['end']);
                        question = question.replace(new RegExp(lemma, 'gi'), "__________").trim();
                        quiz[lemma_key] = {
                            sentence: question,
                            answer: lemma,
                            options: []
                        };
                        keyWords.push(lemma_key);
                        flag = true;
                        break;
                    }
                }
                if (flag) break;
            }
        });

        const similar_words = await SimilarWords(keyWords) || {};
        keyWords.forEach(word => {
            let options = (similar_words[word]?.synms || []).slice(0, 3);
            options.push(quiz[word]['answer']);
            shuffleArray(options);
            while (options.length < 4) {
                options.push("None of these");
            }
            quiz[word]['options'] = options;
        });

        const quiz_results = [];
        for (let q in quiz) {
            quiz_results.push(quiz[q]);
        }
        return quiz_results;

    } catch (err) {
        console.error("Error generating quiz:", err);
        return [];
    }

    function lemmaExists(lemma) {
        if (!keyNotes || keyNotes.length === 0) return true;
        return keyNotes.some(el => el.value === lemma || el.value?.toLowerCase() === lemma.toLowerCase());
    }
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};