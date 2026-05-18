// main.jsx - Updated version
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./routes/App";
import Login from "./routes/Login";

import StudentDashboard from "./pages/StudentDashboard";
import TeacherPortal from "./pages/TeacherPortal";

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
	const userRole = localStorage.getItem("userRole");

	if (!userRole || userRole !== requiredRole) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/login" element={<Login />} />

			<Route
				path="/student-portal"
				element={
					<ProtectedRoute requiredRole="student">
						<StudentDashboard
							onLogout={() => {
								localStorage.removeItem("userRole");
								localStorage.removeItem("userData");
								window.location.href = "/login";
							}}
						/>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/teacher-blank"
				element={
					<ProtectedRoute requiredRole="teacher">
						<TeacherPortal />
					</ProtectedRoute>
				}
			/>
		</Routes>
	</BrowserRouter>,
);
