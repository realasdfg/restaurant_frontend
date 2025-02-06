import React, {useState} from 'react';
import {Button, message, Dropdown} from 'antd';
import {fetchTables, createOrder} from '../../services/api';
import {DownOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import TableListModal from "./TableListModal.jsx";

const CreateOrderDropdown = () => {
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [tables, setTables] = useState([]);
    const navigate = useNavigate();


    const handleCreateTogoOrder = async () => {
        try {
            const response = await createOrder({type: 'togo'});
            navigate(`/orders/${response.data.id}`);
        } catch (error) {
            message.error('Błąd podczas tworzenia zamówienia');
            console.error(error);
        }
    };

    const handleCreateDineInOrder = async (table) => {
        if (!table.is_free) return;
        try {
            const response = await createOrder({type: 'dinein', table_id: table.id});
            setIsTableModalOpen(false);
            navigate(`/orders/${response.data.id}`);
        } catch (error) {
            if (error.response?.status === 400) {
                await openModal()
                message.error('Stół już jest zajęty!');
            } else {
                message.error('Błąd podczas tworzenia zamówienia');
                console.error(error);
            }
        }
    };

    const openModal = async () => {
        try {
            const response = await fetchTables();
            setTables(response.data.sort((a, b) => a.name.localeCompare(b.name)));
            setIsTableModalOpen(true);
        } catch (error) {
            message.error('Nie udało się załadować stolików');
            console.error('Error fetching tables:', error);
        }
    };

    const dropdownItems = [
        {
            label: 'W restauracji',
            key: 'dinein',
            onClick: openModal,
        },
        {
            label: 'Na wynos',
            key: 'togo',
            onClick: handleCreateTogoOrder,
        },
    ];

    return (
        <>
            <Dropdown menu={{items: dropdownItems}}>
                <Button color="primary" variant="outlined">
                    Nowe
                    <DownOutlined/>
                </Button>
            </Dropdown>
            <TableListModal
                open={isTableModalOpen}
                onCancel={() => setIsTableModalOpen(false)}
                onclick={handleCreateDineInOrder}
                tables={tables}
            />
        </>
    );
};

export default CreateOrderDropdown;
