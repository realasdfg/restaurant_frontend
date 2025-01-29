import React, {useState, useRef} from 'react';
import {Header} from 'antd/es/layout/layout.js';
import {MenuOutlined} from '@ant-design/icons';
import {Button, Drawer, Menu} from 'antd';

const OnlineMenuHeader = ({categories, onCategoryClick}) => {
    const [visible, setVisible] = useState(false);
    const drawerContainerRef = useRef(null);

    const showDrawer = () => setVisible(true);
    const closeDrawer = () => setVisible(false);

    return (
        <>
            <Header className="flex justify-between bg-blue-600 rounded-lg ps-6 pe-4">
                <div className="flex items-center">
                    <Button
                        type="text"
                        icon={<MenuOutlined className="text-white text-2xl"/>}
                        onClick={showDrawer}
                        className="lg:hidden"
                    />
                    <div className="text-white text-3xl font-bold">Restauracja</div>
                </div>
                <div className="text-white font-bold">+48 123-123-123</div>
            </Header>

            <div ref={drawerContainerRef}>
                <Drawer
                    title="Kategorie"
                    placement="left"
                    onClose={closeDrawer}
                    open={visible}
                    className="lg:hidden"
                    getContainer={() => drawerContainerRef.current}
                >
                    <Menu
                        mode="inline"
                        onClick={(e) => {
                            onCategoryClick(e.key);
                            closeDrawer();
                        }}
                        items={categories.map(category => ({
                            key: category.id,
                            label: category.name
                        }))}
                        selectedKeys={[]}
                        className="font-mono text-base"
                    />
                </Drawer>
            </div>
        </>
    );
};

export default OnlineMenuHeader;