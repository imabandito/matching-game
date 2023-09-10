import { Player } from "./player.js";

export const defaultArgs = {
  width: "100%",
  height: "90%",
  cols: 4,
  rows: 3,
  timeLimit: 4260000,
  theme: "orange",
  rootSelector: "#app",
  timerSelector: ".timer",
  player: new Player(),
};
