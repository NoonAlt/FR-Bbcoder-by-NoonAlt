function normalizeInputText(inputText) {
    // Normalizes the input text: removes extra whitespace and line breaks
    return inputText.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\s+/g, " ").trim();
}

// Parse the input text to extract dragon data
function parseDragonData(rawInput) {
    const warningEl = document.getElementById("dragon-warning"); // ← add this

    // If the element is missing, fallback to alert
    const showWarning = msg => {
        if (warningEl) {
            warningEl.textContent = msg;
            warningEl.classList.remove("hidden");
        } else {
            alert(msg);
        }
    }

    if (!rawInput || rawInput.trim() === "") {
        showWarning("Please provide some input!");
        return null;
    }

    // Normalize the input text
    const normalizedText = normalizeInputText(rawInput);

    // Initialize variables for extracted data
    let name = "", id = "", breed = "", primaryColor = "", primaryGene = "",
        secondaryColor = "", secondaryGene = "", tertiaryColor = "", tertiaryGene = "",
        hatchday = "", eyeType = "", element = "", parentsStatus = "", offspringStatus = "",
        eternalYouth = "No", silhouetteScroll = "No", reflectionScroll = "No",
        generation = "", sex = "", unnamedLineage = "No";

    // Extract Name
    const nameMatch = normalizedText.match(/^\w+/);
    if (nameMatch) name = nameMatch[0];

    // Extract ID
    const idMatch = normalizedText.match(/#(\d+)/);
    if (idMatch) id = idMatch[1];

    // Extract Breed
    const breedMatch = normalizedText.match(/(?:Level \d+ )?(\w+) Eye Type/);
    if (breedMatch) breed = breedMatch[1];

    // Extract Primary Color and Gene
    const primaryGeneMatch = normalizedText.match(/Primary Gene\s+(\w+)\s+(\w+)/);
    if (primaryGeneMatch) {
        primaryColor = primaryGeneMatch[1];
        primaryGene = primaryGeneMatch[2];
    }

    // Extract Secondary Color and Gene
    const secondaryGeneMatch = normalizedText.match(/Secondary Gene\s+(\w+)\s+(\w+)/);
    if (secondaryGeneMatch) {
        secondaryColor = secondaryGeneMatch[1];
        secondaryGene = secondaryGeneMatch[2];
    }

    // Extract Tertiary Color and Gene
    const tertiaryGeneMatch = normalizedText.match(/Tertiary Gene\s+(\w+)\s+(\w+)/);
    if (tertiaryGeneMatch) {
        tertiaryColor = tertiaryGeneMatch[1];
        tertiaryGene = tertiaryGeneMatch[2];
    }
    // Extract Hatchday
    const hatchdayMatch = normalizedText.match(/Hatchday\s*Hatchday\s*(?:\s)?(\w+\s+\d{1,2},\s+\d{4})/i);
    if (hatchdayMatch) {
        hatchday = hatchdayMatch[1].trim(); // Extract only the date
    }

    // Extract Sex
    sex = normalizedText.includes("Female") ? "Female" : "Male";

    // Extract Parents Status and Generation
    const parentsMatch = normalizedText.match(/Parents\s+([\s\S]*?)\s+Offspring/);
    if (parentsMatch) {
        const parentsData = parentsMatch[1].trim();
        if (/none/i.test(parentsData)) {
            parentsStatus = "None";
            generation = "Gen 1";
        } else {
            parentsStatus = parentsData.includes("Unnamed") ? "Unnamed" : "Named";
            generation = "Gen 2+";
        }
    } else {
        parentsStatus = "Unknown";
        generation = "Unknown";
    }

    // Extract Offspring Status
    const offspringMatch = normalizedText.match(/Offspring\s*(.*)/i);
    if (offspringMatch) {
        const offspringText = offspringMatch[1].trim();
        if (offspringText === "") {
            offspringStatus = ""; // or "Unknown"
        } else if (/none/i.test(offspringText)) {
            offspringStatus = "Unbred";
        } else {
            offspringStatus = "1+";
        }
    } else {
        offspringStatus = ""; // or "Unknown"
    }


    // Determine Unnamed Lineage
    if (parentsStatus.includes("Unnamed") || (offspringMatch && offspringMatch[1].includes("Unnamed"))) {
        unnamedLineage = "Yes";
    }

    // Extract Eye Type
    const eyeTypeMatch = normalizedText.match(/(\w+)\s+Lineage/);
    if (eyeTypeMatch) {
        eyeType = eyeTypeMatch[1];
    }

    // Extract Element (after the second occurrence of "Eye Type")
    const elementMatch = normalizedText.match(/Eye Type\s+(\w+)\s+Eye Type\s*(\w+)/);
    if (elementMatch) {
        element = elementMatch[2].trim();
    }

    // Check for Scrolls
    eternalYouth = /Eternal youth/i.test(normalizedText) ? "Yes" : "No";
    silhouetteScroll = /Silhouette Scroll/i.test(normalizedText) ? "Yes" : "No";
    reflectionScroll = /Reflection Scroll/i.test(normalizedText) ? "Yes" : "No";

    const requiredFields = {
        "Name": name,
        "ID": id,
        "Breed": breed,
        "Hatchday": hatchday,
        "Sex": sex,
        "Parents Status": parentsStatus,
        "Offspring Status": offspringStatus,
        "Eye Type": eyeType,
        "Element": element
    };

    // Gather missing/unknown fields
    const missingFields = [];
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value === "Unknown") {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        showWarning(`Warning: Could not parse the following required fields: ${missingFields.join(", ")}`);
    }


    // Return extracted data
    const parsedData = {
        Name: name, ID: id, Breed: breed, "Primary Color": primaryColor, "Primary Gene": primaryGene,
        "Secondary Color": secondaryColor, "Secondary Gene": secondaryGene,
        "Tertiary Color": tertiaryColor, "Tertiary Gene": tertiaryGene,
        Hatchday: hatchday, Sex: sex, "Unnamed Lineage": unnamedLineage, "Offspring Status": offspringStatus,
        "Eye Type": eyeType, Element: element, "Eternal Youth": eternalYouth,
        "Silhouette Scroll": silhouetteScroll, "Reflection Scroll": reflectionScroll, Generation: generation
    };

    document.getElementById("parsed-data-json").textContent = JSON.stringify(parsedData);
    updateBBCode();

    return parsedData;
}

// Event listener for parsing
document.getElementById("parse-button").addEventListener("click", () => {
    const rawInput = document.getElementById("raw-input").value;
    const parsedData = parseDragonData(rawInput);

    if (!parsedData) return;

    // Display parsed data in the table
    const tableBody = document.querySelector("#data-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    for (const [field, value] of Object.entries(parsedData)) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${field}</td><td>${value}</td>`;
        tableBody.appendChild(row);
    }
});

// Event listener for clearing input
document.getElementById("clear-button").addEventListener("click", () => {
    document.getElementById("raw-input").value = "";
});


// Generate BBCode for images
function updateImageBBCode() {
    const parsedDataElement = document.getElementById("parsed-data-json");
    if (!parsedDataElement) {
        console.error("Parsed data element not found.");
        return;
    }

    const parsedData = JSON.parse(parsedDataElement.textContent); // Use parsed data from JSON
    if (!parsedData) {
        console.error("Parsed data is null or undefined.");
        return;
    }

    // Calculate the folder number (dragon ID)
    const folderNumber = parsedData.ID < 100 ? 1 : Math.ceil(parsedData.ID / 100);

    // Generate Image link BBCode
    const image350 = `[img]https://www1.flightrising.com/rendern/350/${folderNumber}/${parsedData.ID}_350.png[/img]`;
    const imageAvatar = `[img]https://www1.flightrising.com/rendern/avatars/${folderNumber}/${parsedData.ID}.png[/img]`;
    const imagePortrait = `[img]https://www1.flightrising.com/rendern/portraits/${folderNumber}/${parsedData.ID}p.png[/img]`;

    const clickable350 = `[url=https://www1.flightrising.com/dragon/${parsedData.ID}]${image350}[/url]`;
    const clickableAvatar = `[url=https://www1.flightrising.com/dragon/${parsedData.ID}]${imageAvatar}[/url]`;
    const clickablePortrait = `[url=https://www1.flightrising.com/dragon/${parsedData.ID}]${imagePortrait}[/url]`;

    // Update the textareas
    const image350Element = document.getElementById("image-350");
    const imageAvatarElement = document.getElementById("image-avatar");
    const imagePortraitElement = document.getElementById("image-portrait");
    const clickable350Element = document.getElementById("clickable-350");
    const clickableAvatarElement = document.getElementById("clickable-avatar");
    const clickablePortraitElement = document.getElementById("clickable-portrait");

    if (image350Element) {
        image350Element.value = image350;
    } else {
        console.error("Element with ID 'image-350' not found.");
    }

    if (imageAvatarElement) {
        imageAvatarElement.value = imageAvatar;
    } else {
        console.error("Element with ID 'image-avatar' not found.");
    }

    if (imagePortraitElement) {
        imagePortraitElement.value = imagePortrait;
    } else {
        console.error("Element with ID 'image-portrait' not found.");
    }

    if (clickable350Element) {
        clickable350Element.value = clickable350;
    } else {
        console.error("Element with ID 'clickable-350' not found.");
    }

    if (clickableAvatarElement) {
        clickableAvatarElement.value = clickableAvatar;
    } else {
        console.error("Element with ID 'clickable-avatar' not found.");
    }

    if (clickablePortraitElement) {
        clickablePortraitElement.value = clickablePortrait;
    } else {
        console.error("Element with ID 'clickable-portrait' not found.");
    }
}

// Ensure `updateImageBBCode` is called after parsing
document.getElementById("parse-button").addEventListener("click", () => {
    const rawInput = document.getElementById("raw-input").value;
    const parsedData = parseDragonData(rawInput);

    if (!parsedData) return;

    // Display parsed data in the table
    const tableBody = document.querySelector("#data-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    for (const [field, value] of Object.entries(parsedData)) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${field}</td><td>${value}</td>`;
        tableBody.appendChild(row);
    }

    // Call updateImageBBCode to refresh BBCode with the latest parsedData
    updateImageBBCode();
});

// Add copy buttons to Image BBCode textareas
document
  .querySelectorAll('#image-bbcode-generator input[type="text"]')
  .forEach((input) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bbcode-copy-button';
    button.textContent = 'Copy';

    button.addEventListener('click', () => {
      navigator.clipboard.writeText(input.value);
    });

    input.parentNode.appendChild(button); // parent is <td>
  });



// Event listener for "For sale?" checkbox
document.getElementById("for-sale-checkbox").addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    const saleVariables = ["Price", "Currency", "Other notes"];
    const variableSelects = document.querySelectorAll("#drag-drop-area select");

    variableSelects.forEach(select => {
        saleVariables.forEach(variable => {
            const option = select.querySelector(`option[value="${variable}"]`);
            if (isChecked) {
                if (!option) {
                    const newOption = document.createElement("option");
                    newOption.value = variable;
                    newOption.textContent = variable;
                    select.appendChild(newOption);
                }
            } else {
                if (option) {
                    option.remove();
                }
            }
        });
    });
});

document.getElementById("custom-variables-checkbox").addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    const customVariableRows = document.querySelectorAll("#custom-variables-inputs table tr");

    // Extract custom variable labels and assign unique values
    const customVariables = Array.from(customVariableRows).map((row, index) => {
        const labelCell = row.querySelector("td:first-child");
        return {
            label: labelCell ? labelCell.textContent.trim() : `Custom variable ${index + 1}`,
            value: `custom-variable-${index + 1}` // Ensure a unique value for each custom variable
        };
    });

    const variableSelects = document.querySelectorAll("#drag-drop-area select");

    variableSelects.forEach(select => {
        customVariables.forEach(({ label, value }) => {
            const option = select.querySelector(`option[value="${value}"]`);
            if (isChecked) {
                if (!option) {
                    const newOption = document.createElement("option");
                    newOption.value = value;
                    newOption.textContent = label;
                    select.appendChild(newOption);
                }
            } else {
                if (option) {
                    option.remove();
                }
            }
        });
    });

    // Ensure custom variables are added to the global variable list
    if (isChecked) {
        customVariables.forEach(({ value }) => {
            if (!variableList.includes(value)) {
                variableList.push(value);
            }
        });
    } else {
        customVariables.forEach(({ value }) => {
            const index = variableList.indexOf(value);
            if (index !== -1) {
                variableList.splice(index, 1);
            }
        });
    }
});

// --------------------------------------------------- // 
// BBcode Builder
// --------------------------------------------------- // 

// Color code table
const colorCodes = {
    "Maize": "#FFFDEA", "Cream": "#FFEFDC", "Antique": "#D8D6CD", "White": "#FFFFFF", "Moon": "#D8D7D8",
    "Ice": "#EBEFFF", "Orca": "#E0DFFF", "Platinum": "#C8BECE", "Silver": "#BBBABF", "Dust": "#9C9C9E",
    "Grey": "#808080", "Smoke": "#9494A9", "Gloom": "#535264", "Lead": "#413C3F", "Shale": "#4D4850",
    "Flint": "#626268", "Charcoal": "#545454", "Coal": "#4B4946", "Oilslick": "#342B25", "Black": "#333333",
    "Obsidian": "#1D2224", "Eldritch": "#252A25", "Midnight": "#252735", "Shadow": "#3A2E44", "Blackberry": "#4B294F",
    "Mulberry": "#6F235D", "Plum": "#853390", "Wisteria": "#724F7B", "Thistle": "#8F7C8B", "Fog": "#A593B0",
    "Mist": "#E1CEFF", "Lavender": "#CCA4E0", "Heather": "#9777BD", "Purple": "#A261CF", "Orchid": "#D950FF",
    "Amethyst": "#993BD0", "NightShade": "#782EB2", "Violet": "#643F9C", "Grape": "#570FC0", "Royal": "#4D2C89",
    "Eggplant": "#332B65", "Iris": "#535195", "Storm": "#757ADB", "Twilight": "#474AA0", "Indigo": "#2D237A",
    "Sapphire": "#0D095B", "Navy": "#212B5F", "Cobalt": "#003484", "Ultramarine": "#1C51E7", "Blue": "#324BA9",
    "Periwinkle": "#4866D5", "Lapis": "#2B84FF", "Splash": "#6392DF", "Cornflower": "#75A8FF", "Sky": "#AEC8FF",
    "Stonewash": "#7895C1", "Overcast": "#444F69", "Steel": "#556979", "Denim": "#2F4557", "Abyss": "#0D1E24",
    "Phthalo": "#0B2D46", "Azure": "#0A3D67", "Caribbean": "#0086CE", "Teal": "#2B768F", "Cerulean": "#00B4D6",
    "Cyan": "#00FFF0", "Robin": "#9AEAEF", "Aqua": "#72C4C4", "Turquoise": "#3AA0A1", "Spruce": "#8BBBB2",
    "Pistachio": "#E2FFE6", "Seafoam": "#B2E2BD", "Mint": "#9AFFC7", "Jade": "#61AB89", "Spearmint": "#148F67",
    "Thicket": "#005F48", "Peacock": "#20603F", "Emerald": "#21613F", "Shamrock": "#236925", "Jungle": "#1F361A",
    "Hunter": "#1D2715", "Forest": "#425035", "Camo": "#51684C", "Algae": "#97AF8B", "Swamp": "#687F67",
    "Avocado": "#567C34", "Green": "#629C3F", "Fern": "#7ECE73", "Mantis": "#99FF9C", "Pear": "#8ECD55",
    "Leaf": "#A5E32D", "Radioactive": "#C6FF00", "Honeydew": "#D0E672", "Peridot": "#E8FFB5", "Chartreuse": "#B4CD3C",
    "Spring": "#A9A832", "Crocodile": "#828335", "Olive": "#697135", "Murk": "#4B4420", "Moss": "#7F7745",
    "Goldenrod": "#BEA55D", "Amber": "#C18E1B", "Honey": "#D1B300", "Lemon": "#FFE63B", "Yellow": "#F9E255",
    "Grapefruit": "#F7FF6F", "Banana": "#FFEC80", "Sanddollar": "#EBE7AE", "Flaxen": "#FDE9AE", "Ivory": "#FFD297",
    "Buttercup": "#F6BF6B", "Gold": "#E8AF49", "Metals": "#D1B046", "Marigold": "#FFB43B", "Sunshine": "#FA912B",
    "Saffron": "#FF8400", "Sunset": "#FFA248", "Peach": "#FFB576", "Cantaloupe": "#FF984F", "Orange": "#D5602B",
    "Bronze": "#B2560D", "Terracotta": "#B23B07", "Carrot": "#FF5500", "Fire": "#EF5C23", "Pumpkin": "#FF6840",
    "Tangerine": "#FF7360", "Cinnamon": "#C05A39", "Caramel": "#C67047", "Sand": "#B27749", "Tan": "#C49A70",
    "Beige": "#CABBA2", "Stone": "#827A64", "Taupe": "#6D665A", "Slate": "#564D48", "Driftwood": "#766359",
    "Latte": "#977B6C", "Dirt": "#76483F", "Clay": "#603F3D", "Sable": "#57372C", "Umber": "#2F1E1A",
    "Soil": "#5A4534", "Hickory": "#725639", "Tarnish": "#855C32", "Ginger": "#90532B", "Brown": "#8F5B3F",
    "Chocolate": "#563012", "Auburn": "#7B3C1D", "Copper": "#A44B28", "Rust": "#8B3220", "Tomato": "#BA311C",
    "Vermilion": "#E22D17", "Ruby": "#CD000E", "Cherry": "#AA0024", "Crimson": "#850012", "Garnet": "#5B0F14",
    "Sanguine": "#2F0002", "Blood": "#451717", "Maroon": "#652127", "Berry": "#8B272C", "Red": "#C1272D",
    "Strawberry": "#DE3235", "Cerise": "#A22929", "Carmine": "#B13A3A", "Brick": "#9A534D", "Coral": "#CC6F6F",
    "Blush": "#FFA2A2", "Cottoncandy": "#EB7997", "Watermelon": "#DB518D", "Magenta": "#E934AA", "Fuchsia": "#EC0089",
    "Raspberry": "#8A0249", "Wine": "#4D0F28", "Mauve": "#9C4875", "Pink": "#E77FBF", "Bubblegum": "#EAA9FF",
    "Rose": "#FFD6F6", "Pearl": "#FBE9F8"
};

const variableList = [
    "Name", "ID", "Hatchday", "Breed", "Eye Type", "Element",
    "Primary Color", "Primary Gene", "Secondary Color", "Secondary Gene",
    "Tertiary Color", "Tertiary Gene", "Scrolls", "Primary Color Code",
    "Secondary Color Code", "Tertiary Color Code", "Generation", "Sex",
    "Unnamed Lineage", "Offspring Status", "Image (350)", "Clickable (350)",
    "Image (Avatar)", "Clickable (Avatar)", "Image (Portrait)",
    "Clickable (Portrait)", "Price", "Currency", "Other notes"
];

let dragDropArea;

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to initialize the drag and drop area
function initializeDragDropArea() {
    if (!dragDropArea) {
        console.error("dragDropArea is not defined");
        return;
    }
    // Initialize Sortable.js for dragDropArea
    new Sortable(dragDropArea, {
        group: {
            name: "shared",
            pull: true,
            put: true,
        },
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
        draggable: ".block:not(.nested-container)", // Prevent nested-container itself from being draggable
        handle: window.innerWidth >= 1024 ? ".drag-handle" : null, // Regular blocks use handle on large screens, entire element on small screens
        filter: ".nested-container", // Exclude nested containers from being treated as draggable
        onStart: (evt) => {
            const nestedContainer = evt.item.querySelector(".nested-container");
            if (nestedContainer) {
                // Prevent nested containers from interfering with drag
                nestedContainer.setAttribute("sortable-ignore", "true");
            }
        },
        onEnd: (evt) => {
            const nestedContainer = evt.item.querySelector(".nested-container");
            if (nestedContainer) {
                // Restore nested container behavior after drag
                nestedContainer.removeAttribute("sortable-ignore");
            }
            // Re-initialize all nested containers to ensure they maintain their nested state
            document.querySelectorAll(".nested-container").forEach(initializeNestedSortable);
            updateBBCode();
        },
    });
}

// Function to initialize Sortable for nested containers
function initializeNestedSortable(nestedContainer) {
    if (!nestedContainer.hasAttribute("sortable-initialized")) {
        new Sortable(nestedContainer, {
            group: {
                name: "shared", // Ensure compatibility for nested drag-and-drop
                pull: true,     // Allow pulling items out
                put: true,      // Allow dropping items in
            },
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65,
            draggable: ".block", // Allow dragging only direct child blocks
            onStart: (evt) => {
                if (nestedContainer.getAttribute("sortable-ignore") === "true") {
                    evt.preventDefault(); // Prevent interference with parent drag
                }
            },
            onEnd: (evt) => {
                // Re-initialize all nested containers to ensure they maintain their nested state
                document.querySelectorAll(".nested-container").forEach(initializeNestedSortable);
                updateBBCode();
            },
        });
        nestedContainer.setAttribute("sortable-initialized", "true");
    }
}

// Create the Variable Selector Dropdown
function createVariableSelector(selectedValue = "") {
    const select = document.createElement("select");
    select.innerHTML = `<option value="">Select Variable</option>`; 

    variableList.forEach(variable => {
        const option = document.createElement("option");
        option.value = variable;
        option.textContent = variable;
        if (variable === selectedValue) option.selected = true;
        select.appendChild(option);
    });
    return select;
}

// Add a new block
function createBlock(data = { inputBefore: "", variable: "", inputAfter: "", nestableType: null }) {
    console.log("Creating a block:", data);
    const block = document.createElement('div');
    block.classList.add('block', 'flex', 'items-center', 'justify-between', 'p-2', 'border', 'border-gray-300', 'gap-2', 'bg-white', 'rounded', 'w-full', 'box-border', 'text-center', "user-select-none");

    if (data.nestableType) {
        // Special handling for nestable blocks
        block.classList.add("flex-col");
        block.dataset.nestableType = data.nestableType; // Store original nestable type

        // Create editable input for opening tag
        const openingTagInput = document.createElement("input");
        openingTagInput.type = "text";
        openingTagInput.value = data.openingTag || `[${data.nestableType}]`;
        openingTagInput.placeholder = "Opening tag";
        openingTagInput.classList.add("border", "border-gray-300", "rounded", "p-1", "text-sm", "max-w-32", "text-center");
        
        const nestedContainer = document.createElement("div");
        nestedContainer.classList.add("nested-container", "border-2", "border-solid", "border-gray-400", "rounded", "bg-gray-200", "min-w-64", "min-h-12", "flex-shrink-0");

        // Add minimize/expand button
        const toggleButton = document.createElement("button");
        toggleButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        toggleButton.innerHTML = `<i class="fa-solid fa-minus" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        toggleButton.addEventListener("click", () => {
            const isHidden = nestedContainer.style.display === "none";
            nestedContainer.style.display = isHidden ? "block" : "none";
            toggleButton.innerHTML = isHidden
                ? `<i class="fa-solid fa-minus" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`
                : `<i class="fa-solid fa-plus" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        });

        // Container for buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("flex", "space-x-5");

        // Add Up and Down buttons
        const moveUpButton = document.createElement("button");
        moveUpButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        moveUpButton.innerHTML = `<i class="fa-solid fa-circle-arrow-up" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        moveUpButton.addEventListener("click", () => moveBlock(block, -1));

        const moveDownButton = document.createElement("button");
        moveDownButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        moveDownButton.innerHTML = `<i class="fa-solid fa-circle-arrow-down" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        moveDownButton.addEventListener("click", () => moveBlock(block, 1));

        const nestButton = document.createElement("button");
        nestButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        nestButton.innerHTML = `<i class="fa-solid fa-arrow-right-to-bracket" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        nestButton.addEventListener("click", () => nestBlock(block));

        const unnestButton = document.createElement("button");
        unnestButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        unnestButton.innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        unnestButton.addEventListener("click", () => unnestBlock(block));

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        deleteButton.innerHTML = `<i class="fa-regular fa-trash-can" style="font-size: 1.3rem; width: 1.3rem; height: 1.3rem;"></i>`;
        deleteButton.addEventListener("click", () => {
        block.remove();
        updateBBCode();
        window.debouncedAutoSave();
        });

        const copyBlockButton = document.createElement("button");
        copyBlockButton.classList.add("w-5", "h-5", "rounded", "border-none", "cursor-pointer");
        copyBlockButton.innerHTML = `<i class="fa-regular fa-clone" style="font-size: 20px; width: 20px; height: 20px;"></i>`;
        copyBlockButton.addEventListener("click", () => {
        const openingTag = block.querySelector("input[type='text']")?.value || "";
        const nestableType = block.dataset.nestableType;
        createBlock({
            openingTag,
            nestableType
        });
      });

        buttonContainer.append(toggleButton, moveUpButton, moveDownButton, nestButton, unnestButton, copyBlockButton, deleteButton);

        initializeNestedSortable(nestedContainer);
        block.append(openingTagInput, buttonContainer, nestedContainer); // Append input before buttons

    } else {
        // Standard block inputs and controls
        const inputBefore = document.createElement("input");
        inputBefore.type = "text";
        inputBefore.placeholder = "Text before";
        inputBefore.value = data.inputBefore;
        inputBefore.classList.add("border", "border-gray-300", "rounded", "p-1", "text-sm", "max-w-32");

        const variableSelector = createVariableSelector(data.variable);
        variableSelector.classList.add("border", "border-gray-300", "rounded", "p-1", "text-sm", "max-w-32");

        const inputAfter = document.createElement("input");
        inputAfter.type = "text";
        inputAfter.placeholder = "Text after";
        inputAfter.value = data.inputAfter;
        inputAfter.classList.add("border", "border-gray-300", "rounded", "p-1", "text-sm", "max-w-32");

        const dragHandle = document.createElement("div");
        dragHandle.classList.add("drag-handle", "cursor-grab", "p-1", "bg-gray-300", "rounded", "font-bold", "text-sm", "user-select-none");
        dragHandle.innerHTML = '<i class="fas fa-bars"></i>';

        const copyBlockButton = document.createElement("button");
        copyBlockButton.classList.add("w-5", "h-5", "rounded", "border-none", "cursor-pointer");
        copyBlockButton.innerHTML = `<i class="fa-regular fa-clone" style="font-size: 20px; width: 20px; height: 20px;"></i>`;
        copyBlockButton.addEventListener("click", () => {
            const inputBefore = block.querySelector("input:nth-of-type(1)")?.value || "";
            const variableSelector = block.querySelector("select");
            const variable = variableSelector ? variableSelector.value : "";
            const inputAfter = block.querySelector("input:nth-of-type(2)")?.value || "";
            const nestableType = block.classList.contains("flex-col") ? block.textContent.match(/\[(\w+)\]/)?.[1] : null;

            createBlock({
                inputBefore,
                variable,
                inputAfter,
                nestableType
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("w-5", "h-5", "cursor-pointer", "flex", "items-center", "justify-center");
        deleteButton.innerHTML = `<i class="fa-regular fa-trash-can" style="font-size: 20px; width: 20px; height: 20px;"></i>`;
        deleteButton.addEventListener("click", () => {
        block.remove();
        updateBBCode();
        window.debouncedAutoSave();
        });

        block.append(inputBefore, variableSelector, inputAfter, dragHandle, copyBlockButton, deleteButton);

        // Ensure sale variables are correctly displayed based on checkbox state
        variableSelector.classList.add("border", "border-gray-300", "rounded", "p-1", "text-sm", "max-w-32");

        const isChecked = document.getElementById("for-sale-checkbox").checked;
        const saleVariables = ["Price", "Currency", "Other notes"];
        saleVariables.forEach(variable => {
            const option = variableSelector.querySelector(`option[value="${variable}"]`);
            if (isChecked && !option) {
                const newOption = document.createElement("option");
                newOption.value = variable;
                newOption.textContent = variable;
                variableSelector.appendChild(newOption);
            } else if (!isChecked && option) {
                option.remove();
            }
        });
    }

    dragDropArea.appendChild(block);
    updateBBCode();
    window.debouncedAutoSave();  // Trigger auto-save after block creation
    console.log("Returning block:", block);
    return block;
};
// Make createBlock globally accessible
window.createBlock = createBlock;

// Function to nest a block into another nestable block
function nestBlock(block) {
    const nestableBlocks = Array.from(dragDropArea.querySelectorAll('.block.flex-col'));
    const targetNestableBlock = nestableBlocks.find(nestableBlock => nestableBlock !== block);

    if (targetNestableBlock) {
        const nestedContainer = targetNestableBlock.querySelector('.nested-container');
        nestedContainer.appendChild(block);
        initializeNestedSortable(nestedContainer);
        updateBBCode();
    }
}

function unnestBlock(block) {
    const parentContainer = block.closest('.nested-container');
    if (parentContainer) {
        const grandParentContainer = parentContainer.closest('.block.flex-col')?.parentElement;
        if (grandParentContainer) {
            grandParentContainer.appendChild(block);
            updateBBCode();
        }
    }
}

function renderPremadeBlocks() {
        console.log("Rendering premade blocks...");
        const panel = document.getElementById("premade-blocks");
    
        if (!panel) {
            console.error("Premade blocks container not found.");
            return;
        }
    
        // Pre-made block data
        const premadeBlocks = [
            { category: "Text", label: "Bold", inputBefore: "[b]", variable: "", inputAfter: "[/b]" },
            { category: "Text", label: "Cursive", inputBefore: "[i]", variable: "", inputAfter: "[/i]" },
            { category: "Text", label: "Underline", inputBefore: "[u]", variable: "", inputAfter: "[/u]" },
            { category: "Text", label: "Strikethrough", inputBefore: "[s]", variable: "", inputAfter: "[/s]" },
            { category: "Text", label: "Size", nestableType: "size=" },
            { category: "Text", label: "Color", nestableType: "color=" },
            { category: "Alignment", label: "Columns", nestableType: "[columns]" },
            { category: "Alignment", label: "Next Column", inputBefore: "[nextcol]", variable: "", inputAfter: "" },
            { category: "Alignment", label: "Align Center", nestableType: "center" },
            { category: "Alignment", label: "Align Right", nestableType: "right" },
            { category: "Alignment", label: "Align Left", nestableType: "left" },
            { category: "Alignment", label: "Indent", nestableType: "indent" },
            { category: "Alignment", label: "Quote", nestableType: "quote" },
            { category: "Alignment", label: "Hidden", nestableType: "hidden" },
            { category: "FR Specific", label: "Buy Dragon AH Link /purchase icon", inputBefore: "[url=http://www1.flightrising.com/auction-house/buy-dragon/", variable: "ID", inputAfter: "][img]http://flightrising.com/images/layout/button_buyauction.png[/img][/url]"},
            { category: "FR Specific", label: "Buy Dragon AH Link /buy icon", inputBefore: "[url=http://www1.flightrising.com/auction-house/buy-dragon/", variable: "ID", inputAfter: "][img]https://www1.flightrising.com/static/layout/auctionhouse/button_ah_buy.png[/img][/url]"},
            { category: "FR Specific", label: "Buy Dragon AH Link /emoji", inputBefore: "[url=http://www1.flightrising.com/auction-house/buy-dragon/", variable: "ID", inputAfter: "][emoji=money bag size=1][/url]"},
            { category: "FR Specific", label: "Effect preview", inputBefore: "[effect dragon=", variable: "ID", inputAfter: "]" },
        ];        
    
        // Clear existing blocks
        panel.innerHTML = "";
    
        // Group blocks by category
    const categories = {};
    premadeBlocks.forEach(block => {
        if (!categories[block.category]) {
            categories[block.category] = [];
        }
        categories[block.category].push(block);
    });

    // Create collapsible sections
    Object.entries(categories).forEach(([categoryName, blocks]) => {
        const section = document.createElement("div");

        const header = document.createElement("button");
        header.classList.add("font-bold", "text-left", "w-full", "py-2", "px-3", "rounded", "hover:bg-gray-300", "flex", "justify-between", "items-center");
        header.innerHTML = `${categoryName} <i class='fa-solid fa-caret-up transform transition-transform duration-300'></i>`;

        const arrow = header.querySelector("i");

        header.addEventListener("click", () => {
            blockContainer.style.display = blockContainer.style.display === "none" ? "block" : "none";
            arrow.classList.toggle("rotate-180");
        });

        const blockContainer = document.createElement("div");
        blockContainer.classList.add("mt-2", "space-y-2");
        blockContainer.style.display = "none"; // Hidden by default

        blocks.forEach(blockData => {
            const block = document.createElement("div");
            block.classList.add("block", "p-2", "bg-white", "rounded", "cursor-pointer");
            block.textContent = blockData.label;
            block.addEventListener("click", () => createBlock(blockData));
            blockContainer.appendChild(block);
        });

        section.appendChild(header);
        section.appendChild(blockContainer);
        panel.appendChild(section);
    });

    console.log("Premade blocks rendered successfully.");
}
    renderPremadeBlocks();
    
    
    // Toggle premade panel visibility
    document.getElementById("toggle-premade-panel").addEventListener("click", () => {
        const premadePanel = document.getElementById("premade-panel");
        premadePanel.classList.toggle("hidden");
    });

    const premadePanel = document.getElementById("premade-panel");
    if (premadePanel) {
        premadePanel.classList.add("hidden");
    }

    // Move a block up or down
    function moveBlock(block, direction) {
        const parent = block.parentElement;
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(block);
    
        if (index === -1) return; // Block not found
        const targetIndex = index + direction;
    
        // Ensure target index is within bounds
        if (targetIndex < 0 || targetIndex >= siblings.length) return;
    
        // Move block in the DOM
        if (direction === -1) {
            parent.insertBefore(block, siblings[targetIndex]);
        } else if (direction === 1) {
            parent.insertBefore(block, siblings[targetIndex].nextSibling);
        }
    
        updateBBCode(); // Update BBCode to reflect changes
    }

    // Update BBCode with variable replacement
    function updateBBCode() {
        const parsedData = JSON.parse(document.getElementById("parsed-data-json").textContent); // Ensure parsed data is available
        const displayScrollsAsEmojis = document.getElementById("display-scrolls-emojis").checked;
    
        // Collect custom variable values
        const customVariables = {};
        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`custom-variable-value-${i}`);
            if (input) {
                customVariables[`custom-variable-${i}`] = input.value.trim();
            }
        }
    
        const processBlock = (block) => {
            const inputBefore = block.querySelector("input:nth-of-type(1)")?.value || "";
            const variableSelector = block.querySelector("select");
            const variable = variableSelector ? variableSelector.value : "";
            const inputAfter = block.querySelector("input:nth-of-type(2)")?.value || "";
            const nestedContainer = block.querySelector(".nested-container");
    
            let value = ""; // Placeholder for variable output
    
            // Process variable if selected
            if (variable) {
                if (variable === "Scrolls") {
                    const scrolls = [];
                    if (parsedData["Eternal Youth"] === "Yes") scrolls.push(displayScrollsAsEmojis ? "[emoji=eternal youth size=1]" : "Eternal Youth");
                    if (parsedData["Silhouette Scroll"] === "Yes") scrolls.push(displayScrollsAsEmojis ? "[emoji=silhouette size=1]" : "Silhouette");
                    if (parsedData["Reflection Scroll"] === "Yes") scrolls.push(displayScrollsAsEmojis ? "[emoji=reflect size=1]" : "Reflect");
                    value = scrolls.join(" ");
                } else if (variable === "Primary Color Code") {
                    value = colorCodes[parsedData["Primary Color"]] || "";
                } else if (variable === "Secondary Color Code") {
                    value = colorCodes[parsedData["Secondary Color"]] || "";
                } else if (variable === "Tertiary Color Code") {
                    value = colorCodes[parsedData["Tertiary Color"]] || "";
                } else if (customVariables[variable] !== undefined) {
                    value = customVariables[variable]; // Use custom variable value
                } else if (parsedData[variable] !== undefined) {
                    value = parsedData[variable];
                } else {
                    // Handle custom BBCode variables
                    switch (variable) {
                        case "Image (350)":
                            value = document.getElementById("image-350").value;
                            break;
                        case "Clickable (350)":
                            value = document.getElementById("clickable-350").value;
                            break;
                        case "Image (Avatar)":
                            value = document.getElementById("image-avatar").value;
                            break;
                        case "Clickable (Avatar)":
                            value = document.getElementById("clickable-avatar").value;
                            break;
                        case "Image (Portrait)":
                            value = document.getElementById("image-portrait").value;
                            break;
                        case "Clickable (Portrait)":
                            value = document.getElementById("clickable-portrait").value;
                            break;
                        case "Price":
                            value = document.getElementById("sale-price").value;
                            break;
                        case "Currency":
                            value = document.getElementById("sale-currency").value;
                            break;
                        case "Other notes":
                            value = document.getElementById("sale-notes").value;
                            break;
                    }
                }
            }
    
            if (nestedContainer) {
            // Process nested blocks inside nestable blocks
            const nestedBlocks = Array.from(nestedContainer.children).map(processBlock).join("");
            const openingTagInput = block.querySelector("input[type='text']");
            const openingTag = openingTagInput ? openingTagInput.value : `[${block.dataset.nestableType}]`;
            const tagMatch = openingTag.match(/\[(\w+)/);
            const tagName = tagMatch ? tagMatch[1] : 'unknown';
            console.log(`Processing nested block: ${openingTag}${nestedBlocks}[/${tagName}]`);
            return `${openingTag}${nestedBlocks}[/${tagName}]`;
}
    
            console.log(`Processing block: ${inputBefore}${value}${inputAfter}`); // Add this line
            return `${inputBefore}${value}${inputAfter}`;
        };
    
        const blocks = Array.from(dragDropArea.children);
        console.log("Order of blocks in dragDropArea:", blocks); // Add this line
        const bbcodeArray = blocks.map(processBlock);
    
        console.log("Generated BBCode:", bbcodeArray.join("")); // Add this line
    
        const bbcodeResult = document.getElementById("bbcode-result");
        bbcodeResult.value = bbcodeArray.join("");
    }


// Make functions globally accessible
window.createBlock = createBlock;
window.initializeDragDropArea = initializeDragDropArea;
window.initializeNestedSortable = initializeNestedSortable;
window.createVariableSelector = createVariableSelector;
window.nestBlock = nestBlock;
window.unnestBlock = unnestBlock;
window.renderPremadeBlocks = renderPremadeBlocks;
window.moveBlock = moveBlock;
window.updateBBCode = updateBBCode;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing dragDropArea after DOMContentLoaded.");
    dragDropArea = document.getElementById("drag-drop-area");
    // Initialize parsed-data-json with empty object to allow template loading without parsing
    document.getElementById("parsed-data-json").textContent = JSON.stringify({});
    initializeDragDropArea();

    // Create a debounced auto-save function (500ms delay)
    const debouncedAutoSave = debounce(() => {
    // Auto-save to fixed key (always save, even if empty)
    const compressedTemplate = generateTemplateText(dragDropArea);
    localStorage.setItem(`template_auto-draft`, compressedTemplate);
    }, 500);

    // Make it globally accessible
    window.debouncedAutoSave = debouncedAutoSave;

    // Hook debounced auto-save to relevant checkboxes and custom variable inputs
    document.getElementById("for-sale-checkbox").addEventListener("change", debouncedAutoSave);
    document.getElementById("custom-variables-checkbox").addEventListener("change", debouncedAutoSave);

    // Custom variable input fields (text inputs) also trigger auto-save
    document.querySelectorAll("#custom-variables-inputs input[type='text']").forEach(input => {
        input.addEventListener("input", debouncedAutoSave);
    });

    // Add event listener for the "Add Block" button
    const addBlockButton = document.getElementById("add-block");
    addBlockButton.addEventListener("click", () => createBlock());
    

    // Listen for changes to update BBCode AND trigger debounced auto-save
    dragDropArea.addEventListener("input", () => {
        updateBBCode();
        debouncedAutoSave();
    });
    dragDropArea.addEventListener("change", () => {
        updateBBCode();
        debouncedAutoSave();
    });

    // Also listen for Sortable drag-end to catch drag/drop edits
    const sortableInstance = Sortable.get(dragDropArea);  // Assuming Sortable is initialized elsewhere
    if (sortableInstance) {
        sortableInstance.options.onEnd = (evt) => {
            updateBBCode();
            debouncedAutoSave();
        };
    }

    // Copy BBCode to clipboard
    const copyButton = document.getElementById('copy-bbcode');
    const bbcodeResult = document.getElementById('bbcode-result');

    copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(bbcodeResult.value)
        .then(() => showCopyConfirmation(copyButton))
        .catch(err => console.error('Copy failed', err));
    });

    // Event listener for quick copy
    const quickCopyButton = document.getElementById('quick-copy-button');

    quickCopyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(bbcodeResult.value)
        .then(() => {
        showCopyConfirmation(quickCopyButton);
        })
        .catch(err => console.error('Copy failed', err));
    });


    // Ensure BBCode updates whenever parsedData changes
    const parseButton = document.getElementById("parse-button");
    parseButton.addEventListener("click", () => {
        updateBBCode(); // Refresh BBCode with the latest parsedData
    });

    // Toggle BBCode guide visibility
    const toggleGuideButton = document.getElementById("bbcode-guide-button");
    toggleGuideButton.addEventListener("click", () => {
        const guideContent = document.getElementById("guide-content");
        guideContent.style.display = guideContent.style.display === "none" ? "block" : "none";
    });

    // Render premade blocks
    renderPremadeBlocks();

    // Load auto-draft on page load (if exists)
    const autoDraft = localStorage.getItem('template_auto-draft');
    if (autoDraft) {
        loadTemplateFromText(dragDropArea, autoDraft);
    }

    // Check for template in URL hash (after auto-draft load, if needed)
    if (window.location.hash) {
        setTimeout(() => {
            loadTemplateFromURL(dragDropArea);
        }, 100);
    }

    // Add button for saving to URL
    const saveURLButton = document.getElementById("save-url");
    if (saveURLButton) {
        saveURLButton.addEventListener("click", () => saveTemplateToURL(dragDropArea));
    }

    // Add button for loading from URL
    const loadURLButton = document.getElementById("load-url");
    if (loadURLButton) {
        loadURLButton.addEventListener("click", () => loadTemplateFromURL(dragDropArea));
    }
        
    // Trigger the custom-variables-checkbox function by default
    const customVariablesCheckbox = document.getElementById("custom-variables-checkbox");
    customVariablesCheckbox.checked = true; // Ensure the checkbox is checked
    customVariablesCheckbox.dispatchEvent(new Event("change")); // Trigger the change event
    // Trigger the for-sale-checkbox function by default
     const forSaleCheckbox = document.getElementById("for-sale-checkbox");
    forSaleCheckbox.checked = true; // Ensure the checkbox is checked
    forSaleCheckbox.dispatchEvent(new Event("change")); // Trigger the change event

    // Universal copy confirmation function
    function showCopyConfirmation(referenceElement, message = 'Copied!') {
    // Create tooltip element
    const tooltip = document.createElement('span');
    tooltip.textContent = message;
    tooltip.className = 'absolute -top-6 left-1/2 -translate-x-1/2 text-sm px-2 py-1 rounded shadow transition-opacity opacity-100';

    // Make parent relative if not already
    const wrapper = referenceElement.parentElement;
    if (!wrapper.classList.contains('relative')) {
        wrapper.classList.add('relative', 'inline-block');
    }

    wrapper.appendChild(tooltip);

    // Fade out after 1 second
    setTimeout(() => {
        tooltip.classList.add('opacity-0');
        setTimeout(() => tooltip.remove(), 500);
    }, 1000);
    }

    // BBCode URL Generator
    const generateButton = document.getElementById('bbcode-url-generator');
    const modal = document.getElementById('bbcode-modal');
    const urlTextarea = document.getElementById('bbcode-url');
    const nameTextarea = document.getElementById('bbcode-name');
    const urlbbcodecopyButton = document.getElementById('bbcode-copy-button');
    const closeButton = document.getElementById('bbcode-close-button');

    // Open modal
    generateButton.addEventListener('click', () => {
    urlTextarea.value = `[url=${window.location.href}]`;
    nameTextarea.value = '';
    nameTextarea.focus();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    });

    // Close modal
    closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    });

    // Copy BBCode
    urlbbcodecopyButton.addEventListener('click', () => {
    const bbcode = `${urlTextarea.value}${nameTextarea.value}[/url]`;
    navigator.clipboard.writeText(bbcode)
        .then(() => showCopyConfirmation(urlbbcodecopyButton)) // <- universal confirmation
        .catch(err => console.error('Copy failed', err));
    });


    
});

// Generate template text from current blocks
function generateTemplateText(dragDropArea) {
    const processBlock = (block) => {
        const inputBefore = block.querySelector("input[type='text'][placeholder='Text before']")?.value || "";
        const variable = block.querySelector("select")?.value || "";
        const inputAfter = block.querySelector("input[type='text'][placeholder='Text after']")?.value || "";
        const nestedContainer = block.querySelector(".nested-container");
        const openingTag = nestedContainer ? block.querySelector("input[type='text']")?.value || "" : "";
        const nestableType = block.dataset.nestableType || null;

        // Recursively process nested blocks if this block has a nested container
        const nestedBlocks = nestedContainer ? Array.from(nestedContainer.children).map(processBlock) : [];

        return {
            inputBefore,
            variable,
            inputAfter,
            openingTag,
            nestableType,
            nestedBlocks
        };
    };

    const blocks = Array.from(dragDropArea.children);
    // Filter out blocks that have already been processed as nested blocks
    const topLevelBlocks = blocks.filter(block => !block.closest('.nested-container'));
    const workspaceBlocks = topLevelBlocks.map(processBlock);

    // Collect extra variables state
    const extraVariables = {
        forSale: document.getElementById("for-sale-checkbox").checked,
        customVariablesEnabled: document.getElementById("custom-variables-checkbox").checked,
        customVariables: Array.from(document.querySelectorAll("#custom-variables-inputs table tr"))
        .filter(row => row.querySelector("input[type='text']").value.trim() !== "")
        .map(row => ({
            label: row.querySelector("td:first-child").textContent.trim(),
            value: row.querySelector("input[type='text']").value
        })),

        saleInfo: {
            price: document.getElementById("sale-price").value || "",
            currency: document.getElementById("sale-currency").value || "",
            notes: document.getElementById("sale-notes").value || ""
        }
    };

    const templateData = {
        blocks: workspaceBlocks,
        extraVariables
    };

    const jsonString = JSON.stringify(templateData, null, 2);
    // Compress the JSON for shorter, URL-safe output
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    console.log("Generated Compressed Template:", compressed);
    return compressed;
}

// Load template from URL
function loadTemplateFromText(dragDropArea, templateText = null) {
    if (!dragDropArea) {
        console.error("dragDropArea is not defined");
        alert("Error: dragDropArea is not defined. Please ensure the dragDropArea element is initialized.");
        return;
    }

    if (!templateText) {
        templateText = document.getElementById("load-template-text").value;
    }

    console.log("loadTemplateFromText() is running");
    try {
        let decompressed = LZString.decompressFromEncodedURIComponent(templateText);
        if (!decompressed) decompressed = templateText;

        let templateData = JSON.parse(decompressed);

        if (Array.isArray(templateData)) {
            templateData = {
                blocks: templateData,
                extraVariables: {
                    forSale: true,
                    customVariablesEnabled: true,
                    customVariables: [],
                    saleInfo: { price: "", currency: "", notes: "" }
                }
            };
        }

        const parseBlock = (data, parentContainer) => {
            const block = createBlock({
                inputBefore: data.inputBefore || "",
                variable: data.variable || "",
                inputAfter: data.inputAfter || "",
                openingTag: data.openingTag || (data.nestableType ? `[${data.nestableType}]` : ""),
                nestableType: data.nestableType || null,
            });

            if (!(block instanceof HTMLElement)) {
                console.error("Error: createBlock() did not return a valid DOM element!", block);
                return;
            }

            parentContainer.appendChild(block);

            if (data.nestableType && data.nestedBlocks) {
                const nestedContainer = block.querySelector('.nested-container');
                data.nestedBlocks.forEach((nestedData) => parseBlock(nestedData, nestedContainer));
            }
        };

        try {
            // --- Step 1: Restore extra variables first ---
            const extra = templateData.extraVariables;

            document.getElementById("for-sale-checkbox").checked = extra.forSale;
            document.getElementById("custom-variables-checkbox").checked = extra.customVariablesEnabled;

            // Populate sale info
            document.getElementById("sale-price").value = extra.saleInfo.price;
            document.getElementById("sale-currency").value = extra.saleInfo.currency;
            document.getElementById("sale-notes").value = extra.saleInfo.notes;

            // Populate custom variables (set values for the 5 fixed inputs)
            const customInputs = document.querySelectorAll("#custom-variables-inputs input[type='text']");
            extra.customVariables.forEach((cv, index) => {
                if (customInputs[index]) customInputs[index].value = cv.value;
            });

            // Trigger change events to update global variable list before blocks are created
            document.getElementById("for-sale-checkbox").dispatchEvent(new Event("change"));
            document.getElementById("custom-variables-checkbox").dispatchEvent(new Event("change"));

            // --- Step 2: Now create blocks ---
            dragDropArea.innerHTML = ""; // Clear existing blocks
            templateData.blocks.forEach((blockData) => parseBlock(blockData, dragDropArea));

            // Step 3: Update BBCode after everything
            updateBBCode();

        } catch (error) {
            console.error("Error loading template:", error);
            alert("Invalid template format! Please ensure the template is properly formatted and compressed.");
        }

    } catch (error) {
        console.error("Error before calling createBlock:", error);
    }
}


// URL Based Save Functionality

// Save current template to URL hash
function saveTemplateToURL(dragDropArea) {
    try {
        const compressedTemplate = generateTemplateText(dragDropArea);
        window.location.hash = compressedTemplate;
        alert("Template saved to URL! Bookmark this page to save the template.");
    } catch (error) {
        console.error("Error saving to URL:", error);
        alert("Failed to save template to URL.");
    }
}

// Load template from URL hash (with confirmation)
function loadTemplateFromURL(dragDropArea) {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (!hash) {
        alert("No template found in URL.");
        return;
    }
    
    if (confirm("Load template from URL? This will replace current blocks.")) {
        loadTemplateFromText(dragDropArea, hash);
        // Clear the hash after loading to avoid re-loading on refresh
        window.location.hash = '';
    }
}

// Save template to localStorage with a name



function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(`${sectionId}-arrow`);
    section.classList.toggle('hidden');
    if (arrow) {
        arrow.classList.toggle('rotate-180');
    }
}

document.getElementById("for-sale-checkbox").addEventListener("change", function() {
    const saleInfo = document.getElementById("sale-info");
    if (this.checked) {
      saleInfo.style.display = "block";
    } else {
      saleInfo.style.display = "none";
    }
});

document.getElementById("custom-variables-checkbox").addEventListener("change", function() {
    const customVariablesInputs = document.getElementById("custom-variables-inputs");
    if (this.checked) {
        customVariablesInputs.style.display = "block";
    } else {
        customVariablesInputs.style.display = "none";
    }
});


// Sidebar toggle

const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggle-sidebar');
const toggleButtonSmall = document.getElementById('toggle-sidebar-small');
const closeButtonSmall = document.getElementById('close-sidebar-small');

if (window.innerWidth >= 1025) {
    sidebar.classList.add('sidebar-open');
    sidebar.classList.remove('sidebar-closed');
}

toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('sidebar-closed');
  sidebar.classList.toggle('sidebar-open');
  updateToggleSidebarArrow();
});

toggleButtonSmall.addEventListener('click', () => {
  sidebar.classList.toggle('sidebar-closed');
  sidebar.classList.toggle('sidebar-open');
  updateToggleSidebarArrow();
});

closeButtonSmall.addEventListener('click', () => {
  sidebar.classList.add('sidebar-closed');
  sidebar.classList.remove('sidebar-open');
  updateToggleSidebarArrow();
});

function updateToggleSidebarArrow() {
    if (sidebar.classList.contains('sidebar-open')) {
      toggleButton.classList.add('rotate-180');
    } else {
      toggleButton.classList.remove('rotate-180');
    }
  }

  updateToggleSidebarArrow();


const tutorialData = {
  input: {
    title: "Input Window Tutorial",
    content: "Go to your dragon's profile and select all text from name to offspring. Include at least one offspring name, or the 'none' text for the bred/unbred category to work correctly. Copy the text (Ctrl+C or hold/right click > copy) and paste it directly into the input window. Click the parse button, and the program will automatically fill the table below, so that the data can be used in the BBCode generator",
    gif: "images/input-tutorial.gif"
  },
  "extra-variables": {
    title: "Extra Variables Tutorial",
    content: "Extra variables will only display in the variable dropdown menu (in the BBCode builder) when toggled using the checkboxes. Fill in the fields for sale information or custom variables as needed."
  },
  "bbcode-builder": {
    title: "BBCode Builder Tutorial",
    content: "Drag and drop blocks to build your BBCode. Use the 'Add Block' button to create new blocks and customize them as needed."
  }
};

function openTutorialModal(section) {
  const modal = document.getElementById("tutorial-modal");
  const overlay = document.getElementById("tutorial-modal-overlay");
  const title = document.getElementById("tutorial-title");
  const content = document.getElementById("tutorial-content");
  const gifContainer = document.getElementById("tutorial-gif");

  if (tutorialData[section]) {
    title.textContent = tutorialData[section].title;
    // Convert content into a numbered list
    const sentences = tutorialData[section].content.split('. ').filter(sentence => sentence.trim() !== '');
    const numberedList = sentences.map((sentence, index) => `<li>${sentence.trim()}.</li>`).join('');
    content.innerHTML = `<ol class="list-decimal pl-5">${numberedList}</ol>`;

    
    if (tutorialData[section].gif) {
        gifContainer.innerHTML = `<img src="${tutorialData[section].gif}" alt="${tutorialData[section].title} GIF" style="max-width: 100%; height: auto;">`;
      } else {
        gifContainer.innerHTML = ""; // Clear the GIF container if no GIF is provided
      }
  } else {
    console.error(`Tutorial data for section "${section}" not found.`);
    return;
  }

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}
window.openTutorialModal = openTutorialModal;

function closeTutorialModal() {
  const modal = document.getElementById("tutorial-modal");
  const overlay = document.getElementById("tutorial-modal-overlay");

  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}
window.closeTutorialModal = closeTutorialModal;
