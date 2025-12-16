import api from "../../../../services/api";
import axios from "axios";

// Interface matching the database schema
export interface UserProfileData {
  id: string;
  email: string;
  profileImage: string | null;
  firstNameTH: string | null;
  lastNameTH: string | null;
  firstNameEN: string | null;
  lastNameEN: string | null;
  phone: string | null;
  line: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for profile update
export interface ProfileUpdateData {
  firstNameTH: string;
  lastNameTH: string;
  firstNameEN: string;
  lastNameEN: string;
  phone: string;
  line?: string;
  address: string;
}

// Interface for form data (matching ProfilePage component)
export interface ProfileFormData {
  email: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  lineId: string;
  phone: string;
  address: string;
}

// API Response interfaces
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ProfileService {
  /**
   * Get current user's profile data
   */
  async getUserProfile(): Promise<UserProfileData> {
    try {
      const response = await api.get<ApiResponse<UserProfileData>>("/competency/profile");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch profile");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: ProfileUpdateData): Promise<UserProfileData> {
    try {
      const response = await api.put<ApiResponse<UserProfileData>>("/competency/profile", profileData);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error((error.response?.data as { message: string }).message);
      }
      throw new Error("Failed to update user profile");
    }
  }

  /**
   * Get basic user info (for avatar display)
   */
  async getUserBasicInfo(): Promise<Pick<UserProfileData, "id" | "email" | "firstNameEN" | "firstNameTH" | "profileImage">> {
    try {
      const response = await api.get<ApiResponse<Pick<UserProfileData, "id" | "email" | "firstNameEN" | "firstNameTH" | "profileImage">>>("/competency/profile/basic");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to fetch basic info");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching user basic info:", error);
      throw new Error("Failed to fetch user basic info");
    }
  }

  /**
   * Convert database format to form format
   */
  convertToFormData(profileData: UserProfileData): ProfileFormData {
    return {
      email: profileData.email,
      firstNameTh: profileData.firstNameTH || "",
      lastNameTh: profileData.lastNameTH || "",
      firstNameEn: profileData.firstNameEN || "",
      lastNameEn: profileData.lastNameEN || "",
      lineId: profileData.line || "",
      phone: profileData.phone || "",
      address: profileData.address || "",
    };
  }

  /**
   * Convert form format to database format
   */
  convertFromFormData(formData: ProfileFormData): ProfileUpdateData {
    return {
      firstNameTH: formData.firstNameTh,
      lastNameTH: formData.lastNameTh,
      firstNameEN: formData.firstNameEn,
      lastNameEN: formData.lastNameEn,
      phone: formData.phone,
      line: formData.lineId,
      address: formData.address,
    };
  }
}

export default new ProfileService();
