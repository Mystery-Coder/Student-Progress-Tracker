import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { supabase } from "../SupabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AuthPage() {
	const navigate = useNavigate();

	async function authCheck() {
		const { data, error } = await supabase.auth.getUser();

		const user = data?.user;

		if (error) {
			console.log(error);
			return;
		}

		if (user) {
			navigate("/tabs");
		} else {
			navigate("/login");
		}
	}

	useEffect(() => {
		authCheck();
	}, []);

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
		</Box>
	);
}
