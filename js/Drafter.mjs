import {buildPool, getLocalStorage, setLocalStorage, generateUUID} from "./utils.mjs"

export default class Drafter{
    constructor(type){
        this.type = type
        switch(type){
            case "user":
                this.processPack = function (){
                    this.drawPack();
                }
                this.pool = [];
                break;
            case "bot":
            default:
                this.determineBotType();
                break;
        }
    }

    drawPack(){
        const main = document.querySelector("main");
        main.innerHTML = "";
        const cardsSect = document.createElement("section");
        cardsSect.classList.add("cards");
        main.appendChild(cardsSect);
        this.currentPack.forEach(card => {
            const displayDiv = document.createElement("div");
            displayDiv.classList.add("card");
            displayDiv.classList.add(card.rarity);
            if(card.identifiers.multiverseId){
                const cardImg = document.createElement("img");
                cardImg.src = `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.identifiers.multiverseId}&type=card`;
                cardImg.alt = `${card.name}, image from gatherer.wizards.com`;
                cardImg.height = "310";
                cardImg.width = "223";
                displayDiv.appendChild(cardImg);
            } else {
                const nameH3 = document.createElement("h3");
                nameH3.textContent = card.name;
                const costP = document.createElement("p");
                costP.textContent = card.manaCost;
                const typesH4 = document.createElement("h4");
                typesH4.textContent = card.type;
                const cardText = document.createElement("p");
                cardText.textContent = card.text;
                displayDiv.appendChild(nameH3);
                displayDiv.appendChild(costP);
                displayDiv.appendChild(typesH4);
                displayDiv.appendChild(cardText);
            }
            displayDiv.addEventListener("click", e => this.pickCard(card));
            cardsSect.appendChild(displayDiv);
        })
        main.appendChild(document.createElement("hr"));
        const poolLabel = document.createElement("h2");
        poolLabel.textContent = "Current Pool";
        main.appendChild(poolLabel);
        const poolSect = buildPool(this.pool);
        main.appendChild(poolSect);
    }

    pickCard(card){
        this.pool.push(card);
        const cardIndex = this.currentPack.indexOf(card);
        this.currentPack.splice(cardIndex, 1);
        this.manager.advanceDraft();
    }

    determineBotType(){
        const botTypesArray = ["Randy"];
        const botTypeIndex = Math.floor(Math.random() * botTypesArray.length);
        this.botType = botTypesArray[botTypeIndex];
        let namesArray = [];
        switch(botTypeIndex){
            case 0:
                namesArray = ["Randy", "Randall", "Rana", "Randi", "Ranak", "Ranielle", "Rankin", "Randee", "Ranulph", "Ranae"]
                this.processPack = function () {
                    const targetIndex = Math.floor(Math.random() * this.currentPack.length);
                    this.currentPack.splice(targetIndex, 1);
                }
                break
            default:
                throw new Error("Invalid bot type");
        }
        const nameIndex = Math.floor(Math.random() * namesArray.length);
        this.name = namesArray[nameIndex];
    }

    savePool(packName, bots){
        let pools = getLocalStorage("almtgds-pools") || [];
        let savePool = {};
        savePool.pack = packName;
        savePool.bots = bots;
        savePool.pool = this.pool;
        savePool.uuid = generateUUID();
        pools.push(savePool);
        setLocalStorage("almtgds-pools", pools);
    }
    
}