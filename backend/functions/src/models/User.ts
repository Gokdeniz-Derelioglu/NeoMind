export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  appliedJobs?: any[];
  cvId?: string; // Reference to CV doc
}
