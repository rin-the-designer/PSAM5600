import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Pads
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Settings
        </NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
