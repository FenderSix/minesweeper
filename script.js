// Game configuration
const gameConfig = {
  beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

// Single declaration of currentGame
let currentGame = {
  difficulty: "beginner",
  board: [],
  mineLocations: new Set(),
  gameStarted: false,
  gameOver: false,
  timer: null,
  timeElapsed: 0,
  flagCount: 0,
};

// New function to calculate responsive cell size
function calculateCellSize() {
  // Get the board container
  const gameBoard = document.getElementById("game-board");
  const container =
    document.querySelector(".board-container") || gameBoard.parentElement;

  // Get the current game configuration
  const config = gameConfig[currentGame.difficulty];

  // Calculate available space
  const containerWidth = container.clientWidth - 20; // Account for padding
  const containerHeight = window.innerHeight - 250; // Account for header, buttons, margins

  // Calculate maximum possible cell sizes based on both dimensions
  const maxCellWidth = Math.floor(containerWidth / config.cols);
  const maxCellHeight = Math.floor(containerHeight / config.rows);

  // Use the smaller dimension to keep cells square
  let cellSize = Math.min(maxCellWidth, maxCellHeight);

  // Set size boundaries based on difficulty and screen size
  const minSize = window.innerWidth <= 480 ? 22 : 25; // Smaller minimum for mobile
  const maxSize = window.innerWidth <= 480 ? 30 : 35; // Smaller maximum for mobile

  // Adjust cell size based on boundaries
  cellSize = Math.min(Math.max(cellSize, minSize), maxSize);

  // For expert mode on mobile, ensure board is playable
  if (currentGame.difficulty === "expert" && window.innerWidth <= 480) {
    cellSize = Math.max(Math.min(cellSize, 25), 22); // Ensure expert mode is playable on mobile
  }

  return cellSize;
}

function createBoardDisplay() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";

  // Ensure we have a board container
  let boardContainer = document.querySelector(".board-container");
  if (!boardContainer) {
    boardContainer = document.createElement("div");
    boardContainer.className = "board-container";
    gameBoard.parentElement.insertBefore(boardContainer, gameBoard);
    boardContainer.appendChild(gameBoard);
  }

  const config = gameConfig[currentGame.difficulty];
  const cellSize = calculateCellSize();

  // Calculate grid dimensions including padding and gap
  const totalPadding = 10; // 5px padding on each side
  const totalGaps = (config.cols - 1) * 1; // 1px gap between cells
  const totalWidth = config.cols * cellSize + totalPadding + totalGaps;
  const totalHeight =
    config.rows * cellSize + totalPadding + (config.rows - 1) * 1;

  // // Calculate total dimensions
  // const totalWidth = config.cols * cellSize;
  // const totalHeight = config.rows * cellSize;

  // Create grid cells with dynamic sizing
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      // Apply size directly to cells
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      // Adjust font size based on cell size
      cell.style.fontSize = `${Math.max(cellSize * 0.5, 12)}px`;
      gameBoard.appendChild(cell);
    }
  }

  // Set grid layout
  gameBoard.style.width = `${totalWidth}px`;
  gameBoard.style.height = `${totalHeight}px`;
  gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, ${cellSize}px)`;
  gameBoard.style.gridTemplateRows = `repeat(${config.rows}, ${cellSize}px)`;

  // Ensure container fits the board exactly
  boardContainer.style.width = `${totalWidth}px`;
  boardContainer.style.height = `${totalHeight}px`;
}

// Timer functions
function startTimer() {
  currentGame.timeElapsed = 0;
  document.getElementById("timer").textContent = "0";
  currentGame.timer = setInterval(() => {
    currentGame.timeElapsed++;
    document.getElementById("timer").textContent = currentGame.timeElapsed;
  }, 1000);
}

function stopTimer() {
  if (currentGame.timer) {
    clearInterval(currentGame.timer);
    currentGame.timer = null;
  }
}

// Initialize the game board
function initializeGame(difficulty = "beginner") {
  stopTimer();

  // Reset game state
  currentGame.difficulty = difficulty;
  currentGame.gameStarted = false;
  currentGame.gameOver = false;
  currentGame.mineLocations.clear();
  currentGame.timeElapsed = 0;

  // Get configuration for selected difficulty
  const config = gameConfig[difficulty];

  // Create empty board
  currentGame.board = [];
  for (let row = 0; row < config.rows; row++) {
    currentGame.board[row] = [];
    for (let col = 0; col < config.cols; col++) {
      currentGame.board[row][col] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      };
    }
  }

  // Update display
  createBoardDisplay();
  document.getElementById("mine-count").textContent = config.mines;
  document.getElementById("timer").textContent = "0";
}

// Updated createBoardDisplay function for responsiveness
function createBoardDisplay() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = ""; // Clear existing board

  const config = gameConfig[currentGame.difficulty];
  const cellSize = calculateCellSize();

  // Calculate total dimensions
  const totalWidth = config.cols * cellSize;
  const totalHeight = config.rows * cellSize;

  // Create grid cells
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      gameBoard.appendChild(cell);
    }
  }

  // Set responsive grid layout
  gameBoard.style.width = `${totalWidth}px`;
  gameBoard.style.height = `${totalHeight}px`;
  gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, ${cellSize}px)`;
  gameBoard.style.gridTemplateRows = `repeat(${config.rows}, ${cellSize}px)`;

  // Center the board
  gameBoard.style.margin = "15px auto";

  // Log board dimensions for debugging
  console.log(`Board dimensions: ${totalWidth}x${totalHeight}`);
  console.log(`Cell size: ${cellSize}px`);
}

// Rest of the game logic remains the same
function placeMines(firstClickRow, firstClickCol) {
  const config = gameConfig[currentGame.difficulty];

  const positions = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (
        Math.abs(row - firstClickRow) <= 1 &&
        Math.abs(col - firstClickCol) <= 1
      ) {
        continue;
      }
      positions.push([row, col]);
    }
  }

  for (let i = 0; i < config.mines; i++) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    const [row, col] = positions.splice(randomIndex, 1)[0];

    currentGame.board[row][col].isMine = true;
    currentGame.mineLocations.add(`${row},${col}`);
  }

  calculateNeighborCounts();
}

function calculateNeighborCounts() {
  const config = gameConfig[currentGame.difficulty];

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (!currentGame.board[row][col].isMine) {
        let count = 0;

        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;

            if (
              newRow < 0 ||
              newRow >= config.rows ||
              newCol < 0 ||
              newCol >= config.cols ||
              (r === 0 && c === 0)
            ) {
              continue;
            }

            if (currentGame.board[newRow][newCol].isMine) {
              count++;
            }
          }
        }

        currentGame.board[row][col].neighborMines = count;
      }
    }
  }
}

function handleCellClick(row, col, isRightClick = false) {
  if (currentGame.gameOver) return;

  const cell = currentGame.board[row][col];

  if (isRightClick) {
    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;
      updateCellDisplay(row, col);
      updateMineCounter();
    }
    return;
  }

  if (cell.isFlagged || cell.isRevealed) return;

  if (!currentGame.gameStarted) {
    currentGame.gameStarted = true;
    placeMines(row, col);
    startTimer();
  }

  if (cell.isMine) {
    gameOver(false);
    return;
  }

  revealCell(row, col);
  checkWinCondition();
}

function revealCell(row, col) {
  const config = gameConfig[currentGame.difficulty];
  const cell = currentGame.board[row][col];

  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;
  updateCellDisplay(row, col);

  if (cell.neighborMines === 0) {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const newRow = row + r;
        const newCol = col + c;

        if (
          newRow >= 0 &&
          newRow < config.rows &&
          newCol >= 0 &&
          newCol < config.cols &&
          !currentGame.board[newRow][newCol].isRevealed
        ) {
          revealCell(newRow, newCol);
        }
      }
    }
  }
}

function updateCellDisplay(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const cellData = currentGame.board[row][col];

  cell.className = "cell";

  if (cellData.isRevealed) {
    cell.classList.add("revealed");

    if (cellData.isMine) {
      cell.classList.add("mine");
    } else if (cellData.neighborMines > 0) {
      cell.classList.add(`neighbors-${cellData.neighborMines}`);
      cell.textContent = cellData.neighborMines;
    }
  } else if (cellData.isFlagged) {
    cell.classList.add("flagged");
  }
}

function updateMineCounter() {
  const config = gameConfig[currentGame.difficulty];
  const flagCount = countFlags();
  document.getElementById("mine-count").textContent = config.mines - flagCount;
}

function countFlags() {
  let count = 0;
  const config = gameConfig[currentGame.difficulty];

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (currentGame.board[row][col].isFlagged) {
        count++;
      }
    }
  }

  return count;
}

function checkWinCondition() {
  const config = gameConfig[currentGame.difficulty];
  let unrevealedSafeCells = 0;

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = currentGame.board[row][col];
      if (!cell.isMine && !cell.isRevealed) {
        unrevealedSafeCells++;
      }
    }
  }

  if (unrevealedSafeCells === 0) {
    gameOver(true);
  }
}

function gameOver(isWin) {
  currentGame.gameOver = true;
  stopTimer();
  revealAllMines();

  if (isWin) {
    alert("Congratulations! You won!");
    updateLeaderboard(currentGame.timeElapsed);
  } else {
    alert("Game Over! Try again!");
  }
}

function revealAllMines() {
  currentGame.mineLocations.forEach((pos) => {
    const [row, col] = pos.split(",").map(Number);
    currentGame.board[row][col].isRevealed = true;
    updateCellDisplay(row, col);
  });
}

function updateLeaderboard(time) {
  let leaderboard = JSON.parse(
    localStorage.getItem("minesweeperLeaderboard") || "[]"
  );
  leaderboard.push({
    difficulty: currentGame.difficulty,
    time: time,
    date: new Date().toISOString(),
  });

  // Sort and keep top 10
  leaderboard = leaderboard.sort((a, b) => a.time - b.time).slice(0, 10);
  localStorage.setItem("minesweeperLeaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(
    localStorage.getItem("minesweeperLeaderboard") || "[]"
  );
  const leaderboardDiv = document.querySelector(".leaderboard-entries");
  leaderboardDiv.innerHTML = "";

  leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement("div");
    entryElement.className = "leaderboard-entry";
    entryElement.textContent = `${index + 1}. ${entry.difficulty} - ${
      entry.time
    }s`;
    leaderboardDiv.appendChild(entryElement);
  });

  document.getElementById("leaderboard").classList.remove("hidden");
}

// Initialize game and set up event listeners when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Initialize game
  initializeGame("beginner");

  // Add event listeners for cell clicks
  document.getElementById("game-board").addEventListener("click", (e) => {
    const cell = e.target;
    if (cell.classList.contains("cell")) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      handleCellClick(row, col);
    }
  });

  // Add right-click listener for flagging
  document.getElementById("game-board").addEventListener("contextmenu", (e) => {
    e.preventDefault(); // Prevent context menu
    const cell = e.target;
    if (cell.classList.contains("cell")) {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      handleCellClick(row, col, true);
    }
  });

  // Add difficulty selection listeners
  document.querySelectorAll(".difficulty-selector button").forEach((button) => {
    button.addEventListener("click", (e) => {
      // Remove selected class from all buttons
      document
        .querySelectorAll(".difficulty-selector button")
        .forEach((btn) => {
          btn.classList.remove("selected");
        });
      // Add selected class to clicked button
      button.classList.add("selected");

      const difficulty = button.dataset.difficulty;
      initializeGame(difficulty);
    });
  });

  // Add new game button listener
  document.getElementById("new-game-button").addEventListener("click", () => {
    initializeGame(currentGame.difficulty);
  });

  // Select beginner button by default
  document
    .querySelector('[data-difficulty="beginner"]')
    .classList.add("selected");

  // Display existing leaderboard
  displayLeaderboard();

  // Add window resize handler for responsive board
  window.addEventListener(
    "resize",
    _.debounce(() => {
      if (currentGame.gameStarted) return; // Don't resize during active game
      createBoardDisplay();
    }, 250)
  );
});
