import { firestore } from "../apis/firebase"
import { collection, getDocs, addDoc, setDoc, deleteDoc } from "firebase/firestore/lite"
import { UserModel } from "./models/user.model"

export class FirebaseService {
  db = firestore
  async getAllUsers() {
    const usersCol = collection(this.db, "users")
    const usersSnapshot = await getDocs(usersCol)
    const usersList = usersSnapshot.docs.map((doc) => doc.data())
    return usersList as UserModel[]
  }
  async addUser(user: UserModel) {
    const usersCol = collection(this.db, "users")
    const newUser = await addDoc(usersCol, user)
    return newUser.id
  }

  async getUser(userId: UserModel["id"]) {
    const usersCol = collection(this.db, "users")
    const usersSnapshot = await getDocs(usersCol)
    const userDocRef = usersSnapshot.docs.find((doc) => doc.data().id === userId)
    if (userDocRef) {
      return userDocRef.data() as UserModel
    } else {
      console.log("User not found")
      return false
    }
  }

  async updateUser(userId: UserModel["id"], newUserData: UserModel) {
    const usersCol = collection(this.db, "users")
    const usersSnapshot = await getDocs(usersCol)
    const userDocRef = usersSnapshot.docs.find((doc) => doc.data().id === userId)
    if (userDocRef) {
      await setDoc(userDocRef.ref, { ...userDocRef.data(), ...newUserData })
      return true
    } else {
      console.log("User not found")
      return false
    }
  }

  async deleteUser(id: UserModel["id"]) {
    const usersCol = collection(this.db, "users")
    const usersSnapshot = await getDocs(usersCol)
    const userDocRef = usersSnapshot.docs.find((doc) => doc.data().id === id)
    if (userDocRef) {
      await deleteDoc(userDocRef.ref)
      return true
    } else {
      console.log("User not found")
      return false
    }
  }
}
