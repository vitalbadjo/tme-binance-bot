import { getFirestore } from "firebase/firestore/lite"
import firebase from "firebase/compat"
// import "firebase/database"

export type ChatUserData = {
  chatId: number
}

export type FirebaseDB = Record<number, any>

export const db = {}

const firebaseConfig = {
  apiKey: process.env.FBAPI,
  authDomain: "tme-bnb.firebaseapp.com",
  projectId: "tme-bnb",
  storageBucket: "tme-bnb.appspot.com",
  messagingSenderId: process.env.FBMSID,
  appId: process.env.FBAPID,
}
const firebaseController = firebase.initializeApp(firebaseConfig)
export const firestore = getFirestore(firebaseController)
