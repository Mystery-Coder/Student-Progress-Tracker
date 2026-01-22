import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
  Grid,
  Badge,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  Fingerprint as FingerprintIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon,
  WorkspacePremium as PremiumIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { supabase } from "../SupabaseClient";
import SetupForm from "../components/SetupForm";
import AddAcademicForm from "../components/AddAcademicForm";
import PlacementPredictor from "../components/PlacementPredictor";

const drawerWidth = 300;

export default function StudentDashboard({ onLogout }) {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("setup");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentGroup, setStudentGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudent = async () => {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      
      if (userData.user_id) {
        const { data, error } = await supabase
          .rpc("get_student_by_user_id", { p_user_id: userData.user_id })
          .maybeSingle();
        if (error) {
          console.error("Error fetching student:", error);
          if (userData.First_Name) {
            setStudent(userData);
            return;
          }
        } else if (data) {
          setStudent(data);
        } else if (userData.First_Name) {
          setStudent(userData);
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("STUDENT")
            .select()
            .eq("user_id", user.id)
            .maybeSingle();
          
          if (error) console.error(error);
          else if (data) setStudent(data);
        } else {
          navigate("/login");
        }
      }
    };
    fetchStudent();
  }, [navigate]);

  useEffect(() => {
    if (student?.USN) {
      fetchStudentGroup();
    }
  }, [student?.USN]);

  const fetchStudentGroup = async () => {
    setGroupLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        "get_student_group_info",
        {
          p_user_id: student.user_id
        }
      );

      if (error) {
        console.error("RPC error:", error);
        setStudentGroup(null);
        return;
      }

      if (!data || data.length === 0) {
        setStudentGroup(null);
        return;
      }

      setStudentGroup(data[0]);
    } catch (err) {
      console.error("Error in fetchStudentGroup:", err);
      setStudentGroup(null);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    if (onLogout) {
      onLogout();
    } else {
      navigate("/login");
    }
  };

  const menuItems = [
    { text: "Update Profile", icon: <PersonIcon />, value: "setup" },
    { text: "Academic Records", icon: <SchoolIcon />, value: "add" },
    { text: "My Group", icon: <GroupIcon />, value: "group" },
    { text: "Placement Predictor", icon: <TrendingUpIcon />, value: "predictor" },
  ];

  const drawer = (
    <Box sx={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      background: "linear-gradient(180deg, #0f0c29 0%, #1a1a2e 100%)",
      boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
    }}>
      {/* Header Section */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box sx={{ 
                bgcolor: '#4CAF50', 
                width: 12, 
                height: 12, 
                borderRadius: '50%',
                border: '2px solid #0f0c29'
              }} />
            }
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.1)",
                fontSize: "1.5rem",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {student
                ? `${student.First_Name?.[0] || ""}${student.Last_Name?.[0] || ""}`
                : "S"}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
              {student
                ? `${student.First_Name || ""} ${student.Last_Name || ""}`
                : "Student"}
            </Typography>
            <Chip
              label="Student"
              size="small"
              icon={<PremiumIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                color: "white",
                mt: 0.5,
                fontSize: "0.7rem",
                fontWeight: 500,
                backdropFilter: "blur(5px)",
              }}
            />
          </Box>
        </Box>
        {student?.USN && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <FingerprintIcon sx={{ fontSize: 14, opacity: 0.7 }} />
            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 400 }}>
              USN: {student.USN}
            </Typography>
          </Box>
        )}
        {studentGroup && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon sx={{ fontSize: 14, opacity: 0.7 }} />
            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 400 }}>
              Group: {studentGroup.Group_Name}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.value} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              onClick={() => setActiveTab(item.value)}
              selected={activeTab === item.value}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: "all 0.2s ease",
                "&.Mui-selected": {
                  bgcolor: "rgba(102, 126, 234, 0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(102, 126, 234, 0.3)",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#667eea",
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
                  color: activeTab === item.value ? "#667eea" : "rgba(255,255,255,0.6)",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  sx: {
                    color: activeTab === item.value ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
                    fontSize: "0.9rem",
                    fontWeight: activeTab === item.value ? 500 : 400,
                  }
                }}
              />
              {activeTab === item.value && (
                <ArrowForwardIcon sx={{ fontSize: 16, color: "#667eea", ml: 1 }} />
              )}
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
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (!student) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      >
        <CircularProgress 
          sx={{ 
            color: "rgba(102, 126, 234, 0.8)",
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: "flex", 
      height: "100vh", 
      overflow: "hidden", 
      background: "linear-gradient(135deg, #0f0c29 0%, #24243e 100%)",
      position: "relative",
    }}>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <DashboardIcon sx={{ 
              color: "#667eea", 
              fontSize: 28,
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.95)",
              letterSpacing: "0.3px",
            }}>
              Student Portal
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
            background: "rgba(102, 126, 234, 0.3)",
            borderRadius: "3px",
          }
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
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: "linear-gradient(90deg, transparent, #667eea, transparent)",
              }
            }}
          >
            {activeTab === "setup" && (
              <SetupForm student={student} setStudent={setStudent} />
            )}
            {activeTab === "add" && <AddAcademicForm student={student} />}
            {activeTab === "predictor" && <PlacementPredictor student={student} />}
            {activeTab === "group" && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}>
                    <GroupIcon sx={{ fontSize: 32, color: "#667eea" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ 
                        fontWeight: 700, 
                        color: "rgba(255, 255, 255, 0.95)",
                        mb: 0.5,
                      }}
                    >
                      My Group
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: "rgba(255, 255, 255, 0.6)",
                      fontWeight: 400,
                    }}>
                      View your assigned group information and details
                    </Typography>
                  </Box>
                </Box>

                {groupLoading ? (
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    p: 8,
                    flexDirection: "column",
                    gap: 2
                  }}>
                    <CircularProgress 
                      sx={{ 
                        color: "#667eea",
                      }} 
                    />
                    <Typography variant="body1" sx={{ 
                      color: "rgba(255, 255, 255, 0.6)", 
                      fontWeight: 400 
                    }}>
                      Loading group information...
                    </Typography>
                  </Box>
                ) : studentGroup ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 3,
                      border: "1px solid rgba(102, 126, 234, 0.2)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Box>
                          <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            color: "rgba(255, 255, 255, 0.95)", 
                            mb: 0.5 
                          }}>
                            {studentGroup.Group_Name}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: "rgba(255, 255, 255, 0.5)", 
                            fontWeight: 400,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}>
                            <FingerprintIcon sx={{ fontSize: 14 }} />
                            Group ID: {studentGroup.Group_ID}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`Year ${studentGroup.Current_Year}`}
                        icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          bgcolor: "rgba(102, 126, 234, 0.15)",
                          color: "#667eea",
                          fontWeight: 600,
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

                    <Grid container spacing={3}>
                      {[
                        { label: "Group ID", value: studentGroup.Group_ID, icon: <FingerprintIcon /> },
                        { label: "Group Name", value: studentGroup.Group_Name, icon: <GroupIcon /> },
                        { label: "Current Year", value: `Year ${studentGroup.Current_Year}`, icon: <CalendarIcon /> },
                        { label: "Assigned By", value: studentGroup.Admin_Name, icon: <AdminIcon /> },
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              height: "100%",
                              bgcolor: "rgba(255, 255, 255, 0.02)",
                              borderRadius: 2,
                              border: "1px solid rgba(255, 255, 255, 0.05)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                                borderColor: "rgba(102, 126, 234, 0.2)",
                              },
                            }}
                          >
                            <Box sx={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 1.5, 
                              mb: 2,
                              color: "rgba(102, 126, 234, 0.8)",
                            }}>
                              {item.icon}
                              <Typography
                                variant="subtitle2"
                                sx={{ 
                                  fontWeight: 600,
                                  color: "rgba(255, 255, 255, 0.6)",
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: "rgba(255, 255, 255, 0.95)" 
                            }}>
                              {item.value}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      textAlign: "center",
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 3,
                      border: "2px dashed rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Box sx={{ 
                      p: 2,
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      border: "1px solid rgba(102, 126, 234, 0.2)",
                    }}>
                      <GroupIcon sx={{ fontSize: 40, color: "rgba(102, 126, 234, 0.5)" }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      color: "rgba(255, 255, 255, 0.95)", 
                      mb: 2 
                    }}>
                      No Group Assigned
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: "rgba(255, 255, 255, 0.6)", 
                      maxWidth: 500, 
                      mx: "auto", 
                      mb: 4 
                    }}>
                      You have not been assigned to any group yet. Please contact your teacher to get assigned to a group.
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}