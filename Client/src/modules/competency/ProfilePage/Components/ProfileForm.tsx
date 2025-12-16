import React from "react";
import { FormCard, InputField, SaveButton } from "./index";
import { ProfileCardHeader } from "./ProfileCardHeader";
import { NamesSection } from "./NamesSection";
import { ContactSection } from "./ContactSection";

interface ProfileFormData {
  email: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  lineId: string;
  phone: string;
  address: string;
}

interface ProfileFormProps {
  userFirstName: string;
  formData: ProfileFormData;
  errors: { [key: string]: string };
  saving: boolean;
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  userFirstName,
  formData,
  errors,
  saving,
  onInputChange,
  onSave,
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30 overflow-hidden">
        {/* Card Header with Avatar */}
        <ProfileCardHeader userFirstName={userFirstName} />

        {/* Form Content */}
        <div className="p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Email Section - Left Column */}
            <div className="lg:col-span-1">
              <FormCard highlight={true} className="sticky top-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                    <i className="fas fa-envelope text-teal-600 mr-3"></i>
                    ข้อมูลบัญชี
                  </h3>
                  <InputField
                    label="อีเมล"
                    field="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                    icon="fas fa-envelope text-gray-400"
                    onChange={onInputChange}
                  />
                </div>
              </FormCard>
            </div>

            {/* Form Fields - Right Columns */}
            <div className="lg:col-span-3 space-y-12">
              {/* Names Sections */}
              <NamesSection
                formData={{
                  firstNameTh: formData.firstNameTh,
                  lastNameTh: formData.lastNameTh,
                  firstNameEn: formData.firstNameEn,
                  lastNameEn: formData.lastNameEn,
                }}
                errors={errors}
                onInputChange={onInputChange}
              />

              {/* Contact Information Section */}
              <ContactSection
                formData={{
                  lineId: formData.lineId,
                  phone: formData.phone,
                  address: formData.address,
                }}
                errors={errors}
                onInputChange={onInputChange}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <SaveButton onClick={onSave} loading={saving} disabled={saving} />
          </div>
        </div>
      </div>
    </div>
  );
};
