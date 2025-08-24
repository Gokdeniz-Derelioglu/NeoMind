// functions/src/services/userService.ts
import { getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
const usersCollection = db.collection("users");

// Register a new user
export async function createUser(uid: string, userData: any) {
  await usersCollection.doc(uid).set(userData);
  return { id: uid, ...userData };
}

// Fetch a user
export async function getUser(uid: string) {
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) {
    throw new Error("User not found");
  }
  return { id: doc.id, ...doc.data() };
}

// Update a user
export async function updateUser(uid: string, userData: any) {
  await usersCollection.doc(uid).update(userData);
  return { id: uid, ...userData };
}

// Delete a user
export async function deleteUser(uid: string) {
  await usersCollection.doc(uid).delete();
  return { id: uid };
}
