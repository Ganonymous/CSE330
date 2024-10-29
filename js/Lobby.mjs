import { buildPool, getLocalStorage, deletePool } from "./utils.mjs";


export default class Lobby {
    buildLobby(sets){
        this.sets = sets;
        const header = document.querySelector("header");
        const main = document.querySelector("main");
        header.innerHTML = "";
        main.innerHTML = "";
        const lobbySect = document.createElement("section");
        lobbySect.classList.add("lobby");
        main.appendChild(lobbySect);

        const lobbyHead = document.createElement("h2");
        lobbyHead.textContent = "Draft Settings";
        lobbySect.appendChild(lobbyHead);

        const selectorLabel = document.createElement("label");
        selectorLabel.textContent = "Packs to draft: ";
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
        lobbySect.appendChild(selectorLabel);

        const botsLabel = document.createElement("label");
        botsLabel.textContent = "Bots in draft:";
        const botsInput = document.createElement("input");
        botsInput.setAttribute("type", "number");
        botsInput.setAttribute("max", "15");
        botsInput.setAttribute("min", "1");
        botsInput.setAttribute("step", "1");
        botsInput.id = "botCount";
        botsLabel.appendChild(botsInput);
        lobbySect.appendChild(botsLabel);

        const startButton = document.createElement("button");
        startButton.id = "startBtn";
        startButton.textContent = "Start Draft";
        lobbySect.appendChild(startButton);

        const pastPools = getLocalStorage("almtgds-pools");
        if(pastPools){
            main.appendChild(document.createElement("hr"));

            const poolsHead = document.createElement("h2");
            poolsHead.id = "poolsHead"
            poolsHead.textContent = "Prior Draft Pools";
            main.appendChild(poolsHead);

            pastPools.forEach(pastPool => this.buildPastPool(pastPool));
        }
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

    buildPastPool(pastPool){
        const poolArticle = document.createElement("article");

        const poolHead = document.createElement("h3");
        poolHead.textContent = `${pastPool.pack} draft with ${pastPool.bots} bots`;
        poolArticle.appendChild(poolHead);

        const poolSect = buildPool(pastPool.pool);
        poolArticle.appendChild(poolSect);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delBtn");
        deleteButton.textContent = "Delete Pool";
        deleteButton.addEventListener("click", e => {deletePool(pastPool); this.buildLobby(this.sets)});
        poolArticle.appendChild(deleteButton);

        const main = document.querySelector("main");
        main.appendChild(poolArticle);
    }
}