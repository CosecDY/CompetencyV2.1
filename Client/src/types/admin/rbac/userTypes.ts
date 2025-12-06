// --- User ---
export interface User {
  id: string;
  email: string;
  profileImage?: string;
  firstNameTH?: string;
  lastNameTH?: string;
  firstNameEN?: string;
  lastNameEN?: string;
  phone?: string;
  line?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}
