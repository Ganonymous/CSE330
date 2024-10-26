export default class Drafter{
    constructor(type){
        this.type = type
        switch(type){
            case "user":
                this.processPack = function (){
                    this.drawPack();
                }
                break;
            case "bot":
            default:
                this.determineBotType();
                break;
        }
    }

    drawPack(){
        console.log(`Current pack: ${this.currentPack}. User picking not implemented. You are Randy.`)
        const targetIndex = Math.floor(Math.random() * this.currentPack.length);
        this.currentPack.splice(targetIndex, 1);

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
}