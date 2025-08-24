// models/User.ts
export interface User {
  id?: string; // Firestore will generate this
  name: string;
  email: string;
  role: "candidate" | "employer";
  createdAt?: FirebaseFirestore.Timestamp;
}
