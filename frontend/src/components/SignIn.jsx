import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router";

export default function SignIn({ toggleView }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const navigate = useNavigate();

	const handleSignIn = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		if (!email || !password) {
			setMessage({ type: "error", text: "Fill all fields" });
			setLoading(false);
			return;
		}

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			const user = data.user;

			// Check if user is student
			const { data: studentData } = await supabase
				.from("STUDENT")
				.select()
				.eq("user_id", user.id)
				.single();

			// Check if user is admin
			const { data: adminData } = await supabase
				.from("Admin_Details")
				.select()
				.eq("user_id", user.id)
				.single();

			// Store role and data
			if (studentData) {
				localStorage.setItem("userRole", "student");
				localStorage.setItem("userData", JSON.stringify(studentData));
				console.log("Student logged in:", studentData);
			} else if (adminData) {
				localStorage.setItem("userRole", "admin");
				localStorage.setItem("userData", JSON.stringify(adminData));
				console.log("Admin logged in:", adminData);
			} else {
				throw new Error("User not found in database");
			}

			setMessage({ type: "success", text: "Signed in successfully!" });
			navigate("/tabs");
		} catch (error) {
			setMessage({
				type: "error",
				text: `Login Failed: ${error.message}`,
			});
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSignIn}>
			{message.text && (
				<Alert severity={message.type} sx={{ mb: 2 }}>
					{message.text}
				</Alert>
			)}

			<TextField
				label="Email"
				type="email"
				fullWidth
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				sx={{ mb: 2 }}
			/>

			<TextField
				label="Password"
				type="password"
				fullWidth
				required
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				sx={{ mb: 3 }}
			/>

			<Button
				type="submit"
				variant="contained"
				fullWidth
				size="large"
				disabled={loading}
				sx={{ mb: 2 }}
			>
				{loading ? "Loading..." : "Sign In"}
			</Button>

			<Typography
				variant="body2"
				align="center"
				color="text.secondary"
				sx={{ cursor: "pointer" }}
				onClick={toggleView}
			>
				Don't have an account? Sign Up
			</Typography>
		</form>
	);
}
