const uploadInput = document.getElementById("upload");
const difficultySelect = document.getElementById("difficulty");
const generateBtn = document.getElementById("generateBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");
const board = document.getElementById("board");

const movesEl = document.getElementById("moves");
const matchedEl = document.getElementById("matched");
const totalPiecesEl = document.getElementById("totalPieces");

let rows = 5;
let cols = 10;
let pieces = [];
let currentImageURL = null;
let draggedPiece = null;
let moves = 0;

generateBtn.addEventListener("click", generatePuzzle);
shuffleBtn.addEventListener("click", shufflePieces);
resetBtn.addEventListener("click", resetPuzzle);

function setDifficulty() {
  const difficulty = Number(difficultySelect.value);

  if (difficulty === 20) {
    rows = 4;
    cols = 5;
  } else if (difficulty === 50) {
    rows = 5;
    cols = 10;
  } else if (difficulty === 100) {
    rows = 10;
    cols = 10;
  }
}

function generatePuzzle() {
  const file = uploadInput.files[0];
  if (!file) {
    alert("Please upload an image first.");
    return;
  }

  setDifficulty();

  if (currentImageURL) {
    URL.revokeObjectURL(currentImageURL);
  }

  currentImageURL = URL.createObjectURL(file);
  moves = 0;
  movesEl.textContent = moves;

  createBoard();
  createPieces();
  shufflePieces();

  shuffleBtn.disabled = false;
  resetBtn.disabled = false;
}

function createBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
}

function createPieces() {
  pieces = [];
  const total = rows * cols;
  totalPiecesEl.textContent = total;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const piece = document.createElement("div");
      piece.className = "piece";

      const correctIndex = r * cols + c;

      piece.dataset.correctRow = r;
      piece.dataset.correctCol = c;
      piece.dataset.correctIndex = correctIndex;
      piece.dataset.currentIndex = correctIndex;

      piece.draggable = true;

      piece.style.backgroundImage = `url('${currentImageURL}')`;
      piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
      piece.style.backgroundPosition = `${(c / (cols - 1 || 1)) * 100}% ${(r / (rows - 1 || 1)) * 100}%`;

      piece.addEventListener("dragstart", onDragStart);
      piece.addEventListener("dragend", onDragEnd);
      piece.addEventListener("dragover", onDragOver);
      piece.addEventListener("drop", onDrop);

      pieces.push(piece);
    }
  }
}

function shufflePieces() {
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);

  shuffled.forEach((piece, index) => {
    piece.dataset.currentIndex = index;
    board.appendChild(piece);
  });

  updateMatchedBorders();
  updateMatchedCount();
}

function resetPuzzle() {
  createBoard();
  pieces.forEach((piece, index) => {
    piece.dataset.currentIndex = index;
    board.appendChild(piece);
  });

  moves = 0;
  movesEl.textContent = moves;
  updateMatchedBorders();
  updateMatchedCount();
}

function onDragStart() {
  draggedPiece = this;
  this.classList.add("dragging");
}

function onDragEnd() {
  this.classList.remove("dragging");
}

function onDragOver(e) {
  e.preventDefault();
}

function onDrop(e) {
  e.preventDefault();

  if (!draggedPiece || draggedPiece === this) return;

  const targetPiece = this;

  const draggedIndex = draggedPiece.dataset.currentIndex;
  const targetIndex = targetPiece.dataset.currentIndex;

  draggedPiece.dataset.currentIndex = targetIndex;
  targetPiece.dataset.currentIndex = draggedIndex;

  const draggedNext = targetPiece.nextSibling;
  const draggedParent = draggedPiece.parentNode;
  const targetParent = targetPiece.parentNode;

  if (draggedNext === draggedPiece) {
    targetParent.insertBefore(draggedPiece, targetPiece);
  } else {
    draggedParent.insertBefore(draggedPiece, targetPiece);
    targetParent.insertBefore(targetPiece, draggedNext);
  }

  moves++;
  movesEl.textContent = moves;

  updateMatchedBorders();
  updateMatchedCount();
  checkWin();
}

function getPieceAt(row, col) {
  const targetIndex = row * cols + col;
  return pieces.find(piece => Number(piece.dataset.currentIndex) === targetIndex);
}

function isCorrectAt(piece, row, col) {
  return Number(piece.dataset.correctRow) === row && Number(piece.dataset.correctCol) === col;
}

function clearMatchClasses(piece) {
  piece.classList.remove(
    "matched-top",
    "matched-right",
    "matched-bottom",
    "matched-left"
  );
}

function updateMatchedBorders() {
  pieces.forEach(clearMatchClasses);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = getPieceAt(row, col);
      if (!piece) continue;

      if (col < cols - 1) {
        const rightPiece = getPieceAt(row, col + 1);
        if (
          rightPiece &&
          isCorrectAt(piece, row, col) &&
          isCorrectAt(rightPiece, row, col + 1)
        ) {
          piece.classList.add("matched-right");
          rightPiece.classList.add("matched-left");
        }
      }

      if (row < rows - 1) {
        const bottomPiece = getPieceAt(row + 1, col);
        if (
          bottomPiece &&
          isCorrectAt(piece, row, col) &&
          isCorrectAt(bottomPiece, row + 1, col)
        ) {
          piece.classList.add("matched-bottom");
          bottomPiece.classList.add("matched-top");
        }
      }
    }
  }
}

function updateMatchedCount() {
  let matched = 0;

  pieces.forEach(piece => {
    const currentIndex = Number(piece.dataset.currentIndex);
    const correctIndex = Number(piece.dataset.correctIndex);
    if (currentIndex === correctIndex) matched++;
  });

  matchedEl.textContent = matched;
}

function checkWin() {
  const won = pieces.every(piece => {
    return Number(piece.dataset.currentIndex) === Number(piece.dataset.correctIndex);
  });

  const existing = document.querySelector(".complete-message");
  if (existing) existing.remove();

  if (won) {
    const msg = document.createElement("div");
    msg.className = "complete-message";
    msg.textContent = `Perfect. Puzzle solved in ${moves} moves.`;
    board.insertAdjacentElement("afterend", msg);
  }
}
