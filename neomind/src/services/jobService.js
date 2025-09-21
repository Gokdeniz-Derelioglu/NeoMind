import { db } from "../firebase"; // your firebase config
import { collection, getDocs } from "firebase/firestore";

export const getAllJobs = async () => {
  const querySnapshot = await getDocs(collection(db, "jobs"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
