import React, { useState, useEffect, useContext } from "react";
import Layout from "@Layouts/Layout";
import { WhiteTealBackground } from "@Components/Common/Background/WhiteTealBackground";
import AuthContext from "@Contexts/AuthContext";
import useProfile from "@Hooks/useProfile";
import { ProfileHeader, ConfirmationDialog, SuccessToast, AuthStates, ProfileForm } from "./Components";
import "./ProfilePage.css";

const ProfilePage = () => {
  const auth = useContext(AuthContext);

  // Get the same firstName that ProfileDisplay uses for consistency
  const userFirstName = auth?.user?.firstName || auth?.user?.email?.split("@")[0] || "User";

  // Dialog and toast states
  const [showDialog, setShowDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use the profile hook
  const { formData, loading, saving, error, lastUpdated, loadProfile, updateFormData, saveProfile, validateForm, clearError } = useProfile({
    onSaveSuccess: (data) => {
      console.log("Profile saved successfully:", data);
      setShowToast(true);
      setErrors({});
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    },
    onSaveError: (errorMessage) => {
      console.error("Error saving profile:", errorMessage);
      // You could show an error toast here if needed
    },
    onLoadError: (errorMessage) => {
      console.error("Error loading profile:", errorMessage);
      // You could show an error message here if needed
    },
  });

  // Load profile data only after auth is initialized and user is authenticated
  useEffect(() => {
    if (!auth?.loading && auth?.user) {
      loadProfile().catch(console.error);
    }
  }, [auth?.loading, auth?.user, loadProfile]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateFormData(field as keyof typeof formData, e.target.value);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSave = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setShowDialog(true);
    }
  };

  const confirmSave = async () => {
    setShowDialog(false);
    const result = await saveProfile();

    if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <Layout>
      <WhiteTealBackground>
        <div className="container mx-auto px-4 py-16">
          {/* Auth and Loading States */}
          <AuthStates isAuthLoading={!!auth?.loading} isAuthenticated={!!auth?.user} isProfileLoading={loading} error={error} onRetry={() => loadProfile().catch(console.error)} />

          {/* Profile Content - Only show when ready */}
          {!auth?.loading && auth?.user && !loading && !error && (
            <>
              {/* Header Section */}
              <ProfileHeader lastUpdated={lastUpdated} />

              {/* Main Profile Form */}
              <ProfileForm userFirstName={userFirstName} formData={formData} errors={errors} saving={saving} onInputChange={handleInputChange} onSave={handleSave} />
            </>
          )}
        </div>
      </WhiteTealBackground>

      {/* Dialogs and Toasts */}
      <ConfirmationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={confirmSave}
        title="ยืนยันการบันทึก"
        message="คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลส่วนบุคคลนี้ใช่หรือไม่?"
      />

      <SuccessToast isVisible={showToast} message="บันทึกข้อมูลสำเร็จ!" onClose={() => setShowToast(false)} />
    </Layout>
  );
};

export default ProfilePage;
