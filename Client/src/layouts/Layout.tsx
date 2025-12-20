import React from "react";
import { Navbar, Footer } from "@Components/Admin/ExportComponent";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-main-text">
      <Navbar />
      <main className="mt-10 flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
