// HOST

// Function Generate lobby
$(document).ready(function(){
  $('#generateLobbyButton').click(function (event) {
    event.preventDefault();
    console.log('hello world');
    generateRoomCode(code, currentLocation);
    /*
    // Firebase authentication (anonymous) linked to 
    // TODO add game code as parameter

    // Sign in
    firebase.auth().signInAnonymously()
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
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User

            // Adds user to authorized list
            let uid = user.uid;
            let location = firebase.database().ref('TEST' + '/authorized/' + uid);
            location.set(true);
            // ...
        } else {
            // User is signed out
            // ...
        }
    });
    */
  });
});

// Recursive function to check if the room code is complete and generate random letters if not
function generateRoomCode(code, currentLocation) {
    
    // If the string isn't yet 4 characters long
    if (code.length < 4) {
        
        // Generate a random number between 0 and 25
        // Convert this new value to an ascii character (uppercase)
        let newLetter = Math.floor(Math.random() * 25);
        newLetter = String.fromCharCode(65 + newLetter);
        
        // Add the new value to the existing room code
        roomCode =  code + newLetter;

        // Run this function again to check if the code is complete now (length of 4)
        generateRoomCode(roomCode, currentLocation);
        
    // If the string is 4 characters
    } else {
        
        // Update roomCode global variable
        roomCode = code;
        
        // End recursion
        // Passes the 4-digit code into the verifyRoomCode function
        verifyRoomCode(roomCode, currentLocation);
    }
}

// Function to check if the room key passed into it (key) is already an in-session game in the database
function verifyRoomCode(code, currentLocation) {
    
    // Checks that specific location in the database and takes a snapshot
    firebase.database().ref(code).once("value", snapshot => {

        // If the snapshot exists already
        if (snapshot.exists()) {
            
            // Rerun the code generator and try again
            generateRoomCode('', currentLocation);
            
        // If the snapshot doesn't exist, we can set up the lobby
        } else {
            
            // Generate lobby
            // If no players were provided
            if (currentLocation === null) {
                
                // Create empty game with no players
                createLobby(code, currentLocation);
                
            // If players were provided
            } else {
            
                // Grabs directory location
                let location = firebase.database().ref(currentLocation + '/players');

                // Takes ongoing snapshot
                location.on('value', function(snapshot) {
                    
                    // Creates game with same players at this room code location
                    createLobby(code, snapshot.val());
                });
            }
        }
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
