import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import {getAuth} from "firebase/auth"


const firebaseConfig = {
  apiKey: "AIzaSyA2uDSR2K-bYjL5lF41z83-YVXSNVJ-FsA",
  authDomain: "blogify-app-f4e6d.firebaseapp.com",
  projectId: "blogify-app-f4e6d",
  storageBucket: "blogify-app-f4e6d.appspot.com",
  messagingSenderId: "768815133257",
  appId: "1:768815133257:web:5ec26441ffd193b4278598"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {auth,db,storage};
