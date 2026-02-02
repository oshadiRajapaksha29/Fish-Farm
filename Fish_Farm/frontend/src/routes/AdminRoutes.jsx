import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../Component/userManagement/dashboard/AdminDashboardLayout";
import AdminDashboardHome from "../pages/userManagement/dashboardPages/AdminDashboardHomePage";
import AdminDashboardRegistrationPage from "../pages/userManagement/dashboardPages/AdminDashboardRegistrationPage";
import ShopOwnerRegistrationPage from "../pages/userManagement/dashboardPages/ShopOwnerRegistrationPage";
import DriverRegistrationPage from "../pages/userManagement/dashboardPages/DriverRegistrationPage";
import AccountManagementPage from "../pages/userManagement/dashboardPages/AccountManagementPage";
import ReportsPage from "../pages/userManagement/dashboardPages/ReportsPage";
import ActivityMonitoringPage from "../pages/userManagement/dashboardPages/ActivityMonitoringPage";
import SystemConfigurationsPage from "../pages/userManagement/dashboardPages/SystemConfigurationsPage";
import AdministrationToolsPage from "../pages/userManagement/dashboardPages/AdministrationToolsPage";

function AdminRoutes() {

   return (
      <Routes>
         <Route path="/" element={<DashboardLayout />}>
            <Route path="/dashboard" element={<AdminDashboardHome />} />

            <Route path="account-management" element={<AccountManagementPage />} />

            <Route path="user-registration" >
               <Route index element={<AdminDashboardRegistrationPage />} />
               <Route path="shop-owner" element={<ShopOwnerRegistrationPage />} />
               <Route path="employee" element={<DriverRegistrationPage />} />
            </Route>

            <Route path="reports" element={<ReportsPage />} />

            <Route path="activity-monitoring" element={<ActivityMonitoringPage />} />

            <Route path="administration-tools" element={<AdministrationToolsPage />} />

            <Route path="system-configurations" element={<SystemConfigurationsPage />} />
         </Route>
      </Routes>
   );
}

export default AdminRoutes;
