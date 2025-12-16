import React from "react";
import { FormCard, InputField } from "./index";

interface NamesSectionProps {
  formData: {
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
  };
  errors: { [key: string]: string };
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const NamesSection: React.FC<NamesSectionProps> = ({
  formData,
  errors,
  onInputChange,
}) => {
  return (
    <div className="space-y-12">
      {/* Thai Names Section */}
      <div className="bg-white/70 backdrop-blur-sm border border-teal-500/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <i className="fas fa-id-card text-teal-600 text-2xl mr-4"></i>
          <div>
            <h3 className="text-xl font-bold text-gray-800">ชื่อ-นามสกุล (ไทย)</h3>
            <p className="text-gray-600 text-sm">กรุณากรอกชื่อ-นามสกุลภาษาไทย</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCard>
            <InputField
              label="ชื่อ (ไทย)"
              field="firstNameTh"
              placeholder="กรอกชื่อภาษาไทย"
              required={true}
              value={formData.firstNameTh}
              error={errors.firstNameTh}
              onChange={onInputChange}
            />
          </FormCard>
          <FormCard>
            <InputField
              label="นามสกุล (ไทย)"
              field="lastNameTh"
              placeholder="กรอกนามสกุลภาษาไทย"
              required={true}
              value={formData.lastNameTh}
              error={errors.lastNameTh}
              onChange={onInputChange}
            />
          </FormCard>
        </div>
      </div>

      {/* English Names Section */}
      <div className="bg-white/70 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <i className="fas fa-globe text-blue-600 text-2xl mr-4"></i>
          <div>
            <h3 className="text-xl font-bold text-gray-800">ชื่อ-นามสกุล (อังกฤษ)</h3>
            <p className="text-gray-600 text-sm">กรุณากรอกชื่อ-นามสกุลภาษาอังกฤษ</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCard>
            <InputField
              label="First Name"
              field="firstNameEn"
              placeholder="Enter your first name"
              required={true}
              value={formData.firstNameEn}
              error={errors.firstNameEn}
              onChange={onInputChange}
            />
          </FormCard>
          <FormCard>
            <InputField
              label="Last Name"
              field="lastNameEn"
              placeholder="Enter your last name"
              required={true}
              value={formData.lastNameEn}
              error={errors.lastNameEn}
              onChange={onInputChange}
            />
          </FormCard>
        </div>
      </div>
    </div>
  );
};
