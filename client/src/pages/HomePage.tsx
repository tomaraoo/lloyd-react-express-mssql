import { useEffect, useState } from "react";
import { Button, Table, message } from "antd";
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

  return (
    <main className="home-page">
      {contextHolder}
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>User: {username}</p>
        </div>
        <Button onClick={logout}>Logout</Button>
      </header>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tasks}
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No tasks" }}
      />
    </main>
  );
}
