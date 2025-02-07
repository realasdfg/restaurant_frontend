import React from 'react';
import {useParams} from 'react-router-dom';
import CurrentOrders from "../components/Staff/CurrentOrders.jsx";
import OrderDetails from "../components/Staff/OrderDetails.jsx";
import SHeader from "../components/shared/SHeader.jsx";


const StaffPage = () => {
    const {orderId} = useParams();

    return (
        <div className="bg-gray-200 font-mono min-h-screen flex flex-col">
            <SHeader/>
            <div>
                {orderId ? (
                    <OrderDetails orderId={orderId}/>
                ) : (
                    <CurrentOrders/>
                )}
            </div>
        </div>
    );
};

export default StaffPage;
