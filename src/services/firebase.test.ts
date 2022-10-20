import { FirebaseService } from "./firebase"

test("Test firebase", async () => {
  const firebase = new FirebaseService()
  console.log(await firebase.deleteUser("ewq"))
})
