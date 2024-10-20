import { startDraft } from "./utils.mjs";

function validateDraftSettings(){
    const selector = document.querySelector("#selector");
    const botsInput = document.querySelector("#botCount");
    if(selector.value != ""){
        if(botsInput.value && botsInput.value > 0 && botsInput.value < 16){
            startDraft(selector.value, botsInput.value);
        }
    }
}

export default class Lobby {
    buildLobby(sets){
        const header = document.querySelector("header");
        const body = document.querySelector("body");
        header.innerHTML = "";
        body.innerHTML = "";

        const selectorLabel = document.createElement("label");
        selectorLabel.textContent = "Packs to draft:";
        const setSelector = document.createElement("select");
        setSelector.id = "selector";
        selectorLabel.appendChild(setSelector);
        const selectorDefault = document.createElement("option")
        selectorDefault.selected = true;
        selectorDefault.disabled = true;
        selectorDefault.value = "";
        selectorDefault.text = "Select a pack"
        setSelector.add(selectorDefault);
        this.fillSetSelector(setSelector, sets);
        body.appendChild(selectorLabel);

        const botsLabel = document.createElement("label");
        botsLabel.textContent = "Bots in draft:";
        const botsInput = document.createElement("input");
        botsInput.setAttribute("type", "number");
        botsInput.setAttribute("max", "15");
        botsInput.setAttribute("min", "1");
        botsInput.setAttribute("step", "1");
        botsInput.id = "botCount";
        botsLabel.appendChild(botsInput);
        body.appendChild(botsLabel);

        const startButton = document.createElement("button");
        startButton.textContent = "Start Draft";
        body.appendChild(startButton);
        startButton.addEventListener("click", validateDraftSettings)

        //TODO: Check for pool from past draft(s), if so, show any found.
    }

    fillSetSelector(selector, sets){
        const goodBoosters = ["draft", "collector", "set", "play"]

        sets.forEach(set => {
            set.sealedProduct.forEach(product => {
                if(product.category == "booster_pack" && goodBoosters.includes(product.subtype) && product.cardCount){
                    const option = document.createElement("option")
                    option.value = product.name;
                    option.text = product.name;
                    selector.add(option);
                }
            })
        });
    }
}