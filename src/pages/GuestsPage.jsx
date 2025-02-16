import React from 'react';
import 'tailwindcss/tailwind.css';
import {Route, Routes} from "react-router-dom";
import NotFoundPage from "./NotFoundPage.jsx";
import OnlineMenu from "../components/Guests/OnlineMenu.jsx";
import GuestsHeader from "../components/Guests/GuestsHeader.jsx";
import GuestOrder from "../components/Guests/GuestOrder.jsx";
import Payment from "../components/Guests/Payment.jsx";

const GuestsPage = () => {
    return (
        <div className="bg-gray-100 font-mono">
            <Routes>
                <Route path="/" element={<OnlineMenu/>}/>
                <Route path="tables/:tableId" element={<GuestOrder/>}/>
                <Route path="payment" element={<Payment/>}/>

                <Route path="*" element={<><GuestsHeader/><NotFoundPage/></>}/>
            </Routes>
        </div>
    );
};

export default GuestsPage;
