/** ==================================================
 *  CMSI 185 - Final Project - K'torigins
 *  ==================================================
 *  Author 1: Grayson McKim
 *  UID 1:    994211844
 *  Author 2: Elise Sawan // Only if working in
 *  UID 2:    912235572  // group
 *  Author 2: Andrew Seaman // Only if working in
 *  UID 2:    964099798  // group
 *  Author 2: Salem Tesfu // Only if working in
 *  UID 2:    923828704  // group
 */


// ---------------------------------------------------
// PAGE ELEMENT CONFIGURATION
// Store the relevant HTML entities for reference here
// ---------------------------------------------------
    // General Selectors
let lobbyCont  = document.querySelector("#lobby-container"),
    gameCont   = document.querySelector("#game-container"),
    loading    = document.querySelector("#loading"),

    // Lobby Selectors
    configButt = document.querySelector("#config-launch"),
    charSelect = "[name=char-select]:checked",
    diffSelect = "[name=diff-select]:checked",

    // Game Selectors
    timeLeft   = document.querySelector("#game-timer"),
    healthLeft = document.querySelector("#game-health"),
    currRound  = document.querySelector("#game-round"),
    mazeCont   = document.querySelector("#game-maze"),

    //Changing between game and cut scenes
    gameScreen = document.querySelector("#game-container"),
    cutscene = document.querySelector("#cutscene"),
    music = document.getElementById("YenrofSound"),
    // Any relative paths to game assets, including images,
    // sounds, etc.
    assets = {
      images: {
        architect: "./assets/images/architect.png",
        zombie: "./assets/images/zombie.png",
        wall: "./assets/images/wall.png",
        health: "./assets/images/sunglasses.PNG",
      }
    },

    // Global objects
    activeGame,
    activeP5,
    message,

    // Default maze in the case where there is no user-
    // specifiable arena
    campaignMaze = [
      "XXXXXXXXXXXXX",
      "XZ....X....ZX",
      "X...........X",
      "X...X...X...X",
      "X.....P.....X",
      "X...X...X...X",
      "X...........X",
      "XZ....X....ZX",
      "XXXXXXXXXXXXX"
    ],
    // Size of each cell rendered by p5; shrink to make
    // larger maps fit on the screen!
    cellDims = 60;


// ---------------------------------------------------
// GRAPHICS CONFIGURATION
// We'll use the following Graphics functions to
// configure p5
// ---------------------------------------------------

/*
 * Configures an "on demand" version of p5 that begins
 * executing its draw loop when a new game is started,
 * rather than when the page loads (the default use)
 * NOTE: This means all interfacing with p5 is done
 * through the global activeP5 variable
 */
function setupP5 (p) {

  p.setup = function () {
    let canvasHeight = activeGame.rows * cellDims,
        canvasWidth  = activeGame.cols * cellDims;
    p.createCanvas(canvasWidth, canvasHeight);

    // Setup assets as p5 image handles
    assets.p5Images = {};
    for (let im in assets.images) {
      assets.p5Images[im] = p.loadImage(assets.images[im]);
    }
    p.textAlign(p.CENTER, p.CENTER);
  }

  p.draw = function () {
    if (!activeGame) { return; }
    p.background(0);
    p.drawKtahbjects();
    p.writeMessage();
  }

  p.writeMessage = function () {
    if (message) {
      p.fill("red");
      p.textSize(40);
      p.text(message, p.width/2, p.height/4);
    }
  }

  p.drawKtahbjects = function () {
    activeGame.forEachKtahbject((k, r, c) => {
      p.image(assets.p5Images[k.asset], c*cellDims, r*cellDims, cellDims, cellDims);
    });
  }

}


// ---------------------------------------------------
// INTERFACE CONFIGURATION
// We'll use the following functions to communicate
// with the user and collect their input
// ---------------------------------------------------

function beginGameLoad () {
  lobbyCont.style.display = "none";
  loading.style.display = "";
  mazeCont.innerHTML = "";
  timeLeft.value = 100;
  healthLeft.value = 100;
}

function endGameLoad () {
  loading.style.display = "none";
  gameCont.style.display = "";
}

function updateHealth (percentage) {
  healthLeft.value = Math.floor(percentage * 100);
}

function updateTimer (percentage) {
  timeLeft.value = Math.floor(percentage * 100);
}

function updateRound (round) {
  currRound.innerHTML = round;
}

function endGame () {
  gameCont.style.display = "none";
  lobbyCont.style.display = "";
  mazeCont.innerHTML = "";
}

function _key_listener (event) {
  event.preventDefault();
  let player = activeGame.player,
      r = player.r,
      c = player.c;
  switch (event.key) {
    case "a": c--; break;
    case "s": r++; break;
    case "d": c++; break;
    case "w": r--; break;
    case " ": activeGame.player.useAbility(); return;
  }
  activeGame.player.moveTo(r, c);
}

/*
 * Configures the keyboard event handlers for the player;
 * we'll use the standard asdw movement
 */
function bindPlayerKeys () {
  document.addEventListener("keypress", _key_listener);
}

/*
 * Removes the keybindings for the player controls
 */
function removePlayerKeys () {
  document.removeEventListener("keypress", _key_listener);
}


// ---------------------------------------------------
// LOBBY CONFIGURATION
// We'll handle all setup options here
// ---------------------------------------------------

// Configure the game initialization
function initGame (config) {
  beginGameLoad();
  activeGame = new Game(config);
  activeP5 = new p5(setupP5, "game-maze");
  endGameLoad();
};

// Configure the launch button below:
configButt.onclick = function () {
  let maze = campaignMaze,
      character = document.querySelector(charSelect).value,
      difficulty = document.querySelector(diffSelect).value;

  if (!isValidMaze(maze)) {
    alert("[X] Your maze is malformed. Please see the requirements for a valid maze to play.");
    return;
  }

  // If we make it here, then the game is good to go! Create a
  // new game object in our global activeGame to start
  initGame({
    maze: maze,
    char: character,
    diff: difficulty
  });
}


// ---------------------------------------------------
// KTAHBJECT SUPERCLASS
// The following classes will represent all of our
// interactive objects in the game itself
// ---------------------------------------------------

class Ktahbject {
  constructor (r, c, game) {
    // TODO Ktahbjects have 4 properties:
    // r: the row of the ktahbject
    // c: the column of the ktahbject
    // game: a reference to the game in which it's housed
    // health: by default, 100
    // Set these properties here
    this.r = r,
    this.c = c,
    this.game = game,
    this.health = 100;
  }

  /*
   * Moves the current Ktahbject from its current location
   * to the one at the given row and col
   */
  moveTo (row, col) {
    // TODO Create a variable called target that gets the
    // object(s) at the requested row, col
    // [!] see Game's getKtahbjectsAt method
    //let target = ???;
   let target = this.game.getKtahbjectsAt(row, col);

    // TODO set a property called facing on this object
    // that is an object with 2 properties: r and c
    // This property represents which way the moved
    // ktahbject is facing. For example, if it just moved
    // left, then this.facing = {r: 0, c: -1}; if it just
    // moved up, then this.facing = {r: -1, c: 0}, etc.
    // this.facing = {r: ???, c: ???};
    // We'll use the facing property when a player uses
    // their ability, and that ability must occur in a given
    // direction compared to where they're facing
    this.facing = {
      r: row - this.r,
      c: col - this.c
    };

    // TODO Only move if the spot is open; check to see if
    // the target is an empty location; if it is, then
    // we can move to the requested spot; if it isn't, then
    // do nothing!
    if (target.length === 0) {
         // Uncomment and leave the following two lines as-is:
         this.game.addAt(this, row, col);
         this.game.eraseAt(this, this.r, this.c);

         // TODO set this ktahbject's r to row and c to col
        this.r = row;
        this.c = col;
    }
  }
}

class PowerUp extends Ktahbject {
  constructor(r, c, game) {
    super(r,c,game);
    this.asset = "health";
  }

  addHealth() {

  }
}

// ---------------------------------------------------
// PLAYER CLASS
// The Player object will be used to track the Player's
// state during the game, including its used abilities
// ---------------------------------------------------

// TODO Change the Player class definition to inherit from Ktahbject
class Player extends Ktahbject{
  constructor (r, c, game) {
    // TODO Since Player is a subclass of Ktahbject, call the superclass'
    // constructor with the same parameters here:
    super (r, c, game);
    // Leave these lines as-is:
    this.asset = this.character = this.game.character;
    this.facing = {r: -1, c: 0}; // Default: facing up
    this.cooldown = 0;
  }

  /*
   * Players who are adjacent to a Zombie at a game tick
   * will take damage proportional to the difficulty of
   * the game. If the player's health is reduced below 0,
   * then the game will end.
   * All damage updates the health bar of the player using
   * the updateHealth function.
   */
  getEaten () {
    // TODO reduce this player's health property by the amount
    // decided in the game instance's playerDamage property
    // ???
    this.health -= this.game.playerDamage;
    // TODO update the health bar with the percentage of the player's
    // remaining health, out of a maximum 100
    // [!] updateHealth(percentage)
    // ???
    updateHealth(this.health/100);

    // TODO if the player's health is <= 0, then have the game end
    // in defeat
    // if (???) {
    //   [!] See Game class methods for how to end the game!
    // }
    if (this.health <= 0) {
      this.game.end();
    }
  }

  /*
   * Players can use their character's ability as long as it
   * isn't on cooldown, which lasts some number of difficulty-
   * adjusted ticks
   */
  useAbility () {
    let triggerCooldown = false;
    if (this.cooldown === 0) {
      switch (this.character) {
        case "architect":
          let wallLoc = {r: this.r + this.facing.r, c: this.c + this.facing.c},
              objsAtLoc = this.game.getKtahbjectsAt(wallLoc.r, wallLoc.c);

          // TODO if there's nothing in objsAtLoc, then it's clear and
          // ready to have a wall placed in it!
          // if ( ??? )
          if (objsAtLoc.length === 0) {
            // TODO create a new Wall object at the given wallLoc
            // let newWall = new Wall( ??? );
            let newWall = new Wall(wallLoc.r, wallLoc.c, this.game, false);
            // TODO add the newWall to the game's ktahbjects:
            // [!] this.game.ktahbjects
            // ???
            this.game.addAt(newWall, wallLoc.r, wallLoc.c);
            // Uncomment, then leave this line as-is:
             triggerCooldown = true;
          // }
          break;
      }
    }
    if (triggerCooldown) { this.cooldown += this.game.cooldown; }
  }
}

  /*
   * A player's act on a given tick reduces their cooldown by
   * 1, but to a min of 0
   */
  act () {
    // TODO simple: set this Player's cooldown to
    // the max of 0 and this.cooldown - 1
    // [!] Math.max
    // this.cooldown = ???;
    this.cooldown --;
    this.cooldown = Math.max(0, this.cooldown);
  }
}


// ---------------------------------------------------
// ZOMBIE CLASS
// The Ktahmbies themselves! All state related to each
// Zombie in the game will be templated here
// ---------------------------------------------------

// TODO Change the Zombie class definition to inherit from Ktahbject
class Zombie extends Ktahbject{
  constructor (r, c, game) {
    // TODO Since Zombie is a subclass of Ktahbject, call the superclass'
    // constructor with the same parameters here:
    // ???
    super (r, c, game);
    // Leave this line as-is:
    this.asset = "zombie";
  }

  /*
   * A Zombie acts at every tick, performing the following:
   * 1) Ensure that the zombie is removed if its health is <= 0
   * 2) Checks if a player is adjacent to them, if so, the
   *    player will take damage
   * 3) If the player is NOT adjacent, the Zombie moves in
   *    a random direction: up, down, left, or right; if the
   *    direction chosen is blocked (by a wall or zombie),
   *    then this Zombie does nothing for this tick
   */
  act () {
    if (this.health <= 0) {
      // TODO Satisfy act requirement #1:
      // If this Zombie is dead, then remove it from the game,
      // and then return from this function
      // [!] this.game.eraseAt
      // ???
      this.game.eraseAt(this, this.r, this.c);
    }

    let r = this.r,
        c = this.c,
        // Lists all of the putative directions the Zombie can move
        dirs = [{r:0, c:1}, {r:0, c:-1}, {r:1, c:0}, {r:-1, c:0}],
        // Chooses one of those at random
        chosenDir = dirs[Math.floor(Math.random()*4)],
        // Provides a row, col coordinate of the desired location to move
        toMoveTo = {r: r + chosenDir.r, c: c + chosenDir.c};
    // TODO Satisfy act requirement #2: check if the Player is
    // in any of the adjacent cells to the Zombie, and if so,
    // have the Player get eaten and *return* from this function
    // immediately after
    // [!] this.game.player
    // [!] this.game.player.getEaten
    // [!] activeP5.dist  // p5's dist method!
    // ??? (this will be an if statement with stuff inside)
    if (activeP5.dist(r, c, this.game.player.r, this.game.player.c) <= 1) {
      this.game.player.getEaten();
    }


    // TODO Satisfy act requirement #3: move the Zombie. If we
    // reach here, then we know the Player is not adjacent to the
    // Zombie, and it is still alive, so move it to the location
    // we made in toMoveTo above
    // [!] this.moveTo
    // ???
    this.moveTo(toMoveTo.r, toMoveTo.c);
  }
}

// ---------------------------------------------------
// BUBBLES class
// Boss Zombie, shoots projectiles and speeds up each time he
// appears
// ---------------------------------------------------
class Bubbles extends Zombie {
  constructor (r, c, game) {
    super(r, c, game);
  }

  act() {
    let r = this.r,
        c = this.c,
        dirs = [{r:0, c:1}, {r:0, c:-1}, {r:1, c:0}, {r:-1, c:0}],
        chosenDir = dirs[Math.floor(Math.random()*4)],
        toMoveTo = {r: r + chosenDir.r, c: c + chosenDir.c};
    if (activeP5.dist(r, c, this.game.player.r, this.game.player.c) <= 1) {
      this.game.player.getEaten();
    }
    this.moveTo(toMoveTo.r, toMoveTo.c);
  }

}
// ---------------------------------------------------
// WALL CLASS
// Used to model the game's boundaries and impassable
// barriers... can also be used for Architect's walls!
// ---------------------------------------------------

// TODO Change the Wall class definition to inherit from Ktahbject
class Wall extends Ktahbject {
  // [!] Below, permanent is an *optional* parameter, meaning
  // that it will have the value given (true) if the user does
  // not specify it, otherwise, it attains the value of an
  // entered argument; use this parameter to distinguish permanent
  // walls from those constructed by the Architect
  constructor (r, c, game, permanent = true) {
    // TODO Since Wall extends Ktahbject, call the superclass'
    // constructor with the same parameters here:
    // ???
    super (r, c, game);
    // TODO: If the wall is NOT permanent (i.e., was made
    // by the architect) set its health to 5 here
    // ???
    if (!permanent){
      this.health = 5;
    }

    // Leave these lines as-is:
    this.asset = "wall";
    this.permanent = permanent;
  }

  /*
   * Walls "act" by losing 1 health every tick IF
   * they are not permanent. This allows us to make
   * temporary ones via the Architect. Kill the wall
   * if its health is <= 0
   */
  act () {
    // TODO remove 1 health from this wall IF it is
    // not permanent
    // ???
   if (!this.permanent){
     this.health --;
   }
    // TODO if this wall's health is <= 0, then remove
    // it from the game
    if ( this.health <= 0 ) {
       this.game.eraseAt(this, this.r, this.c);
    }
  }
}


// ---------------------------------------------------
// GAME CLASS CONFIGURATION
// We'll use the following Game class to configure all
// of our setup and gameplay
// ---------------------------------------------------

class Game {

  /*
   * A Game instance will be passed a configuration, which
   * is a JS Object containing properties needed for
   * setup. These properties include:
   *   - maze: the user's input Maze, to be parsed into
   *           individual Ktahbjects
   *   - char: the character class selected by the user
   *   - diff: the difficulty setting chosen by the user
   *
   * All property values in the config param are assumed
   * to be valid. Any invalid input will be handled by
   * our lobby configuration below
   */
  constructor (config) {
    let maze = config.maze,
        diffs = ["ktrivial", "ktolerable", "kterrible"],
        diffMultiplier,
        game = this;

    // We'll save each Ktahbject in the Game's state;
    // Important: ktahbjects is an array of arrays of arrays,
    // structured as: ktahbjects[rows][cols][objects]
    this.ktahbjects = [];
    this.player = null;

    this.difficulty = config.diff;
    this.character = config.char;
    this.rows = maze.length;
    this.cols = maze[0].length;
    this.round = 0;
    this.nZoms = 0;

    // Save the amount of damage a player takes from
    // getting eaten, the length of a tick, and the
    // amount of time needed to survive based on difficulty
    diffMultiplier    = diffs.indexOf(this.difficulty);
    this.playerDamage = (diffMultiplier + 2) * 5;
    this.cooldown     = (diffMultiplier + 2) * 3;
    this.tickLength   = (3 - diffMultiplier) * 200 + 500;
    this.surviveTime  = 5;//(diffMultiplier + 1) * 15 + 10;
    this.timerMax     = this.surviveTime;

    // Parse each cell's contents to create a new
    // Ktahbject of the given type
    for (let r = 0; r < this.rows; r++) {
      let ktahbjectRow = this.ktahbjects[r] = [],
          mazeRow = maze[r];
      for (let c = 0; c < this.cols; c++) {
        let ktahbjectCol = ktahbjectRow[c] = [],
            mazeCell = mazeRow[c];

        switch (mazeCell) {
          case "P":
            // We'll track the player separately for
            // convenience, but they'll also be in the
            // ktahbjects array

            // TODO Create a new Player instance and save it
            // within the game's player property
            // ???
            this.player = new Player (r, c, this);

            // TODO add that newly created player object to the
            // ktahbjects array
            // [!] this.addAt (look at that)
            this.addAt(this.player, r, c);
            break;
          case "Z":
            // TODO Create a new Zombie instance and push it into
            // the game's ktahbjects array, and increments
            let newZombie = new Zombie (r, c, this);
            // [!] this.addAt
            // [!] this.nZoms
            // ???
            this.addAt(newZombie, r, c);
            this.nZoms++;
            break;
          case "X":
            // TODO Create a new Wall instance and push it into
            // the game's ktahbjects array
            let newWall = new Wall (r, c, this);
            // [!] this.addAt
            // ???
            this.addAt(newWall, r, c);
            break;
        }
      }
    }

    // Configure the newly created Player's movement
    bindPlayerKeys();
    updateRound(this.round);

    // Start the game!
    this.ticking = setInterval(function () { game.doTick(); }, this.tickLength);
  }

  pauseGame () {
    clearInterval(this.ticking);
    gameScreen.style.display = "none";
  }

  resumeGame () {
    this.ticking = setInterval(function () { this.doTick.bind(game); }, this.tickLength);
    gameScreen.style.display = "block";
  }

  /*
   * Adds the given ktahbject to the maze in the position specified;
   * useful for moving ktahbjects from one location to another,
   * or for creating them for the first time
   */
  addAt (ktahbject, row, col) {
    this.ktahbjects[row][col].push(ktahbject);
  }

  /*
   * Erases the given ktahbject in the position specified;
   * useful for moving ktahbjects from one location to another
   * when you know their origin.
   */
  eraseAt (ktahbject, row, col) {
    let index = this.ktahbjects[row][col].indexOf(ktahbject);
    if (index !== -1) {
      this.ktahbjects[row][col].splice(index, 1);
    }
    return index !== -1;
  }

  /*
   * Kills all objects of a particular ClassType, as specified by
   * the parameter. Useful for cleaning up zombies in between
   * rounds.
   */
  killAll (Type) {
    this.forEachKtahbject((k, r, c) => {
      if (k instanceof Type) {
        this.eraseAt(k, r, c);
      }
    });
  }

  /*
   * Returns the ktahbjects at the requested row and col
   */
  getKtahbjectsAt (row, col) {
    return this.ktahbjects[row][col];
  }

  /*
   * Helper to iterate over all Ktahbjects currently stored
   * in the game; will call the given function specified
   * by the behavior parameter with each Ktahbject
   */
  forEachKtahbject (behavior) {
    for (let row in this.ktahbjects) {
      for (let col in this.ktahbjects[row]) {
        for (let k of this.ktahbjects[row][col]) {
          behavior(k, row, col);
        }
      }
    }
  }

  /*
   * The main control for zombies and game mechanics, the
   * game will periodically (depending on the difficulty)
   * instruct zombies to move, and check if the player has
   * survived / died yet
   */
  doTick () {
    if (!activeGame) { return; }
    let actors = new Set();
    this.forEachKtahbject((k) => actors.add(k));
    actors.forEach((k) => k.act());
    this.surviveTime--;
    updateTimer(this.surviveTime / this.timerMax);
    if (this.surviveTime <= 0) {
      this.nextRound();
    }
  }

  //Pause and resume the Game methods

  pauseGame () {
  clearInterval(this.ticking);
  gameScreen.style.display = "none";
  cutscene.style.display = "grid";
}

resumeGame(game) {
  game.doTick.bind(game);
  cutscene.style.display = "none";
  game.ticking = setInterval(
  function() {
    game.doTick();
  }, game.tickLength);
  gameScreen.style.display = "";
}

  /*
   * Called after a player survives a round; will kill all
   * remaining zombies and respawn them after a short delay,
   * thus beginning the next round
   */
  nextRound () {
    this.killAll(Zombie);
    this.playerDamage++;
    this.nZoms++;
    this.timerMax++;
    this.round++;
    this.surviveTime = this.timerMax;
    if (this.round <= 13) {
    message = "K'tah sleeps... for now...";
    } else {
    message = "Does the K'tah sleep?"
    }
    updateRound(this.round);

    // Dramatic delay before next round
    setTimeout(() => {
      message = "";
      // TODO: Respawn this.nZoms in random locations
      // around the map -- the shock factor that only
      // K'tah! can deliver
      // [!] this.addAt
      // ???
      // this.addAt(new Zombie, Math.floor(Math.random()*9), Math.floor(Math.random()*13));
      for (let i=0; i < this.nZoms; i++){
        let r = Math.floor(Math.random()*this.rows),
            c = Math.floor(Math.random()*this.cols);
        // [!] this.addAt
        // [!] this.nZoms
        // ???
        // console.log(getKtahbjectsAt(r,c));
        if (this.getKtahbjectsAt(r,c).length === 0){
            let newZombie = new Zombie (r, c, this);
            this.addAt(newZombie, r, c);
        }else{
          i--;
        }

      }

    }, 3000);
    if (this.round===1) {
      music.src="heatingUp.mp3";
      this.pauseGame();
      displayScene(keck0);
    } else if (this.round===5) {
      music.src="heatingUp.mp3";
      this.pauseGame();
      displayScene(volleyball0);
    } else if (this.round===9) {
      music.src="heatingUp.mp3";
      this.pauseGame();
      displayScene(keckLab0);
    } else if (this.round===13) {
      music.src="heatingUp.mp3";
      this.pauseGame();
      displayScene(final0);
    }
}

  /*
   * Terminates the current game with a score summary
   */
  end () {
    removePlayerKeys();
    clearInterval(this.ticking);
    if (this.round < 12) {
    alert(`Yenrof destroyed you! \n Your identity was stolen day ${this.round} of the apocalypse.`);
  } else {
    alert(`Bubbles was too much! \n You lasted ${this.round} days into his terror!`)
  }
    endGame();
  }

}


// ---------------------------------------------------
// HELPER FUNCTIONS
// Any functions that make your life easier here!
// ---------------------------------------------------

/*
 * isValidMaze checks to make sure a given maze (as
 * described in the spec) meets a variety of validity
 * criteria, and returns true if all are met:
 *   1. All rows have same number of cols
 *   2. First and last rows are all "X"
 *   3. First and last cols of every row are "X"
 *   4. Exactly 1 player starting location
 *   5. At least 1 zombie starting location
 *   6. No invalid cell contents
 */
function isValidMaze (maze) {
  // Helper function: returns true if and only if the
  // given row contains only the "X" character
  let isAllXRow = function (row) {
        if (!row) { return false; }
        for (let r of row) {
          if (r !== "X") { return false; }
        }
        return true;
      },

      // Helper function: returns true if and only if the
      // given row's first and last cell are "X"
      hasXBorder = function (row) {
        return row[0] === "X" && row[row.length - 1] === "X";
      },

      playerCount = 0,
      zombieCount = 0,
      columnCount = maze[0] && maze[0].length;

  // [Criteria 2 Check]
  if (!(isAllXRow(maze[0]) && isAllXRow(maze[maze.length - 1]))) {
    return false;
  }

  for (let currRow of maze) {
    // [Criteria 1 Check]
    if (currRow.length !== columnCount) { return false; }

    // [Criteria 3 Check]
    if (!hasXBorder(currRow)) { return false; }

    for (let cell of currRow) {
      switch (cell) {
        case "P":
          playerCount++;
          // [Criteria 4 Check]
          if (playerCount > 1) { return false; }
          break;
        case "Z":
          zombieCount++;
          break;
        case "X":
        case ".":
          break;
        // [Criteria 6 Check]
        default:
          return false;
      }
    }
  }

  // [Criteria 4, 5 Check]
  return zombieCount >= 1 && playerCount === 1;
}

//CUTSCENES

let i = 0,
    txt = 'Dramatic text coming on the screen',
    speed = 150,
    img = document.getElementById("image"),
    currentImage,
    gChoice1Path = "",
    gChoice2Path = "",
    body = document.getElementById("body");

let final15 = {
  text: "Yenrof has three stack overflow points | Plus he always writes bad code | and then forces it over mine during merge conflicts in github | I think I'll take my chances!",
  image: "cutsceneImages/destroyedForney.png",
  choice1Path: "End",
  cutscene: 4,
}

let final14 = {
  text: "This is getting spicy!",
  image: "cutsceneImages/endtoal.png",
  choice1Path: final15,
  cutscene: 4,
}

let final13 = {
  text: "I desire your soul, Forney | Perhaps we can come to an agreement... | Yenrof's soul for yours?",
  image: "cutsceneImages/bubbles.png",
  choice1Path: final14,
  cutscene: 4,
  animation: "fastShake"
}

let final12 = {
  text: "Are you kidding me?",
  image: "cutsceneImages/destroyedForney.png",
  choice1Path: final13,
  cutscene: 4,
}

let final11 = {
  text: "Go get 'em, champ | You're doing great!",
  image: "cutsceneImages/endtoal.png",
  choice1Path: final12,
  cutscene: 4,
}

let final10 = {
  text: "Is that Mas- the K'tah?",
  image: "cutsceneImages/destroyedForney.png",
  choice1Path: final11,
  cutscene: 4,
}

let final9 = {
  image: "cutsceneImages/bubbles.png",
  choice1Path: final10,
  cutscene: 4,
  animation: "fastShake"
}

let final8 = {
  text: "Your zombies are weak | And their palms are sweaty | Spaghetti... something... | So I'll do this myself!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: final9,
  cutscene: 4,
  animation: "slowShake",
}

let final7 = {
  text: "Damn! | What a plot twist!",
  image: "cutsceneImages/endtoal.png",
  choice1Path: final8,
  cutscene: 4,
}

let final6 = {
  text: "Ha! | Foolish mortal! | You think you can send the K'tah back to the credits? | I thought better of you | Once the K'tah is alive, it never sleeps!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: final7,
  cutscene: 4,
  animation: "slowShake",
}

let final5 = {
  text: "Inferior sum, | Inferior sum,",
  image: "cutsceneImages/yenrof.png",
  choice1Path: final6,
  cutscene: 4,
}

let final4 = {
  text: "Even though you have a good taste in movies | It is not enough to save you from your treachery! | I know that with the raw CS power of Forney | You would come after me next!!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: final5,
  cutscene: 4,
  animation: "slowShake",
}

let final3 = {
  text: "I would never think of betraying you | I sat through all of 'Alive or Dead' just to find your summoning call!",
  image: "cutsceneImages/yenrof.png",
  choice1Path: final4,
  cutscene: 4,
}

let final2 = {
  text: "NO YENROF | I AM HERE FOR YOU! | The man in sunglasses came and told me of your treachery!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: final3,
  cutscene: 4,
  animation: "slowShake",
}

let final1 = {
  text: "They are almost finished master | Look at him | He's down to almost one stack overflow point!",
  image: "cutsceneImages/yenrof.png",
  choice1Path: final2,
  cutscene: 4,
}

let final0 = {
  text: "Y E N R O F!!!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: final1,
  cutscene: 4,
  animation: "slowShake",
}





let keckLab13 = {
  text: "The ancient power flows through me! | I am the K'tah | You are next Forney | You and your precious Stack Overflow points are mine!!",
  image: "cutsceneImages/yenrof.png",
  choice1Path: "End",
  cutscene: 3,
}

let keckLab12 = {
  text: "It seems that these cutscenes happen every 4 rounds. | So I'll probably finish then.",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab13,
  cutscene: 3,
}

let keckLab11 = {
  text: "Maybe the K'tah will vanquish him! | Hurry go quick!",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab12,
  cutscene: 3,
}

let keckLab10 = {
  text: "Well, if I can get the K'tah to turn on him | Maybe...",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab11,
  cutscene: 3,
}

let keckLab9 = {
  text: "It wouldn't be the first time",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab10,
  cutscene: 3,
}

let keckLab8 = {
  text: "I bet he sold his soul to the K'tah",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab9,
  cutscene: 3,
}

let keckLab7 = {
  text: "Speed it up a bit! | I am about to become the whole-brain bread to this zom-burger",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab8,
  cutscene: 3,
}

let keckLab6 = {
  text: "And you know how all the zombies look like Yenrof?",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab7,
  cutscene: 3,
}

let keckLab5 = {
  text: "Yes?",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab6,
  cutscene: 3,
}

let keckLab4 = {
  text: "You know how he summoned the boss from the depths of IMDb?",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab5,
  cutscene: 3,
}

let keckLab3 = {
  text: "Tell me",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab4,
  cutscene: 3,
}

let keckLab2 = {
  text: "Forney | If you can hold him off a bit longer | I have a plan",
  image: "cutsceneImages/endtoal.png",
  choice1Path: keckLab3,
  cutscene: 3,
}

let keckLab1 = {
  text: "They did call me four-knees in high school...",
  image: "cutsceneImages/beatupforney.png",
  choice1Path: keckLab2,
  cutscene: 3,
}

let keckLab0 = {
  text: "Damn it! Damn it! Damn it! | How are you so fast Forney?",
  image: "cutsceneImages/yenrof.png",
  choice1Path: keckLab1,
  cutscene: 3,
}








let volleyball20 = {
  text: "Of cour- | I mean, we can only assume so. | We need to think of something to stop him...",
  image: "cutsceneImages/toal_xmas.png",
  choice1Path: "End",
  cutscene: 2
}

let volleyball19 = {
  text: "Is that the K'tah?",
  image: "cutsceneImages/builderforney.png",
  choice1Path: volleyball20,
  cutscene: 2,
}

let volleyball18 = {
  text: "Thank you master! | Ego sum stutus | Ego sum stutus | Ego sum stutus",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball19,
  cutscene: 2,
}

let volleyball17 = {
  text: "So be it! | Say the encantation!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: volleyball18,
  cutscene: 2,
  animation: "slowShake",
}

let volleyball16 = {
  text: "It's not my fault that Forney got all the intellegence | Please help me end him!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball17,
  cutscene: 2,
}

let volleyball15 = {
  text: "The (Artificial) Intellegence of your spawn | Is based off of your own intellegence",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: volleyball16,
  cutscene: 2,
  animation: "slowShake",
}

let volleyball14 = {
  text: "How was I supposed to know he could build walls? | And my spawn just go in random directions | They don't even chase him!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball15,
  cutscene: 2,
}

let volleyball13 = {
  text: "Do you know how long it takes to teleport from IMDb? | Didn't I tell you I wanted him Alive or Dead | But preferably dead!!",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: volleyball14,
  cutscene: 2,
  animation: "slowShake",
}

let volleyball12 = {
  text: "Master! | Ev.. Everything is going great! | Th.. The Plan is going fatastically",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball13,
  cutscene: 2,
}

let volleyball11 = {
  text: "Who has disrupted my slumber!?",
  image: "cutsceneImages/darkenedBubbles.png",
  choice1Path: volleyball12,
  cutscene: 2,
  animation: "slowShake",
}

let volleyball10 = {
  text: "Wouldn't you like to know?",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball11,
  cutscene: 2,
}

let volleyball9 = {
  text: "The K'tah? Who is the K'tah?",
  image: "cutsceneImages/builderforney.png",
  choice1Path: volleyball10,
  cutscene: 2,
}

let volleyball8 = {
  text: "(Under breath) K'tah, K'tah, K'tah, K'tah",
  image: "cutsceneImages/toal_xmas.png",
  choice1Path: volleyball9,
  cutscene: 2,
}

let volleyball7 = {
  text: "Stop desecrating the sacred name!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball8,
  cutscene: 2,
}

let volleyball6 = {
  text: "Wait, wait, wait | K'torgins is before K'tah | I wasn't supposed to know that yet. | That's my bad.",
  image: "cutsceneImages/toal_xmas.png",
  choice1Path: volleyball7,
  cutscene: 2,
}

let volleyball5 = {
  text: "How do you know The Sacred Name?",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball6,
  cutscene: 2,
}

let volleyball4 = {
  text: "I thought you were talking about our volleyball game. | It sounds like you're talking about K'tah.",
  image: "cutsceneImages/toal_xmas.png",
  choice1Path: volleyball5,
  cutscene: 2,
}

let volleyball3 = {
  text: "But- we're in the middle of the zombie apocalypse here",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball4,
  cutscene: 2,
}

let volleyball2 = {
  text: "Stop being so dramatic",
  image: "cutsceneImages/toal_xmas.png",
  choice1Path: volleyball3,
  cutscene: 2,
}

let volleyball1 = {
  text: "Ever since the day we were born | I knew it was my destiny to DESTROY YOU!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: volleyball2,
  cutscene: 2,
}


let volleyball0 = {
  text: "You started an armageddon to steal my identity?!",
  image: "cutsceneImages/builderforney.png",
  choice1Path: volleyball1,
  cutscene: 2,
}











let keck8 = {
  text: "I am sure you are dying to know!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: "End",
  cutscene: 1,
}

let keck7 = {
  text: "Ugh! | What is it this time?",
  image: "cutsceneImages/forneyxmas.png",
  choice1Path: keck8,
  cutscene: 1,
}

let keck6 = {
  text: "I am done with those cheap tricks, Forney | I tried to steal your information; | but you did a pretty good job | No, what is coming for you is greater than Norfey Security Company",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: keck7,
  cutscene: 1,
}

let keck5 = {
  text: "Enough of this Yenrof! | I am done (test) playing your games. | Stop trying to steal my identity! | I secured my social security records after last time.",
  image: "cutsceneImages/forneyxmas.png",
  choice1Path: keck6,
  cutscene: 1,
}

let keck4 = {
  text: "You thought you had gotten rid of me | Ha! Foolish! | I have returned with a power unfathomable to you | and your (pretty awesome) mortal beard!",
  image: "cutsceneImages/Yenrof.png",
  choice1Path: keck5,
  cutscene: 1,
}

let keck3 = {
  text: "I recognize that voice | Yenrof, is that you?",
  image: "cutsceneImages/forneyxmas.png",
  choice1Path: keck4,
  cutscene: 1,
}

let keck2 = {
  text: "Yes Master, it is time",
  image: "cutsceneImages/darkYenrof.png",
  choice1Path: keck3,
  cutscene: 1,
}

let keck1 = {
  text: "Ahhhh!!!!",
  image: "cutsceneImages/forneyxmas.png",
  choice1Path: keck2,
  cutscene: 1,
}

let keck0 = {
  text: "Merry Keckmas Everyone!!",
  image: "cutsceneImages/forneyxmas.png",
  choice1Path: keck1,
  cutscene: 1,
}

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("text").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
    }
    if (txt.charAt(i) === "|") {
      i++;
      document.getElementById("text").innerHTML = "";
    }
  }

function displayScene(choice) {
    img.src = "media";
    i = 0;
    document.getElementById("text").innerHTML = "";
    txt = choice.text;
    currentImage = choice.image;
    img.src = currentImage;
    gChoice1Path = choice.choice1Path;
    if (choice.animation === "fastShake") {
      cutscene.classList.add("fastShake");
    } else if (choice.animation === "slowShake") {
      cutscene.classList.add("slowShake");
    } else {
      cutscene.classList.remove("fastShake");
      cutscene.classList.remove("slowShake");
    }
    typeWriter();
}


function button1() {
  if (gChoice1Path!=="End") {
    displayScene(gChoice1Path);
    music.play();
  } else {
    music.src = "Ktah!.mp3";
    music.play();
    activeGame.resumeGame(activeGame);
  }
}

function check(choice) {
  if (choice.cutscene === 1) {
    sound.src = "heatingUp.mp3";
  } else {
    sound.src = "finalBattle.mp3";
  }
}
