import React, {useState} from 'react';
import {MenuOutlined} from '@ant-design/icons';
import {Button, Drawer, Layout, Menu} from 'antd';

const {Header} = Layout;

const GuestsHeader = ({categories, onCategoryClick, isMenu}) => {
    const [visible, setVisible] = useState(false);

    const showDrawer = () => setVisible(true);
    const closeDrawer = () => setVisible(false);

    return (
        <>
            <Header className="flex justify-between bg-blue-600 ps-6 pe-4 sm:m-2 m-2 rounded-lg">
                <div className="flex items-center">
                    {isMenu &&
                        <Button
                            type="text"
                            icon={<MenuOutlined className="text-white text-2xl"/>}
                            onClick={showDrawer}
                            className="lg:hidden"
                        />
                    }
                    <div className="text-white text-3xl font-bold">Restaurant</div>
                </div>
                <div className="text-white font-bold">+48 123-123-123</div>
            </Header>
            {isMenu &&
                <Drawer
                    title="Kategorie"
                    placement="left"
                    onClose={closeDrawer}
                    open={visible}
                    className="lg:hidden"
                    styles={{
                        body: {backgroundColor: "rgb(243, 244, 246)"},
                        header: {backgroundColor: "rgb(243, 244, 246)"}
                    }}
                >
                    <Menu
                        mode="inline"
                        onClick={(e) => {
                            onCategoryClick(e.key);
                            closeDrawer();
                        }}
                        items={categories.map(category => ({
                            key: category.id,
                            label: '• ' + category.name
                        }))}
                        selectedKeys={[]}
                        className="font-mono text-base bg-gray-100"
                    />
                </Drawer>
            }
        </>
    );
};

export default GuestsHeader;