import { Phase, onEnterPhase, setPhase } from "./state.js";
import * as setup from "./screens/setup.js";
import * as reveal from "./screens/reveal.js";
import * as results from "./screens/results.js";

setup.init();
reveal.init();
results.init();

onEnterPhase(Phase.SETUP, setup.onEnter);
onEnterPhase(Phase.REVEAL, reveal.onEnter);
onEnterPhase(Phase.RESULTS, results.onEnter);

setPhase(Phase.SETUP);
