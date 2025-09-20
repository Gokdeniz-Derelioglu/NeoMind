// services/jobService.ts
import { firestore } from "../firebase";
import { Job } from "../models/Job";

const jobsCollection = firestore.collection("jobs");

// ✅ Add a new job (auto-ID)
export async function addJob(job: Job): Promise<Job> {
  const docRef = await jobsCollection.add({
    ...job,
    createdAt: job.createdAt || new Date(),
  });
  return { id: docRef.id, ...job };
}

// ✅ Update an existing job by ID
export async function updateJob(id: string, job: Partial<Job>): Promise<void> {
  await jobsCollection.doc(id).update({
    ...job,
    updatedAt: new Date(),
  });
}

// ✅ Get all jobs (optionally limited)
export async function getJobs(limit = 20): Promise<Job[]> {
  const snapshot = await jobsCollection
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// ✅ Get single job by ID
export async function getJobById(id: string): Promise<Job | null> {
  const doc = await jobsCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Job;
}

// ✅ Filter jobs by region
export async function getJobsByRegion(region: string): Promise<Job[]> {
  const snapshot = await jobsCollection.where("region", "==", region).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// ✅ Filter jobs by field
export async function getJobsByField(field: string): Promise<Job[]> {
  const snapshot = await jobsCollection.where("field", "==", field).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// ✅ Filter jobs by type
export async function getJobsByType(
  type: "full-time" | "part-time" | "internship"
): Promise<Job[]> {
  const snapshot = await jobsCollection.where("type", "==", type).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// ✅ Advanced filter: combine queries (region + field + title, etc.)
export async function filterJobs(filters: {
  region?: string;
  field?: string;
  type?: "full-time" | "part-time" | "internship";
  title?: string; // Firestore doesn’t support contains queries easily → we filter in-memory
}): Promise<Job[]> {
  let query: FirebaseFirestore.Query = jobsCollection;

  if (filters.region) query = query.where("region", "==", filters.region);
  if (filters.field) query = query.where("field", "==", filters.field);
  if (filters.type) query = query.where("type", "==", filters.type);

  const snapshot = await query.get();

  let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

  // 🔎 Title filter: in-memory since Firestore doesn't support LIKE
  if (filters.title) {
    const titleLower = filters.title.toLowerCase();
    jobs = jobs.filter(job => job.name.toLowerCase().includes(titleLower));
  }

  return jobs;
}
