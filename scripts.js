// HOST

// Function to remove room code from database on disconnect || REMOVED due to other onDisconnect listener working now
/*function removeRoomOnDisconnect(code) {
  let roomRef = firebase.database().ref(code);

  roomRef.onDisconnect().cancel(); // Cancel the onDisconnect listener
  window.addEventListener('beforeunload', () => { // Add a listener for the beforeunload event
    roomRef.remove(); // Remove the data directly
  });
  
  // Add an event listener for the `onAuthStateChange()` event
  firebase.auth().onAuthStateChanged((user) => {
    // If the user is no longer authenticated, delete the lobby and its subsequent children
    if (!user) {
      roomRef.remove();
    }
  });
}*/
/*
let roomCode;

function updatePlayersList(roomCode) {
  // Get a reference to the Firebase database
  const db = firebase.database();

  // Get a reference to the "Players" directory in your Firebase database
  const playersRef = db.ref(`${roomCode}/Players`);

  // Update the HTML list of players in real-time
  playersRef.on('value', function(snapshot) {
    const playersList = $('#lobbyPlayers');
    playersList.empty(); // Clear the list

    snapshot.forEach(function(childSnapshot) {
      const playerName = childSnapshot.key;
      const isVIP = childSnapshot.val().VIP;
      const playerListItem = $('<li>');
      playerListItem.text(playerName);
      if (isVIP) {
        playerListItem.append(' (VIP)');
      }
      playersList.prepend(playerListItem);
    });
  });
}

// Function to set up game controller in database
function createGameController(roomCode) {
  // Get a reference to the Firebase database
  const db = firebase.database();

  // Set up game controller object
  const gameControllerRef = db.ref(`${roomCode}/gameController`);
  gameControllerRef.set({
    gamePhase: 'waitingForPlayers',
    currentPlayer: '',
    bets: {}
  });

  // Update the game controller in real-time
  gameControllerRef.on('value', function(snapshot) {
    const gameController = snapshot.val();
    // Update UI accordingly
    // ...
  });
}

// Create a Lobby class
class Lobby {
  constructor() {
    this.roomCode = '';
    this.currentLocation = null;
  }

  // Function to generate lobby
  generate() {
    // Generate room code recursively
    this.generateRoomCode('', this.currentLocation);
  }

  // Recursive function to check if the room code is complete and generate random letters if not
  generateRoomCode(code) {
    if (code.length < 4) {
      let newLetter = Math.floor(Math.random() * 25);
      newLetter = String.fromCharCode(65 + newLetter);
      code += newLetter;
      this.generateRoomCode(code);
    } else {
      this.roomCode = code;
      this.verifyRoomCode(this.roomCode);
    }
  }

  // Function to check if the room key passed into it (key) is already an in-session game in the database
  verifyRoomCode(code) {
    firebase
      .database()
      .ref(code)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          this.generateRoomCode('');
        } else {
          this.createLobby();
          $('.roomCode').text(code);
          roomCode = code;
          updatePlayersList(roomCode);
        }
      });
  }
  
  getRoomCode() {
    return this.roomCode;
  }
  
  // Creates a new lobby (set of values) with either new or existing players
  createLobby() {
    console.log('this ran, code is ' + this.roomCode + '.');

    // Firebase authentication (anonymous) linked to
    // TODO add game code as parameter

    // Sign in
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        // Signed in..
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });

    // On sign on
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        let uid = user.uid;
        let location = firebase.database().ref(this.roomCode + '/authorized/' + uid);
        location.set(true);
        
        // Set up game controller
        createGameController(this.roomCode);

        // Add onDisconnect listener to remove location node when client disconnects
        location.onDisconnect().set(null);

        // Add onDisconnect listener to remove room node if current client is the last client in the room
        let roomRef = firebase.database().ref(this.roomCode);
        roomRef.onDisconnect().set(null);

      } else {
        // User is signed out
        // ...
      }
    });
  }
}

// Create a new Lobby object and attach an event listener to the button
const lobby = new Lobby();
$(document).ready(function () {
  $('#generateLobbyButton').click(function (event) {
    event.preventDefault();
    lobby.generate();
  });
});
*/
// Define constants for the room code length and character set
const ROOM_CODE_LENGTH = 4;
const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Define a helper function to generate a random room code
function generateRoomCode() {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS.charAt(Math.floor(Math.random() * ROOM_CODE_CHARS.length));
  }
  return code;
}

// Define a class to represent a lobby
class Lobby {
  constructor() {
    this.roomCode = '';
  }

  // Generate a new room code
  async generateRoomCode() {
    let code = generateRoomCode();
    while (await this.roomCodeExists(code)) {
      code = generateRoomCode();
    }
    this.roomCode = code;
    return code;
  }
  
  // Updates the game phase in the game controller
  async updateGamePhase(phase) {
    try {
      const gameControllerRef = firebase.database().ref(`${this.roomCode}/gameController`);
      await this.gameControllerRef.update({
        gamePhase: phase
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Check if a room code exists in the database
  async roomCodeExists(code) {
    const snapshot = await firebase.database().ref(code).once('value');
    return snapshot.exists();
  }

  // Create a new lobby
  async createLobby() {
    // Sign in anonymously
    await firebase.auth().signInAnonymously();

    // Listen for authentication state changes
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const uid = user.uid;
        const authorizedRef = firebase.database().ref(`${this.roomCode}/authorized/${uid}`);

        // Add the current user to the list of authorized users
        await authorizedRef.set(true);

        // Set up the game controller
        await createGameController(this.roomCode);

        // Remove the user from the list of authorized users when they disconnect
        authorizedRef.onDisconnect().set(null);

        // Remove the entire room when the last user disconnects
        firebase.database().ref(this.roomCode).onDisconnect().set(null);
      }
    });
  }

  // Update the list of players in the lobby
  updatePlayersList() {
    const playersList = $('#lobbyPlayers');

    firebase.database().ref(`${this.roomCode}/Players`).on('value', (snapshot) => {
      playersList.empty(); // Clear the list
      snapshot.forEach((childSnapshot) => {
        const playerName = childSnapshot.key;
        const isVIP = childSnapshot.val().VIP;
        const playerListItem = $('<li>').text(playerName);
        if (isVIP) {
          playerListItem.append(' (VIP)');
        }
        playersList.prepend(playerListItem);
      });
    });
  }
}

// Create a new lobby object and attach an event listener to the button
const lobby = new Lobby();
$(document).ready(() => {
  $('#generateLobbyButton').click(async (event) => {
    event.preventDefault();
    const roomCode = await lobby.generateRoomCode();
    $('.roomCode').text(roomCode);
    lobby.updatePlayersList();
    await lobby.createLobby();
    await lobby.updateGamePhase('gameStartViable');
  });
});

// Set up the game controller in the database
async function createGameController(roomCode) {
  const gameControllerRef = firebase.database().ref(`${roomCode}/gameController`);
  await gameControllerRef.set({
    gamePhase: 'lobbySetup',
    currentPlayer: '',
    bets: {},
  });

  // Listen for changes to the game controller
  gameControllerRef.on('value', (snapshot) => {
    const gameController = snapshot.val();
    // Update the UI accordingly
    // ...
  });
}

// Function Generate monster

// Function Determine next player

// Function Change game phase

// Phases
/*
title
lobbySetup
gameStartViable
tutorial
game1_determineNextPlayer
game2_generateMonster
game3_showPlayerMonster
game4_openBets
game5_timerBets
game6_closeBets
game7_showAnonBets
game8_closePlayerAction_1
game9_playerActionTimer_1
game10_closePlayerAction_1
game11_showNamedBets
game12_showBetItems
game13_1_showPlayerItems
game13_2_calcFleeAttempt
game14_1_calculateWinner
game14_2_fleeAnimation
game15_showFight
game16_1_playerVictory
game16_2_playerDefeat
game17_payPlayer
game18_betPayout
game19_displayScoreboard
game20_checkWinner
game_21_restartRound
game100_closePlayerAction_2
game101_playerActionTimer_2
game102_closePlayerAction_2
victory
credits
gameNotViable*/

// Function Timer

// Function Phase receiver (changes UI of host screen)

// Function Move card

// Function Calculate fight winner

// Function Payout bets

// Function Check for winner

// Function Restart round

// Function Determine flee success

// Function Track player count

// CLIENT
// Function Phase receiver (changes UI of player screen)

// Function Move card

// Function Place bet

// Function Better use items

// Function Choose action

// Function Player use items

// Function Track disconnect
