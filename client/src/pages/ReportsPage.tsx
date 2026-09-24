import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Select, Space, Table, message } from "antd";
import type { TableProps } from "antd";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

type Summary = {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
};

type ReportFilters = {
  status?: "Pending" | "Completed";
  start_date?: string;
  end_date?: string;
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

export function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const loadReport = useCallback(
    async (filters: ReportFilters) => {
      try {
        const params = new URLSearchParams();

        if (filters.status) params.set("status", filters.status);
        if (filters.start_date) params.set("start_date", filters.start_date);
        if (filters.end_date) params.set("end_date", filters.end_date);

        const query = params.toString();
        const response = await fetch(`${apiUrl}/reports/tasks${query ? `?${query}` : ""}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to generate report");
        }

        setSummary(result.summary);
        setTasks(result.tasks);
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : "Failed to generate report");
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, logout, messageApi, token],
  );

  useEffect(() => {
    loadReport({});
  }, [loadReport]);

  function applyFilters(filters: ReportFilters) {
    setLoading(true);
    loadReport(filters);
  }

  return (
    <main className="home-page">
      {contextHolder}
      <header className="page-header">
        <h1>Task Report</h1>
        <Space className="no-print">
          <Button onClick={() => navigate("/")}>Tasks</Button>
          <Button type="primary" onClick={() => window.print()}>
            Print
          </Button>
        </Space>
      </header>

      <Form className="report-filters no-print" layout="inline" onFinish={applyFilters}>
        <Form.Item label="Status" name="status">
          <Select
            allowClear
            placeholder="All"
            style={{ width: 140 }}
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Completed", label: "Completed" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Start date" name="start_date">
          <Input type="date" />
        </Form.Item>
        <Form.Item label="End date" name="end_date">
          <Input type="date" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Apply
        </Button>
      </Form>

      <div className="report-summary">
        <span>Total: {summary.total}</span>
        <span>Pending: {summary.pending}</span>
        <span>Completed: {summary.completed}</span>
        <span>Overdue: {summary.overdue}</span>
      </div>

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
