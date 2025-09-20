// models/CV.ts
export interface CV {
  id?: string; // Firestore will generate this
  contents: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}