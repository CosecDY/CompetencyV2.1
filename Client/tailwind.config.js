// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       screens: {
//         sm: "640px",
//       },

//       colors: {
//         admin: {
//           primary: "#2563EB", // Blue-600 (สดใส น่าเชื่อถือ)
//           hover: "#1D4ED8", // Blue-700 (เข้มขึ้นตอน Hover)
//           light: "#EFF6FF", // Blue-50 (ใช้ทำพื้นหลังปุ่ม Ghost หรือ Tag)

//           // ⬜ Layout Colors
//           bg: "#F1F5F9", // Slate-100 (พื้นหลังเว็บ สบายตากว่า Gray-100)
//           surface: "#FFFFFF", // White (พื้นหลัง Card/Navbar)
//           sidebar: "#1E293B", // Slate-800 (เผื่อทำ Sidebar สีเข้ม)

//           // 📏 Borders & Lines
//           border: "#E2E8F0", // Slate-200 (เส้นขอบที่ดู Soft ไม่แข็ง)

//           // 📝 Typography
//           text: "#0F172A", // Slate-900 (สีตัวหนังสือหลัก - เกือบดำแต่อ่านง่าย)
//           muted: "#64748B", // Slate-500 (สีตัวหนังสือรอง - เช่น วันที่, คำอธิบาย)
//         },

//         // ------------------------------------------------------------------
//         // 👤 COMPETENCY THEME (Placeholder)
//         // ------------------------------------------------------------------
//         comp: {
//           primary: "#8B5CF6",
//           hover: "#7C3AED",
//           bg: "#FFFFFF",
//         },

//         // ------------------------------------------------------------------
//         // 🚦 SHARED STATUS COLORS (ใช้ร่วมกันทั้ง 2 ระบบ)
//         // ------------------------------------------------------------------
//         danger: {
//           DEFAULT: "#EF4444", // Red-500 (ดูทันสมัยกว่า Red-600)
//           hover: "#DC2626", // Red-600
//           bg: "#FEF2F2", // Red-50 (พื้นหลัง Error message)
//         },
//         success: {
//           DEFAULT: "#10B981", // Emerald-500 (เขียวสบายตา)
//           bg: "#ECFDF5", // Emerald-50
//         },
//         warning: {
//           // ✅ เพิ่มสีแจ้งเตือน (จำเป็นสำหรับ Admin)
//           DEFAULT: "#F59E0B", // Amber-500
//           bg: "#FFFBEB", // Amber-50
//         },
//         info: {
//           // ✅ เพิ่มสีข้อมูลทั่วไป
//           DEFAULT: "#3B82F6", // Blue-500
//           bg: "#EFF6FF", // Blue-50
//         },
//       },

//       fontFamily: {
//         sans: ["Poppins", "Prompt", "sans-serif"],
//       },

//       borderRadius: {
//         lg: "0.5rem", // 8px (มาตรฐานปุ่ม)
//         xl: "0.75rem", // 12px (มาตรฐาน Card)
//         "2xl": "1rem", // 16px (Modal หรือ Card ใหญ่)
//       },
//     },
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ใช้ rgb(...) เพื่อให้ Tailwind ปรับ Opacity ได้ (เช่น bg-primary/50)
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",

        // Semantic Colors (ชื่อตามหน้าที่)
        background: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "main-text": "rgb(var(--color-text-main) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
