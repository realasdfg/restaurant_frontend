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
                price: menuItemData.price? parseFloat(menuItemData.price) : '',
                cost: menuItemData.cost? parseFloat(menuItemData.cost) : ''
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
                label="Nazwa"
                rules={[{required: true, min: 1, max: 50, message: 'Nazwa musi zawierać od 1 do 50 znaków!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="description"
                label="Opis"
                rules={[{max: 256, message: 'Opis może zawierać maksymalnie 256 znaków!'}]}
            >
                <Input.TextArea rows={3}/>
            </Form.Item>

            {menuItemData.image &&
                <img src={new URL(menuItemData.image, window.location.origin).pathname} alt="Zdjęcie pozycji"
                     className="w-2/5  rounded-lg aspect-square object-cover"/>
            }
            <Form.Item
                name="newImage"
                label="Zdjęcie"
                valuePropName="fileList"
                getValueFromEvent={normFile}
            >
                <Upload
                    beforeUpload={() => false}
                    listType="picture"
                >
                    <Button icon={<UploadOutlined/>}>
                        <div>Wgraj zdjęcie</div>
                    </Button>
                </Upload>
            </Form.Item>


            <Form.Item
                name="price"
                label="Cena"
                rules={[{required: true, type: 'number', min: 0.01, message: 'Cena musi być większa 0!'}]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="cost"
                label="Koszt"
                rules={[{required: true, type: 'number', min: 0.01, message: 'Koszt musi być większy 0!'}]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="type"
                label="Typ"
                rules={[{required: true, message: 'Wybierz typ pozycji!'}]}
            >
                <Select>
                    <Option value="by_weight">Wagowa</Option>
                    <Option value="by_quantity">Ilościowa</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="weight"
                label="Waga"
                rules={[{required: true, type: 'number', min: 1, message: 'Waga musi być większa lub równa 1!'}]}
            >
                <InputNumber className="w-full"/>
            </Form.Item>

            <Form.Item
                name="available"
                label="Dostępność"
                rules={[{required: true, message: 'Wybierz dostępność!'}]}
            >
                <Select>
                    <Option value={true}>Tak</Option>
                    <Option value={false}>Nie</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="category_id"
                label="Kategoria"
                rules={[{required: true, message: 'Wybierz kategorię!'}]}
            >
                <Select>
                    {categories.map((category) => (
                        <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                    {isEditing ? 'Zachowaj' : 'Utwórz'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MenuItemForm;
