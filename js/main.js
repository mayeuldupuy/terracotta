import {
    initQuestionnaire,
    getAnswers
} from "./questionnaire.js";

import { renderResults } from "./results.js";

const screens = document.querySelectorAll(".screen");
const startButton = document.getElementById("start-button");

function showScreen(screenId) {
    const target = document.getElementById(screenId);

    if (!target) return;

    screens.forEach(screen => {
        screen.classList.toggle(
            "active",
            screen.id === screenId
        );
    });

    window.scrollTo(0, 0);
}

function showResults() {
    const answers = getAnswers();

    renderResults(answers);

    showScreen("results");
}

initQuestionnaire(showResults);

startButton.addEventListener("click", () => {
    showScreen("questionnaire");
});