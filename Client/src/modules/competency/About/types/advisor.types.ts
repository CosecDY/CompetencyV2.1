export interface ContactInfo {
  address: string;
  email: string;
  officePhone: string;
  mobilePhone: string;
  appointmentUrl: string;
}

export interface SocialLink {
  url: string;
  icon: React.ReactNode;
  label: string;
}

export interface AffiliationLink {
  name: string;
  url: string;
}

export interface AdvisorInfo {
  name: string;
  englishName: string;
  image: string;
  affiliations: AffiliationLink[];
  contact: ContactInfo;
  socialLinks: SocialLink[];
}
