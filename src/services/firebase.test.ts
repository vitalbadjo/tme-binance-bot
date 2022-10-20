import { FirebaseService } from "./firebase"

test("Test firebase", async () => {
  const userId = "123123"
  const service = new FirebaseService()
  const allUsers = await service.getAllUsers()
  expect(allUsers.length).toBeGreaterThan(1)

  const user = await service.addUser({ id: userId })
  expect(user).toBeTruthy()

  const getUser = await service.getUser(userId)
  expect(getUser && getUser.id).toEqual(userId)

  const newUserId = "321"
  const updateUser = await service.updateUser(userId, { id: newUserId })
  expect(updateUser).toBeTruthy()

  await service.deleteUser(newUserId)
  const getUserAgain = await service.getUser(newUserId)
  expect(getUserAgain).toBeFalsy()
})
