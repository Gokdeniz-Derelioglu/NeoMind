// services/cvService.ts
import * as admin from "firebase-admin";
import { CV } from "../models/CV";
import { User } from "../models/User";
import { firestore } from "../firebase";

// ✅ Firestore reference
const db = firestore
const cvsRef = db.collection("cvs");
const usersRef = db.collection("users");

// ✅ Add new cv (auto-generated ID)
export const addCV = async (cv: CV, user: User, uid: string) => {
  const docRef = await cvsRef.add({
    ...cv,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: docRef.id, ...cv };
};

//join cv to user
export const joinCv = async (cvId: string, uid: string) => {
    const userRef = usersRef.doc(uid);
    await userRef.update({
      cvId: cvId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
};

//update cv
export const updateCV = async (id: string, updates: Partial<CV>) => {
  const cvRef = cvsRef.doc(id);
  await cvRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
};