// autocomplete.js

// ----- Helper Functions ----- //

/**
 * Checks whether an element is editable.
 * @param {HTMLElement} el - The target element.
 * @returns {boolean} True if the element is an input, textarea, or contenteditable.
 */
function isEditable(el) {
    return (
        (el.tagName === "INPUT" && el.type === "text") ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
    );
}

/**
 * Extracts the current word from an input or textarea.
 * For contenteditable elements, it returns the current selection text.
 * @param {HTMLElement} el - The target element.
 * @returns {string} The current word.
 */
function getCurrentWord(el) {
    if (el.selectionStart !== undefined) {
        const val = el.value;
        const pos = el.selectionStart;
        const words = val.slice(0, pos).split(/\s+/);
        return words[words.length - 1];
    }
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
}

/**
 * Returns an array of suggestions based on the query.
 * This is a simple static dictionary for demonstration.
 * @param {string} query - The current word being typed.
 * @returns {Array<string>} An array of suggestions.
 */
function getSuggestions(query) {
    const suggestionsDictionary = {
        "hel": ["hello", "help", "helmet"],
        "wor": ["world", "worry", "worship"],
        // Add more mappings as needed
    };

    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return suggestionsDictionary[lowerQuery] || [];
}

/**
 * Applies the selected suggestion to the target field.
 * @param {HTMLElement} target - The input, textarea, or contenteditable element.
 * @param {string} suggestion - The suggestion to insert.
 */
function applySuggestion(target, suggestion) {
    if (target.selectionStart !== undefined) {
        const pos = target.selectionStart;
        const textBefore = target.value.slice(0, pos);
        const textAfter = target.value.slice(pos);
        const parts = textBefore.split(/\s+/);
        parts[parts.length - 1] = suggestion;
        target.value = parts.join(" ") + textAfter;
        target.selectionStart = target.selectionEnd = parts.join(" ").length;
    } else if (target.isContentEditable) {
        document.execCommand("insertText", false, suggestion);
    }
    suggestionBox.style.display = "none";
}

/**
 * Updates and positions the suggestion box with new suggestions.
 * @param {HTMLElement} target - The input field.
 * @param {Array<string>} suggestions - List of suggestions to display.
 */
function updateSuggestionBox(target, suggestions) {
    if (!suggestions || suggestions.length === 0) {
        suggestionBox.style.display = "none";
        return;
    }
    
    // Clear the suggestion box content
    suggestionBox.innerHTML = "";
    
    suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement("div");
        suggestionItem.style.padding = "2px 4px";
        suggestionItem.style.cursor = "pointer";
        suggestionItem.textContent = suggestion;
        suggestionItem.addEventListener("mousedown", (e) => {
            // Prevent the input from losing focus
            e.preventDefault();
            applySuggestion(target, suggestion);
        });
        suggestionBox.appendChild(suggestionItem);
    });
    
    // Position the suggestion box relative to the target element
    const rect = target.getBoundingClientRect();
    suggestionBox.style.top = (rect.bottom + window.scrollY) + "px";
    suggestionBox.style.left = (rect.left + window.scrollX) + "px";
    suggestionBox.style.display = "block";
}

// ----- Suggestion Box Setup ----- //

// Create a floating suggestion box element
let suggestionBox = document.createElement("div");
suggestionBox.style.position = "absolute";
suggestionBox.style.border = "1px solid #ccc";
suggestionBox.style.backgroundColor = "#fff";
suggestionBox.style.zIndex = "9999";
suggestionBox.style.padding = "5px";
suggestionBox.style.display = "none";
document.body.appendChild(suggestionBox);

// ----- Event Listeners ----- //

/**
 * Listens for input events on the document and updates the suggestion box if needed.
 */
document.addEventListener("input", (event) => {
    const target = event.target;
    if (isEditable(target)) {
        const query = getCurrentWord(target);
        const suggestions = getSuggestions(query);
        updateSuggestionBox(target, suggestions);
    }
});

/**
 * Optionally, listen for keydown events to trigger suggestions on every keystroke.
 */
document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (isEditable(target)) {
        const query = getCurrentWord(target);
        const suggestions = getSuggestions(query);
        updateSuggestionBox(target, suggestions);
    }
});
