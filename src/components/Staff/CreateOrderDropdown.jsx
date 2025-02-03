import React, {useState} from 'react';
import {Modal, Button, message, Dropdown, List} from 'antd';
import {fetchTables, createOrder} from '../../services/api';
import {DownOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const CreateOrderDropdown = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tables, setTables] = useState([]);
    const navigate = useNavigate();


    const handleCreateTogoOrder = async () => {
        try {
            const response = await createOrder({type: 'togo'});
            navigate(`/orders/${response.id}`);
        } catch (error) {
            message.error('Błąd podczas tworzenia zamówienia');
            console.error(error);
        }
    };

    const handleCreateDineInOrder = async (table) => {
        if (!table.is_free) return;
        try {
            const response = await createOrder({type: 'dinein', table_id: table.id});
            setIsModalOpen(false);
            navigate(`/orders/${response.id}`);
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
            setIsModalOpen(true);
        } catch (error) {
            message.error('Nie udało się załadować stolików');
            console.error('Error fetching tables:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
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
            <Modal
                title="Wybierz stół"
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
            >
                <List
                    dataSource={tables}
                    renderItem={(table) => (
                        <List.Item>
                            <Button
                                type="primary"
                                block
                                disabled={!table.is_free}
                                onClick={() => handleCreateDineInOrder(table)}
                                className={!table.is_free ? 'bg-gray-300 text-gray-500' : ''}
                            >
                                {table.name} {!table.is_free}
                            </Button>
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default CreateOrderDropdown;
