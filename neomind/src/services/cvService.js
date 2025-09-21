// src/services/cvService.js
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firestore references
const cvsRef = collection(db, "cvs");
const usersRef = collection(db, "users");

/**
 * Add new CV for a user
 * @param {Object} cv - CV data
 * @param {string} uid - User ID
 * @returns CV document with ID
 */
export const addCV = async (cv, uid) => {
  if (!uid) throw new Error("User ID required to add CV");
  try {
    const docRef = await addDoc(cvsRef, {
      ...cv,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Also link CV ID to user
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { cvId: docRef.id, updatedAt: serverTimestamp() });

    return { id: docRef.id, ...cv };
  } catch (err) {
    console.error("Error adding CV:", err);
    throw err;
  }
};

/**
 * Update existing CV
 * @param {string} cvId
 * @param {Object} updates
 */
export const updateCV = async (cvId, updates) => {
  if (!cvId) throw new Error("CV ID is required");

  try {
    const cvRef = doc(db, "cvs", cvId);
    await updateDoc(cvRef, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error("Error updating CV:", err);
    throw err;
  }
};

/**
 * Get CV by ID
 * @param {string} cvId
 */
export const getCVById = async (cvId) => {
  if (!cvId) throw new Error("CV ID is required");

  try {
    const cvDoc = await getDoc(doc(db, "cvs", cvId));
    if (!cvDoc.exists()) return null;
    return { id: cvDoc.id, ...cvDoc.data() };
  } catch (err) {
    console.error("Error fetching CV:", err);
    throw err;
  }
};

/**
 * Get all CVs for a specific user
 * @param {string} uid
 */
export const getCVsByUser = async (uid) => {
  if (!uid) throw new Error("User ID is required");
  try {
    const querySnapshot = await getDocs(cvsRef);
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((cv) => cv.uid === uid);
  } catch (err) {
    console.error("Error fetching user CVs:", err);
    throw err;
  }
};
