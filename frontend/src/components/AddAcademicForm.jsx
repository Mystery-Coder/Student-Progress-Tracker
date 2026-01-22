import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  Grade as GradeIcon,
  CalendarMonth as CalendarIcon,
  AddCircle as AddCircleIcon,
  Build as BuildIcon,
  Delete as DeleteIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { supabase } from "../SupabaseClient";

// CGPA Component - Add this as a separate component
function CGPAComponent({ usn }) {
  const [cgpa, setCgpa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCGPA = async () => {
      if (!usn) {
        setCgpa(0.0);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('calculate_cgpa', {
            p_usn: usn
          });

        if (error) {
          console.error("Error calculating CGPA:", error);
          setCgpa(0.0);
        } else {
          setCgpa(data || 0.0);
        }
      } catch (err) {
        console.error("Error in fetchCGPA:", err);
        setCgpa(0.0);
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
        label={cgpa >= 8.5 ? "Excellent" : cgpa >= 7.5 ? "Good" : cgpa >= 6.5 ? "Average" : "Needs Improvement"}
        size="small"
        sx={{
          bgcolor: cgpa >= 8.5 ? "rgba(76, 175, 80, 0.2)" : 
                   cgpa >= 7.5 ? "rgba(33, 150, 243, 0.2)" : 
                   cgpa >= 6.5 ? "rgba(255, 152, 0, 0.2)" : 
                   "rgba(244, 67, 54, 0.2)",
          color: "white",
          fontWeight: 600,
        }}
      />
    </Box>
  );
}

export default function AddAcademicForm({ student }) {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    Course_Code: "",
    Semester: "",
    Grade: "",
    Year: "",
    Credits_Earned: ""
  });
  const [skillsFormData, setSkillsFormData] = useState({
    Skill_Name: "",
    Rating: 0
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentYear, setStudentYear] = useState(null);
  const [skills, setSkills] = useState([]);
  const [activeSection, setActiveSection] = useState("academic"); // "academic", "skills", or "records"
  const [academicRecords, setAcademicRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Fetch student's group year using RPC
  useEffect(() => {
    const fetchStudentGroupYear = async () => {
      if (!student?.USN) return;

      try {
        // Call RPC function to get student's current year
        const { data, error } = await supabase
          .rpc('get_student_current_year', {
            p_usn: student.USN
          });

        if (error) {
          console.error("Error fetching student year:", error);
          return;
        }

        if (data !== null && data !== undefined) {
          setStudentYear(data);
        } else {
          setMessage({
            type: "warning",
            text: "You are not assigned to any group. Please contact your teacher.",
          });
        }
      } catch (err) {
        console.error("Error in fetchStudentGroupYear:", err);
      }
    };

    fetchStudentGroupYear();
  }, [student?.USN]);

  // Fetch courses filtered by student's year using RPC
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      
      if (!studentYear) {
        setCoursesLoading(false);
        return;
      }

      try {
        // Call RPC function to get courses by year
        const { data, error } = await supabase
          .rpc('get_courses_by_year', {
            p_year: studentYear
          });
        
        if (error) {
          console.error(error);
          setMessage({ type: "error", text: "Failed to load courses" });
        } else {
          setCourses(data || []);
          if (data && data.length === 0) {
            setMessage({
              type: "info",
              text: `No courses available for Year ${studentYear}`,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setMessage({ type: "error", text: "Failed to load courses" });
      } finally {
        setCoursesLoading(false);
      }
    };

    if (studentYear) {
      fetchCourses();
    }
  }, [studentYear]);

  // Fetch existing skills using RPC
  useEffect(() => {
    const fetchSkills = async () => {
      if (!student?.USN) return;

      try {
        // Call RPC function to get student skills
        const { data, error } = await supabase
          .rpc('get_student_skills', {
            p_usn: student.USN
          });

        if (error) {
          console.error("Error fetching skills:", error);
        } else {
          setSkills(data || []);
        }
      } catch (err) {
        console.error("Error in fetchSkills:", err);
      }
    };

    fetchSkills();
  }, [student?.USN]);

  // Fetch academic records when Records tab is active
  useEffect(() => {
    const fetchAcademicRecords = async () => {
      if (!student?.USN || activeSection !== "records") return;

      setRecordsLoading(true);
      try {
        // Call RPC function to get academic details by USN
        const { data, error } = await supabase
          .rpc('get_academic_details_by_usn', {
            p_usn: student.USN
          });

        if (error) {
          console.error("Error fetching academic records:", error);
          setMessage({ type: "error", text: "Failed to load academic records" });
        } else {
          setAcademicRecords(data || []);
        }
      } catch (err) {
        console.error("Error in fetchAcademicRecords:", err);
        setMessage({ type: "error", text: "Failed to load academic records" });
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchAcademicRecords();
  }, [student?.USN, activeSection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call RPC function to add academic record
      const { error } = await supabase.rpc('add_academic_record', {
        p_user_id: user.id,
        p_usn: student?.USN || null,
        p_course_code: formData.Course_Code,
        p_course_name: formData.Course_Name,
        p_semester: parseInt(formData.Semester),
        p_grade: formData.Grade,
        p_year: parseInt(formData.Year),
        p_credits: parseFloat(formData.Credits_Earned) || 0
      });
      
      if (error) throw error;
      
      setMessage({ type: "success", text: "Academic record added successfully!" });
      setFormData({ Course_Code: "", Semester: "", Grade: "", Year: "", Credits_Earned: "" });
      
      // Refresh academic records if on records tab
      if (activeSection === "records") {
        const { data: updatedRecords } = await supabase
          .rpc('get_academic_details_by_usn', {
            p_usn: student.USN
          });
        setAcademicRecords(updatedRecords || []);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSkillsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call RPC function to add student skill
      const { error } = await supabase.rpc('add_student_skill', {
        p_user_id: user.id,
        p_usn: student?.USN || null,
        p_skill_name: skillsFormData.Skill_Name,
        p_rating: parseFloat(skillsFormData.Rating)
      });
      
      if (error) throw error;
      
      // Refresh skills list using RPC
      const { data: updatedSkills, error: fetchError } = await supabase
        .rpc('get_student_skills', {
          p_usn: student?.USN
        });

      if (!fetchError) {
        setSkills(updatedSkills || []);
      }
      
      setMessage({ type: "success", text: "Skill added successfully!" });
      setSkillsFormData({ Skill_Name: "", Rating: 0 });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleDeleteSkill = async (slNo) => {
  if (!student?.USN) {
    setMessage({ type: "error", text: "Student USN not found" });
    return;
  }

  try {
    // Call RPC function to delete skill
    const { data, error } = await supabase
      .rpc('delete_student_skill', {
        p_sl_no: slNo,
        p_usn: student.USN
      });

    if (error) {
      console.error("RPC error:", error);
      throw new Error(`Failed to delete skill: ${error.message}`);
    }

    if (!data) {
      throw new Error("Skill not found or you don't have permission to delete it");
    }

    // Update local state by removing the deleted skill
    setSkills(prevSkills => prevSkills.filter(skill => skill["Sl.No"] !== slNo));
    
    setMessage({ type: "success", text: "Skill deleted successfully!" });
    
  } catch (err) {
    setMessage({ type: "error", text: err.message });
    console.error("Error in handleDeleteSkill:", err);
  }
};
  const gradeColors = {
    A: "success",
    B: "info",
    C: "warning",
    D: "error",
    F: "error",
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "success";
    if (rating >= 3) return "info";
    if (rating >= 2) return "warning";
    return "error";
  };

  // Function to get grade color for records table
  // Update this function in your AddAcademicForm component
const getGradeColor = (grade) => {
  switch (grade) {
    case 'O': return '#4CAF50';
    case 'A+': return '#4CAF50';
    case 'A': return '#2196F3';
    case 'B+': return '#2196F3';
    case 'B': return '#FF9800';
    case 'C': return '#FF9800';
    case 'P': return '#9E9E9E';
    case 'F': return '#F44336';
    default: return '#9E9E9E';
  }
};

  return (
    <Box sx={{
      background: "linear-gradient(135deg, #0f0c29 0%, #24243e 100%)",
      minHeight: "100vh",
      p: 3,
    }}>
      <Typography variant="h4" sx={{ 
        mb: 1, 
        fontWeight: 600, 
        color: "rgba(255, 255, 255, 0.95)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}>
        <SchoolIcon sx={{ color: "#667eea" }} />
        Academic & Skills Records
      </Typography>
      <Typography variant="body2" sx={{ 
        mb: 4, 
        color: "rgba(255, 255, 255, 0.6)",
        fontWeight: 400,
      }}>
        Add your course grades, academic performance, and skills with ratings
      </Typography>

      {/* Section Tabs */}
      <Box sx={{ 
        mb: 4, 
        display: "flex", 
        gap: 2, 
        borderBottom: 1, 
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}>
        <Button
          variant={activeSection === "academic" ? "contained" : "outlined"}
          onClick={() => setActiveSection("academic")}
          startIcon={<SchoolIcon />}
          sx={{ 
            borderRadius: 2,
            background: activeSection === "academic" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : "transparent",
            color: activeSection === "academic" ? "white" : "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              borderColor: "#667eea",
              background: activeSection === "academic" 
                ? "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)" 
                : "rgba(102, 126, 234, 0.1)",
            }
          }}
        >
          Academic Records
        </Button>
        <Button
          variant={activeSection === "skills" ? "contained" : "outlined"}
          onClick={() => setActiveSection("skills")}
          startIcon={<BuildIcon />}
          sx={{ 
            borderRadius: 2,
            background: activeSection === "skills" 
              ? "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)" 
              : "transparent",
            color: activeSection === "skills" ? "white" : "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              borderColor: "#4CAF50",
              background: activeSection === "skills" 
                ? "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)" 
                : "rgba(76, 175, 80, 0.1)",
            }
          }}
        >
          Skills
        </Button>
        <Button
          variant={activeSection === "records" ? "contained" : "outlined"}
          onClick={() => setActiveSection("records")}
          startIcon={<ListIcon />}
          sx={{ 
            borderRadius: 2,
            background: activeSection === "records" 
              ? "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)" 
              : "transparent",
            color: activeSection === "records" ? "white" : "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            "&:hover": {
              borderColor: "#FF9800",
              background: activeSection === "records" 
                ? "linear-gradient(135deg, #F57C00 0%, #E65100 100%)" 
                : "rgba(255, 152, 0, 0.1)",
            }
          }}
        >
          Records
        </Button>
      </Box>

      {studentYear && activeSection === "academic" && (
        <Typography variant="body2" sx={{ 
          mb: 4, 
          fontWeight: 500,
          color: "#667eea",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <SchoolIcon sx={{ fontSize: 16 }} />
          Showing courses for Year {studentYear} (based on your assigned group)
        </Typography>
      )}
      {!studentYear && student?.USN && activeSection === "academic" && (
        <Typography variant="body2" sx={{ 
          mb: 4, 
          color: "#FF9800",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <SchoolIcon sx={{ fontSize: 16 }} />
          You are not assigned to any group. Please contact your teacher to be assigned to a group.
        </Typography>
      )}

      {message && (
        <Alert severity={message.type} sx={{ 
          mb: 3, 
          borderRadius: 2,
          bgcolor: message.type === "success" 
            ? "rgba(76, 175, 80, 0.1)" 
            : message.type === "error"
            ? "rgba(244, 67, 54, 0.1)"
            : message.type === "warning"
            ? "rgba(255, 152, 0, 0.1)"
            : "rgba(33, 150, 243, 0.1)",
          color: "rgba(255, 255, 255, 0.9)",
          border: "1px solid",
          borderColor: message.type === "success" 
            ? "rgba(76, 175, 80, 0.3)"
            : message.type === "error"
            ? "rgba(244, 67, 54, 0.3)"
            : message.type === "warning"
            ? "rgba(255, 152, 0, 0.3)"
            : "rgba(33, 150, 243, 0.3)",
          "& .MuiAlert-icon": {
            color: message.type === "success" 
              ? "#4CAF50"
              : message.type === "error"
              ? "#f44336"
              : message.type === "warning"
              ? "#FF9800"
              : "#2196F3",
          }
        }}>
          {message.text}
        </Alert>
      )}

      {/* Academic Records Section */}
      {activeSection === "academic" && (
        <>
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
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <AddCircleIcon sx={{ mr: 1, color: "#667eea", fontSize: 28 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
              }}>
                Add New Academic Record
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    label="Course"
                    fullWidth
                    value={formData.Course_Code}
                    onChange={(e) => {
                      const selectedCourse = courses.find(c => c.Course_Code === e.target.value);
                      setFormData({ 
                        ...formData, 
                        Course_Code: e.target.value,
                        Course_Name: selectedCourse ? selectedCourse.Course_Name : "",
                        Credits_Earned: selectedCourse ? selectedCourse.Credits || "0" : "0"
                      });
                    }}
                    required
                    disabled={coursesLoading || !studentYear}
                    helperText={
                      !studentYear
                        ? "You must be assigned to a group to select courses"
                        : studentYear
                        ? `Courses for Year ${studentYear}`
                        : ""
                    }
                    InputProps={{
                      startAdornment: <SchoolIcon sx={{ mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />,
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
                        "& .MuiSelect-select": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "rgba(255, 255, 255, 0.6)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  >
                    {!studentYear ? (
                      <MenuItem disabled sx={{
                        bgcolor: "#1a1a2e",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}>
                        No group assigned - Cannot load courses
                      </MenuItem>
                    ) : coursesLoading ? (
                      <MenuItem disabled sx={{
                        bgcolor: "#1a1a2e",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}>
                        <CircularProgress size={20} sx={{ mr: 1, color: "#667eea" }} />
                        Loading courses...
                      </MenuItem>
                    ) : courses.length === 0 ? (
                      <MenuItem disabled sx={{
                        bgcolor: "#1a1a2e",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}>
                        No courses available for Year {studentYear}
                      </MenuItem>
                    ) : (
                      courses.map((c) => (
                        <MenuItem key={c.Course_Code} value={c.Course_Code} sx={{
                          bgcolor: "#1a1a2e",
                          color: "rgba(255, 255, 255, 0.9)",
                          "&:hover": {
                            bgcolor: "rgba(102, 126, 234, 0.2)",
                          },
                          "&.Mui-selected": {
                            bgcolor: "rgba(102, 126, 234, 0.3)",
                            "&:hover": {
                              bgcolor: "rgba(102, 126, 234, 0.4)",
                            },
                          },
                        }}>
                          {c.Course_Name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    label="Semester"
                    type="number"
                    fullWidth
                    value={formData.Semester}
                    onChange={(e) =>
                      setFormData({ ...formData, Semester: e.target.value })
                    }
                    required
                    inputProps={{ min: 1, max: 8 }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />,
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
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    label="Grade"
                    fullWidth
                    value={formData.Grade}
                    onChange={(e) =>
                      setFormData({ ...formData, Grade: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: <GradeIcon sx={{ mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />,
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
                        "& .MuiSelect-select": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "rgba(255, 255, 255, 0.6)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  >
                    <MenuItem value="O" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      O - Outstanding
                    </MenuItem>
                    <MenuItem value="A+" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      A+ - Good
                    </MenuItem>
                    <MenuItem value="A" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      A - Very Good
                    </MenuItem>
                    <MenuItem value="B+" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      B+ - Good
                    </MenuItem>
                    <MenuItem value="B" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      B -Above Average
                    </MenuItem>
                    <MenuItem value="C" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      C - Average
                    </MenuItem>
                    <MenuItem value="P" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      P - Pass
                    </MenuItem>
                    <MenuItem value="F" sx={{
                      bgcolor: "#1a1a2e",
                      color: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(102, 126, 234, 0.2)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "rgba(102, 126, 234, 0.3)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.4)",
                        },
                      },
                    }}>
                      F - Fail
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    label="Year"
                    fullWidth
                    value={formData.Year}
                    onChange={(e) =>
                      setFormData({ ...formData, Year: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1, color: "rgba(255, 255, 255, 0.5)" }} />,
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
                        "& .MuiSelect-select": {
                          color: "rgba(255, 255, 255, 0.95)",
                          padding: "12px 14px",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "rgba(255, 255, 255, 0.6)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <MenuItem key={year} value={year.toString()} sx={{
                        bgcolor: "#1a1a2e",
                        color: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          bgcolor: "rgba(102, 126, 234, 0.2)",
                        },
                        "&.Mui-selected": {
                          bgcolor: "rgba(102, 126, 234, 0.3)",
                          "&:hover": {
                            bgcolor: "rgba(102, 126, 234, 0.4)",
                          },
                        },
                      }}>
                        {year}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    label="Credits Earned"
                    type="number"
                    fullWidth
                    value={formData.Credits_Earned}
                    onChange={(e) =>
                      setFormData({ ...formData, Credits_Earned: e.target.value })
                    }
                    required
                    inputProps={{ step: "0.5", min: 0, max: 10 }}
                    helperText="Auto-filled from course selection"
                    disabled
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
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() =>
                        setFormData({ 
                          Course_Code: "", 
                          Semester: "", 
                          Grade: "", 
                          Year: "",
                          Credits_Earned: "" 
                        })
                      }
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          borderColor: "#667eea",
                          color: "#667eea",
                          bgcolor: "rgba(102, 126, 234, 0.1)",
                        }
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || coursesLoading}
                      sx={{
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
                      {loading ? "Adding..." : "Add Record"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {formData.Grade && (
            <Card
              elevation={0}
              sx={{
                bgcolor: "rgba(102, 126, 234, 0.1)",
                color: "rgba(255, 255, 255, 0.95)",
                borderRadius: 2,
                p: 2,
                mb: 3,
                border: "1px solid rgba(102, 126, 234, 0.2)",
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Preview: {formData.Course_Code} - Semester {formData.Semester} - Year {formData.Year} - Credits: {formData.Credits_Earned} - Grade{" "}
                <Chip
                  label={formData.Grade}
                  size="small"
                  color={gradeColors[formData.Grade] || "default"}
                  sx={{ ml: 1, fontWeight: 600 }}
                />
              </Typography>
            </Card>
          )}
        </>
      )}

      {/* Skills Section */}
      {activeSection === "skills" && (
        <>
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
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <BuildIcon sx={{ mr: 1, color: "#4CAF50", fontSize: 28 }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
              }}>
                Add New Skill
              </Typography>
            </Box>

            <form onSubmit={handleSkillsSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Skill Name"
                    fullWidth
                    value={skillsFormData.Skill_Name}
                    onChange={(e) =>
                      setSkillsFormData({ ...skillsFormData, Skill_Name: e.target.value })
                    }
                    required
                    placeholder="e.g., JavaScript, Python, Communication, Leadership"
                    helperText="Enter the name of the skill you want to add"
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
                          borderColor: "#4CAF50",
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
                      "& .MuiInputLabel-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
                    <Typography variant="body2" sx={{ 
                      whiteSpace: "nowrap",
                      color: "rgba(255, 255, 255, 0.8)",
                    }}>
                      Rating:
                    </Typography>
                    <Rating
                      name="skill-rating"
                      value={parseFloat(skillsFormData.Rating)}
                      onChange={(event, newValue) => {
                        setSkillsFormData({ ...skillsFormData, Rating: newValue || 0 });
                      }}
                      precision={0.5}
                      size="large"
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#4CAF50",
                        },
                        "& .MuiRating-iconEmpty": {
                          color: "rgba(255, 255, 255, 0.3)",
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      minWidth: 40,
                      color: "rgba(255, 255, 255, 0.8)",
                    }}>
                      {skillsFormData.Rating}/5
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={skillsLoading || !skillsFormData.Skill_Name.trim()}
                    sx={{
                      height: "56px",
                      background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: "0 4px 15px rgba(76, 175, 80, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #43A047 0%, #1B5E20 100%)",
                        boxShadow: "0 6px 20px rgba(76, 175, 80, 0.6)",
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
                    {skillsLoading ? "Adding..." : "Add Skill"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Skills List */}
          {skills.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.95)",
              }}>
                Your Skills ({skills.length})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: 600,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      }}>
                        <strong>Skill Name</strong>
                      </TableCell>
                      <TableCell sx={{ 
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: 600,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      }}>
                        <strong>Rating</strong>
                      </TableCell>
                      <TableCell sx={{ 
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: 600,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      }}>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill["Sl.No"]} sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "& td": {
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          color: "rgba(255, 255, 255, 0.8)",
                        }
                      }}>
                        <TableCell>{skill.Skill_Name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Rating
                              value={skill.Rating}
                              precision={0.5}
                              readOnly
                              size="small"
                              sx={{
                                "& .MuiRating-iconFilled": {
                                  color: "#4CAF50",
                                },
                                "& .MuiRating-iconEmpty": {
                                  color: "rgba(255, 255, 255, 0.3)",
                                },
                              }}
                            />
                            <Chip
                              label={skill.Rating.toFixed(1)}
                              size="small"
                              color={getRatingColor(skill.Rating)}
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: getRatingColor(skill.Rating) === "success" ? "rgba(76, 175, 80, 0.2)" :
                                         getRatingColor(skill.Rating) === "info" ? "rgba(33, 150, 243, 0.2)" :
                                         getRatingColor(skill.Rating) === "warning" ? "rgba(255, 152, 0, 0.2)" :
                                         "rgba(244, 67, 54, 0.2)",
                                color: "white",
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSkill(skill["Sl.No"])}
                            title="Delete skill"
                            sx={{
                              color: "#f44336",
                              "&:hover": {
                                bgcolor: "rgba(244, 67, 54, 0.1)",
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Stats */}
              <Box sx={{ mt: 3, display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Card variant="outlined" sx={{ 
                  p: 2, 
                  minWidth: 150,
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.9)",
                }}>
                  <Typography variant="body2" sx={{ 
                    color: "rgba(255, 255, 255, 0.6)",
                  }}>
                    Total Skills
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.95)",
                  }}>
                    {skills.length}
                  </Typography>
                </Card>
                <Card variant="outlined" sx={{ 
                  p: 2, 
                  minWidth: 150,
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.9)",
                }}>
                  <Typography variant="body2" sx={{ 
                    color: "rgba(255, 255, 255, 0.6)",
                  }}>
                    Average Rating
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.95)",
                  }}>
                    {(skills.reduce((sum, skill) => sum + skill.Rating, 0) / skills.length).toFixed(1)}
                  </Typography>
                </Card>
                <Card variant="outlined" sx={{ 
                  p: 2, 
                  minWidth: 150,
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.9)",
                }}>
                  <Typography variant="body2" sx={{ 
                    color: "rgba(255, 255, 255, 0.6)",
                  }}>
                    Highest Rated
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.95)",
                  }}>
                    {Math.max(...skills.map(s => s.Rating)).toFixed(1)}
                  </Typography>
                </Card>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 3,
                textAlign: "center",
                border: "2px dashed rgba(255, 255, 255, 0.1)",
              }}
            >
              <BuildIcon sx={{ 
                fontSize: 48, 
                color: "rgba(255, 255, 255, 0.3)",
                mb: 2 
              }} />
              <Typography variant="h6" sx={{ 
                color: "rgba(255, 255, 255, 0.7)",
                gutterBottom 
              }}>
                No skills added yet
              </Typography>
              <Typography variant="body2" sx={{ 
                color: "rgba(255, 255, 255, 0.5)",
              }}>
                Add your first skill using the form above to get started.
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Records Section */}
{activeSection === "records" && (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      bgcolor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 3,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(10px)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <ListIcon sx={{ mr: 1, color: "#FF9800", fontSize: 28 }} />
      <Typography variant="h6" sx={{ 
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.95)",
      }}>
        Academic Records & CGPA
      </Typography>
    </Box>

    {recordsLoading ? (
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
            color: "#FF9800",
          }} 
        />
        <Typography variant="body1" sx={{ 
          color: "rgba(255, 255, 255, 0.6)", 
          fontWeight: 400 
        }}>
          Loading academic records...
        </Typography>
      </Box>
    ) : academicRecords.length > 0 ? (
      <>
        <Typography variant="body2" sx={{ 
          mb: 3, 
          color: "rgba(255, 255, 255, 0.7)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
          <SchoolIcon sx={{ fontSize: 16 }} />
          Showing {academicRecords.length} academic record(s) for {student?.USN}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Course Code</strong>
                </TableCell>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Course Name</strong>
                </TableCell>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Semester</strong>
                </TableCell>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Year</strong>
                </TableCell>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Grade</strong>
                </TableCell>
                <TableCell sx={{ 
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 600,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}>
                  <strong>Credits</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {academicRecords.map((record, index) => (
                <TableRow key={index} sx={{ 
                  "&:last-child td, &:last-child th": { border: 0 },
                  "& td": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.03)",
                  }
                }}>
                  <TableCell>{record.Course_Code || "N/A"}</TableCell>
                  <TableCell>{record.Course_Name || "N/A"}</TableCell>
                  <TableCell>{record.Semester || "N/A"}</TableCell>
                  <TableCell>{record.Year || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.Grade || "N/A"}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: getGradeColor(record.Grade),
                        color: "white",
                        minWidth: 40,
                      }}
                    />
                  </TableCell>
                  <TableCell>{record.Credits_earned || "0"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Stats - UPDATED FOR CGPA */}
        <Box sx={{ mt: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Card variant="outlined" sx={{ 
            p: 2, 
            minWidth: 150,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.9)",
          }}>
            <Typography variant="body2" sx={{ 
              color: "rgba(255, 255, 255, 0.6)",
            }}>
              Total Records
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
            }}>
              {academicRecords.length}
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ 
            p: 2, 
            minWidth: 150,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.9)",
          }}>
            <Typography variant="body2" sx={{ 
              color: "rgba(255, 255, 255, 0.6)",
            }}>
              Total Credits
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
            }}>
              {academicRecords.reduce((sum, record) => sum + parseFloat(record.Credits_earned || 0), 0).toFixed(1)}
            </Typography>
          </Card>
          <Card variant="outlined" sx={{ 
            p: 2, 
            minWidth: 150,
            bgcolor: "rgba(255, 255, 255, 0.03)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.9)",
          }}>
            <Typography variant="body2" sx={{ 
              color: "rgba(255, 255, 255, 0.6)",
            }}>
              CGPA
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              color: "#4CAF50",
            }}>
              {/* We'll calculate this dynamically */}
              <CGPAComponent usn={student?.USN} />
            </Typography>
          </Card>
        </Box>
      </>
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
          bgcolor: "rgba(255, 152, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
          border: "1px solid rgba(255, 152, 0, 0.2)",
        }}>
          <ListIcon sx={{ fontSize: 40, color: "rgba(255, 152, 0, 0.5)" }} />
        </Box>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: "rgba(255, 255, 255, 0.95)", 
          mb: 2 
        }}>
          No Academic Records Found
        </Typography>
        <Typography variant="body1" sx={{ 
          color: "rgba(255, 255, 255, 0.6)", 
          maxWidth: 500, 
          mx: "auto", 
          mb: 4 
        }}>
          You haven't added any academic records yet. Go to the "Academic Records" tab to add your first course grade.
        </Typography>
        <Button
          variant="contained"
          onClick={() => setActiveSection("academic")}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #653a8e 100%)",
            },
          }}
        >
          <SchoolIcon sx={{ mr: 1 }} />
          Add Academic Record
        </Button>
      </Paper>
    )}
  </Paper>
)}
    </Box>
  );
}