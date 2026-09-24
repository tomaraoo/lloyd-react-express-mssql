import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Table, message } from "antd";
import type { TableProps } from "antd";
import { useAuth } from "../context/AuthContext";

type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: "Pending" | "Completed";
  created_at: string;
  updated_at: string;
};

type CreateTaskValues = {
  title: string;
  description?: string;
  due_date: string;
};

const columns: TableProps<Task>["columns"] = [
  {
    title: "Title",
    dataIndex: "title",
  },
  {
    title: "Description",
    dataIndex: "description",
    render: (value: string | null) => value || "-",
  },
  {
    title: "Due date",
    dataIndex: "due_date",
    render: (value: string) => value.slice(0, 10),
  },
  {
    title: "Status",
    dataIndex: "status",
  },
];

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm<CreateTaskValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const { token, username, logout } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(`${apiUrl}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to retrieve tasks");
        }

        setTasks(result);
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : "Failed to retrieve tasks");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [apiUrl, logout, messageApi, token]);

  async function createTask(values: CreateTaskValues) {
    setCreateLoading(true);

    try {
      const response = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create task");
      }

      setTasks((current) => [result, ...current]);
      form.resetFields();
      setCreateOpen(false);
      messageApi.success("Task created");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <main className="home-page">
      {contextHolder}
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>User: {username}</p>
        </div>
        <div className="page-actions">
          <Button type="primary" onClick={() => setCreateOpen(true)}>
            Add task
          </Button>
          <Button onClick={logout}>Logout</Button>
        </div>
      </header>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tasks}
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No tasks" }}
      />
      <Modal
        title="Add task"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={createTask}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} maxLength={500} />
          </Form.Item>
          <Form.Item
            label="Due date"
            name="due_date"
            rules={[{ required: true, message: "Due date is required" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createLoading}>
            Save
          </Button>
        </Form>
      </Modal>
    </main>
  );
}
