import ExternalServices from "./externalServices.mjs";
import Lobby from "./Lobby.mjs";

const external = new ExternalServices();
const lobby = new Lobby();

const sets = await external.getSets();
console.log(sets);

lobby.buildLobby(sets);