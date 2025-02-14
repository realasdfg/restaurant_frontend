import React, {useState} from "react";
import {Button, message, Dropdown} from "antd";
import {createOrder} from "../../services/api";
import {DownOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import TableListModal from "./TableListModal.jsx";

const CreateOrderDropdown = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleCreateTogoOrder = async () => {
        try {
            const response = await createOrder({type: "togo"});
            navigate(`/staff/orders/${response.data.id}`);
        } catch (error) {
            message.error("Błąd podczas tworzenia zamówienia");
            console.error(error);
        }
    };

    const handleCreateDineInOrder = async (table) => {
        if (!table.is_free) return;
        try {
            const response = await createOrder({type: "dinein", table_id: table.id});
            setIsModalOpen(false);
            navigate(`/staff/orders/${response.data.id}`);
        } catch (error) {
            message.error("Błąd podczas tworzenia zamówienia");
            console.error(error);
        }
    };

    const dropdownItems = [
        {
            label: "W restauracji",
            key: "dinein",
            onClick: () => setIsModalOpen(true),
        },
        {
            label: "Na wynos",
            key: "togo",
            onClick: handleCreateTogoOrder,
        },
    ];

    return (
        <>
            <Dropdown menu={{items: dropdownItems}}>
                <Button color="primary" variant="outlined">
                    Nowe <DownOutlined/>
                </Button>
            </Dropdown>
            <TableListModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onTableClick={handleCreateDineInOrder}/>
        </>
    );
};

export default CreateOrderDropdown;
