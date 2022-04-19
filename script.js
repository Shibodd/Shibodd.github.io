
fetch("./kana-list.json")
.then(response => {
   return response.json();
})
.then(data => console.log(data));

var focused = false;
var light;

function onFocus() {
    if (focused)
        return;

    let elementsToUnblur = document.getElementsByClassName("blur-on-unfocused");
    for (let element of elementsToUnblur)
        element.classList.remove('blurred');
    
    let elementsToHide = document.getElementsByClassName("hide-on-focus");
    for (let element of elementsToHide)
        element.classList.add('hidden');

    document.getElementById("text-input").focus();

    focused = true;
}

function onUnfocus() {
    let elementsToBlur = document.getElementsByClassName("blur-on-unfocused");
    for (let element of elementsToBlur)
        element.classList.add('blurred');
    
    let elementsToShow = document.getElementsByClassName("hide-on-focus");
    for (let element of elementsToShow)
        element.classList.remove('hidden');

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

function onKeyDown(event) {
    if (event.keyCode == 13) { // enter
        console.log("confirm");
    }
}


window.onload = function () {
    light = window.localStorage.getItem('lightmode') == "true";
    updateLight();
    
    onUnfocus();
    document.getElementById("text-input").value = "";
};
