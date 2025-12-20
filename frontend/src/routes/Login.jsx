import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

export default function Login() {
	const [signIn, setSignIn] = useState(true);

	const toggleView = () => {
		setSignIn(!signIn);
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
				<Card
					sx={{
						maxWidth: 500,
						width: "100%",
						boxShadow: 3,
						maxHeight: "85vh",
						overflowY: "auto",
					}}
				>
					<CardContent sx={{ p: 4 }}>
						<Typography
							variant="h4"
							align="center"
							gutterBottom
							sx={{ fontWeight: 600, mb: 3 }}
						>
							{signIn ? "Welcome Back" : "Create Account"}
						</Typography>

						{signIn ? (
							<SignIn toggleView={toggleView} />
						) : (
							<SignUp toggleView={toggleView} />
						)}
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}
