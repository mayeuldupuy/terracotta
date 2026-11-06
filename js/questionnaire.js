
import { questions } from "../data/questions.js";

const STORAGE_KEY = "terracotta-questionnaire-v2";

let currentIndex = 0;
let answers = {};

const container = document.getElementById("question-container");
const categoryElement = document.getElementById("question-category");
const counterElement = document.getElementById("question-counter");
const progressElement = document.getElementById("question-progress");
const progressFill = document.getElementById("progress-fill");
const errorElement = document.getElementById("question-error");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");

let onComplete = () => {};

// SAUVEGARDE DU QUESTIONNAIRE

function saveProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                currentIndex,
                answers
            })
        );
    } catch (error) {
        console.warn("Sauvegarde locale indisponible.", error);
    }
}

// RESTAURATION DU QUESTIONNAIRE

function restoreProgress() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (!saved || typeof saved !== "object") return;

        if (Number.isInteger(saved.currentIndex)) {
            currentIndex = Math.max(
                0,
                Math.min(saved.currentIndex, questions.length - 1)
            );
        }

        if (saved.answers && typeof saved.answers === "object") {
            for (const question of questions) {
                const validIds = question.options.map(
                    option => option.id
                );

                const value = saved.answers[question.id];

                if (!Array.isArray(value)) continue;

                const filtered = [...new Set(value)].filter(
                    id => validIds.includes(id)
                );

                if (
                    filtered.length > 0 &&
                    (
                        question.type !== "multiple" ||
                        !question.maxSelections ||
                        filtered.length <= question.maxSelections
                    )
                ) {
                    answers[question.id] =
                        question.type === "single"
                            ? [filtered[0]]
                            : filtered;
                }
            }
        }
    } catch (error) {
        console.warn(
            "Impossible de restaurer le parcours.",
            error
        );
    }
}

// FONCTIONS UTILITAIRES

function getCurrentQuestion() {
    return questions[currentIndex];
}

function getSelectedAnswers(questionId) {
    return answers[questionId] || [];
}

function clearError() {
    errorElement.textContent = "";
}

function showError(message) {
    errorElement.textContent = message;
}

// PROGRESSION

function updateProgress() {
    const progress = (currentIndex / questions.length) * 100;

    progressFill.style.width = `${progress}%`;

    progressElement.setAttribute(
        "aria-valuenow",
        Math.round(progress)
    );

    counterElement.textContent = `${Math.round(progress)} %`;
}

// CRÉATION DES BOUTONS DE RÉPONSE

function createOptionButton(question, option) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-button";
    button.textContent = option.label;

    const selected = getSelectedAnswers(question.id)
        .includes(option.id);

    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));

    button.addEventListener("click", () => {
        selectAnswer(question, option.id);
    });

    return button;
}

// AFFICHAGE D'UNE QUESTION

function renderQuestion() {
    if (questions.length === 0) return;

    const question = getCurrentQuestion();

    clearError();
    updateProgress();

    categoryElement.textContent = question.category;

    container.replaceChildren();

    const title = document.createElement("h1");
    title.textContent = question.title;

    const description = document.createElement("p");
    description.className = "intro";
    description.textContent = question.description || "";

    const answerGrid = document.createElement("div");
    answerGrid.className = "answer-grid";

    question.options.forEach(option => {
        answerGrid.appendChild(
            createOptionButton(question, option)
        );
    });

    container.append(
        title,
        description,
        answerGrid
    );

    previousButton.disabled = false;

    nextButton.textContent =
        currentIndex === questions.length - 1
            ? "Trouver mon aventure"
            : "Suivant";
}

// SÉLECTION DES RÉPONSES

function selectAnswer(question, optionId) {
    const current = getSelectedAnswers(question.id);

    if (question.type === "single") {
        answers[question.id] = [optionId];
    } else {
        // Q3-J : ouvert à toutes les propositions
        // Q6-H : aucune activité pratiquée
        // Ces réponses sont exclusives des autres choix.
        const exclusiveOption =
            question.id === "Q3" ? "Q3-J" :
            question.id === "Q6" ? "Q6-H" :
            null;

        if (current.includes(optionId)) {
            answers[question.id] = current.filter(
                id => id !== optionId
            );
        } else if (optionId === exclusiveOption) {
            answers[question.id] = [optionId];
        } else {
            const withoutExclusive = current.filter(
                id => id !== exclusiveOption
            );

            if (
                question.maxSelections &&
                withoutExclusive.length >= question.maxSelections
            ) {
                showError(
                    `Vous pouvez sélectionner ${question.maxSelections} réponses maximum.`
                );
                return;
            }

            answers[question.id] = [
                ...withoutExclusive,
                optionId
            ];
        }
    }

    saveProgress();
    renderQuestion();
}

// QUESTION SUIVANTE

function goNext() {
    const question = getCurrentQuestion();
    const selected = getSelectedAnswers(question.id);

    if (selected.length === 0 && !question.optional) {
        showError(
            "Sélectionnez au moins une réponse pour continuer."
        );
        return;
    }

    if (currentIndex < questions.length - 1) {
        currentIndex++;

        saveProgress();
        renderQuestion();
    } else {
        saveProgress();
        onComplete(getAnswers());
    }
}

// QUESTION PRÉCÉDENTE

function goPrevious() {
    if (currentIndex > 0) {
        currentIndex--;

        saveProgress();
        renderQuestion();
    }
}

// EXPORT DES RÉPONSES POUR MAIN.JS

export function getAnswers() {
    return structuredClone(answers);
}

// RÉINITIALISATION DU QUESTIONNAIRE

export function resetQuestionnaire() {
    currentIndex = 0;
    answers = {};

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn(
            "Réinitialisation locale indisponible.",
            error
        );
    }

    renderQuestion();
}

// INITIALISATION DU QUESTIONNAIRE

export function initQuestionnaire(completionCallback) {
    onComplete = completionCallback;

    restoreProgress();

    previousButton.addEventListener(
        "click",
        goPrevious
    );

    nextButton.addEventListener(
        "click",
        goNext
    );

    renderQuestion();
}
