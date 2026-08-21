import { Phase, onEnterPhase, setPhase } from "./state.js";
import * as setup from "./screens/setup.js";
import * as editor from "./screens/editor.js";
import * as reveal from "./screens/reveal.js";
import * as discuss from "./screens/discuss.js";
import * as results from "./screens/results.js";

setup.init();
editor.init();
reveal.init();
discuss.init();
results.init();

onEnterPhase(Phase.SETUP, setup.onEnter);
onEnterPhase(Phase.EDITOR, editor.onEnter);
onEnterPhase(Phase.REVEAL, reveal.onEnter);
onEnterPhase(Phase.DISCUSS, discuss.onEnter);
onEnterPhase(Phase.RESULTS, results.onEnter);

setPhase(Phase.SETUP);
