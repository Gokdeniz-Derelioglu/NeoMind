// models/Job.ts

export interface Job {
  id?: string;
  company: string;
  name: string;
  logo: string; //emoji
  industry: string;
  size: string; //num of employees
  location?: string;
  rating?: number; //1-5 which is determined by the number of right swipes by all users
  founded: number;
  position: string;
  salary: string;
  type?: "full-time" | "part-time" | "contract" | "internship";
  experience: number[]; //list of two numbers ig  
  skills?: string[];
  description: string;
  benefits?: string[];
  posted: string; //how long ago it was posted
  createdAt?: Date;
}
