import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
} from "recharts";
import COMarksUploadBot from "../components/COMarksUploadBot";

import {
	Box,
	Drawer,
	AppBar,
	Toolbar,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Avatar,
	Divider,
	CircularProgress,
	Container,
	Paper,
	Button,
	Chip,
	TextField,
	Alert,
	Grid,
	MenuItem,
	InputAdornment,
	IconButton,
	Rating,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Card,
} from "@mui/material";
import {
	Person as PersonIcon,
	Group as GroupIcon,
	Logout as LogoutIcon,
	Phone as PhoneIcon,
	Work as WorkIcon,
	School as SchoolIcon,
	CalendarMonth as CalendarIcon,
	Menu as MenuIcon,
	Badge as BadgeIcon,
	List as ListIcon,
	People as PeopleIcon,
	SmartToy as BotIcon,
	Analytics as AnalyticsIcon,
	Star as StarIcon,
	Compare as CompareIcon,
	BarChart as BarChartIcon,
	Build as BuildIcon,
	TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const drawerWidth = 280;

// CGPA Component (similar to student version)
function CGPAComponent({ usn }) {
	const [cgpa, setCgpa] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCGPA = async () => {
			if (!usn) return;
			try {
				const { data, error } = await supabase.rpc("calculate_cgpa", {
					p_usn: usn,
				});
				if (error) throw error;
				setCgpa(data || 0);
			} catch (err) {
				console.error("Error fetching CGPA:", err);
				setCgpa(0);
			} finally {
				setLoading(false);
			}
		};

		fetchCGPA();
	}, [usn]);

	if (loading) {
		return <CircularProgress size={24} sx={{ color: "#4CAF50" }} />;
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			{cgpa.toFixed(2)} / 10.0
			<Chip
				label={
					cgpa >= 8.5
						? "Excellent"
						: cgpa >= 7.5
							? "Good"
							: cgpa >= 6.5
								? "Average"
								: "Needs Improvement"
				}
				size="small"
				sx={{
					bgcolor:
						cgpa >= 8.5
							? "rgba(76, 175, 80, 0.2)"
							: cgpa >= 7.5
								? "rgba(33, 150, 243, 0.2)"
								: cgpa >= 6.5
									? "rgba(255, 152, 0, 0.2)"
									: "rgba(244, 67, 54, 0.2)",
					color: "white",
					fontWeight: 600,
				}}
			/>
		</Box>
	);
}

export default function TeacherPortal() {
	const [teacherData, setTeacherData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [activeTab, setActiveTab] = useState("setup");
	const [mobileOpen, setMobileOpen] = useState(false);
	const [groupData, setGroupData] = useState({
		groupID: "",
		groupName: "",
		currentYear: "",
	});
	const [setupForm, setSetupForm] = useState({
		Admin_ID: "",
		Phone: "",
		Designation: "",
	});
	const [studentOptions, setStudentOptions] = useState([]);
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [createdGroups, setCreatedGroups] = useState([]);
	const [groupsLoading, setGroupsLoading] = useState(false);
	const [botOpen, setBotOpen] = useState(false);
	const navigate = useNavigate();

	// Analysis state
	const [selectedGroup, setSelectedGroup] = useState("");
	const [selectedStudent, setSelectedStudent] = useState("");
	const [groupStudents, setGroupStudents] = useState([]);
	const [academicRecords, setAcademicRecords] = useState([]);
	const [skills, setSkills] = useState([]);
	const [analysisLoading, setAnalysisLoading] = useState(false);
	const [studentCGPAComparison, setStudentCGPAComparison] = useState([]);
	const [cgpaDistribution, setCgpaDistribution] = useState([]);

	useEffect(() => {
		fetchTeacherDetails();
		fetchStudentOptions();
	}, []);

	useEffect(() => {
		if (teacherData?.Admin_ID) {
			fetchCreatedGroups();
		}
	}, [teacherData?.Admin_ID, activeTab]);

	// Fetch groups for analysis dropdown
	useEffect(() => {
		if (activeTab === "analysis" && teacherData?.Admin_ID) {
			fetchCreatedGroups();
		}
	}, [activeTab, createdGroups, teacherData?.Admin_ID]);

	// Fetch students in selected group
	useEffect(() => {
		const fetchGroupStudents = () => {
			if (!selectedGroup) {
				setGroupStudents([]);
				return;
			}

			const group = createdGroups.find(
				(g) => g.Group_ID === selectedGroup,
			);
			setGroupStudents(group ? group.students : []);
		};

		fetchGroupStudents();
	}, [selectedGroup, createdGroups]);

	// Fetch student data when student is selected
	useEffect(() => {
		const fetchStudentData = async () => {
			if (!selectedStudent || !selectedGroup) {
				setAcademicRecords([]);
				setSkills([]);
				setStudentCGPAComparison([]);
				setCgpaDistribution([]);
				return;
			}

			setAnalysisLoading(true);
			try {
				// Fetch academic records
				const { data: academicData, error: academicError } =
					await supabase.rpc("get_academic_details_by_usn", {
						p_usn: selectedStudent,
					});
				if (academicError) throw academicError;
				setAcademicRecords(academicData || []);

				// Fetch skills
				const { data: skillsData, error: skillsError } =
					await supabase.rpc("get_student_skills", {
						p_usn: selectedStudent,
					});
				if (skillsError) throw skillsError;
				setSkills(skillsData || []);

				// Fetch CGPA comparison and distribution
				await fetchGroupCGPAData();
			} catch (err) {
				console.error("Error fetching student data:", err);
				setAcademicRecords([]);
				setSkills([]);
				setStudentCGPAComparison([]);
				setCgpaDistribution([]);
			} finally {
				setAnalysisLoading(false);
			}
		};

		fetchStudentData();
	}, [selectedStudent, selectedGroup]);

	// Fetch CGPA comparison and distribution data
	const fetchGroupCGPAData = async () => {
		if (!selectedGroup) return;

		try {
			const group = createdGroups.find(
				(g) => g.Group_ID === selectedGroup,
			);
			if (!group) return;

			const studentsWithCGPA = await Promise.all(
				group.students.map(async (student) => {
					try {
						const { data: cgpa, error } = await supabase.rpc(
							"calculate_cgpa",
							{ p_usn: student.usn },
						);
						if (error) throw error;
						return {
							usn: student.usn,
							name: `${student.first_name} ${student.last_name}`,
							cgpa: cgpa || 0,
						};
					} catch (err) {
						console.error(
							`Error fetching CGPA for ${student.usn}:`,
							err,
						);
						return {
							usn: student.usn,
							name: `${student.first_name} ${student.last_name}`,
							cgpa: 0,
						};
					}
				}),
			);

			// Sort by CGPA descending
			studentsWithCGPA.sort((a, b) => b.cgpa - a.cgpa);

			setStudentCGPAComparison(studentsWithCGPA);
			setCgpaDistribution(calculateCGPADistribution(studentsWithCGPA));
		} catch (err) {
			console.error("Error fetching CGPA data:", err);
			setStudentCGPAComparison([]);
			setCgpaDistribution([]);
		}
	};

	// Calculate CGPA distribution
	const calculateCGPADistribution = (students) => {
		const ranges = [
			{ min: 0, max: 5, label: "0 - 5", color: "#f44336" },
			{ min: 5, max: 6, label: "5 - 6", color: "#FF9800" },
			{ min: 6, max: 7, label: "6 - 7", color: "#2196F3" },
			{ min: 7, max: 8, label: "7 - 8", color: "#4CAF50" },
			{ min: 8, max: 9, label: "8 - 9", color: "#4CAF50" },
			{ min: 9, max: 10, label: "9 - 10", color: "#4CAF50" },
		];

		return ranges.map((range) => {
			const count = students.filter(
				(s) => s.cgpa >= range.min && s.cgpa < range.max,
			).length;
			const percentage =
				students.length > 0
					? ((count / students.length) * 100).toFixed(1)
					: "0.0";
			return { ...range, count, percentage };
		});
	};

	// Helper function to get grade color
	const getGradeColor = (grade) => {
		switch (grade) {
			case "S":
				return "#4CAF50";
			case "A":
				return "#2196F3";
			case "B":
				return "#FF9800";
			case "C":
				return "#f44336";
			case "D":
				return "#9C27B0";
			case "E":
				return "#607D8B";
			case "F":
				return "#000000";
			default:
				return "#757575";
		}
	};

	// Helper function to get rating color
	const getRatingColor = (rating) => {
		if (rating >= 4) return "#4CAF50";
		if (rating >= 3) return "#FF9800";
		if (rating >= 2) return "#2196F3";
		return "#f44336";
	};

	// Fetch teacher details using Supabase user id
	const fetchTeacherDetails = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			const { data, error } = await supabase.rpc("get_teacher_details", {
				p_user_id: user.id,
			});

			if (error) {
				throw error;
			}

			console.log("Teacher data fetched:", data);
			setTeacherData(data?.[0] || null);
		} catch (err) {
			console.error("Error in fetchTeacherDetails:", err);
		}
	};

	// Fetch students list for assigning to groups
	const fetchStudentOptions = async () => {
		const { data, error } = await supabase.rpc("get_students_basic");

		if (error) {
			console.error("Error fetching students:", error);
		} else {
			console.log("Student options fetched:", data);
			setStudentOptions(data || []);
		}
	};

	// Fetch groups created by this teacher
	const fetchCreatedGroups = async () => {
		try {
			const adminID = teacherData?.Admin_ID;
			if (!adminID) return;

			setGroupsLoading(true);

			const { data, error } = await supabase.rpc("get_groups_by_admin", {
				p_admin_id: adminID,
			});

			if (error) throw error;

			// data = flat rows (1 row per student)
			const groupsMap = {};

			(data || []).forEach((row) => {
				const groupId = row.group_id;

				if (!groupsMap[groupId]) {
					groupsMap[groupId] = {
						Group_ID: row.group_id,
						Group_Name: row.group_name,
						Current_Year: row.current_year,
						students: [],
					};
				}

				// push student
				groupsMap[groupId].students.push({
					usn: row.student_usn,
					first_name: row.first_name,
					last_name: row.last_name,
				});
			});

			const result = Object.values(groupsMap).map((g) => ({
				...g,
				studentCount: g.students.length,
			}));

			setCreatedGroups(result);
		} catch (err) {
			console.error("Error fetching groups:", err.message);
			setCreatedGroups([]);
		} finally {
			setGroupsLoading(false);
		}
	};

	// Logout
	const handleLogout = async () => {
		await supabase.auth.signOut();
		localStorage.removeItem("userRole");
		localStorage.removeItem("userData");
		navigate("/login");
	};

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	// Update teacher setup form
	const handleSetupSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) throw new Error("User not authenticated");

			const adminName = teacherData?.First_Name
				? `${teacherData.First_Name} ${teacherData.Last_Name || ""}`
				: teacherData?.Admin_Name || "Teacher";

			const { error } = await supabase.rpc("upsert_teacher_profile", {
				p_admin_id: setupForm.Admin_ID || teacherData?.Admin_ID || "X",
				p_admin_name: adminName,
				p_user_id: user.id,
				p_phone: setupForm.Phone,
				p_designation: setupForm.Designation,
			});

			if (error) throw error;

			setMessage({
				type: "success",
				text: "Profile updated successfully!",
			});

			fetchTeacherDetails();
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		} finally {
			setLoading(false);
		}
	};

	// Create or update group
	const handleGroupSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			const adminID = teacherData?.Admin_ID || setupForm.Admin_ID || "X";

			const { error } = await supabase.rpc("save_group", {
				p_group_id: groupData.groupID,
				p_group_name: groupData.groupName,
				p_current_year: parseInt(groupData.currentYear),
				p_admin_id: adminID,
				p_students: selectedStudents, // array of USNs
			});

			if (error) throw error;

			setMessage({
				type: "success",
				text: "Group created / updated successfully!",
			});

			setGroupData({
				groupID: "",
				groupName: "",
				currentYear: "",
			});
			setSelectedStudents([]);

			fetchCreatedGroups();
		} catch (err) {
			setMessage({ type: "error", text: err.message });
		} finally {
			setLoading(false);
		}
	};

	const menuItems = [
		{ text: "Profile Setup", icon: <PersonIcon />, value: "setup" },
		{ text: "Manage Groups", icon: <GroupIcon />, value: "groups" },
		{ text: "Created Groups", icon: <ListIcon />, value: "created" },
		{ text: "Analysis", icon: <AnalyticsIcon />, value: "analysis" },
	];

	const drawer = (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: "linear-gradient(180deg, #0f0c29 0%, #1a1a2e 100%)",
				boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
			}}
		>
			{/* Header Section */}
			<Box
				sx={{
					p: 3,
					background:
						"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
					color: "white",
					position: "relative",
					overflow: "hidden",
					backdropFilter: "blur(10px)",
					borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						mb: 2,
					}}
				>
					<Avatar
						sx={{
							width: 56,
							height: 56,
							bgcolor: "rgba(255,255,255,0.2)",
							fontSize: "1.5rem",
							border: "2px solid rgba(255,255,255,0.3)",
						}}
					>
						{teacherData
							? `${teacherData.First_Name?.[0] || teacherData.Admin_Name?.[0] || ""}${teacherData.Last_Name?.[0] || ""}`
							: "T"}
					</Avatar>
					<Box>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 600,
								color: "rgba(255,255,255,0.95)",
							}}
						>
							{teacherData
								? teacherData.First_Name
									? `${teacherData.First_Name} ${teacherData.Last_Name || ""}`
									: teacherData.Admin_Name || "Teacher"
								: "Teacher"}
						</Typography>
						<Chip
							label="Teacher"
							size="small"
							sx={{
								bgcolor: "rgba(255,255,255,0.2)",
								color: "white",
								mt: 0.5,
								fontSize: "0.7rem",
								fontWeight: 500,
								backdropFilter: "blur(5px)",
							}}
						/>
					</Box>
				</Box>
				{teacherData?.Admin_ID && (
					<Typography
						variant="body2"
						sx={{
							opacity: 0.9,
							mb: 0.5,
							color: "rgba(255,255,255,0.9)",
						}}
					>
						ID: {teacherData.Admin_ID}
					</Typography>
				)}
				{teacherData?.Designation && (
					<Typography
						variant="body2"
						sx={{ opacity: 0.9, color: "rgba(255,255,255,0.9)" }}
					>
						{teacherData.Designation}
					</Typography>
				)}
			</Box>

			<Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

			{/* Navigation Menu */}
			<List sx={{ flex: 1, pt: 2, px: 1 }}>
				{menuItems.map((item) => (
					<ListItem
						key={item.value}
						disablePadding
						sx={{ mb: 0.5, px: 1 }}
					>
						<ListItemButton
							onClick={() => setActiveTab(item.value)}
							selected={activeTab === item.value}
							sx={{
								borderRadius: 2,
								py: 1.5,
								transition: "all 0.2s ease",
								"&.Mui-selected": {
									bgcolor: "rgba(240, 147, 251, 0.2)",
									color: "white",
									"&:hover": {
										bgcolor: "rgba(240, 147, 251, 0.3)",
									},
									"& .MuiListItemIcon-root": {
										color: "#f093fb",
									},
									"& .MuiListItemText-primary": {
										fontWeight: 600,
									},
								},
								"&:hover": {
									bgcolor: "rgba(255, 255, 255, 0.05)",
									transform: "translateX(4px)",
								},
							}}
						>
							<ListItemIcon
								sx={{
									color:
										activeTab === item.value
											? "#f093fb"
											: "rgba(255,255,255,0.6)",
									minWidth: 40,
								}}
							>
								{item.icon}
							</ListItemIcon>
							<ListItemText
								primary={item.text}
								primaryTypographyProps={{
									sx: {
										color:
											activeTab === item.value
												? "rgba(255,255,255,0.95)"
												: "rgba(255,255,255,0.7)",
										fontSize: "0.9rem",
										fontWeight:
											activeTab === item.value
												? 500
												: 400,
									},
								}}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

			{/* Logout Button */}
			<List sx={{ p: 1 }}>
				<ListItem disablePadding sx={{ px: 1, pb: 1 }}>
					<ListItemButton
						onClick={handleLogout}
						sx={{
							borderRadius: 2,
							py: 1.5,
							color: "rgba(255, 107, 107, 0.8)",
							transition: "all 0.2s ease",
							"&:hover": {
								bgcolor: "rgba(244, 67, 54, 0.1)",
								color: "#ff6b6b",
								transform: "translateX(4px)",
							},
						}}
					>
						<ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
							<LogoutIcon sx={{ fontSize: "1.2rem" }} />
						</ListItemIcon>
						<ListItemText
							primary="Logout"
							primaryTypographyProps={{
								sx: {
									fontWeight: 500,
									fontSize: "0.9rem",
								},
							}}
						/>
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	if (!teacherData) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					background:
						"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
				}}
			>
				<CircularProgress
					sx={{
						color: "rgba(240, 147, 251, 0.8)",
					}}
				/>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				minHeight: "100vh",
				background: "linear-gradient(135deg, #0f0c29 0%, #24243e 100%)",
				position: "relative",
			}}
		>
			<AppBar
				position="fixed"
				sx={{
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					ml: { sm: `${drawerWidth}px` },
					bgcolor: "rgba(15, 12, 41, 0.95)",
					backdropFilter: "blur(10px)",
					color: "rgba(255, 255, 255, 0.9)",
					boxShadow: "0 2px 20px rgba(0, 0, 0, 0.2)",
					borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
					zIndex: 1200,
				}}
			>
				<Toolbar>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							flexGrow: 1,
						}}
					>
						<AnalyticsIcon
							sx={{
								color: "#f093fb",
								fontSize: 28,
							}}
						/>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								color: "rgba(255, 255, 255, 0.95)",
								letterSpacing: "0.3px",
							}}
						>
							Teacher Portal
						</Typography>
					</Box>
					<Chip
						label="Active"
						size="small"
						sx={{
							bgcolor: "rgba(76, 175, 80, 0.15)",
							color: "#4CAF50",
							fontWeight: 500,
							border: "1px solid rgba(76, 175, 80, 0.3)",
						}}
					/>
				</Toolbar>
			</AppBar>

			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
			>
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true,
					}}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}
				>
					{drawer}
				</Drawer>
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							borderRight: "none",
						},
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
					mt: 8,
					bgcolor: "transparent",
					minHeight: "100vh",
					overflow: "auto",
					"&::-webkit-scrollbar": {
						width: "6px",
					},
					"&::-webkit-scrollbar-track": {
						background: "rgba(0,0,0,0.1)",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "rgba(240, 147, 251, 0.3)",
						borderRadius: "3px",
					},
				}}
			>
				<Container maxWidth="lg">
					<Paper
						elevation={0}
						sx={{
							p: 4,
							borderRadius: 3,
							bgcolor: "rgba(26, 26, 46, 0.7)",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(255, 255, 255, 0.05)",
							boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
							minHeight: "calc(100vh - 120px)",
							position: "relative",
							"&::before": {
								content: '""',
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								height: "1px",
								background:
									"linear-gradient(90deg, transparent, #f093fb, transparent)",
							},
						}}
					>
						{message.text && (
							<Alert
								severity={message.type}
								sx={{
									mb: 3,
									borderRadius: 2,
									bgcolor:
										message.type === "success"
											? "rgba(76, 175, 80, 0.1)"
											: message.type === "error"
												? "rgba(244, 67, 54, 0.1)"
												: message.type === "warning"
													? "rgba(255, 152, 0, 0.1)"
													: "rgba(33, 150, 243, 0.1)",
									color: "rgba(255, 255, 255, 0.9)",
									border: "1px solid",
									borderColor:
										message.type === "success"
											? "rgba(76, 175, 80, 0.3)"
											: message.type === "error"
												? "rgba(244, 67, 54, 0.3)"
												: message.type === "warning"
													? "rgba(255, 152, 0, 0.3)"
													: "rgba(33, 150, 243, 0.3)",
									"& .MuiAlert-icon": {
										color:
											message.type === "success"
												? "#4CAF50"
												: message.type === "error"
													? "#f44336"
													: message.type === "warning"
														? "#FF9800"
														: "#2196F3",
									},
								}}
							>
								{message.text}
							</Alert>
						)}

						{activeTab === "setup" && (
							<Box>
								<Typography
									variant="h4"
									sx={{
										mb: 1,
										fontWeight: 700,
										color: "rgba(255, 255, 255, 0.95)",
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<PersonIcon sx={{ color: "#f093fb" }} />
									Profile Setup
								</Typography>
								<Typography
									variant="body2"
									sx={{
										mb: 4,
										color: "rgba(255, 255, 255, 0.6)",
										fontWeight: 400,
									}}
								>
									Update your profile information
								</Typography>

								<form onSubmit={handleSetupSubmit}>
									<Paper
										elevation={0}
										sx={{
											p: 4,
											bgcolor:
												"rgba(255, 255, 255, 0.05)",
											borderRadius: 3,
											border: "1px solid rgba(255, 255, 255, 0.08)",
											backdropFilter: "blur(10px)",
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												mb: 3,
											}}
										>
											<PersonIcon
												sx={{
													mr: 1,
													color: "#f093fb",
													fontSize: 28,
												}}
											/>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 600,
													color: "rgba(255, 255, 255, 0.95)",
												}}
											>
												Teacher Information
											</Typography>
										</Box>
										<Grid container spacing={3}>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Teacher ID (Admin ID)"
													fullWidth
													value={setupForm.Admin_ID}
													onChange={(e) =>
														setSetupForm({
															...setupForm,
															Admin_ID:
																e.target.value,
														})
													}
													required
													helperText="Enter your unique teacher/administrator ID"
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<BadgeIcon
																	sx={{
																		color: "rgba(255, 255, 255, 0.5)",
																	}}
																/>
															</InputAdornment>
														),
													}}
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
														"& .MuiFormHelperText-root":
															{
																color: "rgba(255, 255, 255, 0.5)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Phone Number"
													fullWidth
													value={setupForm.Phone}
													onChange={(e) =>
														setSetupForm({
															...setupForm,
															Phone: e.target
																.value,
														})
													}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<PhoneIcon
																	sx={{
																		color: "rgba(255, 255, 255, 0.5)",
																	}}
																/>
															</InputAdornment>
														),
													}}
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Designation"
													fullWidth
													value={
														setupForm.Designation
													}
													onChange={(e) =>
														setSetupForm({
															...setupForm,
															Designation:
																e.target.value,
														})
													}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<WorkIcon
																	sx={{
																		color: "rgba(255, 255, 255, 0.5)",
																	}}
																/>
															</InputAdornment>
														),
													}}
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12}>
												<Box
													sx={{
														display: "flex",
														justifyContent:
															"flex-end",
														gap: 2,
													}}
												>
													<Button
														variant="outlined"
														size="large"
														onClick={() =>
															setSetupForm({
																Admin_ID:
																	teacherData?.Admin_ID ||
																	"",
																Phone:
																	teacherData?.Phone_Number ||
																	teacherData?.Phone ||
																	"",
																Designation:
																	teacherData?.Designation ||
																	"",
															})
														}
														sx={{
															color: "rgba(255, 255, 255, 0.7)",
															borderColor:
																"rgba(255, 255, 255, 0.3)",
															"&:hover": {
																borderColor:
																	"#f093fb",
																color: "#f093fb",
																bgcolor:
																	"rgba(240, 147, 251, 0.1)",
															},
														}}
													>
														Reset
													</Button>
													<Button
														type="submit"
														variant="contained"
														size="large"
														disabled={loading}
														sx={{
															px: 4,
															background:
																"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
															color: "white",
															fontWeight: 600,
															boxShadow:
																"0 4px 15px rgba(240, 147, 251, 0.4)",
															"&:hover": {
																background:
																	"linear-gradient(135deg, #e082ea 0%, #e4465a 100%)",
																boxShadow:
																	"0 6px 20px rgba(240, 147, 251, 0.6)",
																transform:
																	"translateY(-1px)",
															},
															"&:active": {
																transform:
																	"translateY(0)",
															},
															"&.Mui-disabled": {
																background:
																	"rgba(255, 255, 255, 0.1)",
																color: "rgba(255, 255, 255, 0.3)",
															},
														}}
													>
														{loading
															? "Updating..."
															: "Update Profile"}
													</Button>
												</Box>
											</Grid>
										</Grid>
									</Paper>
								</form>
							</Box>
						)}

						{activeTab === "created" && (
							<Box>
								<Typography
									variant="h4"
									sx={{
										mb: 1,
										fontWeight: 700,
										color: "rgba(255, 255, 255, 0.95)",
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<ListIcon sx={{ color: "#f093fb" }} />
									Created Groups
								</Typography>
								<Typography
									variant="body2"
									sx={{
										mb: 4,
										color: "rgba(255, 255, 255, 0.6)",
										fontWeight: 400,
									}}
								>
									View all groups you have created
								</Typography>

								{groupsLoading ? (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											p: 8,
											flexDirection: "column",
											gap: 2,
										}}
									>
										<CircularProgress
											sx={{
												color: "#f093fb",
											}}
										/>
										<Typography
											variant="body1"
											sx={{
												color: "rgba(255, 255, 255, 0.6)",
												fontWeight: 400,
											}}
										>
											Loading groups...
										</Typography>
									</Box>
								) : createdGroups.length === 0 ? (
									<Paper
										elevation={0}
										sx={{
											p: 6,
											textAlign: "center",
											bgcolor:
												"rgba(255, 255, 255, 0.03)",
											borderRadius: 3,
											border: "2px dashed rgba(255, 255, 255, 0.1)",
										}}
									>
										<Box
											sx={{
												p: 2,
												width: 80,
												height: 80,
												borderRadius: "50%",
												bgcolor:
													"rgba(240, 147, 251, 0.1)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												mx: "auto",
												mb: 3,
												border: "1px solid rgba(240, 147, 251, 0.2)",
											}}
										>
											<GroupIcon
												sx={{
													fontSize: 40,
													color: "rgba(240, 147, 251, 0.5)",
												}}
											/>
										</Box>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 700,
												color: "rgba(255, 255, 255, 0.95)",
												mb: 2,
											}}
										>
											No Groups Created Yet
										</Typography>
										<Typography
											variant="body1"
											sx={{
												color: "rgba(255, 255, 255, 0.6)",
												maxWidth: 500,
												mx: "auto",
												mb: 4,
											}}
										>
											Go to "Manage Groups" to create your
											first student group.
										</Typography>
										<Button
											variant="contained"
											onClick={() =>
												setActiveTab("groups")
											}
											sx={{
												background:
													"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
												color: "white",
												fontWeight: 600,
												"&:hover": {
													background:
														"linear-gradient(135deg, #e082ea 0%, #e4465a 100%)",
												},
											}}
										>
											<GroupIcon sx={{ mr: 1 }} />
											Create Group
										</Button>
									</Paper>
								) : (
									<Grid container spacing={3}>
										{createdGroups.map((group, index) => {
											const groupId =
												group.Group_ID ||
												`group-${index}`;
											const groupName =
												group.Group_Name ||
												"Unnamed Group";
											const currentYear =
												group.Current_Year || "N/A";
											const studentCount =
												group.studentCount || 0;
											const students =
												group.students || [];

											return (
												<Grid
													item
													xs={12}
													md={6}
													key={groupId}
												>
													<Paper
														elevation={0}
														sx={{
															p: 3,
															bgcolor:
																"rgba(255, 255, 255, 0.05)",
															borderRadius: 3,
															height: "100%",
															border: "1px solid",
															borderColor:
																"rgba(255, 255, 255, 0.08)",
															backdropFilter:
																"blur(10px)",
															transition:
																"all 0.3s ease",
															"&:hover": {
																borderColor:
																	"rgba(240, 147, 251, 0.3)",
																boxShadow:
																	"0 8px 32px rgba(240, 147, 251, 0.1)",
																transform:
																	"translateY(-2px)",
															},
														}}
													>
														<Box
															sx={{
																display: "flex",
																alignItems:
																	"center",
																justifyContent:
																	"space-between",
																mb: 2,
															}}
														>
															<Box
																sx={{
																	display:
																		"flex",
																	alignItems:
																		"center",
																	gap: 1,
																}}
															>
																<GroupIcon
																	sx={{
																		color: "#f093fb",
																	}}
																/>
																<Typography
																	variant="h6"
																	sx={{
																		fontWeight: 600,
																		color: "rgba(255, 255, 255, 0.95)",
																	}}
																>
																	{groupName}
																</Typography>
															</Box>
															{currentYear !==
																"N/A" && (
																<Chip
																	label={`Year ${currentYear}`}
																	size="small"
																	sx={{
																		bgcolor:
																			"rgba(240, 147, 251, 0.15)",
																		color: "#f093fb",
																		fontWeight: 600,
																		border: "1px solid rgba(240, 147, 251, 0.3)",
																	}}
																/>
															)}
														</Box>

														{groupId && (
															<Typography
																variant="body2"
																sx={{
																	mb: 2,
																	color: "rgba(255, 255, 255, 0.6)",
																}}
															>
																Group ID:{" "}
																<strong
																	style={{
																		color: "rgba(255, 255, 255, 0.9)",
																	}}
																>
																	{groupId}
																</strong>
															</Typography>
														)}

														<Box
															sx={{
																display: "flex",
																alignItems:
																	"center",
																gap: 1,
																mb: 2,
															}}
														>
															<PeopleIcon
																fontSize="small"
																sx={{
																	color: "rgba(255, 255, 255, 0.6)",
																}}
															/>
															<Typography
																variant="body2"
																sx={{
																	color: "rgba(255, 255, 255, 0.6)",
																}}
															>
																{studentCount}{" "}
																{studentCount ===
																1
																	? "Student"
																	: "Students"}
															</Typography>
														</Box>

														{students &&
															students.length >
																0 && (
																<Box>
																	<Typography
																		variant="subtitle2"
																		sx={{
																			mb: 1,
																			fontWeight: 600,
																			color: "rgba(255, 255, 255, 0.8)",
																		}}
																	>
																		Students:
																	</Typography>
																	<Box
																		sx={{
																			display:
																				"flex",
																			flexWrap:
																				"wrap",
																			gap: 0.5,
																		}}
																	>
																		{students.map(
																			(
																				student,
																			) => (
																				<Chip
																					key={
																						student.usn
																					}
																					label={`${student.first_name} ${student.last_name} (${student.usn})`}
																					size="small"
																					sx={{
																						bgcolor:
																							"rgba(255, 255, 255, 0.08)",
																						color: "rgba(255, 255, 255, 0.9)",
																						border: "1px solid rgba(255, 255, 255, 0.1)",
																					}}
																				/>
																			),
																		)}
																	</Box>
																</Box>
															)}
													</Paper>
												</Grid>
											);
										})}
									</Grid>
								)}
							</Box>
						)}

						{activeTab === "groups" && (
							<Box>
								<Typography
									variant="h4"
									sx={{
										mb: 1,
										fontWeight: 700,
										color: "rgba(255, 255, 255, 0.95)",
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<GroupIcon sx={{ color: "#f093fb" }} />
									Manage Groups
								</Typography>
								<Typography
									variant="body2"
									sx={{
										mb: 4,
										color: "rgba(255, 255, 255, 0.6)",
										fontWeight: 400,
									}}
								>
									Create and manage student groups
								</Typography>

								<form onSubmit={handleGroupSubmit}>
									<Paper
										elevation={0}
										sx={{
											p: 4,
											bgcolor:
												"rgba(255, 255, 255, 0.05)",
											borderRadius: 3,
											border: "1px solid rgba(255, 255, 255, 0.08)",
											backdropFilter: "blur(10px)",
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												mb: 3,
											}}
										>
											<GroupIcon
												sx={{
													mr: 1,
													color: "#f093fb",
													fontSize: 28,
												}}
											/>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 600,
													color: "rgba(255, 255, 255, 0.95)",
												}}
											>
												Group Details
											</Typography>
										</Box>
										<Grid container spacing={3}>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Group ID"
													fullWidth
													value={groupData.groupID}
													onChange={(e) =>
														setGroupData({
															...groupData,
															groupID:
																e.target.value,
														})
													}
													required
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Group Name"
													fullWidth
													value={groupData.groupName}
													onChange={(e) =>
														setGroupData({
															...groupData,
															groupName:
																e.target.value,
														})
													}
													required
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12} sm={4}>
												<TextField
													label="Current Year"
													type="number"
													fullWidth
													value={
														groupData.currentYear
													}
													onChange={(e) =>
														setGroupData({
															...groupData,
															currentYear:
																e.target.value,
														})
													}
													inputProps={{
														min: 1,
														max: 4,
													}}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<CalendarIcon
																	sx={{
																		color: "rgba(255, 255, 255, 0.5)",
																	}}
																/>
															</InputAdornment>
														),
													}}
													required
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& input": {
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
																"& input::placeholder":
																	{
																		color: "rgba(255, 255, 255, 0.4)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													select
													label="Assign Students"
													fullWidth
													SelectProps={{
														multiple: true,
														value: selectedStudents,
														renderValue: (
															selected,
														) => (
															<Box
																sx={{
																	display:
																		"flex",
																	flexWrap:
																		"wrap",
																	gap: 0.5,
																}}
															>
																{selected.map(
																	(value) => {
																		const student =
																			studentOptions.find(
																				(
																					s,
																				) =>
																					s.usn ===
																					value,
																			);
																		return (
																			<Chip
																				key={
																					value
																				}
																				label={
																					student
																						? `${student.first_name} ${student.last_name}`
																						: value
																				}
																				size="small"
																				sx={{
																					bgcolor:
																						"rgba(240, 147, 251, 0.15)",
																					color: "rgba(255, 255, 255, 0.9)",
																					border: "1px solid rgba(240, 147, 251, 0.3)",
																				}}
																			/>
																		);
																	},
																)}
															</Box>
														),
													}}
													onChange={(e) =>
														setSelectedStudents(
															e.target.value,
														)
													}
													InputProps={{
														startAdornment: (
															<InputAdornment position="start">
																<SchoolIcon
																	sx={{
																		color: "rgba(255, 255, 255, 0.5)",
																	}}
																/>
															</InputAdornment>
														),
													}}
													sx={{
														"& .MuiOutlinedInput-root":
															{
																bgcolor:
																	"rgba(255, 255, 255, 0.08)",
																borderRadius: 2,
																"& fieldset": {
																	borderColor:
																		"rgba(255, 255, 255, 0.2)",
																},
																"&:hover fieldset":
																	{
																		borderColor:
																			"rgba(255, 255, 255, 0.3)",
																	},
																"&.Mui-focused fieldset":
																	{
																		borderColor:
																			"#f093fb",
																		borderWidth:
																			"2px",
																	},
																"& .MuiSelect-select":
																	{
																		color: "rgba(255, 255, 255, 0.95)",
																		padding:
																			"12px 14px",
																	},
																"& .MuiSvgIcon-root":
																	{
																		color: "rgba(255, 255, 255, 0.6)",
																	},
															},
														"& .MuiInputLabel-root":
															{
																color: "rgba(255, 255, 255, 0.7)",
															},
													}}
												>
													{studentOptions.map((s) => (
														<MenuItem
															key={s.usn}
															value={s.usn}
															sx={{
																bgcolor:
																	"#1a1a2e",
																color: "rgba(255, 255, 255, 0.9)",
																"&:hover": {
																	bgcolor:
																		"rgba(240, 147, 251, 0.2)",
																},
																"&.Mui-selected":
																	{
																		bgcolor:
																			"rgba(240, 147, 251, 0.3)",
																		"&:hover":
																			{
																				bgcolor:
																					"rgba(240, 147, 251, 0.4)",
																			},
																	},
															}}
														>
															{s.first_name}{" "}
															{s.last_name} (
															{s.usn})
														</MenuItem>
													))}
												</TextField>
											</Grid>
											<Grid item xs={12}>
												<Box
													sx={{
														display: "flex",
														justifyContent:
															"flex-end",
														gap: 2,
													}}
												>
													<Button
														variant="outlined"
														size="large"
														onClick={() => {
															setGroupData({
																groupID: "",
																groupName: "",
																currentYear: "",
															});
															setSelectedStudents(
																[],
															);
														}}
														sx={{
															color: "rgba(255, 255, 255, 0.7)",
															borderColor:
																"rgba(255, 255, 255, 0.3)",
															"&:hover": {
																borderColor:
																	"#f093fb",
																color: "#f093fb",
																bgcolor:
																	"rgba(240, 147, 251, 0.1)",
															},
														}}
													>
														Clear
													</Button>
													<Button
														type="submit"
														variant="contained"
														size="large"
														disabled={loading}
														sx={{
															px: 4,
															background:
																"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
															color: "white",
															fontWeight: 600,
															boxShadow:
																"0 4px 15px rgba(240, 147, 251, 0.4)",
															"&:hover": {
																background:
																	"linear-gradient(135deg, #e082ea 0%, #e4465a 100%)",
																boxShadow:
																	"0 6px 20px rgba(240, 147, 251, 0.6)",
																transform:
																	"translateY(-1px)",
															},
															"&:active": {
																transform:
																	"translateY(0)",
															},
															"&.Mui-disabled": {
																background:
																	"rgba(255, 255, 255, 0.1)",
																color: "rgba(255, 255, 255, 0.3)",
															},
														}}
													>
														{loading
															? "Saving..."
															: "Save Group"}
													</Button>
												</Box>
											</Grid>
										</Grid>
									</Paper>
								</form>
							</Box>
						)}

						{activeTab === "analysis" && (
							<Box>
								<Typography
									variant="h4"
									sx={{
										mb: 1,
										fontWeight: 700,
										color: "rgba(255, 255, 255, 0.95)",
										display: "flex",
										alignItems: "center",
										gap: 1.5,
									}}
								>
									<AnalyticsIcon sx={{ color: "#f093fb" }} />
									Student Analysis
								</Typography>
								<Typography
									variant="body2"
									sx={{
										mb: 4,
										color: "rgba(255, 255, 255, 0.6)",
										fontWeight: 400,
									}}
								>
									Analyze student performance, skills, and
									compare within groups
								</Typography>

								{/* Selection Section */}
								<Paper
									elevation={0}
									sx={{
										p: 4,
										bgcolor: "rgba(255, 255, 255, 0.05)",
										borderRadius: 3,
										mb: 4,
										border: "1px solid rgba(255, 255, 255, 0.08)",
										backdropFilter: "blur(10px)",
									}}
								>
									<Grid container spacing={3}>
										<Grid item xs={12} md={6}>
											<TextField
												select
												label="Select Group"
												fullWidth
												value={selectedGroup}
												onChange={(e) =>
													setSelectedGroup(
														e.target.value,
													)
												}
												disabled={
													createdGroups.length === 0
												}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<GroupIcon
																sx={{
																	color: "rgba(255, 255, 255, 0.5)",
																}}
															/>
														</InputAdornment>
													),
												}}
												sx={{
													"& .MuiOutlinedInput-root":
														{
															bgcolor:
																"rgba(255, 255, 255, 0.08)",
															borderRadius: 2,
															"& fieldset": {
																borderColor:
																	"rgba(255, 255, 255, 0.2)",
															},
															"&:hover fieldset":
																{
																	borderColor:
																		"rgba(255, 255, 255, 0.3)",
																},
															"&.Mui-focused fieldset":
																{
																	borderColor:
																		"#f093fb",
																	borderWidth:
																		"2px",
																},
															"& .MuiSelect-select":
																{
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
														},
													"& .MuiInputLabel-root": {
														color: "rgba(255, 255, 255, 0.7)",
													},
												}}
											>
												<MenuItem
													value=""
													sx={{
														bgcolor: "#1a1a2e",
														color: "rgba(255, 255, 255, 0.7)",
													}}
												>
													Select a group
												</MenuItem>
												{createdGroups.map((group) => (
													<MenuItem
														key={group.Group_ID}
														value={group.Group_ID}
														sx={{
															bgcolor: "#1a1a2e",
															color: "rgba(255, 255, 255, 0.9)",
															"&:hover": {
																bgcolor:
																	"rgba(240, 147, 251, 0.2)",
															},
															"&.Mui-selected": {
																bgcolor:
																	"rgba(240, 147, 251, 0.3)",
																"&:hover": {
																	bgcolor:
																		"rgba(240, 147, 251, 0.4)",
																},
															},
														}}
													>
														{group.Group_Name} (
														{group.studentCount}{" "}
														students)
													</MenuItem>
												))}
											</TextField>
										</Grid>

										<Grid item xs={12} md={6}>
											<TextField
												select
												label="Select Student"
												fullWidth
												value={selectedStudent}
												onChange={(e) =>
													setSelectedStudent(
														e.target.value,
													)
												}
												disabled={
													!selectedGroup ||
													groupStudents.length === 0
												}
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<PersonIcon
																sx={{
																	color: "rgba(255, 255, 255, 0.5)",
																}}
															/>
														</InputAdornment>
													),
												}}
												sx={{
													"& .MuiOutlinedInput-root":
														{
															bgcolor:
																"rgba(255, 255, 255, 0.08)",
															borderRadius: 2,
															"& fieldset": {
																borderColor:
																	"rgba(255, 255, 255, 0.2)",
															},
															"&:hover fieldset":
																{
																	borderColor:
																		"rgba(255, 255, 255, 0.3)",
																},
															"&.Mui-focused fieldset":
																{
																	borderColor:
																		"#f093fb",
																	borderWidth:
																		"2px",
																},
															"& .MuiSelect-select":
																{
																	color: "rgba(255, 255, 255, 0.95)",
																	padding:
																		"12px 14px",
																},
														},
													"& .MuiInputLabel-root": {
														color: "rgba(255, 255, 255, 0.7)",
													},
												}}
											>
												<MenuItem
													value=""
													sx={{
														bgcolor: "#1a1a2e",
														color: "rgba(255, 255, 255, 0.7)",
													}}
												>
													Select a student
												</MenuItem>
												{groupStudents.map(
													(student) => (
														<MenuItem
															key={student.usn}
															value={student.usn}
															sx={{
																bgcolor:
																	"#1a1a2e",
																color: "rgba(255, 255, 255, 0.9)",
																"&:hover": {
																	bgcolor:
																		"rgba(240, 147, 251, 0.2)",
																},
																"&.Mui-selected":
																	{
																		bgcolor:
																			"rgba(240, 147, 251, 0.3)",
																		"&:hover":
																			{
																				bgcolor:
																					"rgba(240, 147, 251, 0.4)",
																			},
																	},
															}}
														>
															{student.first_name}{" "}
															{student.last_name}{" "}
															({student.usn})
														</MenuItem>
													),
												)}
											</TextField>
										</Grid>
									</Grid>
								</Paper>

								{/* Loading State */}
								{analysisLoading && (
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											p: 8,
											flexDirection: "column",
											gap: 2,
										}}
									>
										<CircularProgress
											sx={{
												color: "#f093fb",
											}}
										/>
										<Typography
											variant="body1"
											sx={{
												color: "rgba(255, 255, 255, 0.6)",
												fontWeight: 400,
											}}
										>
											Loading student data...
										</Typography>
									</Box>
								)}

								{/* Student Data Display */}
								{selectedStudent && !analysisLoading && (
									<>
										{/* Student Summary */}
										<Paper
											elevation={0}
											sx={{
												p: 3,
												bgcolor:
													"rgba(255, 255, 255, 0.05)",
												borderRadius: 3,
												mb: 4,
												border: "1px solid rgba(255, 255, 255, 0.08)",
												backdropFilter: "blur(10px)",
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent:
														"space-between",
													mb: 3,
												}}
											>
												<Box>
													<Typography
														variant="h5"
														sx={{
															fontWeight: 700,
															color: "rgba(255, 255, 255, 0.95)",
															mb: 0.5,
														}}
													>
														{
															groupStudents.find(
																(s) =>
																	s.usn ===
																	selectedStudent,
															)?.first_name
														}{" "}
														{
															groupStudents.find(
																(s) =>
																	s.usn ===
																	selectedStudent,
															)?.last_name
														}
													</Typography>
													<Typography
														variant="body2"
														sx={{
															color: "rgba(255, 255, 255, 0.6)",
														}}
													>
														USN: {selectedStudent}
													</Typography>
												</Box>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 2,
													}}
												>
													<Chip
														icon={
															<TrendingUpIcon />
														}
														label="CGPA"
														color="primary"
														sx={{
															bgcolor:
																"rgba(240, 147, 251, 0.15)",
															color: "#f093fb",
															fontWeight: 600,
														}}
													/>
													<Typography
														variant="h4"
														sx={{
															fontWeight: 700,
															color: "#f093fb",
														}}
													>
														<CGPAComponent
															usn={
																selectedStudent
															}
														/>
													</Typography>
												</Box>
											</Box>

											{/* Summary Stats */}
											<Grid container spacing={2}>
												<Grid
													item
													xs={12}
													sm={6}
													md={3}
												>
													<Card
														variant="outlined"
														sx={{
															p: 2,
															bgcolor:
																"rgba(255, 255, 255, 0.03)",
															borderColor:
																"rgba(255, 255, 255, 0.08)",
															color: "rgba(255, 255, 255, 0.9)",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "rgba(255, 255, 255, 0.6)",
																mb: 1,
															}}
														>
															Academic Records
														</Typography>
														<Typography
															variant="h4"
															sx={{
																fontWeight: 600,
																color: "#f093fb",
															}}
														>
															{
																academicRecords.length
															}
														</Typography>
													</Card>
												</Grid>
												<Grid
													item
													xs={12}
													sm={6}
													md={3}
												>
													<Card
														variant="outlined"
														sx={{
															p: 2,
															bgcolor:
																"rgba(255, 255, 255, 0.03)",
															borderColor:
																"rgba(255, 255, 255, 0.08)",
															color: "rgba(255, 255, 255, 0.9)",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "rgba(255, 255, 255, 0.6)",
																mb: 1,
															}}
														>
															Skills Count
														</Typography>
														<Typography
															variant="h4"
															sx={{
																fontWeight: 600,
																color: "#4CAF50",
															}}
														>
															{skills.length}
														</Typography>
													</Card>
												</Grid>
												<Grid
													item
													xs={12}
													sm={6}
													md={3}
												>
													<Card
														variant="outlined"
														sx={{
															p: 2,
															bgcolor:
																"rgba(255, 255, 255, 0.03)",
															borderColor:
																"rgba(255, 255, 255, 0.08)",
															color: "rgba(255, 255, 255, 0.9)",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "rgba(255, 255, 255, 0.6)",
																mb: 1,
															}}
														>
															Avg Skill Rating
														</Typography>
														<Typography
															variant="h4"
															sx={{
																fontWeight: 600,
																color: "#FF9800",
															}}
														>
															{skills.length > 0
																? (
																		skills.reduce(
																			(
																				sum,
																				skill,
																			) =>
																				sum +
																				skill.Rating,
																			0,
																		) /
																		skills.length
																	).toFixed(1)
																: "0.0"}
														</Typography>
													</Card>
												</Grid>
												<Grid
													item
													xs={12}
													sm={6}
													md={3}
												>
													<Card
														variant="outlined"
														sx={{
															p: 2,
															bgcolor:
																"rgba(255, 255, 255, 0.03)",
															borderColor:
																"rgba(255, 255, 255, 0.08)",
															color: "rgba(255, 255, 255, 0.9)",
														}}
													>
														<Typography
															variant="body2"
															sx={{
																color: "rgba(255, 255, 255, 0.6)",
																mb: 1,
															}}
														>
															Total Credits
														</Typography>
														<Typography
															variant="h4"
															sx={{
																fontWeight: 600,
																color: "#2196F3",
															}}
														>
															{academicRecords
																.reduce(
																	(
																		sum,
																		record,
																	) =>
																		sum +
																		parseFloat(
																			record.Credits_earned ||
																				0,
																		),
																	0,
																)
																.toFixed(1)}
														</Typography>
													</Card>
												</Grid>
											</Grid>
										</Paper>

										{/* Academic Records */}
										<Paper
											elevation={0}
											sx={{
												p: 3,
												bgcolor:
													"rgba(255, 255, 255, 0.05)",
												borderRadius: 3,
												mb: 4,
												border: "1px solid rgba(255, 255, 255, 0.08)",
												backdropFilter: "blur(10px)",
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 3,
												}}
											>
												<SchoolIcon
													sx={{
														mr: 1,
														color: "#f093fb",
														fontSize: 28,
													}}
												/>
												<Typography
													variant="h6"
													sx={{
														fontWeight: 600,
														color: "rgba(255, 255, 255, 0.95)",
													}}
												>
													Academic Records
												</Typography>
											</Box>

											{academicRecords.length > 0 ? (
												<TableContainer>
													<Table>
														<TableHead>
															<TableRow>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Course Code
																</TableCell>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Course Name
																</TableCell>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Semester
																</TableCell>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Year
																</TableCell>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Grade
																</TableCell>
																<TableCell
																	sx={{
																		color: "rgba(255, 255, 255, 0.9)",
																		fontWeight: 600,
																	}}
																>
																	Credits
																</TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{academicRecords.map(
																(
																	record,
																	index,
																) => (
																	<TableRow
																		key={
																			index
																		}
																	>
																		<TableCell
																			sx={{
																				color: "rgba(255, 255, 255, 0.8)",
																			}}
																		>
																			{
																				record.Course_Code
																			}
																		</TableCell>
																		<TableCell
																			sx={{
																				color: "rgba(255, 255, 255, 0.8)",
																			}}
																		>
																			{
																				record.Course_Name
																			}
																		</TableCell>
																		<TableCell
																			sx={{
																				color: "rgba(255, 255, 255, 0.8)",
																			}}
																		>
																			{
																				record.Semester
																			}
																		</TableCell>
																		<TableCell
																			sx={{
																				color: "rgba(255, 255, 255, 0.8)",
																			}}
																		>
																			{
																				record.Year
																			}
																		</TableCell>
																		<TableCell>
																			<Chip
																				label={
																					record.Grade
																				}
																				size="small"
																				sx={{
																					bgcolor:
																						getGradeColor(
																							record.Grade,
																						),
																					color: "white",
																					fontWeight: 600,
																				}}
																			/>
																		</TableCell>
																		<TableCell
																			sx={{
																				color: "rgba(255, 255, 255, 0.8)",
																			}}
																		>
																			{
																				record.Credits_earned
																			}
																		</TableCell>
																	</TableRow>
																),
															)}
														</TableBody>
													</Table>
												</TableContainer>
											) : (
												<Box
													sx={{
														textAlign: "center",
														py: 4,
													}}
												>
													<Typography
														variant="body1"
														sx={{
															color: "rgba(255, 255, 255, 0.6)",
														}}
													>
														No academic records
														found for this student.
													</Typography>
												</Box>
											)}
										</Paper>

										{/* Skills */}
										<Paper
											elevation={0}
											sx={{
												p: 3,
												bgcolor:
													"rgba(255, 255, 255, 0.05)",
												borderRadius: 3,
												mb: 4,
												border: "1px solid rgba(255, 255, 255, 0.08)",
												backdropFilter: "blur(10px)",
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 3,
												}}
											>
												<BuildIcon
													sx={{
														mr: 1,
														color: "#4CAF50",
														fontSize: 28,
													}}
												/>
												<Typography
													variant="h6"
													sx={{
														fontWeight: 600,
														color: "rgba(255, 255, 255, 0.95)",
													}}
												>
													Skills ({skills.length})
												</Typography>
											</Box>

											{skills.length > 0 ? (
												<Grid container spacing={2}>
													{skills.map((skill) => (
														<Grid
															item
															xs={12}
															sm={6}
															md={4}
															key={skill["Sl.No"]}
														>
															<Card
																variant="outlined"
																sx={{
																	p: 2,
																	bgcolor:
																		"rgba(255, 255, 255, 0.03)",
																	borderColor:
																		"rgba(255, 255, 255, 0.08)",
																	"&:hover": {
																		borderColor:
																			"rgba(76, 175, 80, 0.3)",
																		bgcolor:
																			"rgba(76, 175, 80, 0.05)",
																	},
																}}
															>
																<Box
																	sx={{
																		display:
																			"flex",
																		justifyContent:
																			"space-between",
																		alignItems:
																			"center",
																		mb: 1,
																	}}
																>
																	<Typography
																		variant="subtitle1"
																		sx={{
																			fontWeight: 600,
																			color: "rgba(255, 255, 255, 0.95)",
																		}}
																	>
																		{
																			skill.Skill_Name
																		}
																	</Typography>
																	<Chip
																		label={skill.Rating.toFixed(
																			1,
																		)}
																		size="small"
																		sx={{
																			bgcolor:
																				getRatingColor(
																					skill.Rating,
																				),
																			color: "white",
																			fontWeight: 600,
																		}}
																	/>
																</Box>
																<Rating
																	value={
																		skill.Rating
																	}
																	precision={
																		0.5
																	}
																	readOnly
																	sx={{
																		"& .MuiRating-iconFilled":
																			{
																				color: getRatingColor(
																					skill.Rating,
																				),
																			},
																		"& .MuiRating-iconEmpty":
																			{
																				color: "rgba(255, 255, 255, 0.3)",
																			},
																	}}
																/>
															</Card>
														</Grid>
													))}
												</Grid>
											) : (
												<Box
													sx={{
														textAlign: "center",
														py: 4,
													}}
												>
													<Typography
														variant="body1"
														sx={{
															color: "rgba(255, 255, 255, 0.6)",
														}}
													>
														No skills found for this
														student.
													</Typography>
												</Box>
											)}
										</Paper>

										{/* CGPA Comparison */}
										<Paper
											elevation={0}
											sx={{
												p: 3,
												bgcolor:
													"rgba(255, 255, 255, 0.05)",
												borderRadius: 3,
												mb: 4,
												border: "1px solid rgba(255, 255, 255, 0.08)",
												backdropFilter: "blur(10px)",
											}}
										>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													mb: 3,
												}}
											>
												<CompareIcon
													sx={{
														mr: 1,
														color: "#FF9800",
														fontSize: 28,
													}}
												/>
												<Typography
													variant="h6"
													sx={{
														fontWeight: 600,
														color: "rgba(255, 255, 255, 0.95)",
													}}
												>
													CGPA Comparison (
													{
														studentCGPAComparison.length
													}{" "}
													students)
												</Typography>
											</Box>

											{studentCGPAComparison.length >
											0 ? (
												<>
													{/* CGPA Bar Chart */}
													<Box sx={{ mb: 4 }}>
														<Typography
															variant="h6"
															sx={{
																mb: 3,
																fontWeight: 600,
																color: "rgba(255, 255, 255, 0.95)",
																display: "flex",
																alignItems:
																	"center",
																gap: 1,
															}}
														>
															<BarChartIcon
																sx={{
																	color: "#2196F3",
																}}
															/>
															CGPA Comparison
														</Typography>
														<Box
															sx={{
																display: "flex",
																justifyContent:
																	"center",
															}}
														>
															<ResponsiveContainer
																width="100%"
																height={300}
															>
																<BarChart
																	data={studentCGPAComparison.map(
																		(
																			student,
																			index,
																		) => ({
																			name:
																				student
																					.name
																					.length >
																				10
																					? student.name.substring(
																							0,
																							10,
																						) +
																						"..."
																					: student.name,
																			cgpa: student.cgpa,
																			fill:
																				student.usn ===
																				selectedStudent
																					? "#f093fb"
																					: "#2196F3",
																		}),
																	)}
																	margin={{
																		top: 5,
																		right: 30,
																		left: 20,
																		bottom: 5,
																	}}
																>
																	<CartesianGrid
																		strokeDasharray="3 3"
																		stroke="rgba(255,255,255,0.3)"
																	/>
																	<XAxis
																		dataKey="name"
																		stroke="rgba(255,255,255,0.8)"
																	/>
																	<YAxis stroke="rgba(255,255,255,0.8)" />
																	<Tooltip
																		contentStyle={{
																			backgroundColor:
																				"rgba(26,26,46,0.9)",
																			border: "1px solid rgba(255,255,255,0.2)",
																			borderRadius:
																				"8px",
																		}}
																		labelStyle={{
																			color: "white",
																		}}
																	/>
																	<Bar
																		dataKey="cgpa"
																		fill="#2196F3"
																	/>
																</BarChart>
															</ResponsiveContainer>
														</Box>
													</Box>

													{/* CGPA Distribution Histogram */}
													<Box sx={{ mt: 4 }}>
														<Typography
															variant="h6"
															sx={{
																mb: 3,
																fontWeight: 600,
																color: "rgba(255, 255, 255, 0.95)",
																display: "flex",
																alignItems:
																	"center",
																gap: 1,
															}}
														>
															<BarChartIcon
																sx={{
																	color: "#2196F3",
																}}
															/>
															CGPA Distribution
														</Typography>
														<Box
															sx={{
																display: "flex",
																justifyContent:
																	"center",
															}}
														>
															<ResponsiveContainer
																width="100%"
																height={300}
															>
																<BarChart
																	data={
																		cgpaDistribution
																	}
																	margin={{
																		top: 5,
																		right: 30,
																		left: 20,
																		bottom: 5,
																	}}
																>
																	<CartesianGrid
																		strokeDasharray="3 3"
																		stroke="rgba(255,255,255,0.3)"
																	/>
																	<XAxis
																		dataKey="label"
																		stroke="rgba(255,255,255,0.8)"
																	/>
																	<YAxis stroke="rgba(255,255,255,0.8)" />
																	<Tooltip
																		contentStyle={{
																			backgroundColor:
																				"rgba(26,26,46,0.9)",
																			border: "1px solid rgba(255,255,255,0.2)",
																			borderRadius:
																				"8px",
																		}}
																		labelStyle={{
																			color: "white",
																		}}
																	/>
																	<Bar
																		dataKey="count"
																		fill="#2196F3"
																	/>
																</BarChart>
															</ResponsiveContainer>
														</Box>
													</Box>
												</>
											) : (
												<Box
													sx={{
														textAlign: "center",
														py: 4,
													}}
												>
													<Typography
														variant="body1"
														sx={{
															color: "rgba(255, 255, 255, 0.6)",
														}}
													>
														No CGPA data available
														for comparison.
													</Typography>
												</Box>
											)}
										</Paper>
									</>
								)}

								{/* Empty State */}
								{!selectedStudent && !analysisLoading && (
									<Paper
										elevation={0}
										sx={{
											p: 6,
											textAlign: "center",
											bgcolor:
												"rgba(255, 255, 255, 0.03)",
											borderRadius: 3,
											border: "2px dashed rgba(255, 255, 255, 0.1)",
										}}
									>
										<Box
											sx={{
												p: 2,
												width: 80,
												height: 80,
												borderRadius: "50%",
												bgcolor:
													"rgba(240, 147, 251, 0.1)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												mx: "auto",
												mb: 3,
												border: "1px solid rgba(240, 147, 251, 0.2)",
											}}
										>
											<AnalyticsIcon
												sx={{
													fontSize: 40,
													color: "rgba(240, 147, 251, 0.5)",
												}}
											/>
										</Box>
										<Typography
											variant="h5"
											sx={{
												fontWeight: 700,
												color: "rgba(255, 255, 255, 0.95)",
												mb: 2,
											}}
										>
											{createdGroups.length === 0
												? "No Groups Available"
												: "Select a Group and Student"}
										</Typography>
										<Typography
											variant="body1"
											sx={{
												color: "rgba(255, 255, 255, 0.6)",
												maxWidth: 500,
												mx: "auto",
												mb: 4,
											}}
										>
											{createdGroups.length === 0
												? "You haven't created any groups yet. Go to 'Manage Groups' to create your first group."
												: "Choose a group from the dropdown above, then select a student to view their analysis."}
										</Typography>
										{createdGroups.length === 0 && (
											<Button
												variant="contained"
												onClick={() =>
													setActiveTab("groups")
												}
												sx={{
													background:
														"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
													color: "white",
													fontWeight: 600,
													"&:hover": {
														background:
															"linear-gradient(135deg, #e082ea 0%, #e4465a 100%)",
													},
												}}
											>
												<GroupIcon sx={{ mr: 1 }} />
												Create Group
											</Button>
										)}
									</Paper>
								)}
							</Box>
						)}
					</Paper>
				</Container>
			</Box>

			{/* Floating Bot Icon */}
			<IconButton
				onClick={() => setBotOpen(true)}
				sx={{
					position: "fixed",
					bottom: 20,
					right: 20,
					bgcolor: "#f093fb",
					color: "white",
					width: 56,
					height: 56,
					boxShadow: "0 4px 15px rgba(240, 147, 251, 0.4)",
					"&:hover": {
						bgcolor: "#e082ea",
						boxShadow: "0 6px 20px rgba(240, 147, 251, 0.6)",
						transform: "translateY(-2px)",
					},
					transition: "all 0.2s ease",
				}}
			>
				<BotIcon />
			</IconButton>

			{/* Bot Component */}
			{botOpen && (
				<COMarksUploadBot
					open={botOpen}
					onClose={() => setBotOpen(false)}
					teacherData={teacherData}
				/>
			)}
		</Box>
	);
}
