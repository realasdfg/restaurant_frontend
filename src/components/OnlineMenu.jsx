import React, {useEffect, useState} from 'react';
import {Layout, Typography, Spin, Divider} from 'antd';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const {Content} = Layout;
const {Title} = Typography;

const OnlineMenu = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, itemsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/v1/menu/categories'),
                    axios.get('http://localhost:8000/api/v1/menu/items')
                ]);

                setCategories(categoriesRes.data);
                setMenuItems(itemsRes.data);
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <Layout>

            <Content className="p-8 bg-gray-100">
                {categories.map((category) => (
                    <div key={category.id} className="mb-8">
                        <Title level={3} className="text-blue-400">{category.name}</Title>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {menuItems
                                .filter((item) => item.category_id === category.id)
                                .map((item) => (
                                    <div key={item.id}
                                         className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition-shadow">
                                        <img src={item.image} alt={item.name}
                                             className="w-full rounded aspect-square object-cover rounded-t-md"/>
                                        <div className="mt-2 font-semibold text-lg">{item.name}</div>
                                        <div className="text-gray-600 line-clamp-3">{item.description}</div>
                                        <div className="text-blue-600 font-bold mt-2">{item.price} zł {item.type === 'by_weight' ? 'za 100g' : ''}</div>
                                    </div>
                                ))}
                        </div>
                        <Divider/>
                    </div>
                ))}
            </Content>


        </Layout>
    );
};

export default OnlineMenu;
