import 'firebase/analytics';
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FB_API_KEY,
  authDomain: process.env.VITE_FB_AUTH_DOMAIN,
  projectId: process.env.VITE_FB_PROJECT_ID,
  storageBucket: process.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FB_APP_ID,
  measurementId: process.env.VITE_FB_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const gamesCollectionName = 'games';
const playersCollectionName = 'players';
export const db = firebase.firestore();
db.settings({ experimentalAutoDetectLongPolling: true });

// Use Firestore Emulator if the environment variable is set
if (process.env.VITE_USE_FIRESTORE_EMULATOR === 'true') {
  console.log('Using Firestore Emulator');
  const emulatorHost = window.location.hostname;
  db.useEmulator(emulatorHost, 8080);
}

export const removeOldGameFromStore = async () => {
  const monthsToDelete = 6;
  const dateObj = new Date();
  const requiredDate = new Date(dateObj.setMonth(dateObj.getMonth() - monthsToDelete));
  const games = await db
    .collection(gamesCollectionName)
    .where('createdAt', '<', requiredDate)
    .get();

  console.log('Games length', games.docs.length);
  if (games.docs.length > 0) {
    const data = games.docs[0].data();
    console.log(data);
    console.log(games.docs[games.docs.length - 1].data());
    console.log(data.createdAt.toDate().toString());
    console.log(games.docs[games.docs.length - 1].data().createdAt.toDate().toString());
    const gamesCollection: any = [];

    games.forEach((game) => {
      gamesCollection.push(game);
    });
    for (const game of gamesCollection) {
      console.log('Deleting:', game.data().name);
      const players = await game.ref.collection(playersCollectionName).get();
      const playersCollection: any = [];
      players.forEach((player: any) => {
        playersCollection.push(player);
      });
      for (const player of playersCollection) {
        await player.ref.delete();
      }
      await game.ref.delete();
      console.log('deleted');
    }
  }

  return true;
};
