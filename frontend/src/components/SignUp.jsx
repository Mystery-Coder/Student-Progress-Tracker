import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { supabase } from "../SupabaseClient";

export default function SignUp({ toggleView }) {
	const [formData, setFormData] = useState({
		name: "",
		usn: "",
		email: "",
		password: "",
		motherName: "",
		fatherName: "",
		dob: "",
		phone: "",
		gender: "Male",
		isAdmin: false,
		adminId: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		// Validate fields based on user type
		if (formData.isAdmin) {
			if (
				!formData.name ||
				!formData.email ||
				!formData.password ||
				!formData.adminId
			) {
				setMessage({ type: "error", text: "Fill all fields" });
				setLoading(false);
				return;
			}
		} else {
			if (
				!formData.name ||
				!formData.usn ||
				!formData.email ||
				!formData.password ||
				!formData.phone ||
				!formData.motherName ||
				!formData.fatherName ||
				!formData.dob
			) {
				setMessage({ type: "error", text: "Fill all fields" });
				setLoading(false);
				return;
			}
		}

		try {
			// Sign up user
			const { data, error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
			});

			if (error) throw error;

			const user = data.user;
			const session = data.session;

			if (session) {
				// Split name into first and last name
				const nameArr = formData.name.trim().split(" ");
				const firstName = nameArr[0];
				const lastName = nameArr.slice(1).join(" ") || "";

				// Insert into appropriate table
				if (formData.isAdmin) {
					await supabase.from("Admin_Details").insert({
						user_id: user?.id,
						Admin_ID: formData.adminId,
						Admin_Name: formData.name,
					});
				} else {
					await supabase.from("STUDENT").insert({
						user_id: user?.id,
						USN: formData.usn,
						First_Name: firstName,
						Last_Name: lastName,
						Date_born: formData.dob,
						Sex: formData.gender,
						Father_Name: formData.fatherName,
						Mother_Name: formData.motherName,
						Phone_No: formData.phone,
					});
				}

				setMessage({
					type: "success",
					text: "Signed Up! Login with Email",
				});
				setTimeout(() => toggleView(), 1000);
			}
		} catch (error) {
			setMessage({ type: "error", text: error.message });
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSignUp}>
			{message.text && (
				<Alert severity={message.type} sx={{ mb: 2 }}>
					{message.text}
				</Alert>
			)}

			<TextField
				label="Full Name"
				fullWidth
				required
				value={formData.name}
				onChange={(e) => handleChange("name", e.target.value)}
				sx={{ mb: 2 }}
			/>

			<TextField
				label="Email"
				type="email"
				fullWidth
				required
				value={formData.email}
				onChange={(e) => handleChange("email", e.target.value)}
				sx={{ mb: 2 }}
			/>

			<TextField
				label="Password"
				type="password"
				fullWidth
				required
				value={formData.password}
				onChange={(e) => handleChange("password", e.target.value)}
				helperText="Minimum 6 characters required"
				sx={{ mb: 2 }}
			/>

			<FormControlLabel
				control={
					<Checkbox
						checked={formData.isAdmin}
						onChange={(e) =>
							handleChange("isAdmin", e.target.checked)
						}
					/>
				}
				label="Sign up as Admin"
				sx={{ mb: 2 }}
			/>

			{formData.isAdmin ? (
				// Admin fields
				<TextField
					label="Admin ID"
					fullWidth
					required
					value={formData.adminId}
					onChange={(e) => handleChange("adminId", e.target.value)}
					sx={{ mb: 2 }}
				/>
			) : (
				// Student fields
				<>
					<TextField
						label="USN"
						fullWidth
						required
						value={formData.usn}
						onChange={(e) => handleChange("usn", e.target.value)}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Mother Name"
						fullWidth
						required
						value={formData.motherName}
						onChange={(e) =>
							handleChange("motherName", e.target.value)
						}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Father Name"
						fullWidth
						required
						value={formData.fatherName}
						onChange={(e) =>
							handleChange("fatherName", e.target.value)
						}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Date of Birth"
						type="date"
						fullWidth
						required
						value={formData.dob}
						onChange={(e) => handleChange("dob", e.target.value)}
						InputLabelProps={{ shrink: true }}
						sx={{ mb: 2 }}
					/>

					<TextField
						label="Phone"
						type="tel"
						fullWidth
						required
						value={formData.phone}
						onChange={(e) => handleChange("phone", e.target.value)}
						sx={{ mb: 2 }}
					/>

					<TextField
						select
						label="Gender"
						fullWidth
						value={formData.gender}
						onChange={(e) => handleChange("gender", e.target.value)}
						sx={{ mb: 2 }}
					>
						<MenuItem value="Male">Male</MenuItem>
						<MenuItem value="Female">Female</MenuItem>
					</TextField>
				</>
			)}

			<Button
				type="submit"
				variant="contained"
				fullWidth
				size="large"
				disabled={loading}
				sx={{ mb: 2 }}
			>
				{loading ? "Loading..." : "Sign Up"}
			</Button>

			<Typography
				variant="body2"
				align="center"
				color="text.secondary"
				sx={{ cursor: "pointer" }}
				onClick={toggleView}
			>
				Already have an account? Sign In
			</Typography>
		</form>
	);
}
