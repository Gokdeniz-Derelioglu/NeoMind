// models/User.ts
export interface User {
  id?: string; // Firestore will generate this
  name: string;
  email: string;
  role: "candidate" | "employer";
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  location?: string; 
  skills?: string[2][]; //matrix of string pairs? I hope it is... This is a preference list btw
  experience?: string;
  education?: string;
  employmentTypePreference?: "full-time" | "part-time" | "contract" | "internship";
  cvId?: string; // Reference to id of CV string in database
}