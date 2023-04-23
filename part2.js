var rs = require('readline-sync');

/// *** GAME CLASSES *** ---------------------------------------------------

class Game {
  constructor(gameSettings) {
    this.gameSettings = gameSettings;
    this.board = this.createBoard(); //this will be used for GUI in the future
    this.fleet = new Fleet(gameSettings, this);
    this.tiles = this.createTiles();

    for (let i = 0; i < gameSettings.numShips; i++) {
      const shipType = gameSettings.availableShips[i];
      this.fleet.addShip(shipType.type);
    }
    
    this.guesses = [];
    this.numOfGuessByPlayer = 0;
  }

  createBoard() {
    return Array.from({ length: this.gameSettings.boardSize }, (_, row) =>
      Array.from({ length: this.gameSettings.boardSize }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
    );
  }

  isGameOver() {
    return this.fleet.totalHealth === 0;
  }

  createTiles() {
    let tiles = {};
    for (let i = 0; i < this.gameSettings.boardSize; i++) {
      for (let j = 0; j < this.gameSettings.boardSize; j++) {
        let tile = {
          tileName: String.fromCharCode(65 + i) + (j + 1),
          occupiedTile: false,
        };
        tiles[tile.tileName] = tile;
      }
    }
    return tiles; 
  }
}

class Ship {
  constructor(length, game) {
    this.hit = false;
    this.size = length;
    this.health = this.size;
    this.isPlaced = false;
    this.occupiedTiles = [];
  }
}

class Fleet {
  constructor(gameSettings) {
    this.ships = [];
    this.numShips = gameSettings.numShips;
    this.totalHealth = gameSettings.numShips;
    this.availableShips = gameSettings.availableShips;
  }

  addShip(shipType) {
    const { length } = this.availableShips.find(s => s.type === shipType);
    const ship = new Ship(length, this.game);
    this.ships.push(ship);
  }

  getShipByTile(tile) {
    return this.ships.find(ship => ship.occupiedTiles.includes(tile));
  }
}

/// *** GAME FUNCTIONS *** ---------------------------------------------------

function setupGame(game) {
  let boardSize = game.gameSettings.boardSize;
  let ships = game.fleet.ships;
  let tiles = game.tiles;

  function canPlaceShip(ship, startingTile, direction) {
    let row = startingTile.charCodeAt(0) - 65;
    let col = parseInt(startingTile.substr(1)) - 1;

    for (let i = 0; i < ship.size; i++) {
      let currentTile;
      if (direction === 'horizontal') {
        currentTile = String.fromCharCode(65 + row) + (col + i + 1);
      } else {
        currentTile = String.fromCharCode(65 + row + i) + (col + 1);
      }

      if (!tiles[currentTile] || tiles[currentTile].occupiedTile) {
        return false;
      }
    }

    return true;
  }

  ships.forEach(ship => {
    while (!ship.isPlaced) {
      let length = ship.size;

      let row = Math.floor(Math.random() * boardSize);
      let col = Math.floor(Math.random() * boardSize);
      let startingTile = String.fromCharCode(65 + row) + (col + 1);

      let directions = ['horizontal', 'vertical'];
      let directionIndex = Math.floor(Math.random() * directions.length);
      let direction = directions[directionIndex];

      let canBePlaced = canPlaceShip(ship, startingTile, direction);

      if (canBePlaced) {
        for (let i = 0; i < length; i++) {
          let currentTile;
          if (direction === 'horizontal') {
            currentTile = String.fromCharCode(65 + row) + (col + i + 1);
          } else {
            currentTile = String.fromCharCode(65 + row + i) + (col + 1);
          }

          ship.occupiedTiles.push(currentTile);
          tiles[currentTile].occupiedTile = true;
        }
        ship.isPlaced = true;
      }
    }
  });
}

function playerTurn(playerInput, game) {
  playerInput = playerInput.toUpperCase();
  let tiles = game.tiles;

  if (game.guesses.includes(playerInput)) {
    console.log("You have already picked this location. Miss!");
    return;
  }

  game.guesses.push(playerInput);
  game.numOfGuessByPlayer += 1; //this is for future development of an accuracy rating

  if (tiles[playerInput] && tiles[playerInput].occupiedTile) {
    const ship = game.fleet.getShipByTile(playerInput);
    if (ship.health > 1) {
      ship.health--;
      console.log("Hit!");
    }
    else if (ship.health === 1) {
      ship.health--;
      if (game.fleet.totalHealth > 1) {
        game.fleet.totalHealth--;
        game.fleet.numShips--;
        const shipsRemaining = game.fleet.numShips === 1 ? 'ship' : 'ships';
        console.log(`Hit! You have sunk a battleship. ${
            game.fleet.numShips
          } ${shipsRemaining} remaining.`);
      }
      else {
        game.fleet.totalHealth--;
        console.log("Hit. You have sunk all battleships!");
        return;
      }
    }
  } else {
    console.log("Miss!");
  }
}

function gameLoop(game) {
  while (!game.isGameOver()) {
    let playerInput = rs.question("Enter a location to strike i.e. 'A2': ", {
      limit: /^[a-jA-J]([0-9]|10)$/,
      limitMessage: 'Sorry, $<lastInput> is not allowed.'
    });
    playerTurn(playerInput, game);
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

  setupGame(game);
  console.log(game.fleet.ships);
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    gameLoop(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}

// *** RUN THE GAME ***  ---------------------------------------------------

  playGame();