import { useState } from "react";
import { Button, Form, Input, message } from "antd";

type RegisterValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterPage() {
  const [form] = Form.useForm<RegisterValues>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  async function handleRegister(values: RegisterValues) {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      form.resetFields();
      messageApi.success("Registration successful");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {contextHolder}
      <section className="auth-form">
        <h1>Register</h1>
        <Form form={form} layout="vertical" onFinish={handleRegister} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Email is invalid" },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 4, message: "Password must be at least 4 characters" },
            ]}
          >
            <Input.Password maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Password confirmation is required" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue("password") === value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password maxLength={100} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>
      </section>
    </main>
  );
}
