import ExternalServices from "./externalServices.mjs";
import Lobby from "./Lobby.mjs";
import Switcher from "./switcher.mjs";

const external = new ExternalServices();
const lobby = new Lobby();
const switcher = new Switcher(lobby);

const sets = await external.getSets();

lobby.buildLobby(sets);
switcher.init();