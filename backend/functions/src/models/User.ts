// models/User.ts
export interface User {
  id?: string; // Firestore will generate this
  name: string;
  email: string;
  role: "candidate" | "employer";
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  location?: string; 
  skills?: string[]; 
  experience?: string;
  education?: string;
  employmentTypePreference?: "full-time" | "part-time" | "contract" | "internship";
  cvId?: string; // Reference to id of CV string in database
}