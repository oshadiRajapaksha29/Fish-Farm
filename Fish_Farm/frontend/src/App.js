// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import NavbarLayout from "./Component/Home/NavbarLayout.jsx";

// Public Pages
import MainHome from "./Component/Home/Home.jsx";
import Items from "./Component/Items/Items.jsx";
import About from "./Component/Home/About.jsx";
import ContactUs from "./Component/Home/ContactUs.jsx"; // unified naming

// Auth
import AdminPortal from "./Component/AdminPortal/AdminPortal.jsx";
import EmployeeLoginPortal from "./Component/EmployeePortal/EmployeeLoginPortal.jsx";
import FishStoreLogin from "./Component/AdminPortal/Login.jsx";
import DarkFishStoreRegister from "./Component/AdminPortal/Register.jsx";

// Tank Module
import TankDashboardLayout from "./Component/Tank/Sidebar/DashboardLayout.jsx";
import DashboardHome from "./Component/Tank/Pages/DashboardHome.jsx";
import AddDetails from "./Component/Tank/Pages/AddDetails.jsx";
import WaterLevel from "./Component/Tank/Pages/WaterLevel.jsx";
import Reports from "./Component/Tank/Pages/Reports.jsx";
import MudPuddles from "./Component/Tank/Pages/AddTanks/MudPuddles/AddMudPuddles.jsx";
import GlassTanks from "./Component/Tank/Pages/AddTanks/GlassTanks/AddGlassTanks.jsx";
import AddCementTanks from "./Component/Tank/Pages/AddTanks/CementTanks/AddCementTanks.jsx";
import AllTankAdd from "./Component/Tank/Pages/AddTanks/AllTankAdd.jsx";
import UpdateAllTank from "./Component/Tank/Pages/AddTanks/UpdateAllTank.jsx";
import ViewAllTank from "./Component/Tank/Pages/AddTanks/ViewAllTank.jsx";

// Accessories Module
import AccessoriesDashboardLayout from "./Component/Tank/Pages/Accessories/AccessoriesSidebar/AccessoriesDashboardLayout.jsx";
import AccessoriesDashboardHome from "./Component/Tank/Pages/Accessories/AccessoriesSidebar/AccessoriesDashboardHome.jsx";
import AddNewAccessories from "./Component/Tank/Pages/Accessories/AddNewAccessories.jsx";
import ViewAccessories from "./Component/Tank/Pages/Accessories/ViewAccessories.jsx";
import UpdateAccessories from "./Component/Tank/Pages/Accessories/UpdateAccessories.jsx";
import Accessories from "./Component/Tank/Pages/Accessories/Accessories.jsx";
import ProductDetail from "./Component/Tank/Pages/Accessories/ProductDetail.jsx";
import AccessoriesReport from "./Component/Tank/Pages/Accessories/AccessoriesReport.jsx";

// Fish Module
import FishDashboardLayout from "./Component/Fish/Sidebar/FishDashboardLayout.jsx";
import FishDashboardHome from "./Component/Fish/Sidebar/FishDashboardHome.jsx";
import AddDetail from "./Component/Fish/Pages/AddDetails/AddDetails.jsx";
import FishViewDetails from "./Component/Fish/Pages/ViewFish/ViewFish.jsx";
import FishReportPage from "./Component/Fish/Pages/FishReportPage/FishReportPage.jsx";

// Medicine Module
import MedicineDashboardLayout from "./Component/Health/Medicine/MedicineSidebar/MedicineDashboardLayout.jsx";
import MedicineDashboardHome from "./Component/Health/Medicine/MedicineSidebar/MedicineDashboardHome.jsx";
import AddMedicine from "./Component/Health/Medicine/AddMedicine/AddMedicine.jsx";
import MedicineList from "./Component/Health/Medicine/AddMedicine/MedicineList.jsx";
import UpdateMedicine from "./Component/Health/Medicine/AddMedicine/UpdateMedicine.jsx";
import MedicineReportPage from "./Component/Health/Medicine/AddMedicine/MedicineReportPage.jsx";

// Mortality Module
import MortalityDashboardLayout from "./Component/Health/Mortality/Sidebar/MortalityDashboardLayout.jsx";
import MortalityDashboardHome from "./Component/Health/Mortality/Sidebar/MortalityDashboardHome.jsx";
import AddMortality from "./Component/Health/Mortality/Pages/AddMortality/AddMortality.jsx";
import ViewMortality from "./Component/Health/Mortality/Pages/ViewMortality/ViewMortality.jsx";
import MortalityReportPage from "./Component/Health/Mortality/Pages/MortalityReportPage/MortalityReportPage.jsx";

// Disease Module
import DiseaseReportDashboardLayout from "./Component/Health/DiseaseReport/Sidebar/DiseaseReportDashboardLayout.jsx";
import DiseaseReportDashboardHome from "./Component/Health/DiseaseReport/Sidebar/DiseaseReportDashboardHome.jsx";
import AddDisease from "./Component/Health/DiseaseReport/Pages/AddDisease/AddDisease.jsx";
import ViewDisease from "./Component/Health/DiseaseReport/Pages/ViewDisease/ViewDisease.jsx";
import DiseaseReportPage from "./Component/Health/DiseaseReport/Pages/DiseaseReportPage/DiseaseReportPage.jsx";

// Orders
import OrderDashboardLayout from "./Component/Orders/Sidebar/OrderDashboardLayout.jsx";
import OrderDashboardHome from "./Component/Orders/Sidebar/OrderDashboardHome.jsx";
import MyOrders from "./Component/Orders/MyOrders/MyOrders.jsx";
import OrderDetail from "./Component/Orders/MyOrders/OrderDetail.jsx";
import AdminOrderDetails from "./Component/Orders/OrderDetails/AdminOrderDetails.jsx";
import AdminOrderList from "./Component/Orders/OrderDetails/AdminOrderList.jsx";
import LatestOrderRedirect from "./Component/Orders/OrderDetails/LatestOrderRedirect.jsx";
import OrderManagementReport from "./Component/Orders/OrderDetails/OrderManagementReport.jsx";
import OrderManagementDashboard from "./Component/Orders/OrderDetails/OrderManagementDashboard.jsx";
import AdminReturnRequests from "./Component/Orders/OrderDetails/AdminReturnRequests.jsx";

// Food & Medicine
import FoodAndMedicineDashboardLayout from "./Component/Items/Food&Medicine/FoodAndMedicineSidebar/FoodAndMedicineDashboardLayout.jsx";
import FoodAndMedicineDashboardHome from "./Component/Items/Food&Medicine/FoodAndMedicineSidebar/FoodAndMedicineDashboardHome.jsx";
import FoodAndMedicine from "./Component/Items/Food&Medicine/AddFoodOrMedicine/AddFoodOrMedicine.jsx";
import UpdateFoodAndMedicine from "./Component/Items/Food&Medicine/AddFoodOrMedicine/UpdateFoodAndMedicine.jsx";
import ViewFoodAndMedicine from "./Component/Items/Food&Medicine/AddFoodOrMedicine/ViewFoodAndMedicine.jsx";
import FoodMedicineReports from "./Component/Items/Food&Medicine/Reports/FoodMedicineReports.jsx";

// Health Portal
import HelthPortal from "./Component/Health/HelthPortal/HelthPortal.jsx";

// Customer Shopping
import ShopFoodMedicine from "./Component/Items/Food&Medicine/ShopFoodMedicine.jsx";
import ProductDetails from "./Component/Items/Food&Medicine/ProductDetails.jsx";
import Cart from "./Component/Orders/Cart/Cart.jsx";
import Checkout from "./Component/Orders/Cart/Checkout.jsx";
import OrderSuccess from "./Component/Orders/Cart/OrderSuccess.jsx";

// Fish Customer Pages
import Home from "./Component/Fish/CustomerPages/Home.jsx";
import Species from "./Component/Fish/CustomerPages/Species.jsx";
import FishProductDetail from "./Component/Fish/CustomerPages/FishProductDetail.jsx";
import ShopFish from "./Component/Fish/CustomerPages/ShopFish.jsx";

// Employee Task Module
import EmployeeTaskDashboardLayout from "./Component/EmployeeTask/Sidebar/EmployeeTaskDashboardLayout.jsx";
import EmployeeTaskDashboardHome from "./Component/EmployeeTask/EmployeeTaskDashboardHome.jsx";
import EmployeeTask from "./Component/EmployeeTask/AddTask.jsx";
import ViewEmployeeTask from "./Component/EmployeeTask/ViewTask.jsx";
import UpdateTask from "./Component/EmployeeTask/UpdateTask.jsx";
import EmployeeView from "./Component/EmployeeTask/EmployeeView.jsx";
import EmployeeReports from "./Component/EmployeeTask/Reports.jsx";

// Inventory Module
import InventoryDashboardLayout from "./Component/Inventary/InventarySidebar/InventoryDashboardLayout.jsx";
import InventoryDashboardHome from "./Component/Inventary/InventarySidebar/InventoryDashboardHome.jsx";
import ViewInventary from "./Component/Inventary/DisplayInventary.jsx";
import AddInventary from "./Component/Inventary/AddInventary.jsx";
import UpdateInventary from "./Component/Inventary/UpdateInventary.jsx";
import InventaryReports from "./Component/Inventary/InventaryReports.jsx";

// Breeding Module
import BreedingDashboardLayout from "./Component/Breading/BreedingSidebar/BreedingDashboardLayout.jsx";
import BreedingDashboard from "./Component/Breading/BreedingSidebar/BreedingDashboard.jsx";
import Mother from "./Component/Breading/Mother Tank/MotherTank.jsx";
import Baby from "./Component/Breading/Baby Tank/AddBabyTank.jsx";
import ViewMother from "./Component/Breading/Mother Tank/ViewMother.jsx";
import Baby_Mom_Report from "./Component/Breading/Baby_Mom_Report.jsx";
import View_parent from "./Component/Breading/Mother Tank/View_parent.jsx";

// Massage / Notification Module (from teammate)
import MassageDashboardLayout from "./Component/Massage/MassageSidebar/MassageDashboardLayout.jsx";
import MassageDashboardHome from "./Component/Massage/MassageSidebar/MassageDashboardHome.jsx";
import AddNotification from "./Component/Massage/Massage.jsx";
import View_All_Massage from "./Component/Massage/View_All_Massage.jsx";

// Admin & Profile
import AdminRoutes from "./routes/AdminRoutes.jsx";
import ProfilePage from "./pages/userManagement/ProfilePage.jsx";
import Logout from "./Component/userManagement/shared/Logout.jsx";

// Context
import { CartProvider } from "./Component/Orders/Cart/CartContext.jsx";

// Global AI Chatbot
import AIChatbot from "./Component/AI/AIChatbot.jsx";

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route element={<NavbarLayout />}>
          <Route index element={<MainHome />} />
          <Route path="/items" element={<Items />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Shop */}
          <Route path="/shop" element={<ShopFish />} />
          <Route path="/categories/:type" element={<ShopFish />} />

          {/* Customer Shopping */}
          <Route path="/shop/food-medicine" element={<ShopFoodMedicine />} />
          <Route path="/shop/food-medicine/:id" element={<ProductDetails />} />
          <Route path="/shop/fish" element={<ShopFish />} />
          <Route path="/fish/:id" element={<FishProductDetail />} />
          <Route path="/shop/accessories" element={<Accessories />} />
          <Route path="/shop/accessories/:id" element={<ProductDetail />} />
          <Route path="/species" element={<Species />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/order-success/thank-you" element={<OrderSuccess />} />

          {/* My Orders */}
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-orders/:id" element={<OrderDetail />} />

          {/* Accessories (Alternative Dashboard Route with Navbar) */}
          <Route path="/dashboard/homeaccessories" element={<Accessories />} />
          <Route path="/dashboard/homeaccessories/:id" element={<ProductDetail />} />
        </Route>

        {/* ---------- AUTH ---------- */}
        <Route path="/login" element={<FishStoreLogin />} />
        <Route path="/register" element={<DarkFishStoreRegister />} />
        <Route path="/EmployeeLoginPortal" element={<EmployeeLoginPortal />} />

        {/* ---------- ADMIN & PROFILE ---------- */}
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/HelthPortal" element={<HelthPortal />} />

        {/* ---------- MODULE DASHBOARDS ---------- */}
        {/* Tank */}
        <Route path="/dashboard" element={<TankDashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="tank/AddDetails" element={<AddDetails />} />
          <Route path="tank/AddDetails/mud" element={<MudPuddles />} />
          <Route path="tank/AddDetails/glass" element={<GlassTanks />} />
          <Route path="tank/AddDetails/cement" element={<AddCementTanks />} />
          <Route path="tank/AddDetails/all" element={<AllTankAdd />} />
          <Route path="tank/view-live" element={<ViewAllTank />} />
          <Route path="tank/view-details/:id" element={<UpdateAllTank />} />
          <Route path="tank/water-level" element={<WaterLevel />} />
          <Route path="tank/reports" element={<Reports />} />
        </Route>

        {/* Massage / Notification */}
        <Route path="/dashboard/Notification" element={<MassageDashboardLayout />}>
          <Route index element={<AddNotification />} />
          <Route path="addNotification" element={<AddNotification />} />
          <Route path="viewAllMassage" element={<View_All_Massage />} />
        </Route>

        {/* Accessories - Admin Dashboard */}
        <Route path="/dashboard/accessories" element={<AccessoriesDashboardLayout />}>
          <Route index element={<AccessoriesDashboardHome />} />
          <Route path="AddNewAccessories" element={<AddNewAccessories />} />
          <Route path="ViewAccessories" element={<ViewAccessories />} />
          <Route path="ViewAccessories/:id" element={<UpdateAccessories />} />
          <Route path="AccessoriesReport" element={<AccessoriesReport />} />
        </Route>

        {/* Fish */}
        <Route path="/dashboard/fish" element={<FishDashboardLayout />}>
          <Route index element={<FishDashboardHome />} />
          <Route path="AddDetail" element={<AddDetail />} />
          <Route path="view" element={<FishViewDetails />} />
          <Route path="reports" element={<FishReportPage />} />
        </Route>

        {/* Medicine */}
        <Route path="/dashboard/medicine" element={<MedicineDashboardLayout />}>
          <Route index element={<MedicineDashboardHome />} />
          <Route path="AddDetails" element={<AddMedicine />} />
          <Route path="View" element={<MedicineList />} />
          <Route path="update/:id" element={<UpdateMedicine />} />
          <Route path="Edit/:id" element={<UpdateMedicine />} />
          <Route path="Report" element={<MedicineReportPage />} />
        </Route>

        {/* Mortality */}
        <Route path="/dashboard/mortality" element={<MortalityDashboardLayout />}>
          <Route index element={<MortalityDashboardHome />} />
          <Route path="add-detail" element={<AddMortality />} />
          <Route path="view" element={<ViewMortality />} />
          <Route path="reports" element={<MortalityReportPage />} />
        </Route>

        {/* Disease */}
        <Route path="/dashboard/disease" element={<DiseaseReportDashboardLayout />}>
          <Route index element={<DiseaseReportDashboardHome />} />
          <Route path="AddDetail" element={<AddDisease />} />
          <Route path="view" element={<ViewDisease />} />
          <Route path="reports" element={<DiseaseReportPage />} />
        </Route>

        {/* Food & Medicine */}
        <Route path="/dashboard/FoodAndMedicine" element={<FoodAndMedicineDashboardLayout />}>
          <Route index element={<FoodAndMedicineDashboardHome />} />
          <Route path="AddNewFoodAndMedicine" element={<FoodAndMedicine />} />
          <Route path="ViewFoodAndMedicine" element={<ViewFoodAndMedicine />} />
          <Route path="UpdateFoodAndMedicine/:id" element={<UpdateFoodAndMedicine />} />
          <Route path="reports" element={<FoodMedicineReports />} />
        </Route>

        {/* Employee Task */}
        <Route path="/dashboard/EmployeeTask" element={<EmployeeTaskDashboardLayout />}>
          <Route index element={<EmployeeTaskDashboardHome />} />
          <Route path="AddTask" element={<EmployeeTask />} />
          <Route path="ViewTask" element={<ViewEmployeeTask />} />
          <Route path="ViewTask/:id" element={<UpdateTask />} />
          <Route path="Reports" element={<EmployeeReports />} />
        </Route>
        <Route path="/EmployeeView" element={<EmployeeView />} />

        {/* Inventory */}
        <Route path="/dashboard/Inventory" element={<InventoryDashboardLayout />}>
          <Route index element={<InventoryDashboardHome />} />
          <Route path="DisplayInventary" element={<ViewInventary />} />
          <Route path="AddInventary" element={<AddInventary />} />
          <Route path="DisplayInventary/:id" element={<UpdateInventary />} />
          <Route path="InventaryReports" element={<InventaryReports />} />
        </Route>

        {/* Breeding */}
        <Route path="/dashboard/Breeding" element={<BreedingDashboardLayout />}>
          <Route index element={<BreedingDashboard />} />
          <Route path="mother" element={<Mother />} />
          <Route path="baby" element={<Baby />} />
          <Route path="viewmother" element={<ViewMother />} />
          <Route path="Baby_Mom_Report" element={<Baby_Mom_Report />} />
          <Route path="view_parent" element={<View_parent />} />
        </Route>

        {/* Admin Orders */}
        <Route path="/dashboard/admin" element={<OrderDashboardLayout />}>
          <Route index element={<OrderManagementDashboard />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="orders/dashboard" element={<OrderManagementDashboard />} />
          <Route path="orders/report" element={<OrderManagementReport />} />
          <Route path="orders/returns" element={<AdminReturnRequests />} />
          <Route path="orders/:orderId" element={<AdminOrderDetails />} />
          <Route path="orders/details" element={<LatestOrderRedirect />} />
        </Route>

        {/* Logout */}
        <Route path="/logout" element={<Logout />} />
      </Routes>

      {/* Global Chat Components */}
      <AIChatbot />
    </CartProvider>
  );
}

export default App;
