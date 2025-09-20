import { firestore } from "../firebase";
import { Job } from "../models/Job";

const jobsCollection = firestore.collection("jobs");

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
export async function getJobsByType(type: "full-time" | "part-time" | "internship"): Promise<Job[]> {
  const snapshot = await jobsCollection.where("type", "==", type).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
}

// ✅ Advanced filter: combine queries (region + field + title, etc.)
export async function filterJobs(filters: {
  region?: string;
  field?: string;
  type?: "full-time" | "part-time" | "internship";
  title?: string; // Firestore doesn’t support contains queries easily → we use "==" or need external search
}): Promise<Job[]> {
  let query: FirebaseFirestore.Query = jobsCollection;

  if (filters.region) query = query.where("region", "==", filters.region);
  if (filters.field) query = query.where("field", "==", filters.field);
  if (filters.type) query = query.where("type", "==", filters.type);

  const snapshot = await query.get();

  let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

  // 🔎 title filter: since Firestore has no LIKE, we filter in-memory
  if (filters.title) {
    const titleLower = filters.title.toLowerCase();
    jobs = jobs.filter(job => job.title.toLowerCase().includes(titleLower));
  }

  return jobs;
}
