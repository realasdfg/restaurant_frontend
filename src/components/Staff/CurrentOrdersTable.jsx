import React from 'react';
import {Table} from 'antd';
import PropTypes from "prop-types";

const CurrentOrdersTable = ({dataSource, columns, onRow}) => (
        <Table
            dataSource={dataSource}
            columns={columns}
            rowKey={(record) => record.id}
            onRow={onRow}
            pagination={false}
            locale={{ emptyText: 'Tu będą widoczne zamówienia' }}
        />
    )
;

CurrentOrdersTable.propTypes = {
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    onRow: PropTypes.func.isRequired,
};

export default CurrentOrdersTable;