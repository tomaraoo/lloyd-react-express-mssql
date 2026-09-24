import { Button } from "antd";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { username, logout } = useAuth();

  return (
    <main className="home-page">
      <h1>Task Report System</h1>
      <p>User: {username}</p>
      <Button onClick={logout}>Logout</Button>
    </main>
  );
}
