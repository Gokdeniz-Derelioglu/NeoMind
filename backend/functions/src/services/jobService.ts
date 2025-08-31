// src/services/jobService.ts
import { firestore } from "../firebase";
import { Job } from "../models/Job";
import * as admin from "firebase-admin";
import { generateJobId } from "../utils/generateJobID";


const jobsRef = firestore.collection("jobs");

// ✅ Add a new job with custom ID
export const addJob = async (job: Job) => {
  const jobId = generateJobId(job.location, job.title);
  await jobsRef.doc(jobId).set({ ...job, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { id: jobId, ...job }; // Return the job object including its ID

  return { id: jobId, ...job };
};

// ✅ Get a job by ID
export const getJobById = async (id: string) => {
  const doc = await jobsRef.doc(id).get();
  if (!doc.exists) throw new Error("Job not found");
  return { id: doc.id, ...doc.data() } as Job;
};

// ✅ Get all jobs
export const getAllJobs = async () => {
  const snapshot = await jobsRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};

// ✅ Filter jobs
export const filterJobs = async (filters: Partial<Job>) => {
  let query: FirebaseFirestore.Query = jobsRef;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query = query.where(key, "==", value);
    }
  });

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
};
