// *** CURRENT TASKS ***

  // TODO If the ship does not overlap with any existing ships, update the position key of the ship object to include all the tiles that the ship will occupy on the board.

  // TODO If the ship does overlap with an existing ship or does not fit within the boundaries of the board, generate a new random starting position for the ship and repeat the process from step 2.

//-----------------------------------------------------------------------------
// *** FUTURE TASKS ***

// TODO Randomly place 2 battleships on game board:
  // // TODO Generate a random starting position for each ship on the board. You can use the Math.random() function to generate a random index for the row and column of the starting tile.

  // TODO Check if the ship can fit within the boundaries of the board from its starting position. For example, if the ship is of length 4 and its starting position is [2, 5], then you should check if there are 4 tiles horizontally or vertically from this position on the board.

  // TODO If the ship fits within the boundaries of the board, check if it overlaps with any existing ships on the board. You can do this by checking if any of the tiles that the ship will occupy are already occupied by another ship.

var rs = require('readline-sync');

function startGame() {
  rs.keyIn('Press any key to start the game. ',
    {hideEchoBack:true,mask:""}
  );
}

function createGameBoard(rowSize, colSize) {
  return Array.from({ length: rowSize }, (_, row) =>
    Array.from({ length: colSize }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
  );
}

class Game {
  constructor(rowSize, colSize, numShips, shipLength) {
    this.gameBoard = createGameBoard(rowSize, colSize);
    this.fleet = new Fleet(numShips, shipLength, this);
    for (let i = 0; i < numShips; i++) {
      this.fleet.addShip(shipLength, this);
    }
  }
}

class Ship {
  constructor(length, randomTile) {
    this.position = randomTile;
    this.hit = false;
    this.size = length;
  }
}

class Fleet {
  constructor(numShips, shipLength, game) {
    this.ships = [];
    this.totalHealth = 0;
    this.game = game;

    for (let i = 0; i < numShips; i++) {
      this.addShip(shipLength);
    }
  }

  getRandomTile() {
    const board = this.game.gameBoard;
    const randomSubArrayIndex = Math.floor(Math.random() * board.length);
    const randomElementIndex = Math.floor(Math.random() * board[randomSubArrayIndex].length);
    let randomTile = board[randomSubArrayIndex][randomElementIndex];
    return randomTile;
  }

  addShip(length) {
    const ship = new Ship(length, this.getRandomTile());
    this.ships.push(ship);
    this.totalHealth += length;
  }

  removeShip(ship) {
    const index = this.ships.indexOf(ship);
    if (index !== -1) {
      this.ships.splice(index, 1);
      this.totalHealth -= ship.size;
    }
  }

  getShip(index) {
    return this.ships[index];
  }

  getShips() {
    return this.ships;
  }
}


function playGame(game) {
  let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-cA-C][1-3]$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
  });

  let hitShip = false; // flag to check if a ship was hit

  game.fleet.ships.forEach(ship => {
    if (ship.position === playerInput) {
      if (!ship.hit) { // check if the ship has already been hit
        hitShip = true;
        ship.hit = true;
        game.fleet.totalHealth--;
        if (game.fleet.totalHealth > 1) {
          console.log(`Hit. You have sunk a battleship. ${game.fleet.totalHealth} ships remaining.`);
        } else if (game.fleet.totalHealth === 1) {
          console.log(`Hit. You have sunk a battleship. 1 ship remaining.`);
        }
      } else {
        hitShip = true;
        console.log(`You have already picked this location. Miss!`);
      }
    }
  });

  if (!hitShip) {
    console.log(`You have missed!`);
  }
}



// *** RUN THE GAME ***

while (true) {
  startGame();
  const game = new Game(3, 3, 2, 1);
  while (game.fleet.totalHealth > 0) {
    playGame(game); // Pass the game instance as an argument
  }
  const repeat = rs.keyInYN('You have destroyed all battleships. Would you like to play again? ');
  if (!repeat) {
    break;
  }
}

console.log('Thanks for playing!');