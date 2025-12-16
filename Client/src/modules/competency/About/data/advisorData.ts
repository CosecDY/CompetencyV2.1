import React from "react";
import { AdvisorInfo } from "../types/advisor.types";
import AdvisorIMG from "@Assets/competency/AboutPage/Advisor.jpeg";
import { FaFacebook, FaGlobe } from "react-icons/fa";

export const advisorInfo: AdvisorInfo = {
  name: "ดร.สุรเดช จิตประไพกุลศาล",
  englishName: "DR. Suradet Jitprapaikulsarn",
  image: AdvisorIMG,
  affiliations: [
    {
      name: "ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ (ECPE)",
      url: "https://ecpe.nu.ac.th",
    },
    {
      name: "คณะวิศวกรรมศาสตร์",
      url: "http://www.eng.nu.ac.th/eng2022/index.php",
    },
    {
      name: "มหาวิทยาลัยนเรศวร",
      url: "https://www.nu.ac.th/",
    },
  ],
  contact: {
    address: "99 หมู่ 9 ตำบลท่าโพธิ์ อำเภอเมือง พิษณุโลก พิษณุโลก 65000 ประเทศไทย",
    email: "suradet.j@gmail.com / suradet@nu.ac.th",
    officePhone: "055-96-4391",
    mobilePhone: "089-451-8144",
    appointmentUrl: "http://tinyurl.com/SJ-appointment",
  },
  socialLinks: [
    {
      url: "https://www.facebook.com/suradetj",
      icon: React.createElement(FaFacebook),
      label: "Facebook",
    },
    {
      url: "https://suradetj.wordpress.com/",
      icon: React.createElement(FaGlobe),
      label: "Website",
    },
  ],
};
