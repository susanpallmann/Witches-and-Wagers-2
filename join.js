$(document).ready(function() {
  // Get a reference to the Firebase database
  const db = firebase.database();
  
  // When the form is submitted
  $('#join-game-form').submit(async function(event) {
    event.preventDefault(); // Prevent the form from submitting
    
    const roomCode = $('#room-code-input').val();
    const username = $('#username-input').val();
    
    try {
      // Authenticate the user anonymously with Firebase Authentication
      const userCredential = await firebase.auth().signInAnonymously();
      
      // Get the user's ID token from Firebase Authentication
      const idToken = await userCredential.user.getIdToken();
      
      // Check if the room has less than 9 authorized users
      const authorizedUsersRef = db.ref(`${roomCode}/authorized`);
      authorizedUsersRef.once('value', async function(snapshot) {
        const authorizedUserCount = snapshot.numChildren();
        if (authorizedUserCount >= 9) {
          $('#error-message').text('The game is already full');
          await firebase.auth().currentUser.delete(); // Remove the user from Firebase Authentication
          return;
        }
        
        // Add the user's ID token to the "authorizedUsers" list in your Firebase database
        await authorizedUsersRef.child(userCredential.user.uid).set(true);

        // Add the user's username to the "Players" directory in your Firebase database
        const playersRef = db.ref(`${roomCode}/Players`);
        await playersRef.child(username).set({
          VIP: false,
        });

        console.log('Successfully joined game!');
      });
      
    } catch (error) {
      $('#error-message').text('Error joining game: ' + error.message);
      console.error('Error joining game:', error);
    }
  });
});
