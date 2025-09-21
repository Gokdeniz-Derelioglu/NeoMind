// src/services/jobService.js
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getAllJobs = async (user) => {
  if (!user) throw new Error("User not authenticated");

  try {
    const querySnapshot = await getDocs(collection(db, "jobs"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error fetching jobs:", err);
    throw err; // let the component handle it
  }
};
