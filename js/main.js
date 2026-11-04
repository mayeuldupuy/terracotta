// =================================
// NAVIGATION ENTRE LES ÉCRANS
// =================================

const screens = document.querySelectorAll(".screen");

function showScreen(screenId) {

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const targetScreen = document.getElementById(screenId);

    if (targetScreen) {
        targetScreen.classList.add("active");
    }

}


// =================================
// DÉMARRAGE DU QUESTIONNAIRE
// =================================

const startButton = document.getElementById("start-button");

startButton.addEventListener("click", () => {
    showScreen("questionnaire");
});