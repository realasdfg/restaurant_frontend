import React, {useEffect} from 'react';
import {Button, Form, Input, InputNumber, Select, Upload} from 'antd';
import {UploadOutlined} from '@ant-design/icons';

const {Option} = Select;

const MenuItemForm = ({isEditing = false, menuItemData = {}, onSubmit, categories = []}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (menuItemData) {
            const formData = {
                ...menuItemData,
                price: menuItemData.price ? parseFloat(menuItemData.price) : '',
                cost: menuItemData.cost ? parseFloat(menuItemData.cost) : ''
            };
            if (isEditing && menuItemData.image) {
                formData.image = [
                    {
                        uid: '-1',
                        name: 'Current Image',
                        url: menuItemData.image,
                    },
                ];
            } else {
                formData.image = [];
            }
            form.setFieldsValue(formData);
        }
    }, [menuItemData, isEditing, form]);

    const normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList ? e.fileList : [];
    };


    return (
        <Form
            form={form}
            initialValues={isEditing ? {...menuItemData} : {available: true}}
            onFinish={onSubmit}
            layout="vertical"
        >
            <Form.Item
                name="name"
                label="Name"
                rules={[{
                    required: true,
                    min: 1,
                    max: 50,
                    message: 'The name must be between 1 and 50 characters long!'
                }]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{max: 256, message: 'The description can be up to 256 characters long!'}]}
            >
                <Input.TextArea rows={3}/>
            </Form.Item>

            {menuItemData.image &&
                <img src={new URL(menuItemData.image, window.location.origin).pathname} alt="Item photo"
                     className="w-2/5  rounded-lg aspect-square object-cover"/>
            }
            <Form.Item
                name="newImage"
                label="Photo"
                valuePropName="fileList"
                getValueFromEvent={normFile}
            >
                <Upload
                    beforeUpload={() => false}
                    listType="picture"
                >
                    <Button icon={<UploadOutlined/>}>
                        <div>Upload a photo</div>
                    </Button>
                </Upload>
            </Form.Item>


            <Form.Item
                name="price"
                label="Price"
                rules={[{required: true, type: 'number', min: 0.01, message: 'The price must be greater than 0!'}]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="cost"
                label="Cost"
                rules={[{required: true, type: 'number', min: 0.01, message: 'The cost must be greater than 0!'}]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="type"
                label="Type"
                rules={[{required: true, message: 'Select the item type!'}]}
            >
                <Select>
                    <Option value="by_weight">By Weight</Option>
                    <Option value="by_quantity">By Quantity</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="weight"
                label="Weight"
                rules={[{
                    required: true,
                    type: 'number',
                    min: 1,
                    message: 'The weight must be greater than or equal to 1!'
                }]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="available"
                label="Available"
                rules={[{required: true, message: 'Select availability!'}]}
            >
                <Select>
                    <Option value={true}>Tak</Option>
                    <Option value={false}>Nie</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="category_id"
                label="Category"
                rules={[{required: true, message: 'Select a category!'}]}
            >
                <Select>
                    {categories.map((category) => (
                        <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MenuItemForm;
