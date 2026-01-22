import { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  Typography,
  MenuItem,
  Box,
  InputLabel,
  FormControl,
  Select,
} from "@mui/material";
import { supabase } from "../SupabaseClient";
import { useNavigate } from "react-router-dom";

export default function SignIn({ toggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!email || !password || !role) {
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
      if (!user) throw new Error("Authentication failed");

      // ================= STUDENT =================
      if (role === "student") {
        const { data: isStudent, error: studentError } = await supabase.rpc(
          "student_exists_for_user",
          {
            p_user_id: user.id,
          }
        );

        if (studentError) throw new Error(studentError.message);

        if (!isStudent) {
          throw new Error("Student account not found. Please sign up first.");
        }

        localStorage.setItem("userRole", "student");
        navigate("/student-portal");
      }

      // ================= TEACHER =================
      else if (role === "teacher") {
        const { data: isAdmin, error: adminError } = await supabase.rpc(
          "admin_exists_for_user",
          {
            p_user_id: user.id,
          }
        );

        if (adminError) throw new Error(adminError.message);

        if (!isAdmin) {
          throw new Error("Teacher account not found. Please sign up first.");
        }

        localStorage.setItem("userRole", "teacher");
        navigate("/teacher-blank");
      }

      setMessage({ type: "success", text: "Signed in successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: `Login Failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSignIn} sx={{ width: "100%" }}>
      {message.text && (
        <Alert
          severity={message.type}
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor:
              message.type === "error"
                ? "rgba(244, 67, 54, 0.15)"
                : "rgba(76, 175, 80, 0.15)",
            color: "white",
            border: "1px solid",
            borderColor:
              message.type === "error"
                ? "rgba(244, 67, 54, 0.4)"
                : "rgba(76, 175, 80, 0.4)",
            "& .MuiAlert-icon": {
              color: message.type === "error" ? "#ff6b6b" : "#51cf66",
            },
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* Email Field */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            mb: 1,
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          Email
        </Typography>
        <TextField
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.25)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#667eea",
                borderWidth: "2px",
              },
              "& input": {
                color: "white",
                padding: "14px 16px",
                fontSize: "0.95rem",
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.4)",
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      {/* Password Field */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            mb: 1,
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          Password
        </Typography>
        <TextField
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.25)",
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.4)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#667eea",
                borderWidth: "2px",
              },
              "& input": {
                color: "white",
                padding: "14px 16px",
                fontSize: "0.95rem",
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.4)",
                  opacity: 1,
                },
              },
            },
          }}
        />
      </Box>

      {/* Role Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            mb: 1,
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          Sign in as
        </Typography>
        <FormControl fullWidth>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.25)",
                borderWidth: "1px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.4)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#667eea",
                borderWidth: "2px",
              },
              "& .MuiSelect-select": {
                color: "white",
                padding: "14px 16px",
                fontSize: "0.95rem",
              },
              "& .MuiSvgIcon-root": {
                color: "rgba(255, 255, 255, 0.6)",
              },
            }}
          >
            <MenuItem
              value="student"
              sx={{
                backgroundColor: "#1a1a2e",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.2)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.4)",
                  },
                },
              }}
            >
              Student
            </MenuItem>
            <MenuItem
              value="teacher"
              sx={{
                backgroundColor: "#1a1a2e",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.2)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.4)",
                  },
                },
              }}
            >
              Teacher
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Sign In Button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading}
        sx={{
          mb: 3,
          py: 1.5,
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 2,
          fontWeight: 600,
          fontSize: "1rem",
          textTransform: "none",
          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
          "&:hover": {
            background: "linear-gradient(90deg, #5a6fd8 0%, #6a3d8f 100%)",
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
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                animation: "spin 1s linear infinite",
              }}
            />
            Signing In...
          </Box>
        ) : (
          "Sign In"
        )}
      </Button>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}