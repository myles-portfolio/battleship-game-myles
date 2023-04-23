// *** CURRENT TASKS ***

// TODO Keep in mind that your code cannot place two ships on intersecting paths
// TODO Ship placement should be random (horizontally and vertically placed) and not manually placed by you in the code
// TODO Ships must be placed within the grid boundaries

// TODO If the ship does not overlap with any existing ships, update the position key of the ship object to include all the tiles that the ship will occupy on the board.

  // TODO If the ship does overlap with an existing ship or does not fit within the boundaries of the board, generate a new random starting position for the ship and repeat the process from step 2.

//-----------------------------------------------------------------------------
// *** FUTURE TASKS ***


  // TODO Check if the ship can fit within the boundaries of the board from its starting position. For example, if the ship is of length 4 and its starting position is [2, 5], then you should check if there are 4 tiles horizontally or vertically from this position on the board.

  // TODO If the ship fits within the boundaries of the board, check if it overlaps with any existing ships on the board. You can do this by checking if any of the tiles that the ship will occupy are already occupied by another ship.

  // TODO Setup a more robust player prompt for hit event, as once longer ships are added to the game board, the player may not always sink the ship.

  //get the ship's length and starting position
  //check tiles up, down, left and right of starting position
  //in first direction that has enough open tiles for ship's, push those tiles to the ship's occupiedTiles array

var rs = require('readline-sync');

/// *** GAME CLASSES *** ---------------------------------------------------

class Game {
  constructor(gameSettings) {
    this.gameSettings = gameSettings;
    this.board = this.createBoard();
    this.fleet = new Fleet(gameSettings, this);

    for (let i = 0; i < gameSettings.numShips; i++) {
      const shipType = gameSettings.availableShips[i];
      this.fleet.addShip(shipType.type);
    }
    
    this.guesses = [];
  }

  createBoard() {
    return Array.from({ length: this.gameSettings.boardSize }, (_, row) =>
      Array.from({ length: this.gameSettings.boardSize }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
    );
  }

  playerTurn(playerInput) {
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
    }

    if (!hitShip) {
      if (this.guesses.includes(playerInput)) {
        console.log(`You have already picked this location. Miss!`);
        return;
      }

      console.log(`You have missed!`);
      this.guesses.push(playerInput);
    }
  }

  isGameOver() {
    return this.fleet.totalHealth === 0;
  }
}

class Ship {
  constructor(length, game) {
    this.hit = false;
    this.size = length;
    this.occupiedTiles = [];
  }
}

class Fleet {
  constructor(gameSettings) {
    this.ships = [];
    this.totalHealth = 0;
    this.numShips = gameSettings.numShips;
    this.availableShips = gameSettings.availableShips;
  }

  addShip(shipType) {
    const { length } = this.availableShips.find(s => s.type === shipType);
    const ship = new Ship(length, this.game);
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

/// *** GAME FUNCTIONS *** ---------------------------------------------------

function setupGame(game) {
  let boardSize = game.gameSettings.boardSize;
  let ships = game.fleet.ships;

  let tiles = {};
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      let tile = {
        tileName: String.fromCharCode(65 + i) + (j + 1),
        occupiedTile: false,
      };
      tiles[tile.tileName] = tile;
    }
  }

  console.log(tiles);

  ships.forEach(ship => {
      console.log('Add ship to board...');
    });
}

function gameLoop(game) {
  while (!game.isGameOver()) {
    let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-jA-J]([0-9]|10)$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
    });

    game.playerTurn(playerInput);
  }

  const repeat = rs.keyInYN('Would you like to play again? ');

  if (repeat) {
    game.reset();
    startGame();
  } else {
    console.log('Thanks for playing!');
    process.exit();
  }
}

function playGame() {
  rs.keyIn('Press any key to start the game. ',
    {hideEchoBack:true,mask:""}
  );

  const gameSettings = {
    boardSize: 10,
    availableShips: [
      {type: 'Destroyer', length: 2, amount: 1},
      {type: 'Submarine', length: 3, amount: 1},
      {type: 'Cruiser', length: 3, amount: 1},
      {type: 'Battleship', length: 4, amount: 1},
      {type: 'Carrier', length: 5, amount: 1},
    ],
    numShips: 0,
  };

  gameSettings.numShips = Object.values(gameSettings.availableShips).reduce((acc, ship) => {
    return acc + ship.amount;
  }, 0);

  const game = new Game(gameSettings);

  //console.log(game.board);
  //console.log(game.fleet);

  setupGame(game);
  //console.log(setupGame(game));
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    gameLoop(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}

// *** RUN THE GAME ***  ---------------------------------------------------

  playGame();