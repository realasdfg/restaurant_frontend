import React, {useEffect, useState} from "react";
import {Modal, List, Button, message} from "antd";
import {fetchTables} from "../../services/api.js";
import {tableWebSocketService} from "../../services/websocketService.js";


const TableListModal = ({open, onCancel, onTableClick}) => {
    const [tables, setTables] = useState([]);

    useEffect(() => {
        if (open) {
            loadTables();

            const access_token = localStorage.getItem("access_token");
            tableWebSocketService.connect(access_token);

            const unsubscribe = tableWebSocketService.subscribe((table) => {
                console.log('New table info received', table);
                setTables((prevTables) => prevTables.map(o => (o.id === table.id ? table : o)));
            });

            return () => {
                unsubscribe();
                tableWebSocketService.close();
            };
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
            modalRender={(modal) => (
                <div onClick={(event) => event.stopPropagation()}>{modal}</div>
            )}
        >
            <List
                dataSource={tables}
                renderItem={(table) => (
                    <List.Item>
                        <Button
                            type="primary"
                            block
                            disabled={!table.is_free}
                            onClick={() => onTableClick(table)}
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
