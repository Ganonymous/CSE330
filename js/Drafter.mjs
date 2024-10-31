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
        const cardBackTemplate = document.createElement("img");
        cardBackTemplate.src = "./images/cardBack.jpeg";
        cardBackTemplate.alt = "Back of a Magic: The Gathering card";
        cardBackTemplate.height = "310";
        cardBackTemplate.width = "223";
        cardBackTemplate.classList.add("face-down");
        for (let i = 0; i < this.currentPack.length; i++) {
            const card = this.currentPack[i];
            const displayDiv = document.createElement("div");
            displayDiv.classList.add("card");
            displayDiv.appendChild(cardBackTemplate.cloneNode(true));
            if(card.identifiers.multiverseId){
                const cardImg = document.createElement("img");
                cardImg.src = `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.identifiers.multiverseId}&type=card`;
                cardImg.alt = `${card.name}, image from gatherer.wizards.com`;
                cardImg.height = "310";
                cardImg.width = "223";
                cardImg.classList.add("face-up");
                cardImg.classList.add(card.rarity);
                displayDiv.appendChild(cardImg);
            } else {
                const imitatorCard = document.createElement("div");
                imitatorCard.classList.add("card");
                imitatorCard.classList.add("face-up");
                const nameH3 = document.createElement("h3");
                nameH3.textContent = card.name;
                const costP = document.createElement("p");
                costP.textContent = card.manaCost;
                const typesH4 = document.createElement("h4");
                typesH4.textContent = card.type;
                const cardText = document.createElement("p");
                cardText.textContent = card.text;
                imitatorCard.appendChild(nameH3);
                imitatorCard.appendChild(costP);
                imitatorCard.appendChild(typesH4);
                imitatorCard.appendChild(cardText);
                imitatorCard.classList.add(card.rarity);
                displayDiv.appendChild(imitatorCard)
            }
            displayDiv.addEventListener("click", e => this.pickCard(card));
            setTimeout(() => {
                cardsSect.appendChild(displayDiv);
            }, i * 250);
        }
        main.appendChild(document.createElement("hr"));
        const poolLabel = document.createElement("h2");
        poolLabel.textContent = "Current Pool";
        main.appendChild(poolLabel);
        const poolSect = buildPool(this.pool);
        main.appendChild(poolSect);
    }

    pickCard(card){
        window.scroll(0, 0);
        this.pool.push(card);
        const cardIndex = this.currentPack.indexOf(card);
        const cardsSect = document.querySelector(".cards");
        const cardsArray = cardsSect.childNodes;
        this.currentPack.splice(cardIndex, 1);
        for (let i = 0; i < cardsArray.length; i++) {
            const displayDiv = cardsArray[i];
            setTimeout(() => {
                displayDiv.childNodes.forEach(card => {
                    card.classList.toggle("face-down");
                    card.classList.toggle("face-up");

                });
            }, i * 100);
        }
        setTimeout(() => {
            this.manager.advanceDraft()
        }, (cardsArray.length * 100) + 800);
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