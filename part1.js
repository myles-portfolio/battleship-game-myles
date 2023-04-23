var rs = require('readline-sync');

class Game {
  constructor(size, numShips, shipLength) {
    this.gameBoard = createGameBoard(size);
    this.fleet = new Fleet(numShips, shipLength, this);
    
    for (let i = 0; i < numShips; i++) {
      this.fleet.addShip(shipLength, this);
    }
    this.inputHistory = [];
  }

  takeTurn(playerInput) { // flag to check if a ship was hit
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
          console.log(`Hit. You have sunk a battleship. ${this.fleet.totalHealth} ships remaining.`);
        } else {
          console.log(`Hit. You have sunk all battleships!`);
        }
        
        break; // exit loop once a ship has been hit
      }
      
      if (this.inputHistory.includes(playerInput)) {
        console.log(`You have already picked this location. Miss!`);
        return;
      }
    }
    
    if (!hitShip) {
      console.log(`You have missed!`);
      this.inputHistory.push(playerInput);
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
    const oceanArray = this.game.gameBoard;
    const randomSubArrayIndex = Math.floor(Math.random() * oceanArray.length);
    const randomElementIndex = Math.floor(Math.random() * oceanArray[randomSubArrayIndex].length);
    let randomTile = oceanArray[randomSubArrayIndex][randomElementIndex];
    oceanArray[randomSubArrayIndex].splice(randomElementIndex, 1);
    return randomTile;
  }

  addShip(length) {
    const ship = new Ship(length, this.getRandomTile());
    this.ships.push(ship);
    this.totalHealth += length;
  }
}

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

function playGame(game) {
  let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-cA-C][1-3]$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
  });

  game.takeTurn(playerInput);

  if (game.fleet.totalHealth === 0) {
    const repeat = rs.keyInYN('Would you like to play again? ');

    if (repeat) {
      startGame();
      game.reset();
    } else {
      console.log('Thanks for playing!');
      process.exit();
    }
  }
}

// *** RUN THE GAME ***

while (true) {
  startGame();
  const game = new Game(3, 2, 1);
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    playGame(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}