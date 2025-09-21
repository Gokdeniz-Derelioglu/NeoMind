export interface CV {
  id?: string; // Firestore will generate this
  userId: string; // Reference to the User
  contents: string;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
