import React, {useEffect, useState} from 'react';
import {Layout, Typography, Spin, Divider, Input, Modal} from 'antd';
import 'tailwindcss/tailwind.css';
import {Header, Footer} from "antd/es/layout/layout.js";
import {fetchCategories, fetchMenuItems} from "../services/api.js";


const {Content} = Layout;
const {Title} = Typography;
const {Search} = Input;

const OnlineMenuPage = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, itemsRes] = await Promise.all([
                    fetchCategories(),
                    fetchMenuItems()
                ]);

                setCategories(categoriesRes.data);
                setMenuItems(itemsRes.data);
                setFilteredItems(itemsRes.data);
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.trim() === '') {
            setFilteredItems(menuItems);
        } else {
            const lowercasedValue = value.toLowerCase();
            setFilteredItems(
                menuItems.filter(item =>
                    item.name.toLowerCase().includes(lowercasedValue) ||
                    item.description.toLowerCase().includes(lowercasedValue)
                )
            );
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleModalClose = () => {
        setSelectedItem(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 font-mono">
            <Header className="flex justify-between items-center bg-blue-600 rounded-lg ps-10 pe-4">
                <div className="text-white text-3xl font-bold">Restauracja</div>
                <div className="text-white font-bold">+48 123-123-123</div>
            </Header>

            <Content className="min-h-screen flex flex-col p-1 pt-3 pb-3 ">
                <div className="flex flex-grow justify-center">
                    <div className="max-w-screen-lg w-full bg-gray-200 p-5 rounded-lg">
                        <div className="mb-6">
                            <Search
                                placeholder="Wyszukaj pozycji..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                enterButton
                                className="w-full max-w-md mx-auto"
                            />
                        </div>

                        {categories.map((category) => {
                            const categoryItems = filteredItems.filter((item) => item.category_id === category.id);

                            if (categoryItems.length === 0) {
                                return null;
                            }

                            return (
                                <div key={category.id}>
                                    <Title level={3} className="text-blue-400">{category.name}</Title>
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {categoryItems.map((item) => (
                                            <div key={item.id}
                                                 className="flex flex-col justify-between border rounded-lg p-2 bg-gray-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
                                                 onClick={() => handleItemClick(item)}>
                                                <div>
                                                    <img src={item.image} alt={item.name}
                                                         className="w-full rounded-lg aspect-square object-cover"/>
                                                    <div className="mt-2 font-semibold text-lg m-1">{item.name}</div>
                                                    <div
                                                        className="text-gray-600 line-clamp-3 m-1">{item.description}</div>
                                                </div>
                                                <div
                                                    className="text-blue-600 font-bold mt-2 m-1">{item.price} zł {item.type === 'by_weight' ? 'za 100g' : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Divider/>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Modal
                    open={!!selectedItem}
                    onCancel={handleModalClose}
                    footer={null}
                    centered
                    className="bg-gray-100 font-mono rounded-lg"
                >
                    {selectedItem && (
                        <div className="flex flex-col items-center text-base">
                            <img src={selectedItem.image} alt={selectedItem.name}
                                 className="w-full rounded-lg max-w-xs aspect-square object-cover"/>
                            <div className="mt-4 text-lg font-semibold">{selectedItem.name}</div>
                            <div className="mt-2 text-gray-600">{selectedItem.description}</div>
                            <div
                                className="mt-2 text-blue-600 font-bold">{selectedItem.price} zł {selectedItem.type === 'by_weight' ? 'za 100g' : ''}</div>
                        </div>
                    )}
                </Modal>
            </Content>

            <Footer className="text-center bg-blue-600 text-white py-4 rounded-lg">
                <div>© 2025 Restauracja. All rights reserved.</div>
            </Footer>
        </div>
    );
};

export default OnlineMenuPage;
