const boardSize = 4;
let board = [];
let score = 0;
let highScore = 0;
let previousBoard = [];
let previousScore = 0;

// Replace FILE_ID with the actual file IDs from Google Drive
const mergeSound = new Audio('https://drive.google.com/file/d/16SmCirZdSr-jBqjFotlO7yInjSKCaZmq/view?usp=sharing');
const loseSound = new Audio('https://drive.google.com/uc?export=download&id=LOSE_SOUND_FILE_ID');

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initGame() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    updateBoard();
}

function addRandomTile() {
    const emptyTiles = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) {
                emptyTiles.push({ r, c });
            }
        }
    }
    if (emptyTiles.length > 0) {
        const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    const boardElement = document.querySelector('.grid-container');
    boardElement.innerHTML = '';
    board.forEach(row => {
        row.forEach(value => {
            const tileElement = document.createElement('div');
            tileElement.classList.add('tile');
            if (value !== 0) {
                tileElement.textContent = value;
                tileElement.classList.add(`tile-${value}`);
                if (value === 2048) {
                    showWinMessage();
                }
            }
            boardElement.appendChild(tileElement);
        });
    });
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

function move(direction) {
    savePreviousState();
    let moved = false;
    if (direction === 'left') {
        for (let r = 0; r < boardSize; r++) {
            const originalRow = board[r].slice();
            const newRow = slideAndMerge(originalRow);
            if (newRow.toString() !== originalRow.toString()) {
                moved = true;
                board[r] = newRow;
            }
        }
    } else if (direction === 'right') {
        for (let r = 0; r < boardSize; r++) {
            const originalRow = board[r].slice().reverse();
            const newRow = slideAndMerge(originalRow).reverse();
            if (newRow.toString() !== originalRow.toString()) {
                moved = true;
                board[r] = newRow;
            }
        }
    } else if (direction === 'up') {
        for (let c = 0; c < boardSize; c++) {
            const originalColumn = board.map(row => row[c]);
            const newColumn = slideAndMerge(originalColumn);
            if (newColumn.toString() !== originalColumn.toString()) {
                moved = true;
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = newColumn[r];
                }
            }
        }
    } else if (direction === 'down') {
        for (let c = 0; c < boardSize; c++) {
            const originalColumn = board.map(row => row[c]).reverse();
            const newColumn = slideAndMerge(originalColumn).reverse();
            if (newColumn.toString() !== originalColumn.toString()) {
                moved = true;
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = newColumn[r];
                }
            }
        }
    }

    if (moved) {
        addRandomTile();
        updateBoard();
        checkGameOver();
    }
}

function slideAndMerge(row) {
    const newRow = row.filter(value => value !== 0);
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2;
            score += newRow[i];
            newRow.splice(i + 1, 1);
            mergeSound.play(); // Play sound when tiles merge
            newRow[i] = { value: newRow[i], merged: true }; // Mark as merged
        }
    }
    while (newRow.length < boardSize) {
        newRow.push(0);
    }
    return newRow.map(tile => (typeof tile === 'object' ? tile.value : tile));
}

function checkGameOver() {
    const isGameOver = board.flat().every(value => value !== 0);
    if (isGameOver) {
        showLoseMessage();
        if (score > highScore) {
            highScore = score;
        }
    }
}

function savePreviousState() {
    previousBoard = board.map(row => row.slice());
    previousScore = score;
}

function undoMove() {
    if (previousBoard.length > 0) {
        board = previousBoard.map(row => row.slice());
        score = previousScore;
        updateBoard();
    }
}

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}

function handleTouchEnd() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            move('right');
        } else {
            move('left');
        }
    } else {
        if (deltaY > 0) {
            move('down');
        } else {
            move('up');
        }
    }
}

function showWinMessage() {
    const winMessage = document.createElement('div');
    winMessage.id = 'win-message';
    winMessage.textContent = 'You Win!';
    document.getElementById('game-container').appendChild(winMessage);
    winMessage.style.display = 'block';

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        document.getElementById('game-container').appendChild(confetti);
    }

    setTimeout(() => {
        winMessage.style.display = 'none';
        document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
    }, 5000);
}

function showLoseMessage() {
    const loseMessage = document.getElementById('lose-message');
    loseMessage.style.display = 'block';
    loseSound.play(); // Play sound when the game is lost
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
        }
    });

    document.getElementById('restart-button').addEventListener('click', initGame);
    document.getElementById('undo-button').addEventListener('click', undoMove);
    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
    document.getElementById('try-again-button').addEventListener('click', () => {
        document.getElementById('lose-message').style.display = 'none';
        initGame();
    });

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
});