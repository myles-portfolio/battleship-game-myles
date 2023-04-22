// *** CURRENT TASKS ***

// TODO The computer will now place multiple ships in this format:
  // TODO One two-unit ship
  // TODO Two three-unit ships
  // TODO One four-unit ship
  // TODO One five-unit ship

// TODO Keep in mind that your code cannot place two ships on intersecting paths
// TODO Ship placement should be random (horizontally and vertically placed) and not manually placed by you in the code
// TODO Ships must be placed within the grid boundaries
// TODO The game works as before, except now, all ships must be destroyed to win

// TODO If the ship does not overlap with any existing ships, update the position key of the ship object to include all the tiles that the ship will occupy on the board.

  // TODO If the ship does overlap with an existing ship or does not fit within the boundaries of the board, generate a new random starting position for the ship and repeat the process from step 2.

//-----------------------------------------------------------------------------
// *** FUTURE TASKS ***

// TODO Randomly place 2 battleships on game board:
  // // TODO Generate a random starting position for each ship on the board. You can use the Math.random() function to generate a random index for the row and column of the starting tile.

  // TODO Check if the ship can fit within the boundaries of the board from its starting position. For example, if the ship is of length 4 and its starting position is [2, 5], then you should check if there are 4 tiles horizontally or vertically from this position on the board.

  // TODO If the ship fits within the boundaries of the board, check if it overlaps with any existing ships on the board. You can do this by checking if any of the tiles that the ship will occupy are already occupied by another ship.

  // TODO Setup a more robust player prompt for hit event, as once longer ships are added to the game board, the player may not always sink the ship.

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
  constructor(boardSize, buildFleetFunc) {
    this.board = new createGameBoard(boardSize);
    this.buildFleet = buildFleetFunc; // pass the buildFleet function as an argument
    this.fleet = this.buildFleet(this); // call the buildFleet function with the current game instance as an argument
  }

  buildFleet() {
    const fleet = [];
    this.ships.push(new Ship(2));
    this.ships.push(new Ship(3));
    this.ships.push(new Ship(3));
    this.ships.push(new Ship(4));
    this.ships.push(new Ship(5));
    return fleet;
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
  constructor(shipSizes, game) {
    this.ships = [];
    this.totalHealth = 0;
    this.game = game;
    for (let i = 0; i < shipSizes.length; i++) {
      const ship = new Ship(shipSizes[i]);
      this.ships.push(ship);
      this.totalHealth += shipSizes[i];
      this.placeShip(ship);
    }
  }

  getRandomStartTile(shipLength) {
    const maxRow = this.size - shipLength + 1;
    const maxCol = this.size - shipLength + 1;
    const row = Math.floor(Math.random() * maxRow);
    const col = Math.floor(Math.random() * maxCol);
    return [row, col];
  }

  placeShip(ship) {
    let [row, col] = this.getRandomStartTile(ship.length);
    let direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

    if (direction === 'horizontal') {
      if (this.checkHorizontal(row, col, ship.length)) {
        for (let i = col; i < col + ship.length; i++) {
          this.tiles[row][i] = 'ship';
        }
        ship.position = [row, col];
      } else {
        this.placeShip(ship);
      }
    } else {
      if (this.checkVertical(row, col, ship.length)) {
        for (let i = row; i < row + ship.length; i++) {
          this.tiles[i][col] = 'ship';
        }
        ship.position = [row, col];
      } else {
        this.placeShip(ship);
      }
    }

    this.fleet.totalHealth += ship.length;
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
  console.log(game.fleet);
  let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-jA-J]([1-9]|10)$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
  });

  this.buildFleet();
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
  const game = new Game(10, buildFleet);
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    playGame(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}
