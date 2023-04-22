var rs = require('readline-sync');

function startGame() {
  rs.keyIn('Press any key to start the game. ',
    {hideEchoBack:true,mask:""}
  );
}

function createGameBoard(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
  );
}

class Game {
  constructor(size, numShips, shipLength) {
    this.gameBoard = createGameBoard(size);
    this.fleet = new Fleet(numShips, shipLength, this);
    for (let i = 0; i < numShips; i++) {
      this.fleet.addShip(shipLength, this);
    }
  }

  takeTurn(playerInput) {
    let doDamage = false; // flag to check if a ship was hit
    let healthRemaining = this.fleet.ships.length;

    for (let i = 0; i < healthRemaining; i++) {
      let ship = this.fleet.ships[i];
      if (ship.position === playerInput) {
        if (!ship.hit) { // check if the ship has already been hit
          doDamage = true;
          ship.hit = true;
          this.fleet.totalHealth--;
          if (this.fleet.totalHealth > 1) {
            console.log(`Hit. You have sunk a battleship. ${this.fleet.totalHealth} ships remaining.`);
          } else if (this.fleet.totalHealth === 1) {
            console.log(`Hit. You have sunk a battleship. 1 ship remaining.`);
          }
        } else {
          doDamage = true;
          console.log(`You have already picked this location. Miss!`);
        }
        break;
      }
    }

    if (!doDamage) {
      console.log(`You have missed!`);
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
  }

  getRandomTile() {
    const board = this.game.gameBoard;
    const randomSubArrayIndex = Math.floor(Math.random() * board.length);
    const randomElementIndex = Math.floor(Math.random() * board[randomSubArrayIndex].length);
    let randomTile = board[randomSubArrayIndex][randomElementIndex];
    board[randomSubArrayIndex].splice(randomElementIndex, 1);
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

  game.takeTurn(playerInput);
}


// *** RUN THE GAME ***


while (true) {
  startGame();
  const game = new Game(3, 2, 1);
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    playGame(game); // Pass the game instance as an argument
  }
  const repeat = rs.keyInYN('You have destroyed all battleships. Would you like to play again? ');
  if (!repeat) {
    break;
  }
}

console.log('Thanks for playing!');