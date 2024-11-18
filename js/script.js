document.addEventListener("DOMContentLoaded", () => {
    // Initialize Matter.js components
    const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Runner = Matter.Runner;

    // Create the physics engine, renderer, and runner
    const engine = Engine.create();
    engine.gravity.y = 0.5; // Set gravity strength

    const render = Render.create({
        element: document.getElementById("fallingIconsContainer"),
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: "transparent"
        }
    });

    const runner = Runner.create(); // Create the runner

    // Create boundaries: ground, left wall, right wall
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth + 50, 50, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    World.add(engine.world, [ground, leftWall, rightWall]);

    // Page elements
    const landingPage = document.getElementById("landingPage");
    const secondPage = document.getElementById("secondPage");
    const animatedPage = document.getElementById("animatedPage");
    const menuPage = document.getElementById("menuPage");
    const finalPage = document.getElementById("finalPage");
    const finalPageButton = document.getElementById("finalPageButton");

    let visitCount = 0;
    
    // Function to update the visibility of the finalPageButton
    function updateFinalPageButtonVisibility() {
        if (visitCount >= 3) {
            finalPageButton.classList.remove("hidden");
        } else {
            finalPageButton.classList.add("hidden");
        }
    }
    
    // Show the specified page
    function showPage(page) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        page.classList.add("active");
    }
    

    const blobs = {
        option1: document.querySelector('.blob2'),
        option2: document.querySelector('.blob3'),
        option3: document.querySelector('.blob4')
    };
    // Function to handle button click
    window.changeBlobOpacity = function(option) {
        blobs[option].style.opacity = '0.8'; // Set the blob to full opacity
    };

    // Navigation function
    window.navigateTo = function(option) {
        showPage(document.getElementById(`${option}Page`));
        visitCount++;
        changeBlobOpacity(option);
        updateFinalPageButtonVisibility(); // Update button visibility after navigating
    };


    // Initial check on page load
    updateFinalPageButtonVisibility();
    
    window.returnToMenu = function() {
        showPage(menuPage);
    }

    window.navToLast = function(){
        showPage(finalPage);
    }

    
    const icons = [
        './svg_icons/capsule-svgrepo-com.svg',
        './svg_icons/clinic-building-svgrepo-com.svg',
        './svg_icons/cry-1-svgrepo-com.svg',
        './svg_icons/healthcare-hospital-medical-50-svgrepo-com.svg',
        './svg_icons/infusion-svgrepo-com.svg',
        './svg_icons/inject-svgrepo-com.svg',
        './svg_icons/injuried-svgrepo-com.svg',
        './svg_icons/medicine-bottle-svgrepo-com.svg',
        './svg_icons/microscope-svgrepo-com.svg',
        './svg_icons/female-organ-reproduction-svgrepo-com.svg',
        './svg_icons/woman-svgrepo-com.svg',
        './svg_icons/woman-with-chest-pain-svgrepo-com.svg'
    ];
    
    let iconsStoppedFalling = false; // Flag to indicate when icons stop falling

    function startFallingIcons() {
        const maxIcons = 100;
        let iconCount = 0;

        const iconInterval = setInterval(() => {
            if (iconCount >= maxIcons) {
                iconsStoppedFalling = true;
                clearInterval(iconInterval); // Stop adding icons once max is reached
                console.log("Icons have stopped falling."); // Log when icons stop falling
                return;
            }

            const iconPath = icons[Math.floor(Math.random() * icons.length)];
            createIcon(Math.random() * window.innerWidth, 0, iconPath);

            iconCount++;
        }, 200); // Adjust interval for falling speed

        // Start Matter.js engine and renderer
        Runner.run(runner, engine);
        Render.run(render);
    }

    function createIcon(x, y, iconPath) {
        const icon = Bodies.rectangle(x, y, 125, 125, {
            label: 'icon',
            render: {
                sprite: {
                    texture: iconPath,
                    xScale: 0.25,
                    yScale: 0.25
                }
            }
        });
        World.add(engine.world, icon);
    }


    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    World.add(engine.world, mouseConstraint);


    

    // Adjust the event to mouseup for improved click detection
    Matter.Events.on(mouseConstraint, "mousemove", (event) => {
        if (iconsStoppedFalling) {
            const mousePosition = event.mouse.position;
            const allBodies = Matter.Composite.allBodies(engine.world);

            // Check for icons under the mouse position
            allBodies.forEach(body => {
                const adjustedBounds = {
                    min: {
                        x: body.bounds.min.x - 5,
                        y: body.bounds.min.y - 5
                    },
                    max: {
                        x: body.bounds.max.x + 5,
                        y: body.bounds.max.y + 5
                    }
                };
                
                if (body.label === 'icon' && Matter.Bounds.contains(adjustedBounds, mousePosition)) {
                    World.remove(engine.world, body);
                    console.log("Icon removed at position:", mousePosition); // Confirm removal
                    checkTextUncovered(); // Check if text is now uncovered
                }
            });
        }
    });


    // Define a hidden rectangle sensor
    const hiddenRectangle = Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 2, 500, 200, {
        isSensor: true,
        isStatic: true,
        label: 'hiddenRectangle',
        render: {
            visible: false // Set to false to make it invisible
        }
    });
    World.add(engine.world, hiddenRectangle);

    function checkTextUncovered() {
        if (!iconsStoppedFalling) return; // Only proceed if icons have stopped falling

        const allBodies = Matter.Composite.allBodies(engine.world);
        const icons = allBodies.filter(body => body.label === 'icon');
        const overlappingIcons = icons.filter(icon => {
            return Matter.Query.collides(icon, [hiddenRectangle]).length > 0;
        });

        if (overlappingIcons.length === 0) {
            document.getElementById("proceedButton").classList.remove("hidden");
        }
    }

    // Continuously check if the text is uncovered only after icons have stopped falling
    Matter.Events.on(engine, "afterUpdate", () => {
        if (iconsStoppedFalling) {
            checkTextUncovered();
        }
    });
 

    let currentState = "landing"; // Possible states: landing, animated, second, menu

    document.addEventListener("click", transitionToPage);
    document.addEventListener("keydown", transitionToPage);

    function transitionToPage() {
        
        if (currentState === "landing") {
            currentState = "animated";
            showPage(animatedPage);
            startFallingIcons();
            document.removeEventListener("click", transitionToPage);
            document.removeEventListener("keydown", transitionToPage);
    
            // Add proceed button click handler for transitioning to the second page
            document.getElementById("proceedButton").addEventListener("click", transitionToSecondPage);
        }
    }

    function transitionToSecondPage() {
        if (currentState === "second") {
            console.log("transitionToSecondPage called.");
    
            setTimeout(() => {
                console.log("Listeners for menu transition added.");
                document.addEventListener("click", transitionToMenu);
                document.addEventListener("keydown", transitionToMenu);
            }, 100); 
        }
    }
    
    function transitionToMenu() {
        if (currentState === "second") {
            currentState = "menu";
            showPage(menuPage);
            console.log("Transitioned to menu page. Removing listeners.");
            // Clean up menu transition listeners
            document.removeEventListener("click", transitionToMenu);
            document.removeEventListener("keydown", transitionToMenu);
        }
    }
    
    // Landing page -> Animated page

    document.getElementById("proceedButton").addEventListener("click", () => {
        if (currentState === "animated") {
            currentState = "second";
            console.log("Current state is 'animated'. Transitioning to second page.");
            showPage(secondPage);
        }
    });



    // Adjust render size on window resize
    window.addEventListener("resize", () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 25 });
        Matter.Body.setPosition(leftWall, { x: -50, y: window.innerHeight / 2 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    });

});
