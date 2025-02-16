import React, {useEffect} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import GuestsHeader from "./GuestsHeader.jsx";
import {payOrderOnline} from "../../services/api.js";
import {message} from "antd";

const Payment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get("orderId");
    const tableId = searchParams.get("tableId");

    useEffect(() => {
        const pay = async () => {
            try {
                await payOrderOnline(orderId);
            } catch (error) {
                message.error("Błąd opłaty zamówienia")
                console.error(error)
            } finally {
                setTimeout(() => {
                    navigate(`/tables/${tableId}`);
                }, 5000);
            }
        };

        pay();
    }, [navigate, tableId, orderId]);

    return (
        <>
            <GuestsHeader isMenu={false}/>
            <div className="flex justify-center min-h-screen">
                <h2>Przetwarzanie płatności...</h2>
            </div>
        </>
    );
};

export default Payment;
