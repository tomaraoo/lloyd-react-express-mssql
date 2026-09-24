import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, message } from "antd";
import type { TableProps } from "antd";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

type CreateTaskValues = {
  title: string;
  description?: string;
  due_date: string;
};

type UpdateTaskValues = CreateTaskValues & {
  status: "Pending" | "Completed";
};

const taskColumns: NonNullable<TableProps<Task>["columns"]> = [
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [createForm] = Form.useForm<CreateTaskValues>();
  const [updateForm] = Form.useForm<UpdateTaskValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const { token, username, logout } = useAuth();
  const navigate = useNavigate();
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
      createForm.resetFields();
      setCreateOpen(false);
      messageApi.success("Task created");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  }

  function openUpdate(task: Task) {
    setEditingTask(task);
    updateForm.setFieldsValue({
      title: task.title,
      description: task.description || undefined,
      due_date: task.due_date.slice(0, 10),
      status: task.status,
    });
  }

  async function updateTask(values: UpdateTaskValues) {
    if (!editingTask) return;

    setUpdateLoading(true);

    try {
      const response = await fetch(`${apiUrl}/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update task");
      }

      setTasks((current) => current.map((task) => (task.id === result.id ? result : task)));
      setEditingTask(null);
      messageApi.success("Task updated");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setUpdateLoading(false);
    }
  }

  async function deleteTask(taskId: number) {
    setDeletingTaskId(taskId);

    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete task");
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));
      messageApi.success("Task deleted");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "Failed to delete task");
    } finally {
      setDeletingTaskId(null);
    }
  }

  const columns: TableProps<Task>["columns"] = [
    ...taskColumns,
    {
      title: "Actions",
      key: "actions",
      render: (_, task) => (
        <Space>
          <Button onClick={() => openUpdate(task)}>Edit</Button>
          <Popconfirm
            title="Delete task?"
            onConfirm={() => deleteTask(task.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button danger loading={deletingTaskId === task.id}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="home-page">
      {contextHolder}
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>User: {username}</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => navigate("/reports")}>Reports</Button>
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
        <Form form={createForm} layout="vertical" onFinish={createTask}>
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
      <Modal
        title="Edit task"
        open={editingTask !== null}
        onCancel={() => setEditingTask(null)}
        footer={null}
      >
        <Form form={updateForm} layout="vertical" onFinish={updateTask}>
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
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateLoading}>
            Save
          </Button>
        </Form>
      </Modal>
    </main>
  );
}
