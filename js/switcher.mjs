import Lobby from "./Lobby.mjs";
import DraftManager from "./DraftManager.mjs";
import ExternalServices from "./externalServices.mjs";


const external = new ExternalServices;

export default class Switcher {
    constructor(lobby){
        this.lobby = lobby;
    }
    init() {
        this.lobby.switcher = this.
        this.lobby.connectStartButton();
    }
    async switchToDraft(){
        const packSelect = document.querySelector("#selector");
        const packName = packSelect.options[packSelect.selectedIndex].text;
        const botCount = document.querySelector("#botCount").value;
        const draft = new DraftManager(packSelect.value, packName, botCount);
        await draft.init();
        draft.switcher = this;
        draft.startDraft();
    }
    async switchToLobby(){
        const sets = await external.getSets();
        this.lobby.buildLobby(sets);
        this.lobby.connectStartButton();
    }
}