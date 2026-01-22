import { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  Grid,
  Paper,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  EmojiEvents as EmojiEventsIcon,
  FamilyRestroom as FamilyIcon,
  Cake as CakeIcon,
  Transgender as TransgenderIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import { supabase } from "../SupabaseClient";

export default function SetupForm({ student, setStudent }) {
  const [formData, setFormData] = useState(student || {});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: rpcData, error } = await supabase.rpc("update_student_profile", {
        p_user_id: user.id,
        p_usn: formData.USN,
        p_first_name: formData.First_Name,
        p_last_name: formData.Last_Name,
        p_date_born: formData.Date_born,
        p_sex: formData.Sex,
        p_phone_no: formData.Phone_No,
        p_father_name: formData.Father_Name,
        p_mother_name: formData.Mother_Name,
        p_sslc: formData.SSLC,
        p_puc: formData.PUC,
        p_no_of_projects: formData.No_of_Projects,
        p_no_of_hackathons: formData.No_of_Hackathons,
        p_number_of_internships: formData.Number_Of_Internships
      });

      if (error) {
        console.error("Full error object:", error);
        throw new Error(error.message || "Failed to update profile. Check console for details.");
      }

      console.log("Update successful, RPC returned:", rpcData);
      
      if (user.id) {
        const { data: updatedStudent, error: fetchError } = await supabase.rpc("get_student_by_user_id", {
          p_user_id: user.id
        });
        
        if (!fetchError && updatedStudent) {
          const studentData = Array.isArray(updatedStudent) ? updatedStudent[0] : updatedStudent;
          if (studentData) {
            setStudent({ ...student, ...studentData, ...formData });
          }
        }
      }
      
      setStudent({ ...student, ...formData });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ 
        mb: 2, 
        fontWeight: 700, 
        color: "rgba(255, 255, 255, 0.95)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}>
        <PersonIcon sx={{ color: "#667eea" }} />
        Update Profile
      </Typography>
      <Typography variant="body2" sx={{ 
        mb: 4, 
        color: "rgba(255, 255, 255, 0.6)",
        fontWeight: 400,
      }}>
        Update your personal, academic, and professional information
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            bgcolor: message.type === "success" 
              ? "rgba(76, 175, 80, 0.1)" 
              : "rgba(244, 67, 54, 0.1)",
            color: "rgba(255, 255, 255, 0.9)",
            border: "1px solid",
            borderColor: message.type === "success"
              ? "rgba(76, 175, 80, 0.3)"
              : "rgba(244, 67, 54, 0.3)",
            "& .MuiAlert-icon": {
              color: message.type === "success" ? "#4CAF50" : "#f44336",
            }
          }}
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information Section */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(102, 126, 234, 0.3)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
              }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <PersonIcon sx={{ mr: 1.5, color: "#667eea", fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "1.1rem",
                }}>
                  Personal Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter first name"
                    value={formData.First_Name || ""}
                    onChange={(e) => handleChange("First_Name", e.target.value)}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter last name"
                    value={formData.Last_Name || ""}
                    onChange={(e) => handleChange("Last_Name", e.target.value)}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Date of Birth
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={formData.Date_born || ""}
                    onChange={(e) => handleChange("Date_born", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Gender
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={formData.Sex || ""}
                    onChange={(e) => handleChange("Sex", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& .MuiSelect-select": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "rgba(255, 255, 255, 0.6)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="Male" sx={{ bgcolor: "#1a1a2e", color: "rgba(255, 255, 255, 0.9)" }}>
                      Male
                    </MenuItem>
                    <MenuItem value="Female" sx={{ bgcolor: "#1a1a2e", color: "rgba(255, 255, 255, 0.9)" }}>
                      Female
                    </MenuItem>
                    <MenuItem value="Other" sx={{ bgcolor: "#1a1a2e", color: "rgba(255, 255, 255, 0.9)" }}>
                      Other
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Phone Number
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter phone number"
                    value={formData.Phone_No || ""}
                    onChange={(e) => handleChange("Phone_No", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Family Information Section */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(102, 126, 234, 0.3)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
              }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <FamilyIcon sx={{ mr: 1.5, color: "#667eea", fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "1.1rem",
                }}>
                  Family Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Father's Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter father's name"
                    value={formData.Father_Name || ""}
                    onChange={(e) => handleChange("Father_Name", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Mother's Name
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter mother's name"
                    value={formData.Mother_Name || ""}
                    onChange={(e) => handleChange("Mother_Name", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Academic Information Section */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(102, 126, 234, 0.3)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
              }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <SchoolIcon sx={{ mr: 1.5, color: "#667eea", fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "1.1rem",
                }}>
                  Academic Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    SSLC Percentage
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="Enter SSLC percentage"
                    value={formData.SSLC || ""}
                    onChange={(e) => handleChange("SSLC", e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>%</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    PUC Percentage
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="Enter PUC percentage"
                    value={formData.PUC || ""}
                    onChange={(e) => handleChange("PUC", e.target.value)}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" sx={{ color: "rgba(255, 255, 255, 0.5)" }}>%</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    USN
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter USN"
                    value={formData.USN || ""}
                    onChange={(e) => handleChange("USN", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Achievements Section */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ 
              p: 3, 
              bgcolor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "rgba(102, 126, 234, 0.3)",
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
              }
            }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <EmojiEventsIcon sx={{ mr: 1.5, color: "#667eea", fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "1.1rem",
                }}>
                  Achievements & Experience
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Number of Projects
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="Enter number"
                    value={formData.No_of_Projects || ""}
                    onChange={(e) => handleChange("No_of_Projects", e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Number of Hackathons
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="Enter number"
                    value={formData.No_of_Hackathons || ""}
                    onChange={(e) => handleChange("No_of_Hackathons", e.target.value)}
                    inputProps={{ min: 0 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                  }}>
                    Number of Internships
                  </Typography>
                  <TextField
                    type="number"
                    fullWidth
                    placeholder="Enter number"
                    value={formData.Number_Of_Internships || ""}
                    onChange={(e) => handleChange("Number_Of_Internships", e.target.value)}
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& input::placeholder": {
                          color: "rgba(255, 255, 255, 0.4)",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                mt: 2,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setFormData(student || {})}
                  sx={{ 
                    minWidth: 120,
                    color: "rgba(255, 255, 255, 0.7)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    "&:hover": {
                      borderColor: "#667eea",
                      color: "#667eea",
                      bgcolor: "rgba(102, 126, 234, 0.1)",
                    }
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
                    minWidth: 160,
                    px: 4,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: 600,
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}