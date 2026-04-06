// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBXjWyzgNtmEU9hGurJylTLF-X-2ueZETw",
    authDomain: "restaurant-login-92354.firebaseapp.com",
    projectId: "restaurant-login-92354",
    storageBucket: "restaurant-login-92354.firebasestorage.app",
    messagingSenderId: "409582852102",
    appId: "1:409582852102:web:7fe67f567d77a2834e8b87"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };