import Lobby from "./Lobby.mjs";
import DraftManager from "./DraftManager.mjs";
import ExternalServices from "./externalServices.mjs";


const external = new ExternalServices;

export default class Switcher {
    constructor(lobby){
        this.lobby = lobby;
    }
    init() {
        const startButton = document.querySelector("#startBtn")
        startButton.addEventListener("click", () => {
            if(this.lobby.validateDraftSettings()){
                this.switchtoDraft();
            }
        })

    }
    async switchtoDraft(){
        const packSelect = document.querySelector("#selector");
        const packName = packSelect.options[packSelect.selectedIndex].text;
        const botCount = document.querySelector("#botCount").value;
        const draft = new DraftManager(packSelect.value, packName, botCount);
        await draft.init();
        draft.startDraft();
    }
    async switchtoLobby(){
        const sets = await external.getSets();
        this.lobby.buildLobby(sets);
        const startButton = document.querySelector("#startBtn")
        startButton.addEventListener("click", () => {
            if(this.lobby.validateDraftSettings()){
                this.switchtoDraft();
            }
        })
    }
}