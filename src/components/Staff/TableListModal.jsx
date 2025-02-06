import React, {useEffect, useState} from "react";
import {Modal, List, Button, message} from "antd";
import {fetchTables} from "../../services/api.js";


const TableListModal = ({open, onCancel, onTableClick}) => {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        if (open) {
            loadTables();
        }
    }, [open]);

    const loadTables = async () => {
        try {
            const response = await fetchTables();
            setTables(response.data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            message.error("Nie udało się załadować stolików");
            console.error("Error fetching tables:", error);
        }
    };

    return (
        <Modal
            title="Wybierz stół"
            centered
            open={open}
            onCancel={onCancel}
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
                            onClick={(event) => onTableClick(table, event)}
                            className={!table.is_free ? 'bg-gray-300 text-gray-500' : ''}
                        >
                            {table.name}
                        </Button>
                    </List.Item>
                )}
            />
        </Modal>
    );
};


export default TableListModal;
