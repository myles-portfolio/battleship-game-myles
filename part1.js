var rs = require('readline-sync');

class Game {
  constructor(size, numShips, shipLength) {
    this.size = size;
    this.gameBoard = this.createGameBoard();
    this.fleet = new Fleet(numShips, shipLength, this);
    
    for (let i = 0; i < numShips; i++) {
      this.fleet.addShip(shipLength, this);
    }
    this.guesses = [];
  }

  createGameBoard() {
    return Array.from({ length: this.size }, (_, row) =>
      Array.from({ length: this.size }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
    );
  }

  startGame() {
    rs.keyIn('Press any key to start the game. ',
      {hideEchoBack:true,mask:""}
    );
  }

  takeTurn(playerInput) {
    playerInput = playerInput.toUpperCase();
    let healthRemaining = this.fleet.ships.length;
    let hitShip = false;
    
    for (let i = 0; i < healthRemaining; i++) {
      let ship = this.fleet.ships[i];
      
      if (ship.position === playerInput) {
        if (ship.hit) {
          console.log(`You have already sunk this battleship!`);
          return;
        }
        
        ship.hit = true;
        this.fleet.totalHealth--;
        hitShip = true;
        
        if (this.fleet.totalHealth > 0) {
          console.log(`Hit. You have sunk a battleship. ${this.fleet.totalHealth} ship remaining.`);
        } else {
          console.log(`Hit. You have sunk all battleships!`);
        }
        
        break;
      }
      
      if (this.guesses.includes(playerInput)) {
        console.log(`You have already picked this location. Miss!`);
        return;
      }
    }
    
    if (!hitShip) {
      console.log(`You have missed!`);
      this.guesses.push(playerInput);
    }
  }

  reset(numShips, shipLength) {
    this.fleet = new Fleet(numShips, shipLength, this);

    for (let i = 0; i < numShips; i++) {
      this.fleet.addShip(shipLength, this);
    }

    this.guesses = [];
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
    this.shipSize = shipLength;
    this.numShips = numShips;
  }

  getRandomTile() {
    const oceanArray = this.game.gameBoard;
    const randomSubArrayIndex = Math.floor(Math.random() * oceanArray.length);
    const randomElementIndex = Math.floor(Math.random() * oceanArray[randomSubArrayIndex].length);
    let randomTile = oceanArray[randomSubArrayIndex][randomElementIndex];
    oceanArray[randomSubArrayIndex].splice(randomElementIndex, 1);
    return randomTile;
  }

  addShip(length, game) {
    const ship = new Ship(length, this.getRandomTile());
    this.ships.push(ship);
    game.fleet.totalHealth += length;
  }

  getShips() {
    return this.ships.length;
  }
}

function playGame(game) {
  let numShips = game.fleet.getShips();
  let shipLength = game.fleet.shipSize;
  let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-cA-C][1-3]$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
  });

  game.takeTurn(playerInput);

  if (game.fleet.totalHealth === 0) {
    const repeat = rs.keyInYN('Would you like to play again? ');

    if (repeat) {
      game.startGame();
      game.reset(numShips, shipLength);
    } else {
      console.log('Thanks for playing!');
      process.exit();
    }
  }
}

// *** RUN THE GAME ***

while (true) {
  const game = new Game(3, 2, 1);
  game.startGame();
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    playGame(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}