import React, {useEffect} from 'react';
import {Button, Form, Input, Select} from 'antd';

const {Option} = Select;

const UserForm = ({isEditing = false, userData = {}, onSubmit, currentUser = {}}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (userData) {
            form.setFieldsValue(userData);
        }
    }, [userData, form]);

    return (
        <Form
            form={form}
            initialValues={isEditing ? userData : {role: 'staff'}}
            onFinish={onSubmit}
            layout="vertical"
        >
            <Form.Item
                name="username"
                label="Username"
                rules={[{
                    required: true,
                    min: 3,
                    max: 30,
                    message: 'Your username must be between 3 and 30 characters long!'
                }]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="first_name"
                label="First name"
                rules={[{required: true, min: 1, max: 30, message: 'The name must be between 1 and 30 characters long!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="last_name"
                label="Last name"
                rules={[{required: true, min: 1, max: 30, message: 'The last name must be between 1 and 30 characters long!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item
                name="role"
                label="Role"
                rules={[{required: true, message: 'Choose a role!'}]}
            >
                <Select disabled={isEditing && currentUser.id === userData.id}>
                    <Option value="staff">STAFF</Option>
                    <Option value="admin">ADMIN</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={[{required: !isEditing, min: 8, message: 'Password must be at least 8 characters long!'}]}
            >
                <Input/>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                    {isEditing ? 'Save' : 'Create'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default UserForm;
