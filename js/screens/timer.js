import { state, setPhase, Phase } from "../state.js";
import { formatTime, $ } from "../utils.js";

let displayEl, toggleBtn, revealBtn;
let secondsLeft = 0;
let intervalId = null;
let paused = false;

export function init() {
  displayEl = $("#timer-display");
  toggleBtn = $("#timer-toggle");
  revealBtn = $("#timer-reveal");

  toggleBtn.addEventListener("click", togglePause);
  revealBtn.addEventListener("click", () => finish());
}

export function onEnter() {
  stopInterval();
  secondsLeft = state.timerSeconds;
  paused = false;
  toggleBtn.textContent = "Pause";
  render();
  startInterval();
}

function startInterval() {
  stopInterval();
  intervalId = setInterval(() => {
    if (paused) return;
    secondsLeft -= 1;
    render();
    if (secondsLeft <= 0) {
      finish();
    }
  }, 1000);
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function togglePause() {
  paused = !paused;
  toggleBtn.textContent = paused ? "Resume" : "Pause";
}

function render() {
  displayEl.textContent = formatTime(secondsLeft);
  displayEl.classList.toggle("low", secondsLeft <= 10);
}

function finish() {
  stopInterval();
  setPhase(Phase.RESULTS);
}
