import React from "react";

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import GuestsPage from "./pages/GuestsPage.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/*" element={<GuestsPage/>}/>

                    <Route path="/staff/login" element={<LoginPage/>}/>
                    <Route path="/staff/*" element={
                        <ProtectedRoute requiredRole="staff"><StaffPage/></ProtectedRoute>
                    }/>
                    <Route path="/admin/*" element={
                        <ProtectedRoute requiredRole="admin"><StaffPage/></ProtectedRoute>
                    }/>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
