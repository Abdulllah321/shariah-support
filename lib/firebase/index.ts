import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
    apiKey: "AIzaSyAmny9_A9UOabvlvKAY16AL-RMNwsfMizM",
    authDomain: "daily-activity-88e39.firebaseapp.com",
    projectId: "daily-activity-88e39",
    storageBucket: "daily-activity-88e39.firebasestorage.app",
    messagingSenderId: "927372929627",
    appId: "1:927372929627:web:747f931d9566b1b48a6d7e",
    measurementId: "G-B3WWS63JTN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
