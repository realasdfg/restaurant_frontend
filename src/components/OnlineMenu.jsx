import React, {useEffect, useState} from 'react';
import {Layout, Typography, Spin, Divider, Input} from 'antd';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const {Content} = Layout;
const {Title} = Typography;
const {Search} = Input;

const OnlineMenu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, itemsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/v1/menu/categories'),
                    axios.get('http://localhost:8000/api/v1/menu/items')
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <Content className="min-h-screen flex flex-col p-1 pt-3 pb-3">
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
                            <div key={category.id} className="mb-8 ">
                                <Title level={3} className="text-blue-400">{category.name}</Title>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ">
                                    {categoryItems.map((item) => (
                                        <div key={item.id}
                                             className="flex flex-col justify-between border rounded-lg p-4 bg-gray-100 shadow hover:shadow-lg transition-shadow">
                                            <div>
                                                <img src={item.image} alt={item.name}
                                                     className="w-full rounded aspect-square object-cover rounded-t-md"/>
                                                <div className="mt-2 font-semibold text-lg">{item.name}</div>
                                                <div className="text-gray-600 line-clamp-3">{item.description}</div>
                                            </div>
                                            <div
                                                className="text-blue-600 font-bold mt-2 ">{item.price} zł {item.type === 'by_weight' ? 'za 100g' : ''}
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
        </Content>
    );
};

export default OnlineMenu;
