import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Form, Input, message } from "antd";
import { useAuth } from "../../context/AuthContext";

type LoginValues = {
  username: string;
  password: string;
};

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin(values: LoginValues) {
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      login(result.token, result.user.username);
      navigate("/", { replace: true });
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      {contextHolder}
      <section className="auth-form">
        <h1>Login</h1>
        <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Username is required" }]}
          >
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password maxLength={100} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form>
        <p>
          <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
