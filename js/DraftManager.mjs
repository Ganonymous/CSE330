import ExternalServices from "./externalServices.mjs";
import { weightedRandomChoice, shuffleArray, buildPool } from "./utils.mjs";
import Drafter from "./Drafter.mjs";

const external = new ExternalServices;

export default class DraftManager {
    constructor(setCode, packName, bots){
        this.botCount = bots;
        this.packName = packName;
        this.setCode = setCode;
    }

    async init(){
        const external = new ExternalServices;
        this.set = await external.getSetData(this.setCode);
        this.findBooster(this.packName);
        this.secondaryCards = await external.getSecondaryCards(this.setCode);
    }

    findBooster(packName){
        const boosters = Object.entries(this.set.booster);
        let fallback = null;
        for(const [key, pack] of boosters){
            const name = pack.name;
            if(name == packName){
                this.booster = pack;
                return;
            }
            if(name.includes("Draft")){
                fallback = pack;
            }
        }
        if(fallback){
            this.booster = fallback;
            return;
        }
        throw new Error(`The selected pack "${formatted}" can not be found, and the set did not contain a labelled draft booster`);
    }

    startDraft(){
        this.drafters = [new Drafter("user")];
        this.drafters[0].manager = this;
        for(let i = 0; i < this.botCount; i++){
            this.drafters.push(new Drafter("bot"));
        }
        shuffleArray(this.drafters);
        const testBooster = this.fillPack(this.pickPack());
        this.totalRounds = Math.ceil(40 / testBooster.length);
        this.currentRound = 1;
        this.startRound();
            
        
    }

    startRound(){
        if(this.currentRound <= this.totalRounds){
            this.buildBoosters();
            this.drafters.forEach(drafter => {
                drafter.currentPack = this.boostersList.pop()
            });
            this.currentPick = 0;
            this.advanceDraft();
        } else {
            this.endDraft();
        }
    }


    advanceDraft(){
        if(this.drafters[0].currentPack.length > 0){
            if(this.currentRound % 2 == 1){
                const asideBooster = this.drafters[0].currentPack;
                for(let i = 0; i < this.drafters.length - 1; i++){
                    this.drafters[i].currentPack = this.drafters[i + 1].currentPack;
                }
                this.drafters[this.drafters.length - 1].currentPack = asideBooster;
            } else{
                const asideBooster = this.drafters[this.drafters.length - 1].currentPack;
                for(let i = this.drafters.length - 1; i > 0; i--){
                    this.drafters[i].currentPack = this.drafters[i - 1].currentPack;
                }
                this.drafters[0].currentPack = asideBooster;
            }
            this.currentPick++;
            this.drawDraftHeader();
            this.drafters.forEach(drafter => drafter.processPack());
            return;
        } else {
            this.currentRound++;
            this.startRound();
        }
    }

    drawDraftHeader(){
        const header = document.querySelector("header");
        header.innerHTML = "";
        const passDirection = (this.currentRound % 2 == 1)? "right" : "left";
        const arrowSrc = `./images/arrow_${passDirection}_icon.png`;
        const arrowAlt = `Arrow pointing ${passDirection}, by Interactivemania on iconfinder.com`;
        let displayDrafters = [];
        if(this.drafters.length < 5){
            displayDrafters = this.drafters;
        } else {
            const userIndex = this.drafters.findIndex(drafter => drafter.type == "user");
            for(let i = -2; i <= 2; i++){
                const nextDrafter = this.drafters[(userIndex + i + this.drafters.length) % this.drafters.length];
                displayDrafters.push(nextDrafter);
            }
        }
        const draftersDiv = document.createElement("div");
        draftersDiv.classList.add("drafters");
        header.appendChild(draftersDiv);
        const templateArrow = document.createElement("img");
        templateArrow.src = arrowSrc;
        templateArrow.alt = arrowAlt;
        templateArrow.height = "25";
        templateArrow.width = "25";
        draftersDiv.appendChild(templateArrow.cloneNode(true));
        displayDrafters.forEach(drafter => {
            const botMode = drafter.type == "bot";
            const drafterDiv = document.createElement("div");
            drafterDiv.classList.add("drafter");
            const profileImg = document.createElement("img");
            profileImg.src = `./images/user_circle_${botMode? "gear_" : ""}fill_icon.png`;
            profileImg.alt = `User icon of a person in a circle ${botMode? "with a gear " : ""} by Phosphor Icons on iconfinder.com`;
            profileImg.height = "50";
            profileImg.width = "50";
            drafterDiv.appendChild(profileImg);
            const nameplate = document.createElement("p");
            nameplate.classList.add("nameplate");
            nameplate.textContent = botMode ? `Bot ${drafter.name}` : "You";
            drafterDiv.appendChild(nameplate);
            draftersDiv.append(drafterDiv);
            draftersDiv.append(templateArrow.cloneNode(true));
        })
        const statusDiv = document.createElement("div");
        statusDiv.id = "draftStatus";
        const packH = document.createElement("h4");
        packH.textContent = `Pack: ${this.currentRound}`;
        const pickP = document.createElement("p");
        pickP.textContent = `Pick: ${this.currentPick}`;
        statusDiv.appendChild(packH);
        statusDiv.appendChild(pickP);
        header.appendChild(statusDiv);
    }

    findCard(cardID){
       const foundCard = this.set.cards.find(card => card.uuid == cardID);
       if(foundCard){ 
            return structuredClone(foundCard);
        }
        const outsideCard = this.secondaryCards.find(card => card.uuid == cardID);
        if(outsideCard){
            return structuredClone(outsideCard);
        }
        throw new Error("Card could not be found in main or secondary sheets")
    }

    buildBoosters(){
        this.boostersList = [];
        for (let i = 0; i <= this.botCount; i++) { // using <= so the user's boosters are also created
            this.boostersList.push(this.fillPack(this.pickPack()));
        }
    }

    pickPack(){
        const weightedOptions = [];
        const patterns = this.booster.boosters;
        for (let index = 0; index < patterns.length; index++) {
            weightedOptions.push([index, patterns[index].weight]);
        }
        const targetIndex = weightedRandomChoice(weightedOptions, this.booster.boostersTotalWeight);
        return patterns[targetIndex].contents;
    }

    fillPack(pattern){
        const patternArray = Object.entries(pattern);
        let pack = [];
        for(let [sheet, count] of patternArray){
            pack = pack.concat(this.getCardsFromSheet(sheet, count));
        }
        return pack;
    }

    getCardsFromSheet(sheetName, count){
        const sheet = this.booster.sheets[sheetName];
        const cards = []
        let cardsAdded = 0;
        const cardNames = [];
        while(cardsAdded < count){
            const targetUUID = weightedRandomChoice(Object.entries(sheet.cards), sheet.totalWeight);
            const foundCard = this.findCard(targetUUID);
            if(sheet.foil){
                foundCard.isFoil = true;
            } else{
                foundCard.isFoil = false;
            }
            if(sheet.allowDuplicates){
                cards.push(foundCard);
                cardsAdded++;
            } else if(!cardNames.includes(foundCard.name)){
                cardNames.push(foundCard.name);
                cards.push(foundCard);
                cardsAdded++;
            }
        }
        if(sheet.balanceColors){
            this.enforceColorBalance(sheet, cards, cardNames);
        }
        return cards;
    }

    enforceColorBalance(sheet, cards, cardNames){
        const colorsFound = [];
        const lockedIndices = [];
        for (let index = 0; index < cards.length; index++) {
            for(let color of cards[index].colors){
                if(!colorsFound.includes(color)){
                    colorsFound.push(color);
                    lockedIndices.push(index);
                }
            }
        }
        while(colorsFound.length < 5){
            for (let index = 0; index < cards.length; index++) {
                if(colorsFound.length < 5 && !lockedIndices.includes(index)){
                    const targetUUID = weightedRandomChoice(Object.entries(sheet.cards), sheet.totalWeight);
                    const foundCard = this.findCard(targetUUID);
                    let swap = false
                    if(!cardNames.includes(foundCard.name)){
                        for(let color of foundCard.colors){
                            if(!colorsFound.includes(color)){
                                colorsFound.push(color);
                                lockedIndices.push(index);
                                swap = true;
                            }
                        }
                        if(swap){
                            if(sheet.foil){
                                foundCard.isFoil = true;
                            } else{
                                foundCard.isFoil = false;
                            }
                            cards[index] = foundCard;
                        }
                    }
                }
            }
        }
    }

    endDraft(){
        const statusDiv = document.querySelector("#draftStatus");
        statusDiv.innerHTML = "<h3>Your Pool</h3>";

        const main = document.querySelector("main");
        main.innerHTML = "";

        const userDrafter = this.drafters.find(drafter => drafter.type == "user");
        userDrafter.savePool(this.packName, this.botCount);
        main.appendChild(buildPool(userDrafter.pool));

        const buttonsDiv = document.createElement("div");
        buttonsDiv.id = "draftEndButtons";
        main.appendChild(buttonsDiv);

        const restartButton = document.createElement("button");
        restartButton.id = "restartBtn";
        restartButton.textContent = "Restart Draft";
        restartButton.addEventListener("click", e => this.startDraft());
        buttonsDiv.appendChild(restartButton);

        const endButton = document.createElement("button");
        endButton.id = "endBtn";
        endButton.textContent = "End Draft and return to lobby";
        endButton.addEventListener("click", e => this.switcher.switchToLobby());
        buttonsDiv.appendChild(endButton);
    }
}