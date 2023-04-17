import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBS8KV1krHYJf3hjCUm5fXhX-i8j_CPA0A",
  authDomain: "notes-c5fcd.firebaseapp.com",
  projectId: "notes-c5fcd",
  storageBucket: "notes-c5fcd.appspot.com",
  messagingSenderId: "122403973274",
  appId: "1:122403973274:web:07cf9554c969d6c18ad723"
};

const appFirebase = initializeApp(firebaseConfig);
const storageFirebase = getStorage(appFirebase)

export {
  appFirebase,
  storageFirebase
}