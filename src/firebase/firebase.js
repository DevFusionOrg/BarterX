import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAKOVVZdufTgPSlbh4L9JPKPN-cpMH12XQ",
  authDomain: "barterx-b03.firebaseapp.com",
  projectId: "barterx-b03",
  storageBucket: "barterx-b03.firebasestorage.app",
  messagingSenderId: "177580975982",
  appId: "1:177580975982:web:6cbc840db8659cf277c37f",
  measurementId: "G-Y0BK0N4HR3"
};

const app = initializeApp(firebaseConfig);

export default app;