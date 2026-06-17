import React from "react";

import {BrowserRouter, Routes, Route} from 'react-router-dom';
import GuestPage from "./pages/GuestPage.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/*" element={<GuestPage/>}/>

                    <Route path="/staff/login" element={<LoginPage/>}/>
                    <Route path="/staff/*" element={
                        <ProtectedRoute requiredRole="staff"><StaffPage/></ProtectedRoute>
                    }/>
                    <Route path="/admin/*" element={
                        <ProtectedRoute requiredRole="admin"><StaffPage/></ProtectedRoute>
                    }/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
