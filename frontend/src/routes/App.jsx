import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { supabase } from "../SupabaseClient.js";

export default function AuthPage() {
	const [tabValue, setTabValue] = useState(0);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleSignUp = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			setMessage({ type: "error", text: error.message });
		} else {
			setMessage({
				type: "success",
				text: "Sign Up Complete! Use email to sign in",
			});
		}
		setLoading(false);
	};

	const handleSignIn = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		console.log(data);
		const user = data.user;
		let id = user.id;

		let student_details = await supabase
			.from("STUDENT")
			.select()
			.eq("user_id", id);

		console.log(student_details);

		if (error) {
			setMessage({ type: "error", text: error.message });
		} else {
			setMessage({ type: "success", text: "Signed in successfully!" });
			// Redirect to dashboard or main app
		}
		setLoading(false);
	};

	return (
		<Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f5f5f5" }}>
			<AppBar position="static">
				<Toolbar>
					<Typography
						variant="h6"
						sx={{
							flexGrow: 1,
							textAlign: "center",
							fontWeight: "bold",
						}}
					>
						Student Progress Tracker
					</Typography>
				</Toolbar>
			</AppBar>

			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "calc(100vh - 64px)",
					padding: 2,
				}}
			>
				<Card sx={{ maxWidth: 450, width: "100%", boxShadow: 3 }}>
					<CardContent sx={{ p: 4 }}>
						<Typography
							variant="h4"
							align="center"
							gutterBottom
							sx={{ fontWeight: 600, mb: 3 }}
						>
							Welcome
						</Typography>

						<Tabs
							value={tabValue}
							onChange={(e, newValue) => {
								setTabValue(newValue);
								setMessage({ type: "", text: "" });
							}}
							centered
							sx={{ mb: 3 }}
						>
							<Tab label="Sign In" />
							<Tab label="Sign Up" />
						</Tabs>

						{message.text && (
							<Alert severity={message.type} sx={{ mb: 2 }}>
								{message.text}
							</Alert>
						)}

						<form
							onSubmit={
								tabValue === 0 ? handleSignIn : handleSignUp
							}
						>
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
								helperText={
									tabValue === 1 &&
									"Minimum 6 characters required"
								}
							/>

							<Button
								type="submit"
								variant="contained"
								fullWidth
								size="large"
								disabled={loading}
								sx={{ mb: 2 }}
							>
								{loading
									? "Loading..."
									: tabValue === 0
									? "Sign In"
									: "Sign Up"}
							</Button>
						</form>

						{tabValue === 0 && (
							<Typography
								variant="body2"
								align="center"
								color="text.secondary"
							>
								Don't have an account? Switch to Sign Up
							</Typography>
						)}
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}
