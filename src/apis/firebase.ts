import { getFirestore } from "firebase/firestore/lite"
import { initializeApp } from "firebase/app"

export const db = {}

const firebaseConfig = {
  apiKey: process.env.FBAPI,
  authDomain: "tme-bnb.firebaseapp.com",
  projectId: "tme-bnb",
  storageBucket: "tme-bnb.appspot.com",
  messagingSenderId: process.env.FBMSID,
  appId: process.env.FBAPID,
}
const firebaseController = initializeApp(firebaseConfig)
export const firestore = getFirestore(firebaseController)
