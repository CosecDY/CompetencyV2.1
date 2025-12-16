import React from "react";
import { FormCard, InputField } from "./index";

interface ContactSectionProps {
  formData: {
    lineId: string;
    phone: string;
    address: string;
  };
  errors: { [key: string]: string };
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  formData,
  errors,
  onInputChange,
}) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center mb-6">
        <i className="fas fa-address-book text-emerald-600 text-2xl mr-4"></i>
        <div>
          <h3 className="text-xl font-bold text-gray-800">ข้อมูลการติดต่อ</h3>
          <p className="text-gray-600 text-sm">ข้อมูลสำหรับการติดต่อกลับ</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormCard>
            <InputField
              label="Line ID"
              field="lineId"
              placeholder="กรอก Line ID (ถ้ามี)"
              icon="fab fa-line text-green-500"
              value={formData.lineId}
              onChange={onInputChange}
            />
          </FormCard>
          <FormCard>
            <InputField
              label="หมายเลขโทรศัพท์"
              field="phone"
              type="tel"
              placeholder="กรอกหมายเลขโทรศัพท์"
              required={true}
              icon="fas fa-mobile-alt text-blue-500"
              value={formData.phone}
              error={errors.phone}
              onChange={onInputChange}
            />
          </FormCard>
        </div>

        <FormCard>
          <InputField
            label="ที่อยู่"
            field="address"
            type="textarea"
            rows={4}
            placeholder="กรอกที่อยู่ของคุณ"
            required={true}
            icon="fas fa-map-marker-alt text-red-500"
            value={formData.address}
            error={errors.address}
            onChange={onInputChange}
          />
        </FormCard>
      </div>
    </div>
  );
};
