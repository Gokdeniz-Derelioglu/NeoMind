// services/userService.ts
import * as admin from "firebase-admin";
import { User } from "../models/User";
import { firestore } from "../firebase";

// ✅ Firestore reference
const db = firestore
const usersRef = db.collection("users");

// ✅ Add new user (auto-generated ID)
export const addUser = async (user: User) => {
  const docRef = await usersRef.add({
    ...user,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, ...user };
};

// ✅ Get user by ID
export const getUserById = async (id: string) => {
  const doc = await usersRef.doc(id).get();
  if (!doc.exists) throw new Error("User not found");
  return { id: doc.id, ...doc.data() } as User;
};

// ✅ Get all users
export const getAllUsers = async () => {
  const snapshot = await usersRef.get();
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as User)
  );
};

// ✅ Register user with custom UID (e.g., after authentication)
export const registerUser = async (uid: string, email: string, name: string) => {
  const userRef = usersRef.doc(uid);
  await userRef.set({
    email,
    name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, uid };
};

// ✅ Update user details
// To use function, pass a partial User object with fields to be updated, and a partial User object is created by using TypeScript's Partial<T> utility. 
export const updateUser = async (id: string, updates: Partial<User>) => {
  const userRef = usersRef.doc(id);
  await userRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
};

// ✅ Delete user by ID
export const deleteUser = async (id: string) => {
  await usersRef.doc(id).delete();
  return { success: true };
};