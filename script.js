let currentPlayer = "X";
let board = Array(9).fill(null);
let gameMode = null;
let difficulty = 'hard';
const status = document.getElementById("status");
const cells = document.querySelectorAll(".cell");

const clickSound = new Audio('sounds/click.mp3');
const winSound = new Audio('sounds/win.mp3');
const restartSound = new Audio('sounds/restart.mp3');

cells.forEach(cell => cell.addEventListener("click", handleClick));

function setMode(mode) {
  gameMode = mode;
  resetGame();
  if (mode === 'ai') {
    document.getElementById('difficultySelect').style.display = 'inline-block';
    status.textContent = "Player's Turn";
  } else {
    document.getElementById('difficultySelect').style.display = 'none';
    status.textContent = "Player X's Turn";
  }
}

function setDifficulty(level) {
  difficulty = level;
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameMode || board[index] || checkWinner()) return;

  makeMove(index, currentPlayer);

  if (checkWinner()) {
    winSound.play();
    status.textContent = `Player ${currentPlayer} wins!`;
    return;
  }

  if (board.every(cell => cell)) {
    status.textContent = "It's a draw!";
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";

  if (gameMode === "ai" && currentPlayer === "O") {
    setTimeout(() => {
      const aiMove = getBestMove();
      makeMove(aiMove, "O");

      if (checkWinner()) {
        winSound.play();
        status.textContent = "Computer wins!";
      } else if (board.every(cell => cell)) {
        status.textContent = "It's a draw!";
      } else {
        currentPlayer = "X";
        status.textContent = "Player's Turn";
      }
    }, 500);
  } else {
    status.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  clickSound.play();
}

function resetGame() {
  restartSound.play();
  board.fill(null);
  currentPlayer = "X";
  cells.forEach(cell => cell.textContent = "");
  if (gameMode === 'ai') {
    status.textContent = "Player's Turn";
  } else if (gameMode === 'pvp') {
    status.textContent = "Player X's Turn";
  } else {
    status.textContent = "Choose a mode to start the game";
  }
}

function checkWinner() {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winPatterns.some(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

function getBestMove() {
  if (difficulty === 'easy') {
    const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }
  if (difficulty === 'medium') {
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        if (checkWinner()) {
          board[i] = null;
          return i;
        }
        board[i] = null;
      }
    }
    const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  const winner = checkWinnerForMinimax(boardState);
  if (winner === "O") return 1;
  if (winner === "X") return -1;
  if (boardState.every(cell => cell)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (!boardState[i]) {
        boardState[i] = "O";
        const score = minimax(boardState, depth + 1, false);
        boardState[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < boardState.length; i++) {
      if (!boardState[i]) {
        boardState[i] = "X";
        const score = minimax(boardState, depth + 1, true);
        boardState[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWinnerForMinimax(b) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a, b_, c] of winPatterns) {
    if (b[a] && b[a] === b[b_] && b[a] === b[c]) return b[a];
  }
  return null;
}