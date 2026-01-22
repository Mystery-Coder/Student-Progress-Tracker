// Login.jsx - Dark Theme Version (Updated without emojis)
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Analytics as AnalyticsIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

export default function Login() {
  const [activeTab, setActiveTab] = useState(0);
  const [animate, setAnimate] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setAnimate(true);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: "Academic Tracking",
      description: "Monitor grades, courses, and academic performance",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Placement Predictor",
      description: "AI-powered placement probability analysis",
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: "Group Management",
      description: "Teachers can create and manage student groups",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: "CO Analytics",
      description: "Comprehensive Course Outcome analysis and insights",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)`,
        },
      }}
    >
      {/* Animated background elements */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            background: `radial-gradient(circle, rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, 0.1) 0%, transparent 70%)`,
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            pt: { xs: 4, md: 8 },
            pb: { xs: 4, md: 8 },
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Fade in={animate} timeout={800}>
            <Box>
              {/* Header Section */}
              <Box
                sx={{
                  textAlign: "center",
                  mb: { xs: 4, md: 6 },
                  px: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <DashboardIcon sx={{ fontSize: 60, color: "#667eea", mr: 2 }} />
                  <Box>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 800,
                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                      }}
                    >
                      Student Progress Tracker
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        maxWidth: 600,
                        mx: "auto",
                        fontWeight: 300,
                        mt: 1,
                      }}
                    >
                      AI-powered platform for tracking academic performance, 
                      predicting placements, and managing student progress
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", lg: "row" },
                  gap: 4,
                  alignItems: "stretch",
                }}
              >
                {/* Left Side - Features */}
                <Box
                  sx={{
                    flex: 1,
                    display: { xs: "none", lg: "flex" },
                    flexDirection: "column",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      flex: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 4 }}>
                      <AnalyticsIcon sx={{ fontSize: 32, color: "#667eea", mr: 1 }} />
                      <Typography
                        variant="h5"
                        sx={{
                          color: "white",
                          fontWeight: 600,
                        }}
                      >
                        Platform Features
                      </Typography>
                    </Box>
                    <Box sx={{ display: "grid", gap: 3 }}>
                      {features.map((feature, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            background: "rgba(255, 255, 255, 0.03)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.08)",
                              transform: "translateX(5px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              background: "linear-gradient(45deg, #667eea, #764ba2)",
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: "white", fontWeight: 600 }}
                            >
                              {feature.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Box>

                {/* Right Side - Auth Card */}
                <Box sx={{ flex: 1, maxWidth: { xs: "100%", lg: 500 } }}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {/* Header with gradient */}
                    <Box
                      sx={{
                        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        p: 3,
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                        {activeTab === 0 ? (
                          <LoginIcon sx={{ fontSize: 32, color: "white", mr: 2 }} />
                        ) : (
                          <PersonAddIcon sx={{ fontSize: 32, color: "white", mr: 2 }} />
                        )}
                        <Typography
                          variant="h4"
                          sx={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: { xs: "1.75rem", md: "2.125rem" },
                          }}
                        >
                          {activeTab === 0 ? "Welcome Back" : "Get Started"}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 1 }}
                      >
                        {activeTab === 0
                          ? "Sign in to access your dashboard"
                          : "Create your account in seconds"}
                      </Typography>
                    </Box>

                    {/* Tabs */}
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      sx={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        "& .MuiTab-root": {
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "1rem",
                          fontWeight: 600,
                          py: 2.5,
                          "&.Mui-selected": {
                            color: "white",
                          },
                        },
                        "& .MuiTabs-indicator": {
                          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          height: 3,
                        },
                      }}
                    >
                      <Tab 
                        label="Sign In" 
                        icon={<LoginIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                        iconPosition="start"
                      />
                      <Tab 
                        label="Sign Up" 
                        icon={<PersonAddIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                        iconPosition="start"
                      />
                    </Tabs>

                    {/* Form Content */}
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                      <Fade in={true} timeout={300}>
                        <Box>
                          {activeTab === 0 ? (
                            <SignIn toggleView={() => setActiveTab(1)} />
                          ) : (
                            <SignUp toggleView={() => setActiveTab(0)} />
                          )}
                        </Box>
                      </Fade>
                    </CardContent>

                    {/* Footer */}
                    <Box
                      sx={{
                        p: 3,
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AccountCircleIcon sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 1, fontSize: 18 }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.5)" }}
                      >
                        {activeTab === 0
                          ? "Don't have an account?"
                          : "Already have an account?"}
                        <Typography
                          component="span"
                          variant="body2"
                          onClick={() => setActiveTab(activeTab === 0 ? 1 : 0)}
                          sx={{
                            color: "#667eea",
                            cursor: "pointer",
                            fontWeight: 600,
                            ml: 1,
                            "&:hover": {
                              color: "#764ba2",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {activeTab === 0 ? "Sign Up" : "Sign In"}
                        </Typography>
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Stats for mobile */}
                  {isMobile && (
                    <Box sx={{ mt: 3 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.05)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <AnalyticsIcon sx={{ color: "#667eea", mr: 1 }} />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "white", fontWeight: 600 }}
                          >
                            Key Features
                          </Typography>
                        </Box>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                          {features.slice(0, 4).map((feature, index) => (
                            <Box
                              key={index}
                              sx={{
                                textAlign: "center",
                                p: 1.5,
                                borderRadius: 2,
                                background: "rgba(255, 255, 255, 0.03)",
                              }}
                            >
                              <Box sx={{ color: "#667eea", mb: 1 }}>
                                {feature.icon}
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}
                              >
                                {feature.title}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Footer */}
              <Box
                sx={{
                  mt: 6,
                  textAlign: "center",
                  color: "rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <SchoolIcon sx={{ fontSize: 20, mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />
                  <Typography variant="body2">
                    © 2024 Student Progress Tracker. All rights reserved.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TrendingUpIcon sx={{ fontSize: 16, mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />
                  <Typography variant="caption">
                    Powered by Supabase & MongoDB
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Box>
      </Container>

      {/* Global styles for animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(-10px) translateX(-10px);
            }
            75% {
              transform: translateY(10px) translateX(15px);
            }
          }
        `}
      </style>
    </Box>
  );
}