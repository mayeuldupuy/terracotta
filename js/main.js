import {
    initQuestionnaire,
    getAnswers
} from "./questionnaire.js";

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
    const resultsContainer = document.getElementById(
        "results-container"
    );

    resultsContainer.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = "Exploration terminée";

    const description = document.createElement("p");
    description.className = "intro";
    description.textContent =
        "Vos réponses ont été enregistrées localement. " +
        "Le calcul de votre profil sera intégré à la prochaine étape.";

    resultsContainer.append(title, description);

    console.log("Réponses Terracotta :", answers);

    showScreen("results");
}

initQuestionnaire(showResults);

startButton.addEventListener("click", () => {
    showScreen("questionnaire");
});