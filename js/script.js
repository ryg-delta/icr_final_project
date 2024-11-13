document.addEventListener("DOMContentLoaded", () => {
    // Initialize Matter.js components
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;

    // Create the physics engine and renderer
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

    Render.run(render);

    // Confirm canvas element exists and log it
    console.log("Render Canvas:", render.canvas);

    // Try adding event listener after the canvas is created and rendered
    render.canvas.addEventListener("mousedown", () => {
        console.log("Mouse down event detected on render canvas");
    });
    

    // Create boundaries: ground, left wall, right wall
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 25, window.innerWidth + 50, 50, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true });
    World.add(engine.world, [ground, leftWall, rightWall]);

    // Page elements
    const landingPage = document.getElementById("landingPage");
    const animatedPage = document.getElementById("animatedPage");
    const menuPage = document.getElementById("menuPage");
    const finalPageButton = document.getElementById("finalPageButton");

    const subPages = ["option1", "option2", "option3"];
    let visitedPages = JSON.parse(localStorage.getItem("visitedPages")) || {
        option1: false,
        option2: false,
        option3: false
    };

    // Check if all subpages have been visited
    const allVisited = () => subPages.every(page => visitedPages[page]);

    // Show a specific page
    function showPage(page) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        page.classList.add("active");
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

    render.canvas.addEventListener("mousedown", () => {
        console.log("Mouse down event detected on canvas");
    });
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
        }, 300); // Adjust interval for falling speed

        // Start Matter.js engine and renderer
        Engine.run(engine);
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

    // PROBLEM CHILD VVVV
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    World.add(engine.world, mouseConstraint);


    

    // Handle icon removal when clicked
    Matter.Events.on(mouseConstraint, "click", (event) => {
        console.log("Mouse event triggered");
        if (iconsStoppedFalling) {
            console.log("Entered");
            const mousePosition = event.mouse.position;
            const allBodies = Matter.Composite.allBodies(engine.world);
            // Log the mouse position
            console.log("Mouse Position:", mousePosition);
            // Detect if the mouse is clicking on an icon
            allBodies.forEach(body => {
                console.log("Body Label:", body.label, "Body Bounds:", body.bounds);

            // Adjust bounds to increase click detection accuracy
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
                if (body.label === 'icon' && Matter.Bounds.contains(body.bounds, mousePosition)) {
                    World.remove(engine.world, body); // Remove icon immediately
                    console.log("Icon removed at position:", mousePosition); // Log icon removal position
                    checkTextUncovered(); // Check if text is uncovered
                }
            });
        }
    });

    // Define a hidden rectangle sensor
    const hiddenRectangle = Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 2, 200, 50, {
        isSensor: true,
        isStatic: true,
        label: 'hiddenRectangle'
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

    //PROBLEM CHILD ^^^^^    

   
    function transitionToAnimatedPage() {
        showPage(animatedPage);
        startFallingIcons();
        document.removeEventListener("click", transitionToAnimatedPage);
        document.removeEventListener("keydown", transitionToAnimatedPage);
    }
     // Start falling icons on the animated page
    document.addEventListener("click", transitionToAnimatedPage);
    document.addEventListener("keydown", transitionToAnimatedPage);


    document.getElementById("proceedButton").addEventListener("click", () => showPage(menuPage));

    window.navigateTo = function(option) {
        showPage(document.getElementById(`${option}Page`));
        visitedPages[option] = true;
        localStorage.setItem("visitedPages", JSON.stringify(visitedPages));
        if (allVisited()) finalPageButton.classList.remove("hidden");
    };

    window.returnToMenu = function() { showPage(menuPage); }

    if (allVisited()) finalPageButton.classList.remove("hidden");

    // Adjust render size on window resize
    window.addEventListener("resize", () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 25 });
        Matter.Body.setPosition(leftWall, { x: -50, y: window.innerHeight / 2 });
        Matter.Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    });
});
