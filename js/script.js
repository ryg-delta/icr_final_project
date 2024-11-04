document.addEventListener("DOMContentLoaded", () => {
    const landingPage = document.getElementById("landingPage");
    const animatedPage = document.getElementById("animatedPage");
    const menuPage = document.getElementById("menuPage");
    const finalPageButton = document.getElementById("finalPageButton");
    const finalPage = document.getElementById("finalPage");

    const subPages = ["option1", "option2", "option3"];
    let visitedPages = JSON.parse(localStorage.getItem("visitedPages")) || {
        option1: false,
        option2: false,
        option3: false
    };

    const allVisited = () => subPages.every(page => visitedPages[page]);

    function showPage(page) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        page.classList.add("active");
    }

    document.addEventListener("click", transitionToAnimatedPage);
    document.addEventListener("keydown", transitionToAnimatedPage);

    function transitionToAnimatedPage() {
        showPage(animatedPage);
        startAnimationSequence();
        document.removeEventListener("click", transitionToAnimatedPage);
        document.removeEventListener("keydown", transitionToAnimatedPage);
    }

    function startAnimationSequence() {
        setTimeout(() => {
            showPage(menuPage);
        }, 3000); // Adjust duration based on animation needs
    }

    window.navigateTo = function(option) {
        showPage(document.getElementById(`${option}Page`));
        visitedPages[option] = true;
        localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
        if (allVisited()) {
            finalPageButton.classList.remove("hidden");
        }
    };

    window.returnToMenu = function() {
        showPage(menuPage);
    };

    // Initialize by revealing final page button if all pages visited
    if (allVisited()) {
        finalPageButton.classList.remove("hidden");
    }
});
