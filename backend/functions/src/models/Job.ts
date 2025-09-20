// models/Job.ts

export interface Job {
  id?: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  createdAt?: Date;
  location?: string;
  salaryRange?: string;
  employmentType?: "full-time" | "part-time" | "contract" | "internship";
  skills?: string[];
}
