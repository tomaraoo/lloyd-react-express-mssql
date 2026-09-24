export type Task = {
  id: number;
  title: string;
  description: string | null;
  due_date: string;
  status: "Pending" | "Completed";
  created_at: string;
  updated_at: string;
};
