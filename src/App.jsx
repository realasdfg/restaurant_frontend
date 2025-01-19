import React from "react";

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import OnlineMenuPage from "./pages/OnlineMenuPage.jsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<OnlineMenuPage/>}/>
                {/*<Route path="/waiter" element={<WaiterPage/>}/>*/}
                {/*<Route path="/admin" element={<AdminPage/>}/>*/}
            </Routes>
        </Router>
    )
}

export default App
