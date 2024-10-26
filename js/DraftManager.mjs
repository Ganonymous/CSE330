import ExternalServices from "./externalServices.mjs";
import { weightedRandomChoice } from "./utils.mjs";


const external = new ExternalServices;

export default class DraftManager {
    constructor(setCode, packName, bots){
        this.botCount = bots;
        this.packName = packName;
        this.setCode = setCode;
    }

    async init(){
        const external = new ExternalServices;
        console.log(`Starting ${this.packName} draft with ${this.botCount} bots`);
        this.set = await external.getSetData(this.setCode);
        console.log(this.set);
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
        //create user drafter
        //create bot drafters
        //shuffle drafter positions
        this.runDraft();
        this.endDraft();
    }


    runDraft(){
        for(let round = 1; round <= 3; round++){
            this.buildBoosters();
            console.log(`Round ${round} boosters:`);
            console.log(this.boostersList);
        }
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

    }

}