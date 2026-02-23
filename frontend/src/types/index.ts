export type Role = "student" | "professor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  credits: number;
  department: string;
  semester: string;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  images: string[];
  is_published: boolean;
}
