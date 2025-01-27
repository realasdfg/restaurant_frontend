import React from "react";

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import OnlineMenuPage from "./pages/OnlineMenuPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import StaffPage from "./pages/StaffPage.jsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<OnlineMenuPage/>}/>
                <Route path="/staff/login" element={<LoginPage/>}/>
                <Route path="/orders" element={<ProtectedRoute><StaffPage/></ProtectedRoute>}/>
                <Route path="/orders/:orderId" element={<ProtectedRoute><StaffPage/></ProtectedRoute>}/>
            </Routes>
        </Router>
    )
}

export default App
