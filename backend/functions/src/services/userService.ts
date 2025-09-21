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

// ✅ Get user by ID (Admin SDK)
export const getUserById = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const userDoc = await usersRef.doc(userId).get();
    if (!userDoc.exists) throw new Error("User not found");
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
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

// Increase the level of a skill in the user skill matrix or add it if not present
export const increaseUserSkill = async (id: string, skill: string) => {
  const userRef = usersRef.doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error("User not found");

  // Assume userDoc.data().skills is an array of { skill: string, level: number }
  const skills: { skill: string; level: number }[] = userDoc.data()?.skills || [];
  const skillIndex = skills.findIndex(s => s.skill === skill);

  if (skillIndex === -1) {
    // Add new skill with level 1
    skills.push({ skill, level: 1 });
  } else {
    // Increase level by 1
    skills[skillIndex].level += 1;
  }

  await userRef.update({
    skills,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, skills };
};

// ✅ Delete user by ID
export const deleteUser = async (id: string) => {
  await usersRef.doc(id).delete();
  return { success: true };
};