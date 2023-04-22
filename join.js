//Import //
import { lobby } from './scripts.js';

$(document).ready(function() {
  // Get a reference to the Firebase database
  const db = firebase.database();

  let userCredential;
  let roomCode;
  let username;

  // When the form is submitted
  $('#join-game-form').submit(async function(event) {
    event.preventDefault(); // Prevent the form from submitting

    roomCode = $('#room-code').val().toUpperCase();
    username = $('#username').val();

    try {
      // Authenticate the user anonymously with Firebase Authentication
      userCredential = await firebase.auth().signInAnonymously();

      // Get the user's ID token from Firebase Authentication
      const idToken = await userCredential.user.getIdToken();

      // Check if the room exists
      const roomSnapshot = await db.ref(roomCode).once('value');
      if (!roomSnapshot.exists()) {
        $('#error-message').text('Room does not exist');
        await cleanupFirebaseResources();
        return;
      }

      // Check if the room has less than 9 authorized users
      const authorizedUsersSnapshot = await db.ref(`${roomCode}/authorized`).once('value');
      const authorizedUserCount = authorizedUsersSnapshot.numChildren();
      if (authorizedUserCount >= 9) {
        $('#error-message').text('The game is already full');
        await cleanupFirebaseResources();
        return;
      }

      // Check if the username is already taken in the "Players" directory
      const playersSnapshot = await db.ref(`${roomCode}/Players`).once('value');
      if (playersSnapshot.hasChild(username)) {
        $('#error-message').text('Username is already taken');
        await cleanupFirebaseResources();
        return;
      } else {
        // Add the user's ID token to the "authorizedUsers" list in your Firebase database
        await db.ref(`${roomCode}/authorized/${userCredential.user.uid}`).set(true);

        // Add the user's username to the "Players" directory in your Firebase database
        const playerCount = playersSnapshot.numChildren();
        if (playerCount === 0) {
          await db.ref(`${roomCode}/Players/${username}`).set({
            VIP: true,
          });
          await console.log(lobby);
          await lobby.updateGamePhase('gameStartViable');

          // Set the first player as VIP and the current player in the game controller
          await db.ref(`${roomCode}/gameController/currentPlayer`).set(username);
        } else {
          await db.ref(`${roomCode}/Players/${username}`).set({
            VIP: false,
          });
        }

        console.log('Successfully joined game!');
      }
    } catch (error) {
      $('#error-message').text('Error joining game: ' + error.message);
    }
  });

  // Clean up Firebase resources when the user leaves the page
  $(window).on('beforeunload unload', async function() {
    await cleanupFirebaseResources();
  });

  // Function to remove the user from Firebase resources
  async function cleanupFirebaseResources() {
    // Remove the user from the Players list
    await db.ref(`${roomCode}/Players/${username}`).remove();

    // Remove the user from the authorized list
    await db.ref(`${roomCode}/authorized/${userCredential.user.uid}`).remove();

    // Sign the user out to remove their authentication information from the Firebase project
    await firebase.auth().signOut();
  }
});
