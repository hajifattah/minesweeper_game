import "./style.css";
let input = {};
let cell = [];
let correctCell = 0;
let form = document.getElementById("form");
let mineSweeper = document.getElementById("mineSweeper");
let start = document.getElementById("start");
let outGame = document.getElementById("outGame");
let inGame = document.getElementById("inGame");
let reset = document.getElementById("reset");
start.addEventListener("click", getInput);
reset.addEventListener("click", resetGame);
// show number of mines
function addToInGame() {
  let html = `number of <img src="./public/mine.svg" class=" size-6 inline-block" alt=""> is : ${input.numberMines}`;
  inGame.firstElementChild.firstElementChild.innerHTML = html;
  inGame.classList.remove("hidden");
}
// reset Game
function resetGame() {
  cell = [];
  correctCell = 0;
  input = {};
  for (const item of form.children) {
    if (item === form.lastElementChild) break;
    item.value = "";
  }
  mineSweeper.style.removeProperty("pointer-events");
  inGame.classList.add("hidden");
  outGame.classList.remove("hidden");
  mineSweeper.innerHTML = "";
  mineSweeper.style.removeProperty("width");
}
//check and get input
function getInput() {
  for (const item of form.children) {
    if (item === form.children[2]) {
      let allCell = input.rows * input.columns;
      if (item.value >= allCell) {
        return alert(`number of mines must be less than ${allCell}!`);
      } else if (item.value === "") {
        input[item.name] = 10;
        break;
      } else if (item.value < 2) {
        return alert("number of Mines must be greater than 1!");
      } else {
        input[item.name] = Number(item.value);
        break;
      }
    }
    if (item.value === "") {
      input[item.name] = 10;
    } else if (item.value < 5) {
      return alert("number of rows and columns must be greater than 4!");
    } else if (item.value > 150) {
      return alert("number of rows and columns must be less than 151!");
    } else input[item.name] = Number(item.value);
  }
  outGame.classList.add("hidden");
  addToInGame();
  createCell();
}
//create array objects of cells
function createCell() {
  let allCell = input.rows * input.columns;
  let minesIndex = createMine(allCell);

  for (let index = 0; index < allCell; index++) {
    cell.push({ id: index });
    cell[index].show = false;
    minesIndex.includes(index)
      ? (cell[index].mine = true)
      : (cell[index].mine = false);
    if (cell[index].mine === false) {
      cell[index].value = 0;
    } else if (cell[index].mine === true) {
      cell[index].value = '<img src="public/mine.svg" alt="">';
    }
  }
  createCellNumber(minesIndex);
  console.log(cell);
  render();
}
// create value of cell
function createCellNumber(minesIndex) {
  let indexAroundMine = [];
  indexAroundMine = findIndexAround(minesIndex);
  //delete mines index that aside together
  indexAroundMine = indexAroundMine.filter((item) => cell[item].mine === false);
  indexAroundMine.forEach((indexAround) => {
    if (cell[indexAround].value >= 1) {
      cell[indexAround].value++;
    } else if (cell[indexAround].value === 0) {
      cell[indexAround].value = 1;
    }
  });
}
// create index of mines
function createMine(allCell) {
  let mines = [];
  let random = 0;
  for (let index = 0; index < input.numberMines; index++) {
    random = Math.floor(Math.random() * allCell);
    while (mines.includes(random)) {
      random = Math.floor(Math.random() * allCell);
    }
    mines[index] = random;
  }
  console.log(mines);
  return mines;
}
//notRepeat parametr for avoid return duplicated index to setShow function
function findIndexAround(indexArray, notRepeat = false) {
  let indexAround = [];
  indexArray.forEach((index) => {
    let row = Math.floor(index / input.columns);
    let col = index - row * input.columns;
    let newIndex;
    //current location
    if ((col + 1) % input.columns !== 0) {
      indexAround.push(index + 1);
    }
    if (col % input.columns !== 0) {
      indexAround.push(index - 1);
    }
    //previos row location
    if (row > 0) {
      newIndex = (row - 1) * input.columns + col;
      indexAround.push(newIndex);
      if ((col + 1) % input.columns !== 0) {
        indexAround.push(newIndex + 1);
      }
      if (col % input.columns !== 0) {
        indexAround.push(newIndex - 1);
      }
    }
    //next row location
    if (row < input.rows - 1) {
      newIndex = (row + 1) * input.columns + col;
      indexAround.push(newIndex);
      if ((col + 1) % input.columns !== 0) {
        indexAround.push(newIndex + 1);
      }
      if (col % input.columns !== 0) {
        indexAround.push(newIndex - 1);
      }
    }
  });
  //delete duplicate
  if (notRepeat === true) indexAround = [...new Set(indexAround)];
  return indexAround;
}

// click in minesweeper
mineSweeper.addEventListener("click", setShow);
function setShow(event) {
  let index = Number(event.target.id);
  if (cell[index].show === true) return;
  if (cell[index].mine === true) {
    render(true);
    alert("You lose");
  } else if (cell[index].mine === false) {
    if (cell[index].value !== 0) {
      correctCell++;
      if (correctCell === input.rows * input.columns - input.numberMines) {
        alert("you won!");
        render(true);
        mineSweeper.style.pointerEvents = "none";
      }
      cell[index].show = true;
      event.target.classList.remove("mineHover");
      event.target.style.backgroundColor = "rgb(143, 158, 180)";
      event.target.innerHTML = cell[index].value;
      return;
    }
    //find index aound of clicked by user
    let visited = [index];
    correctCell++;
    let stack = [...visited];
    do {
      stack = findIndexAround(stack, true);
      let sampleStack = [...stack];
      stack.forEach((item) => {
        if (visited.includes(item)) {
          sampleStack.splice(sampleStack.indexOf(item), 1);
        } else if (cell[item].value === 0) {
          correctCell++;
          visited.push(item);
        } else if (cell[item].value !== 0) {
          correctCell++;
          visited.push(
            Number(sampleStack.splice(sampleStack.indexOf(item), 1))
          );
        }
      });
      stack = [...sampleStack];
    } while (stack.length !== 0);
    //cell convert to visited
    visited.forEach((item) => {
      let element = event.currentTarget.children[item];
      cell[item].show = true;
      element.classList.remove("mineHover");
      element.style.backgroundColor = "rgb(143, 158, 180)";
      element.innerHTML = cell[item].value;
    });
    if (correctCell === input.rows * input.columns - input.numberMines) {
      alert("you won!");
      render(true);
      mineSweeper.style.pointerEvents = "none";
    }
  }
}

function render(end = false) {
  let html = "";
  mineSweeper.style.width = `${input.columns * 24}px`;
  // mineSweeper.classList.add(`w-[${input.columns * 24}px]`);
  if (end) {
    cell.forEach((item) => {
      mineSweeper.style.pointerEvents = "none";
      item.show = true;
      html += `<div id=${item.id} class=" border border-sky-200 size-6 text-center mineHover bg-[rgb(143,158,180)]" > ${item.value}</div>`;
    });
  } else {
    cell.forEach((item) => {
      html += `<div id =${item.id} class=" border border-sky-200 size-6 text-center mineHover bg-[rgb(48,165,231)]"></div>`;
    });
  }
  mineSweeper.innerHTML = html;
}
