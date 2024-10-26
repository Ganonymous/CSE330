


export default class Lobby {
    buildLobby(sets){
        const header = document.querySelector("header");
        const main = document.querySelector("main");
        header.innerHTML = "";
        main.innerHTML = "";

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
        main.appendChild(selectorLabel);

        const botsLabel = document.createElement("label");
        botsLabel.textContent = "Bots in draft:";
        const botsInput = document.createElement("input");
        botsInput.setAttribute("type", "number");
        botsInput.setAttribute("max", "15");
        botsInput.setAttribute("min", "1");
        botsInput.setAttribute("step", "1");
        botsInput.id = "botCount";
        botsLabel.appendChild(botsInput);
        main.appendChild(botsLabel);

        const startButton = document.createElement("button");
        startButton.id = "startBtn";
        startButton.textContent = "Start Draft";
        main.appendChild(startButton);

        //TODO: Check for pool from past draft(s), if so, show any found.
    }

    fillSetSelector(selector, sets){
        const goodBoosters = ["draft", "collector", "set", "play"]

        sets.forEach(set => {
            const boosterTypes = [];
            set.sealedProduct.forEach(product => {
                if(product.category == "booster_pack" && goodBoosters.includes(product.subtype) && product.cardCount){
                    if(!boosterTypes.includes(product.subtype)) boosterTypes.push(product.subtype);
                }
            })
            boosterTypes.forEach(type => {
                const nameString = `${set.name} ${String(type).charAt(0).toUpperCase()}${String(type).slice(1)} Booster`;
                const option = document.createElement("option")
                option.value = set.code;
                option.text = nameString;
                selector.add(option);
            })
            
        });
    }

    validateDraftSettings(){
        const selector = document.querySelector("#selector");
        const botsInput = document.querySelector("#botCount");
        if(selector.value != ""){
            if(botsInput.value && botsInput.value > 0 && botsInput.value < 16){
                return true;
            }
        }
        return false;
    }
}