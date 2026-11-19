
const $ = id => document.getElementById(id);

const screens = ["welcome", "dashboard", "testView", "report"];

let results = {
    acuity: {},
    color: null,
    contrast: null,
    astigmatism: null
};

let acuityEye = "right";
let acuityRound = 1;
let acuityIndex = 0;
let acuityItems = [];
let acuityCorrect = 0;

let colorIndex = 0;
let colorCorrect = 0;

let contrastIndex = 0;
let contrastCorrect = 0;


// ======================================
// NAVIGATION AND SCREEN MANAGEMENT
// ======================================

function show(id) {
    screens.forEach(screen => {
        $(screen).classList.toggle("hidden", screen !== id);
    });
}

function setup(title, description, html) {

    const previousScroll = window.scrollY;

    $("testTitle").textContent = title;
    $("testDescription").textContent = description;
    $("testContent").innerHTML = html;

    show("testView");

    requestAnimationFrame(() => {
        window.scrollTo(0, previousScroll);
    });
}

function updateProgress() {

    let completed = 0;

    if (Object.keys(results.acuity).length === 2) completed++;
    if (results.color) completed++;
    if (results.contrast) completed++;
    if (results.astigmatism) completed++;

    $("progressText").textContent = `${completed} / 4`;

    $("progressBar").style.width =
        `${completed / 4 * 100}%`;
}

function markDone(test) {

    const status = $("status-" + test);

    status.textContent = "COMPLETED";
    status.classList.add("done");

    updateProgress();
}


// ======================================
// MAIN BUTTONS
// ======================================

$("beginBtn").onclick = () => show("dashboard");

$("backBtn").onclick = () => show("dashboard");

$("menuBtn").onclick = () => show("dashboard");

$("resetBtn").onclick = () => {

    results = {
        acuity: {},
        color: null,
        contrast: null,
        astigmatism: null
    };

    ["acuity", "color", "contrast", "astigmatism"].forEach(test => {

        const status = $("status-" + test);

        status.textContent = "NOT STARTED";
        status.classList.remove("done");

    });

    updateProgress();

    show("welcome");
};

document.querySelectorAll("[data-test]").forEach(button => {

    button.onclick = () => startTest(button.dataset.test);

});

$("reportBtn").onclick = generateReport;


function startTest(test) {

    if (test === "acuity") startAcuity();
    if (test === "color") startColor();
    if (test === "contrast") startContrast();
    if (test === "astigmatism") startAstigmatism();

}


// ======================================
// 1. VISUAL ACUITY
// SVG LANDOLT C
// 20 QUESTIONS PER EYE
// ======================================

function startAcuity() {

    acuityEye = "right";
    acuityRound = 1;
    acuityIndex = 0;

    results.acuity = {};

    beginAcuityEye();
}


function beginAcuityEye() {

    const sizes = [
        54, 51, 48, 45, 42,
        39, 36, 33, 30, 28,
        26, 24, 22, 20, 18,
        17, 16, 15, 14, 13
    ];

    acuityItems = sizes.map((size, index) => ({

        size,

        opacity: Math.max(
            0.18,
            0.95 - index * 0.038
        ),

        answer: ["up", "down", "left", "right"][
            Math.floor(Math.random() * 4)
        ]

    }));

    acuityCorrect = 0;
    acuityIndex = 0;

    const instruction = acuityRound === 1
        ? "Close your LEFT eye. Keep your RIGHT eye open."
        : "Close your RIGHT eye. Keep your LEFT eye open.";

    setup(
        "Visual Acuity Test",
        "Identify the opening direction of the C symbol.",
        `
        <div class="instruction">

            <h3>${instruction}</h3>

            <p>
                Cover the specified eye gently with your palm
                or an eye cover. Do not press on your eye.
            </p>

            <p>
                Keep your viewing distance consistent.
                Identify the small opening in the circular C.
            </p>

        </div>

        <span class="eye-badge">
            ROUND ${acuityRound} OF 2
        </span>

        <span class="eye-badge">
            ${acuityEye.toUpperCase()} EYE
        </span>

        <div id="acuityStimulus" class="stimulus"></div>

        <p id="acuityCount" class="muted"></p>

        <div id="acuityChoices" class="choice-row"></div>

        <p class="muted">
            Select Can't tell if you cannot identify the opening.
        </p>
        `
    );

    showAcuityItem();
}


// Create a circular Landolt C using SVG.
// The gap is positioned on the right, then rotated.

function createLandoltC(size, direction, opacity) {

    const rotations = {
        right: 0,
        down: 90,
        left: 180,
        up: 270
    };

    const rotation = rotations[direction];

    return `
        <svg
            width="${size}"
            height="${size}"
            viewBox="0 0 100 100"
            role="img"
            aria-label="Circular C symbol"
            style="
                display:block;
                opacity:${opacity};
                transform:rotate(${rotation}deg);
                overflow:visible;
                color:currentColor;
            "
        >

            <circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                stroke="currentColor"
                stroke-width="13"
                stroke-linecap="butt"
                stroke-dasharray="194 20"
            />

        </svg>
    `;
}


function showAcuityItem() {

    const TOTAL_QUESTIONS = 20;

    if (acuityIndex >= acuityItems.length) {

        results.acuity[acuityEye] = {
            correct: acuityCorrect,
            total: TOTAL_QUESTIONS
        };

        if (acuityRound === 1) {

            acuityRound = 2;
            acuityEye = "left";

            beginAcuityEye();

            return;
        }

        markDone("acuity");

        setup(
            "Visual Acuity Completed",
            "Both eye activities have been recorded.",
            `
            <h3>Assessment completed!</h3>

            <p class="instruction">
                Right eye:
                ${results.acuity.right.correct}/${TOTAL_QUESTIONS}
            </p>

            <p class="instruction">
                Left eye:
                ${results.acuity.left.correct}/${TOTAL_QUESTIONS}
            </p>

            <button class="primary" id="doneAcuity">
                Return to menu
            </button>
            `
        );

        $("doneAcuity").onclick = () => show("dashboard");

        return;
    }

    const item = acuityItems[acuityIndex];

    $("acuityStimulus").innerHTML =
        createLandoltC(
            item.size,
            item.answer,
            item.opacity
        );

    $("acuityCount").textContent =
        `Question ${acuityIndex + 1} of ${TOTAL_QUESTIONS}`;

    const arrows = {
        up: "↑",
        down: "↓",
        left: "←",
        right: "→"
    };

    $("acuityChoices").innerHTML = `

        ${["up", "right", "down", "left"].map(direction => `
            <button class="choice" data-dir="${direction}">
                ${arrows[direction]}
            </button>
        `).join("")}

        <button class="choice" data-dir="unknown">
            Can't tell
        </button>
    `;

    document.querySelectorAll("[data-dir]").forEach(button => {

        button.onclick = () => {

            if (button.dataset.dir === item.answer) {
                acuityCorrect++;
            }

            acuityIndex++;

            showAcuityItem();

        };

    });

}


// ======================================
// 2. COLOR VISION
// DOUBLE-DIGIT PATTERNS
// ======================================

function startColor() {

    colorIndex = 0;
    colorCorrect = 0;

    nextColor();
}


function generateDoubleNumber() {

    return Math.floor(Math.random() * 90) + 10;

}



function makeColorPlate(target) {

    const canvas = document.createElement("canvas");

    canvas.width = 600;
    canvas.height = 450;

    canvas.className = "color-canvas";

    const ctx = canvas.getContext("2d");

    // Similar brightness, but different color combinations.
    // Inspired by pseudo-isochromatic color plates.
    const palettes = [

        {
            background: "#B9A77F",
            foreground: "#788C5C",
            secondary: "#A69B76"
        },

        {
            background: "#A99A83",
            foreground: "#858D64",
            secondary: "#B49A83"
        },

        {
            background: "#B69B85",
            foreground: "#7F8E75",
            secondary: "#A99A83"
        },

        {
            background: "#A8A080",
            foreground: "#8B795F",
            secondary: "#B1A58A"
        },

        {
            background: "#B5A18A",
            foreground: "#788C78",
            secondary: "#A79A83"
        },

        {
            background: "#A99A78",
            foreground: "#858B65",
            secondary: "#B6A58A"
        },

        {
            background: "#B7A08A",
            foreground: "#78866D",
            secondary: "#A99B81"
        },

        {
            background: "#A7A08A",
            foreground: "#8C795F",
            secondary: "#B5A58A"
        },

        {
            background: "#B59A8B",
            foreground: "#7F8970",
            secondary: "#A99C83"
        },

        {
            background: "#AAA080",
            foreground: "#85876B",
            secondary: "#B8A68A"
        }

    ];

    const palette =
        palettes[Math.floor(Math.random() * palettes.length)];

    // Base background
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // Create number mask
    const mask = document.createElement("canvas");

    mask.width = canvas.width;
    mask.height = canvas.height;

    const m = mask.getContext("2d");

    m.font = "bold 190px Arial";
    m.textAlign = "center";
    m.textBaseline = "middle";

    m.fillText(String(target), 300, 225);

    const pixels = m.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    ).data;


    // Randomized dot field
    for (let y = 8; y < 445; y += 11) {

        for (let x = 8; x < 595; x += 11) {

            const index = (y * canvas.width + x) * 4;

            const inside = pixels[index + 3] > 100;

            // Number dots use foreground color.
            // Surrounding dots use secondary color.
            ctx.fillStyle = inside
                ? palette.foreground
                : palette.secondary;

            const offsetX = Math.random() * 5;
            const offsetY = Math.random() * 5;

            // Different dot sizes make the number harder to trace.
            const radius = 2.5 + Math.random() * 3.5;

            ctx.beginPath();

            ctx.arc(
                x + offsetX,
                y + offsetY,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

    return canvas;
}



function generateColorOptions(answer) {

    const options = [answer];

    while (options.length < 4) {

        const number = generateDoubleNumber();

        if (!options.includes(number)) {
            options.push(number);
        }

    }

    return options.sort(() => Math.random() - 0.5);

}


function nextColor() {

    const TOTAL_QUESTIONS = 15;

    if (colorIndex >= TOTAL_QUESTIONS) {

        results.color = {
            correct: colorCorrect,
            total: TOTAL_QUESTIONS
        };

        markDone("color");

        setup(
            "Color Vision Completed",
            "Your responses have been recorded.",
            `
            <h3>${colorCorrect} of ${TOTAL_QUESTIONS} correct</h3>

            <p class="instruction">
                This is a generated color-pattern activity,
                not a standardized Ishihara examination.
            </p>

            <button class="primary" id="doneColor">
                Return to menu
            </button>
            `
        );

        $("doneColor").onclick = () => show("dashboard");

        return;
    }

    const answer = generateDoubleNumber();

    const options = generateColorOptions(answer);

    setup(
        "Color Vision Test",
        "Identify the double-digit number hidden in the colored dots.",
        `
        <p class="instruction">
            Carefully observe the entire color plate.
            Select the number you can identify.
        </p>

        <div id="plateHolder"></div>

        <p class="muted">
            Question ${colorIndex + 1} of ${TOTAL_QUESTIONS}
        </p>

        <div class="choice-row">

            ${options.map(number => `
                <button class="choice" data-color="${number}">
                    ${number}
                </button>
            `).join("")}

            <button class="choice" data-color="none">
                Not visible
            </button>

        </div>
        `
    );

    $("plateHolder").appendChild(
        makeColorPlate(answer)
    );

    document.querySelectorAll("[data-color]").forEach(button => {

        button.onclick = () => {

            if (button.dataset.color === String(answer)) {
                colorCorrect++;
            }

            colorIndex++;

            nextColor();

        };

    });

}


// ======================================
// 3. CONTRAST SENSITIVITY
// ======================================

function startContrast() {

    contrastIndex = 0;
    contrastCorrect = 0;

    nextContrast();

}


function nextContrast() {

    const TOTAL_QUESTIONS = 10;

    if (contrastIndex >= TOTAL_QUESTIONS) {

        results.contrast = {
            correct: contrastCorrect,
            total: TOTAL_QUESTIONS
        };

        markDone("contrast");

        setup(
            "Contrast Activity Completed",
            "Your responses have been recorded.",
            `
            <h3>${contrastCorrect} of 10 correct</h3>

            <button class="primary" id="doneContrast">
                Return to menu
            </button>
            `
        );

        $("doneContrast").onclick = () => show("dashboard");

        return;
    }

    const levels = [
        0.95, 0.85, 0.75, 0.65, 0.55,
        0.45, 0.38, 0.32, 0.26, 0.20
    ];

    const answers = [
        "C", "E", "O", "P", "D",
        "F", "C", "O", "E", "P"
    ];

    const level = levels[contrastIndex];
    const answer = answers[contrastIndex];

    const options = ["C", "E", "O", "P", "D", "F"]
        .sort(() => Math.random() - 0.5);

    setup(
        "Contrast Sensitivity",
        "Identify the symbol shown on the screen.",
        `
        <p class="instruction">
            The symbol gradually becomes lower in contrast.
        </p>

        <div class="stimulus"
            style="color:rgba(30,42,60,${level})">
            ${answer}
        </div>

        <p class="muted">
            Question ${contrastIndex + 1} of 10
        </p>

        <div class="choice-row">

            ${options.map(option => `
                <button class="choice" data-contrast="${option}">
                    ${option}
                </button>
            `).join("")}

        </div>
        `
    );

    document.querySelectorAll("[data-contrast]").forEach(button => {

        button.onclick = () => {

            if (button.dataset.contrast === answer) {
                contrastCorrect++;
            }

            contrastIndex++;

            nextContrast();

        };

    });

}


// ======================================
// 4. RADIAL LINE ACTIVITY
// ======================================

function startAstigmatism() {

    setup(
        "Radial Line Activity",
        "Observe the radial pattern.",
        `
        <p class="instruction">
            Look at the center of the pattern.
            Do any lines appear darker or blurrier than others?
        </p>

        <svg class="radial"
            viewBox="0 0 300 300">

            <circle cx="150" cy="150" r="5" fill="#111"/>

            ${Array.from({length:36}, (_, i) => {

                const angle = i * Math.PI / 18;

                const x = 150 + 140 * Math.cos(angle);
                const y = 150 + 140 * Math.sin(angle);

                return `
                    <line
                        x1="150"
                        y1="150"
                        x2="${x}"
                        y2="${y}"
                        stroke="#111"
                        stroke-width="2"
                    />
                `;

            }).join("")}

        </svg>

        <div class="choice-row">

            <button class="choice" data-radial="No, lines look similar">
                No, lines look similar
            </button>

            <button class="choice" data-radial="Yes, some look different">
                Yes, some look different
            </button>

            <button class="choice" data-radial="Unsure">
                Unsure
            </button>

        </div>
        `
    );

    document.querySelectorAll("[data-radial]").forEach(button => {

        button.onclick = () => {

            results.astigmatism = {
                response: button.dataset.radial
            };

            markDone("astigmatism");

            setup(
                "Activity Recorded",
                "Your observation has been saved.",
                `
                <p class="instruction">
                    ${button.dataset.radial}
                </p>

                <button class="primary" id="doneRadial">
                    Return to menu
                </button>
                `
            );

            $("doneRadial").onclick = () => show("dashboard");

        };

    });

}


// ======================================
// 5. AI ANALYSIS AND RESULTS
// ======================================

async function generateReport() {

    show("report");

    $("aiHeadline").textContent = "Analyzing your responses...";

    $("observations").innerHTML = "";
    $("recommendations").innerHTML = "";

    const completed = {
        acuity: results.acuity,
        color: results.color,
        contrast: results.contrast,
        astigmatism: results.astigmatism
    };

    const cards = [

        [
            "Visual Acuity",
            Object.keys(results.acuity).length === 2
                ? `${results.acuity.right.correct + results.acuity.left.correct}/40`
                : "Not completed"
        ],

        [
            "Color Vision",
            results.color
                ? `${results.color.correct}/15`
                : "Not completed"
        ],

        [
            "Contrast",
            results.contrast
                ? `${results.contrast.correct}/10`
                : "Not completed"
        ],

        [
            "Radial Lines",
            results.astigmatism
                ? "Recorded"
                : "Not completed"
        ]

    ];

    $("scoreGrid").innerHTML = cards.map(card => `
        <div class="score">
            <small>${card[0]}</small>
            <b>${card[1]}</b>
        </div>
    `).join("");

    $("reportMeta").textContent =
        `Participant: ${$("participant").value.trim() || "Anonymous"}
        · Age group: ${$("ageGroup").value}
        · ${new Date().toLocaleString()}`;

    try {

        const response = await fetch("/api/analyze", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                participant:
                    $("participant").value.trim() || "Anonymous",

                age_group: $("ageGroup").value,

                tests: completed

            })

        });

        if (!response.ok) {
            throw new Error("Analysis request failed");
        }

        const data = await response.json();

        $("aiHeadline").textContent =
            data.headline || "Screening summary";

        $("aiSource").textContent =
            data.source || "Analysis engine";

        $("observations").innerHTML =
            (data.observations || [])
                .map(item => `<li>${escapeHtml(item)}</li>`)
                .join("");

        $("recommendations").innerHTML =
            (data.recommendations || [])
                .map(item => `<li>${escapeHtml(item)}</li>`)
                .join("");

    } catch (error) {

        $("aiHeadline").textContent =
            "Analysis could not be reached";

        $("aiSource").textContent = "Connection error";

        $("observations").innerHTML =
            "<li>Your test scores are still available above.</li>";

    }

}


function escapeHtml(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// INITIALIZE
updateProgress();
