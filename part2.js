// *** CURRENT TASKS ***

// TODO Keep in mind that your code cannot place two ships on intersecting paths
// TODO Ship placement should be random (horizontally and vertically placed) and not manually placed by you in the code
// TODO Ships must be placed within the grid boundaries
// TODO The game works as before, except now, all ships must be destroyed to win

// TODO If the ship does not overlap with any existing ships, update the position key of the ship object to include all the tiles that the ship will occupy on the board.

  // TODO If the ship does overlap with an existing ship or does not fit within the boundaries of the board, generate a new random starting position for the ship and repeat the process from step 2.

//-----------------------------------------------------------------------------
// *** FUTURE TASKS ***


  // TODO Check if the ship can fit within the boundaries of the board from its starting position. For example, if the ship is of length 4 and its starting position is [2, 5], then you should check if there are 4 tiles horizontally or vertically from this position on the board.

  // TODO If the ship fits within the boundaries of the board, check if it overlaps with any existing ships on the board. You can do this by checking if any of the tiles that the ship will occupy are already occupied by another ship.

  // TODO Setup a more robust player prompt for hit event, as once longer ships are added to the game board, the player may not always sink the ship.

var rs = require('readline-sync');

function startGame() {
  rs.keyIn('Press any key to start the game. ',
    {hideEchoBack:true,mask:""}
  );
  const game = new Game(gameSettings);
  console.log(game.fleet);
  let fleetHealth = game.fleet.totalHealth;
  while (fleetHealth > 0) {
    playGame(game);
    fleetHealth = game.fleet.totalHealth; 
  }
}

function createGameBoard(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => `${String.fromCharCode(65 + row)}${col + 1}`)
  );
}

class Game {
  constructor() {
    this.gameBoard = new createGameBoard(gameSettings.boardSize);
    this.fleet = new Fleet(gameSettings, this);
    this.numShips = gameSettings.numShips;
    this.guesses = [];
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
  constructor(length, randomTile) {
    this.position = randomTile;
    this.hit = false;
    this.size = length;
  }
}

class Fleet {
  constructor(gameSettings, game) {
    this.ships = [];
    this.totalHealth = 0;
    this.game = game;
    for (let shipType of gameSettings.shipsByType) {
      const enlistShip = gameSettings.availableShipTypes[Object.keys(shipType)[0]];
      for (let i = 0; i < shipType[Object.keys(shipType)[0]]; i++) {
        this.ships.push(new Ship(enlistShip.length, this.getRandomTile()));
      }
    }
  }

  getRandomTile() {
    const oceanArray = this.game.gameBoard;
    const randomSubArrayIndex = Math.floor(Math.random() * oceanArray.length);
    const randomElementIndex = Math.floor(Math.random() * oceanArray[randomSubArrayIndex].length);
    let randomTile = oceanArray[randomSubArrayIndex][randomElementIndex];
    oceanArray[randomSubArrayIndex].splice(randomElementIndex, 1);
    return randomTile;
  }

  addShip(shipType) {
    const { length } = availableShipTypes[shipType];
    const ship = new Ship(length, this.getRandomTile());
    this.ships.push(ship);
    this.totalHealth += length;
  }

  placeShips(board) {
    for (const ship of this.ships) {
      const { size } = ship;
      let isValidPosition = false;
      let positions = [];

      while (!isValidPosition) {
        const startRow = Math.floor(Math.random() * board.grid.length);
        const startCol = Math.floor(Math.random() * board.grid[0].length);
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        positions = board.getShipPositions(startRow, startCol, size, orientation);

        isValidPosition = positions.every((pos) => {
          const [row, col] = pos;
          return board.grid[row][col] === BoardTile.Empty;
        });
      }

      for (const pos of positions) {
        const [row, col] = pos;
        board.placeShip(row, col, ship);
      }

      ship.position = positions;
    }
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

// *** SET UP GAME ***

const gameSettings = {
  numShips: 5, // total number of ships in the fleet
  shipsByType: [
    {1: 1}, // destroyers: number of
    {2: 1}, // submarines: number of
    {3: 1}, // cruisers: number of
    {4: 1}, // battleships: number of
    {5: 1}, // carriers: number of
  ],
  boardSize: 10,
  availableShipTypes: {
  1: {shipType: 'Destroyer', length: 2},
  2: {shipType: 'Submarine', length: 3},
  3: {shipType: 'Cruiser', length: 3},
  4: {shipType: 'Battleship', length: 4},
  5: {shipType: 'Carrier', length: 5},
  }
};

// *** RUN THE GAME ***

  startGame();
