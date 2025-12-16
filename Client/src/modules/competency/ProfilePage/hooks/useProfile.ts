import { useState, useCallback, useRef } from "react";
import profileService, { UserProfileData, ProfileFormData } from "modules/competency/ProfilePage/services/profileService";

/**
 * Profile Hook State Interface
 */
interface ProfileState {
  // Profile data
  profileData: UserProfileData | null;
  formData: ProfileFormData;

  // Loading states
  loading: boolean;
  saving: boolean;

  // Error state
  error: string | null;

  // Last update timestamp
  lastUpdated: string;
}

/**
 * Hook configuration options
 */
interface UseProfileOptions {
  onSaveSuccess?: (data: UserProfileData) => void;
  onSaveError?: (error: string) => void;
  onLoadError?: (error: string) => void;
}

/**
 * Custom hook for managing user profile data
 *
 * Features:
 * - Load user profile data
 * - Update profile with validation
 * - Form state management
 * - Error handling
 * - Loading states
 */
export function useProfile(options?: UseProfileOptions) {
  const { onSaveSuccess, onSaveError, onLoadError } = options || {};

  // Use refs to store callbacks to prevent recreation of loadProfile
  const callbacksRef = useRef({ onSaveSuccess, onSaveError, onLoadError });
  callbacksRef.current = { onSaveSuccess, onSaveError, onLoadError };

  // Initialize form data with default values
  const initialFormData: ProfileFormData = {
    email: "",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    lineId: "",
    phone: "",
    address: "",
  };

  const [state, setState] = useState<ProfileState>({
    profileData: null,
    formData: initialFormData,
    loading: false,
    saving: false,
    error: null,
    lastUpdated: new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  /**
   * Load user profile data
   */
  const loadProfile = useCallback(async (): Promise<UserProfileData | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const profileData = await profileService.getUserProfile();
      const formData = profileService.convertToFormData(profileData);

      setState((prev) => ({
        ...prev,
        profileData,
        formData,
        loading: false,
        lastUpdated: new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      return profileData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load profile";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      callbacksRef.current.onLoadError?.(errorMessage);
      return null;
    }
  }, []); // Empty dependency array since we use refs for callbacks

  /**
   * Update form data
   */
  const updateFormData = useCallback((field: keyof ProfileFormData, value: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      error: null, // Clear error when user starts typing
    }));
  }, []);

  /**
   * Set multiple form fields at once
   */
  const setFormData = useCallback((newFormData: Partial<ProfileFormData>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...newFormData,
      },
    }));
  }, []);

  /**
   * Validate form data
   */
  const validateForm = useCallback((formData: ProfileFormData): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    const requiredFields = {
      firstNameTh: "กรุณากรอกชื่อ (ไทย)",
      lastNameTh: "กรุณากรอกนามสกุล (ไทย)",
      firstNameEn: "กรุณากรอกชื่อ (อังกฤษ)",
      lastNameEn: "กรุณากรอกนามสกุล (อังกฤษ)",
      phone: "กรุณากรอกหมายเลขโทรศัพท์",
      address: "กรุณากรอกที่อยู่",
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field as keyof ProfileFormData].trim()) {
        errors[field] = message;
      }
    });

    // Phone validation
    if (formData.phone.trim() && !/^[0-9-+\s()]{10,}$/.test(formData.phone)) {
      errors.phone = "รูปแบบหมายเลขโทรศัพท์ไม่ถูกต้อง";
    }

    return errors;
  }, []);

  /**
   * Save profile data
   */
  const saveProfile = useCallback(async (): Promise<{
    success: boolean;
    errors?: { [key: string]: string };
  }> => {
    // Validate form
    const validationErrors = validateForm(state.formData);
    if (Object.keys(validationErrors).length > 0) {
      return { success: false, errors: validationErrors };
    }

    setState((prev) => ({ ...prev, saving: true, error: null }));

    try {
      const updateData = profileService.convertFromFormData(state.formData);
      const updatedProfile = await profileService.updateUserProfile(updateData);
      const newFormData = profileService.convertToFormData(updatedProfile);

      setState((prev) => ({
        ...prev,
        profileData: updatedProfile,
        formData: newFormData,
        saving: false,
        lastUpdated: new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      callbacksRef.current.onSaveSuccess?.(updatedProfile);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save profile";
      setState((prev) => ({
        ...prev,
        saving: false,
        error: errorMessage,
      }));
      callbacksRef.current.onSaveError?.(errorMessage);
      return { success: false };
    }
  }, [state.formData, validateForm]);

  /**
   * Reset form to original data
   */
  const resetForm = useCallback(() => {
    if (state.profileData) {
      const formData = profileService.convertToFormData(state.profileData);
      setState((prev) => ({
        ...prev,
        formData,
        error: null,
      }));
    }
  }, [state.profileData]);

  /**
   * Check if form has changes
   */
  const hasChanges = useCallback((): boolean => {
    if (!state.profileData) return false;

    const originalFormData = profileService.convertToFormData(state.profileData);
    return JSON.stringify(originalFormData) !== JSON.stringify(state.formData);
  }, [state.profileData, state.formData]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    profileData: state.profileData,
    formData: state.formData,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Computed
    hasChanges: hasChanges(),

    // Actions
    loadProfile,
    updateFormData,
    setFormData,
    saveProfile,
    resetForm,
    validateForm: () => validateForm(state.formData),
    clearError,
  };
}

export default useProfile;
