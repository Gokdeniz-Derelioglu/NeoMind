import { CV } from "../models/CV";
import { User } from "../models/User";
import { firestore } from "../firebase";

// Firestore refs
const db = firestore;
const cvsRef = db.collection("cvs");
const usersRef = db.collection("users");

// Add new CV (auto-generated ID)
export const addCV = async (cv: CV, user: User, uid: string) => {
  const docRef = await cvsRef.add({
    ...cv,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...cv };
};

// Join CV to user
export const joinCv = async (cvId: string, uid: string) => {
  const userRef = usersRef.doc(uid);
  await userRef.update({
    cvId: cvId,
    updatedAt: new Date(),
  });
};

// Update existing CV
export const updateCV = async (id: string, updates: Partial<CV>) => {
  const cvRef = cvsRef.doc(id);
  await cvRef.update({
    ...updates,
    updatedAt: new Date(),
  });
  return { success: true };
};

// Fetch CV by ID
export const getCVById = async (id: string) => {
  const doc = await cvsRef.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as CV) };
};
