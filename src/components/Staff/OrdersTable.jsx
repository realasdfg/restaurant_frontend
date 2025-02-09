import React, {useState} from 'react';
import {Table} from 'antd';

const OrdersTable = ({dataSource, columns, onRow, pagination}) => {
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 50,
            total: dataSource.length,
            position: ['topRight'],
            pageSizeOptions: ["25", "50", "100", "250", "500", "1000"],
            showSizeChanger: true,
            responsive: true,
        },
    });

    const handleTableChange = (pagination) => {
        setTableParams({
            pagination
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    return (
        <>
            <Table
                dataSource={dataSource}
                columns={columns}
                rowKey={(record) => record.id}
                onRow={onRow}
                pagination={!pagination ? pagination : tableParams.pagination}
                locale={{emptyText: 'Tu będą widoczne zamówienia'}}
                onChange={handleTableChange}
            />
        </>
    )
};

export default OrdersTable;