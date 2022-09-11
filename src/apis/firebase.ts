import firebase from "firebase/compat"
import { getFirestore } from "firebase/firestore/lite"
import initializeApp = firebase.initializeApp

export type ChatUserData = {
	chatId: number
}

export type FirebaseDB = Record<number, any>

export const db = {}

const firebaseConfig = {}
const firebaseController = initializeApp(firebaseConfig)
export const firestore = getFirestore(firebaseController)
