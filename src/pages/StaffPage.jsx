import React from 'react';
import {Route, Routes, useLocation} from 'react-router-dom';
import CurrentOrders from "../components/Staff/CurrentOrders.jsx";
import OrderDetails from "../components/Staff/OrderDetails.jsx";
import SHeader from "../components/shared/SHeader.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import OrdersArchive from "../components/Admin/OrdersArchive.jsx";
import UsersManagement from "../components/Admin/UsersManagement.jsx";


const StaffPage = () => {
    const location = useLocation();

    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <div className="bg-gray-200 font-mono min-h-screen flex flex-col">
            <SHeader isAdminPage={isAdminPage}/>
            <div className="container mx-auto">
                <Routes>
                    {isAdminPage ? (
                        <> {/* Admin routes */}
                            <Route path="orders" element={<OrdersArchive/>}/>
                            <Route path="orders/:orderId" element={<OrderDetails isAdmin={isAdminPage}/>}/>
                            <Route path="users" element={<UsersManagement/>}/>
                            {/*<Route path="users/:userId" element={<UserDetails/>}/>*/}
                            {/*<Route path="menu" element={<MenuManagement/>}/>*/}
                            {/*<Route path="tables" element={<MenuManagement/>}/>*/}
                            {/*<Route path="statistics" element={<Statistics/>}/>*/}
                        </>
                    ) : (
                        <> {/* Staff routes */}
                            <Route path="orders" element={<CurrentOrders/>}/>
                            <Route path="orders/:orderId" element={<OrderDetails/>}/>
                        </>
                    )}
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default StaffPage;
