import { UserModel } from "./models/user.model";
export declare class FirebaseService {
    db: import("firebase/firestore/lite").Firestore;
    getAllUsers(): Promise<UserModel[]>;
    addUser(user: UserModel): Promise<string>;
    getUser(userId: UserModel["id"]): Promise<false | UserModel>;
    updateUser(userId: UserModel["id"], newUserData: UserModel): Promise<boolean>;
    deleteUser(id: UserModel["id"]): Promise<boolean>;
}
