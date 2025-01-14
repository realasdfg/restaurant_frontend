import React from "react";

import OnlineMenu from "./components/OnlineMenu.jsx";
import {Header, Footer} from "antd/es/layout/layout.js";


function App() {
    return (
        <div className="bg-gray-100 font-mono">
            <Header className="flex justify-between items-center bg-blue-600 rounded-lg">
                <div className="text-white text-3xl font-bold">Restauracja</div>
                <div className="text-white  font-bold">+48 123-123-123</div>
            </Header>

            <OnlineMenu/>

            <Footer className="text-center bg-blue-600 text-white py-4 rounded-lg">
                <div>© 2025 Restauracja. All rights reserved.</div>
            </Footer>
        </div>
    )
}

export default App
