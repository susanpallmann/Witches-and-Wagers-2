// Get a reference to the Firebase database
const db = firebase.database();

// When the user enters a room code and their preferred username and clicks "Join Game":
const joinGame = async (roomCode, username) => {
  try {
    // Check if there are already 8 players in the game
    const playersRef = db.ref(`${roomCode}/Players`);
    const playersSnapshot = await playersRef.once('value');
    const numPlayers = playersSnapshot.numChildren();
    if (numPlayers >= 8) {
      console.log('Error joining game: the game is already full');
      return;
    }

    // Authenticate the user anonymously with Firebase Authentication
    const userCredential = await firebase.auth().signInAnonymously();

    // Get the user's ID token from Firebase Authentication
    const idToken = await userCredential.user.getIdToken();

    // Add the user's ID token to the "authorized" list in your Firebase database
    const authorizedUsersRef = db.ref(`${roomCode}/authorized`);
    await authorizedUsersRef.child(userCredential.user.uid).set(true);

    // Add the user's username to the "Players" directory in your Firebase database
    await playersRef.child(username).set({
      VIP: false,
    });
    
    console.log('Successfully joined game!');
  } catch (error) {
    console.error('Error joining game:', error);
  }
};

const joinButton = document.getElementById('joinButton');

joinButton.addEventListener('click', async (event) => {
  event.preventDefault();
  
  const roomCode = document.getElementById('roomCode').value.toUpperCase();
  const username = document.getElementById('username').value;
  
  try {
    // Check if there are already 8 or more players in the game
    const playersRef = db.ref(`${roomCode}/Players`);
    const snapshot = await playersRef.once('value');
    const numPlayers = snapshot.numChildren();
    if (numPlayers >= 8) {
      throw new Error('Cannot join game: max number of players already reached');
    }

    // Join the game
    await joinGame(roomCode, username);
  } catch (error) {
    console.error(error);
  }
});
