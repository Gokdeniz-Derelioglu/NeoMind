// src/services/userService.js
import { db } from "../firebase"; // make sure this exports your Firestore instance
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Get user by ID
export const getUserById = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) throw new Error("User not found");
    return { id: userDoc.id, ...userDoc.data() };
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

// Update user info
export const updateUser = async (userId, updates) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

// Add a new user
export const addUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, userData);
    return { id: userId, ...userData };
  } catch (err) {
    console.error("Error adding user:", err);
    throw err;
  }
};

// --- NEW: Add a job application for a user ---
export const addJobApplication = async (userId, job) => {
  if (!userId) throw new Error("User ID is required");
  if (!job) throw new Error("Job data is required");

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found");

    // Add job to the user's appliedJobs array (creates array if not present)
    await updateDoc(userRef, {
      appliedJobs: arrayUnion(job),
    });

    return { success: true };
  } catch (err) {
    console.error("Error adding job application:", err);
    throw err;
  }
};
