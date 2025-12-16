import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RouteWrapper from "./guards/RouteWrapper";
import AdminGuard from "./guards/AdminGuard";
import Loading from "@Components/Competency/Loading/Loading";

import { adminRoutes } from "./admin/adminRoutes";
import { HomePage, ResultsPage, CompetencyDetailPage, ProfilePage, AboutPage } from "@Pages/ExportPages";
import PortfolioPage from "modules/competency/PortfolioPage/PortfolioPage";

const AppRoutes: React.FC = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/competency/:source/:id" element={<CompetencyDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="portfolio" element={<PortfolioPage />} />

      {/* Protected Routes */}
      <Route>
        {/* Admin Module */}
        <Route
          path="admin/*"
          element={
            <AdminGuard>
              <RouteWrapper routes={adminRoutes} />
            </AdminGuard>
          }
        />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRoutes;
