export class Player {
  #username;
  #score = 0;
  #playerEl = document.querySelector(".player");

  constructor(username = "Player") {
    this.#username = username;
  }

  addScore(scored) {
    this.#score += scored;
    this.#playerEl.innerHTML = this.#username + " score: " + this.#score;
  }

  resetScore() {
    this.#score = 0;
    this.#playerEl.innerHTML = this.#username + " score: " + this.#score;
  }
}
