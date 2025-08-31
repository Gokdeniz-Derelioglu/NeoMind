// src/models/Job.ts
export interface Job {
  id?: string;
  title: string;
  field: string;
  region: string;
  company: string;
  location: string;
  description: string;
  type: "full-time" | "part-time" | "internship";
  createdAt: FirebaseFirestore.Timestamp;
}
