$(document).ready(function() {
  // Get a reference to the Firebase database
  const db = firebase.database();
  
  // When the form is submitted
  $('#join-game-form').submit(async function(event) {
    event.preventDefault(); // Prevent the form from submitting
    
    const roomCode = $('#room-code').val().toUpperCase();
    const username = $('#username').val();
    
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
        
        // Check if the username is already taken in the "Players" directory
        const playersRef = db.ref(`${roomCode}/Players`);
        playersRef.once('value', async function(snapshot) {
          if (snapshot.hasChild(username)) {
            $('#error-message').text('Username is already taken');
            await firebase.auth().currentUser.delete(); // Remove the user from Firebase Authentication
            return;
          }
        });
          
        // Add the user's ID token to the "authorizedUsers" list in your Firebase database
        await authorizedUsersRef.child(userCredential.user.uid).set(true);

        // Add the user's username to the "Players" directory in your Firebase database
        const playersSnapshot = await playersRef.once('value');
        const playerCount = playersSnapshot.numChildren();

        if (playerCount === 0) {
          await playersRef.child(username).set({
            VIP: true,
          });
        } else {
          await playersRef.child(username).set({
            VIP: false,
          });
        }

        console.log('Successfully joined game!');
      });
      
      // Add an event listener for the beforeunload event to remove the user from the Players and authorized lists
      $(window).on('beforeunload', function() {
        const playerRef = db.ref(`${roomCode}/Players/${username}`);
        playerRef.remove();
        const authorizedUserRef = db.ref(`${roomCode}/authorized/${userCredential.user.uid}`);
        authorizedUserRef.remove();
      });
      
    } catch (error) {
      $('#error-message').text('Error joining game: ' + error.message);
      console.error('Error joining game:', error);
    }
  });
});
