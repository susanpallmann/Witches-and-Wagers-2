// HOST

// Function to remove room code from database on disconnect
function removeRoomOnDisconnect(code) {
  // Create a reference to the room code location in the database
  let roomRef = firebase.database().ref(code);

  // Set the onDisconnect() method to remove the room code from the database
  roomRef.onDisconnect().remove();
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
        }
      });
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
        
        // Remove the room code from the database when the client disconnects
        removeRoomOnDisconnect(code);
        
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
