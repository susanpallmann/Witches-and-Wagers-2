$(document).ready(function() {
  // Get a reference to the Firebase database
  const db = firebase.database();
  
  // When the form is submitted
  $('#join-game-form').submit(async function(event) {
    event.preventDefault(); // Prevent the form from submitting
    
    const roomCode = $('#room-code').val();
    const username = $('#username').val();
    
    try {
      // Authenticate the user anonymously with Firebase Authentication
      const userCredential = await firebase.auth().signInAnonymously();
      
      // Get the user's ID token from Firebase Authentication
      const idToken = await userCredential.user.getIdToken();
      
      // Check if the room has less than 8 players
      const playersRef = db.ref(`${roomCode}/Players`);
      playersRef.once('value', async function(snapshot) {
        const playerCount = snapshot.numChildren();
        if (playerCount >= 8) {
          $('#error-message').text('The game is already full');
          return;
        }
        
        // Add the user's ID token to the "authorizedUsers" list in your Firebase database
        const authorizedUsersRef = db.ref(`${roomCode}/authorizedUsers`);
        await authorizedUsersRef.child(userCredential.user.uid).set(true);

        // Add the user's username to the "Players" directory in your Firebase database
        await playersRef.child(username).set({
          VIP: false,
        });

        console.log('Successfully joined game!');
      });
      
    } catch (error) {
      $('#error-message').text(`Error joining game: ${error.message}`);
    }

    return false; // Stop the form submission
  });
});
