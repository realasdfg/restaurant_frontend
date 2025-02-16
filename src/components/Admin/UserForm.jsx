import React from 'react';
import {Button, Form, Input, Select} from 'antd';

const {Option} = Select;

const UserForm = ({isEditing = false, userData = {}, onSubmit, currentUser = {}}) => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Form
            form={form}
            initialValues={isEditing ? userData : {role: 'staff'}}
            onFinish={handleFinish}
            layout="vertical"
        >
            <Form.Item
                name="username"
                label="Nazwa użytkownika"
                rules={[{
                    required: true,
                    min: 3,
                    max: 30,
                    message: 'Nazwa użytkownika musi zawierać od 1 do 30 znaków!'
                }]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="first_name"
                label="Imię"
                rules={[{required: true, min: 1, max: 30, message: 'Imię musi zawierać od 1 do 30 znaków!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="last_name"
                label="Nazwisko"
                rules={[{required: true, min: 1, max: 30, message: 'Nazwisko musi zawierać od 1 do 30 znaków!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="role"
                label="Rola"
                rules={[{required: true, message: 'Wybierz rolę!'}]}
            >
                <Select disabled={isEditing && currentUser.id === userData.id}>
                    <Option value="staff">STAFF</Option>
                    <Option value="admin">ADMIN</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="password"
                label="Hasło"
                rules={[{required: !isEditing, min: 8, message: 'Hasło musi zawierać co najmniej 8 znaków!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                    {isEditing ? 'Zachowaj' : 'Utwórz'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default UserForm;
