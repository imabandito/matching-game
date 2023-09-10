export class MatchGrid {
  #width;
  #height;
  #cols;
  #rows;
  #time = 0;
  #timeLimit;
  #theme;
  #interval;
  #isActive = false;
  #timerEl;
  #rootEl;
  #grid;
  #numbers = {};
  #cells;
  #player;
  #picksArr = [];
  #totalCorrectPicks = 0;

  constructor(args) {
    this.#width = args.width;
    this.#height = args.height;
    this.#cols = args.cols;
    this.#rows = args.rows;
    this.#timeLimit = args.timeLimit;
    this.#theme = args.theme;
    this.#time = this.#timeLimit / 1000;
    this.#timerEl = document.querySelector(args.timerSelector);
    this.#rootEl = document.querySelector(args.rootSelector);
    this.#cells = this.#cols * this.#rows;
    this.#player = args.player;
    if (this.#cells % 2 !== 0)
      throw new Error("number of cells should be even");
  }

  get isActive() {
    return this.#isActive;
  }

  render() {
    if (!this.#rootEl) {
      throw new Error("root doesn't exist");
    }
    this.#grid = this.#createGrid();
    this.#rootEl.innerHTML = "";
    this.#rootEl.appendChild(this.#grid);
    this.#timerEl.innerHTML = this.#generateTimeString(this.#time);
    this.#player.addScore(0);
    anime({
      targets: ".grid-cell",
      scale: [
        { value: 0.1, easing: "easeOutSine", duration: 500 },
        { value: 1, easing: "easeInOutQuad", duration: 1200 },
      ],
      delay: anime.stagger(150, {
        grid: [this.#cols, this.#rows],
        from: "center",
      }),
    });
  }

  play() {
    this.#setupGridListener();
    this.#handleTime();
    this.#isActive = true;
  }

  pause() {
    this.#handleLeave();
  }

  resume() {
    this.#handleTime();
  }

  reset() {
    this.#handleLeave();
    this.#time = this.#timeLimit / 1000;
    this.#isActive = false;
    this.#numbers = {};
    this.#picksArr = [];
    this.#totalCorrectPicks = 0;
    this.render();
    this.#player.resetScore();
  }

  #createGrid() {
    const grid = document.createElement("div");
    grid.className = "grid";
    grid.style.width = this.#width;
    grid.style.height = this.#height;
    grid.style.gridTemplateColumns = `repeat(${this.#cols}, ${
      100 / this.#cols
    }fr)`;
    grid.style.gridTemplateRows = `repeat(${this.#rows}, ${
      100 / this.#rows
    }fr)`;

    for (let i = 0; i < this.#cells; i++) {
      const cell = document.createElement("div");
      cell.className = `grid-cell grid-cell_${this.#theme}`;
      cell.id = i + 1;
      grid.appendChild(cell);
    }

    this.#fillCells();

    return grid;
  }

  #fillCells() {
    const middleNum = Math.floor(this.#cells / 2);
    for (let i = 1; i <= middleNum; i++) {
      const pairKey = this.#generateRandomKey(middleNum + 1, this.#cells, i);
      const randomId = this.#generateRandomValue(1, middleNum + 10);
      this.#numbers[i] = randomId;
      this.#numbers[pairKey] = randomId;
    }
  }

  #generateRandomKey(min, max, id = null) {
    let newKey;
    do {
      newKey = Math.floor(Math.random() * (max - min + 1) + min);
    } while (newKey === id || Object.hasOwn(this.#numbers, newKey));

    return newKey;
  }

  #generateRandomValue(min, max) {
    let newVal;
    do {
      newVal = Math.floor(Math.random() * (max - min + 1) + min);
    } while (Object.values(this.#numbers).includes(newVal));

    return newVal;
  }

  #setupGridListener() {
    this.#grid.addEventListener("click", (cell) => {
      const cellId = cell.target.id;
      if (
        !cellId ||
        !this.isActive ||
        cellId === this.#picksArr[0]?.publicId ||
        cellId === this.#picksArr[1]?.publicId
      ) {
        return;
      }
      cell.target.innerHTML = this.#numbers[cellId];

      anime({
        targets: cell.target,
        scale: 1.05,
        border: "5px solid #fff",
        duration: 500,
        direction: "alternate",
        begin: () => {
          cell.target.style.zIndex = 100;
        },
        complete: () => {
          cell.target.style.zIndex = 1;
        },
      });

      this.#picksArr.push({
        publicId: cellId,
        privateId: this.#numbers[cellId],
      });
      const firstEl = document.getElementById(this.#picksArr[0]?.publicId);
      const secondEl = document.getElementById(this.#picksArr[1]?.publicId);

      if (
        this.#picksArr.length === 2 &&
        this.#picksArr[0].privateId === this.#picksArr[1].privateId
      ) {
        this.#player.addScore(this.#picksArr[0].privateId);
        this.#totalCorrectPicks++;
        anime({
          targets: [firstEl, secondEl],
          translateX: "100vw",
          duration: 5000,
          begin: () => {
            firstEl.style.zIndex = 100;
            secondEl.style.zIndex = 100;
          },
          complete: () => {
            firstEl.classList.add("hidden");
            secondEl.classList.add("hidden");
          },
        });
        this.#picksArr.splice(0, 2);
        if (this.#totalCorrectPicks === this.#cells / 2) {
          this.#handleWin();
        }
      } else if (
        this.#picksArr.length === 2 &&
        this.#picksArr[0].privateId !== this.#picksArr[1].privateId
      ) {
        this.#isActive = false;
        this.#picksArr.splice(0, 2);
        setTimeout(() => {
          secondEl.innerHTML = "";
          firstEl.innerHTML = "";
          this.#isActive = true;
        }, 600);
      }
    });
  }

  #handleWin() {
    this.#time = 0;
    this.#isActive = false;
    this.#picksArr = [];
    this.#totalCorrectPicks = 0;
    this.#numbers = {};

    const winEl = document.createElement("div");
    winEl.className = "win";
    winEl.innerHTML =
      "Congrats!!! <span class='emoji'>&#128515;</span><br/> Win for the Winner";
    this.#rootEl.innerHTML = "";
    this.#rootEl.appendChild(winEl);
    anime({
      targets: ".emoji",
      rotate: 360,
      loop: true,
      duration: 5000,
    });
  }

  #handleTime() {
    if (this.#time === 0) return;

    this.#timerEl.innerHTML = this.#generateTimeString(this.#time);
    this.#interval = setInterval(() => {
      this.#time--;
      this.#timerEl.innerHTML = this.#generateTimeString(this.#time);
      if (this.#time <= 0) {
        this.#timerEl.innerHTML = "Game over";
        clearInterval(this.#interval);
        this.#isActive = false;
      }
    }, 1000);
  }

  #handleLeave() {
    clearInterval(this.#interval);
  }

  #generateTimeString(seconds) {
    let days = Math.floor(seconds / (3600 * 24));
    let hours = Math.floor((seconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;
    let result = "";

    if (days > 0) {
      result += `${String(days).padStart(2, "0")}:`;
    }
    if (hours > 0 || result !== "") {
      result += `${String(hours).padStart(2, "0")}:`;
    }
    if (minutes > 0 || result !== "") {
      result += `${String(minutes).padStart(2, "0")}:`;
    }
    result += `${String(remainingSeconds).padStart(2, "0")} s`;

    return result;
  }
}
