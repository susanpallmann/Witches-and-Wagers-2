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
      
      // Check if the room has less than 8 players
      const playersRef = db.ref(`gameCodes/${roomCode}/Players`);
      playersRef.once('value', function(snapshot) {
        const playerCount = snapshot.numChildren();
        if (playerCount >= 8) {
          console.log('The game is already full');
          return;
        }
        
        // Add the user's ID token to the "authorizedUsers" list in your Firebase database
        const authorizedUsersRef = db.ref(`gameCodes/${roomCode}/authorizedUsers`);
        await authorizedUsersRef.child(userCredential.user.uid).set(true);

        // Add the user's username to the "Players" directory in your Firebase database
        await playersRef.child(username).set({
          VIP: false,
        });

        console.log('Successfully joined game!');
      });
      
    } catch (error) {
      console.error('Error joining game:', error);
    }
  });
});
