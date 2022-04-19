var kana;
var kana_promise = fetch("./kana.json")
    .then(response => response.json());


// ==== APP EFFECTS ====

var focused = false;
var light;

function onFocus() {
    if (focused)
        return;

    if (selectedKanaCount() < 2) {
        textInput.blur();
        return;
    }

    let elementsToUnblur = document.getElementsByClassName("blur-on-unfocused");
    for (let element of elementsToUnblur)
        element.classList.remove('blurred');
    
    let elementsToHide = document.getElementsByClassName("hide-on-focus");
    for (let element of elementsToHide)
        element.classList.add('hidden');

    if (selectionChanged) {
        nextCharacter();
        textInput.value = "";
        selectionChanged = false;
    }
    
    textInput.focus();

    focused = true;
}

function onUnfocus() {
    let elementsToBlur = document.getElementsByClassName("blur-on-unfocused");
    for (let element of elementsToBlur)
        element.classList.add('blurred');
    
    let elementsToShow = document.getElementsByClassName("hide-on-focus");
    for (let element of elementsToShow)
        element.classList.remove('hidden');

    textInput.blur();
    
    focused = false;
}
function switchLight() {
    light = !light;
    updateLight();
    window.localStorage.setItem('lightmode', light.toString());
}

function updateLight() {
    let elements = document.getElementsByClassName("lightswitching");
    let classes = ["dark", "light"];
    for (let el of elements) {
        el.classList.add(classes[light | 0]);
        el.classList.remove(classes[!light | 0]);
    }
}



// ==== KANA =====

class KanaCharacter {
    constructor(roumaji, info) {
        this.selected = false;
        this.cell = null;
        this.info = info;
        this.roumaji = roumaji;
    }

    setSelection(selected) {
        if (this.selected == selected)
            return;

        this.selected = selected;
        if (selected)
            this.cell.classList.add('selected-character');
        else
            this.cell.classList.remove('selected-character');

        window.localStorage.setItem(this.getSelStorageKey(), selected);
    }

    getSelStorageKey() {
        return "sel_" + this.roumaji;
    }

    toggleSelection() {
        this.setSelection(!this.selected);
    }

    updateCellCharacter() {
        this.cell.innerHTML = getCharacterFromRoumaji(this.roumaji);
    }
}


// ==== KANA TABLE =====

var selectionChanged;

const KANA_COLS = "aiueo";
const KANA_ROWS = " kstnhmyrw";
const KANA_EXCEPTIONS = {
    'si': 'shi',
    'ti': 'chi',
    'tu': 'tsu',
    'hu': 'fu',
    'wu': 'n'
};

function resolveCharacterFromKanaTable(row, col) {
    let character = (KANA_ROWS[row] + KANA_COLS[col]).trim();

    if (character in KANA_EXCEPTIONS)
        character = KANA_EXCEPTIONS[character];

    return character;
}

function createKanaTableHeaderElement(content, onclick) {
    let h = document.createElement('th');
    h.innerHTML = content;
    h.onclick = onclick;
    h.classList.add('hoverbutton');
    return h;
}

function createKanaPanel() {
    let table = document.getElementById("kana-table");

    let header_row_elem = document.createElement('tr');
    header_row_elem.appendChild(createKanaTableHeaderElement('#', onKanaTableHeaderClick));
    for (let col = 0; col < KANA_COLS.length; ++col)
        header_row_elem.appendChild(createKanaTableHeaderElement('v', (evt) => onKanaTableColumnHeaderClick(col, evt)));
    
    table.appendChild(header_row_elem);

    for (let row = 0; row < KANA_ROWS.length; ++row) {
        let row_elem = document.createElement('tr');

        row_elem.appendChild(createKanaTableHeaderElement('>', (evt) => onKanaTableRowHeaderClick(row, evt)))

        for (let col = 0; col < KANA_COLS.length; ++col) {
            let cell = document.createElement('td');
            cell.classList.add('kana-table-character');
            cell.classList.add('hide-text-selection');
            
            let k = kana[resolveCharacterFromKanaTable(row, col)];
            if (k != undefined) {
                k.cell = cell;
                k.updateCellCharacter();

                cell.onclick = (evt) => onKanaTableCharacterClick(k, evt);
            }
            
            row_elem.appendChild(cell);
        }

        table.appendChild(row_elem);
    }
}

function onKanaTableCharacterClick(k, event) {
    k.toggleSelection();
    selectionChanged = true;
}


function onKanaTableRowHeaderClick(row, event) {
    let on;
    for (let col = 0; col < KANA_COLS.length; ++col) {
        let k = kana[resolveCharacterFromKanaTable(row, col)];

        if (on == undefined)
            on = !k.selected;

        if (k != undefined)
            k.setSelection(on);
    }
    selectionChanged = true;
}
function onKanaTableColumnHeaderClick(col, event) {
    let on;
    for (let row = 0; row < KANA_ROWS.length; ++row) {
        let k = kana[resolveCharacterFromKanaTable(row, col)];
        if (on == undefined)
            on = !k.selected;

        if (k != undefined)
            k.setSelection(on);
    }
    selectionChanged = true;
}

function onKanaTableHeaderClick(event) {
    let on;
    for (let k in kana) {
        if (on == undefined)
            on = !k.selected;
        kana[k].toggleSelection();
    }
    selectionChanged = true;
}

function selectedKanaCount() {
    return Object.values(kana).reduce((acc, val, i) => acc + val.selected, 0);
}

// ==== KANA SWITCHING ====

var isHiragana;
function switchKana() {
    isHiragana = !isHiragana;
    updateDisplayedCharacter();
    for (let k in kana)
        kana[k].updateCellCharacter();
}
function getCharacterFromRoumaji(roumaji) {
    let k = kana[roumaji];

    return k == undefined ? undefined : (isHiragana ? k.info.hiragana : k.info.katakana);
}


// ==== MAIN LOGIC ====

var characterToGuess;
function nextCharacter() {
    let from = Object.entries(kana)
                    .filter(kvp => kvp[1].selected && kvp[0] != characterToGuess)
                    .map(kvp => kvp[0]);

    characterToGuess = from[Math.floor(Math.random() * from.length)];

    updateDisplayedCharacter();
}

function onKeyPress(event) {
    console.log(event);
    if (textInput.value == characterToGuess) {
        nextCharacter();
        textInput.value = "";
    }
}

function updateDisplayedCharacter() {
    textDisplay.innerHTML = getCharacterFromRoumaji(characterToGuess);
}


var serif;
function updateSerif() {
    let el = document.getElementsByTagName("html")[0];
    let classes = ['sans-serif', 'serif'];
    
    el.classList.add(classes[serif | 0]);
    el.classList.remove(classes[!serif | 0]);
}
function switchSerif() {
    serif = !serif;
    updateSerif();
    window.localStorage.setItem('serif', serif.toString());
}


var textInput;
var textDisplay;

window.onload = function () {
    light = window.localStorage.getItem('lightmode') == "true";
    serif = window.localStorage.getItem('serif') == "true";

    textInput = document.getElementById("text-input");
    textDisplay = document.getElementById("text-display");

    updateLight();
    updateSerif();
    
    onUnfocus();
    textInput.value = "";

    kana_promise.then(data => {
        kana = {};
        for (let ch in data)
            kana[ch] = new KanaCharacter(ch, data[ch]);

        createKanaPanel();

        for (let k in kana) {
            let stored = window.localStorage.getItem(kana[k].getSelStorageKey());
            let sel = stored == "true" || stored == undefined;

            kana[k].setSelection(sel);
        }

        nextCharacter();
    });
};