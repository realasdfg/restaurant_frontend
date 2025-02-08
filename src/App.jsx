import React from "react";

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import OnlineMenuPage from "./pages/OnlineMenuPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import SHeader from "./components/shared/SHeader.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<OnlineMenuPage/>}/>
                    <Route path="/staff/login" element={<LoginPage/>}/>
                    <Route path="/orders" element={<ProtectedRoute requiredRole="staff"><StaffPage/></ProtectedRoute>}/>
                    <Route path="/orders/:orderId" element={
                        <ProtectedRoute requiredRole="staff"><StaffPage/></ProtectedRoute>
                    }/>

                    <Route path="*" element={<ProtectedRoute><SHeader></SHeader><NotFoundPage/></ProtectedRoute>}/>
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
