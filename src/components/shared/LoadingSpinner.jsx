import React from 'react';
import {Spin} from "antd";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen flex-1">
        <Spin size="large"/>
    </div>
);

export default LoadingSpinner;