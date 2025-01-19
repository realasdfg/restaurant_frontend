import React from 'react';
import {Header} from 'antd/es/layout/layout.js';

const OnlineMenuHeader = () => (
    <Header className="flex justify-between items-center bg-blue-600 rounded-lg ps-10 pe-4">
        <div className="text-white text-3xl font-bold">Restauracja</div>
        <div className="text-white font-bold">+48 123-123-123</div>
    </Header>
);

export default OnlineMenuHeader;