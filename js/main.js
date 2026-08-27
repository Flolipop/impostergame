import { Phase, onEnterPhase, setPhase, state } from "./state.js";
import * as setup from "./screens/setup.js";
import * as editor from "./screens/editor.js";
import * as reveal from "./screens/reveal.js";
import * as discuss from "./screens/discuss.js";
import * as results from "./screens/results.js";
import { $all } from "./utils.js";

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

function tabPhase(btn) {
  return btn.dataset.tab === "editor" ? Phase.EDITOR : Phase.SETUP;
}

$all(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => setPhase(tabPhase(btn)));
});

function syncTabs() {
  $all(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", tabPhase(btn) === state.phase);
  });
}

onEnterPhase(Phase.SETUP, syncTabs);
onEnterPhase(Phase.EDITOR, syncTabs);

setPhase(Phase.SETUP);
