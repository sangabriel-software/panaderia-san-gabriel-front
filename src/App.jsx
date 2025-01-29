import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/App.css";
import "./styles/globalStyles.css";

// Lazy-loaded components
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const LoginPage = lazy(() => import("./pages/LoginPages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage"));
const ManageUsers = lazy(() => import("./pages/UsersPages/Users/ManageUsers/ManageUsers"));
const ManageRoles = lazy(() => import("./pages/UsersPages/Roles/ManageRoles/ManageRoles"));
const CreateRolForm = lazy(() => import("./pages/UsersPages/Roles/CreateRoles/CreateRolForm"));
const UpdateRolesForm = lazy(() => import("./pages/UsersPages/Roles/UpdateRoles/UpdateRolesForm"));
const CreateUsers = lazy(() => import("./pages/UsersPages/Users/createUsers/CreateUsers"));


function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users">
            <Route path="users" element={<ManageUsers />} />
            <Route path="create-user" element={<CreateUsers />} />            
            <Route path="roles" element={<ManageRoles />} />
            <Route path="createRol" element={<CreateRolForm />} />
            <Route path="editRol/:idRol" element={<UpdateRolesForm />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;