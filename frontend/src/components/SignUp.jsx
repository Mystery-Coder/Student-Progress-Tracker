import { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  MenuItem,
  Typography,
  Box,
  FormControl,
  Select,
} from "@mui/material";
import { supabase } from "../SupabaseClient";

export default function SignUp({ toggleView }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
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

    if (!formData.email || !formData.password || !formData.name || !formData.role) {
      setMessage({ type: "error", text: "Fill all fields" });
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Failed to create user account");

      // Split name
      const nameArr = formData.name.trim().split(" ");
      const firstName = nameArr[0];
      const lastName = nameArr.slice(1).join(" ") || "";

      // 2️⃣ Create role-specific record using RPC
      if (formData.role === "teacher") {
        const { data: created, error: rpcError } = await supabase.rpc(
          "create_teacher_account",
          {
            p_user_id: user.id,
            p_admin_name: formData.name,
          }
        );

        if (rpcError) {
          throw new Error(`Failed to create teacher account: ${rpcError.message}`);
        }

        if (!created) {
          throw new Error("Failed to create teacher account");
        }
      } else {
        const { data: created, error: rpcError } = await supabase.rpc(
          "create_student_account",
          {
            p_user_id: user.id,
            p_first_name: firstName,
            p_last_name: lastName,
          }
        );

        if (rpcError) {
          throw new Error(`Failed to create student account: ${rpcError.message}`);
        }

        if (!created) {
          throw new Error("Failed to create student account");
        }
      }

      // 3️⃣ Success message
      setMessage({
        type: "success",
        text: data.session
          ? "Signed Up! Login with Email"
          : "Signed Up! Please check your email to confirm your account, then login.",
      });

      setTimeout(() => toggleView(), 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSignUp} sx={{ width: "100%" }}>
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

      {/* Name Field */}
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
          Name
        </Typography>
        <TextField
          fullWidth
          required
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter your full name"
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
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
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
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="Create a password"
          helperText="Minimum 6 characters required"
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
            "& .MuiFormHelperText-root": {
              color: "rgba(255, 255, 255, 0.5)",
              marginLeft: 0,
              mt: 1,
              fontSize: "0.8rem",
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
          Sign up as
        </Typography>
        <FormControl fullWidth>
          <Select
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
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

      {/* Sign Up Button */}
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
            Creating Account...
          </Box>
        ) : (
          "Sign Up"
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