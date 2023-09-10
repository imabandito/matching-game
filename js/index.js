import { MatchGrid } from "./matchGrid.js";
import { defaultArgs } from "./data.js";

const grid = new MatchGrid(defaultArgs);
const start = document.querySelector(".start");
const reset = document.querySelector(".reset");

grid.render();

start.addEventListener("click", () => {
  start.disabled = true;
  reset.disabled = false;
  grid.play();
});

reset.addEventListener("click", () => {
  reset.disabled = true;
  start.disabled = false;
  grid.reset();
});

document.addEventListener("mouseleave", (event) => {
  if (grid.isActive) {
    grid.pause();
  }
});

document.addEventListener("mouseenter", (event) => {
  if (grid.isActive) {
    grid.resume();
  }
});
