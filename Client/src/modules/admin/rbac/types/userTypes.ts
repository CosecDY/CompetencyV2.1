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

export interface UserWithRoles extends User {
  roles?: UserRoleDetail[];
}

export interface UserRoleDetail {
  id: number;
  name: string;
  description?: string;
}
