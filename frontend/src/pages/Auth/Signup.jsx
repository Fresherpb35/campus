import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Fade,
  useTheme,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  School,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import signupAnimation from "../../assets/signup.json";
import apiClient from "../../api/api.client.js";

// Floating Tab Component
const FloatingTab = ({ label, position, delay, color }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={1000}>
      <Chip
        label={label}
        sx={{
          position: "absolute",
          ...position,
          fontWeight: 600,
          fontSize: "0.85rem",
          px: 1.5,
          py: 2,
          backgroundColor: color,
          color: "white",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.3)",
          animation: "float 4s ease-in-out infinite",
          animationDelay: `${delay}ms`,
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-15px)" },
          },
          zIndex: 10,
          cursor: "default",
          display: { xs: "none", md: "inline-flex" }, // Hide on mobile
          "&:hover": {
            transform: "scale(1.05)",
            transition: "transform 0.3s ease",
          },
        }}
      />
    </Fade>
  );
};

const Signup = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    college: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingColleges, setFetchingColleges] = useState(false);

  // Fetch colleges on component mount
  useEffect(() => {
    fetchColleges();
  }, []);
  const fetchColleges = async () => {
    setFetchingColleges(true);
    try {
      const response = await apiClient.get("/college/get-colleges");
      // Support APIs that return either `{ data: [...] }` or `[...]`
      const payload = response.data?.data ?? response.data;
      // Defensive: ensure we always have an array
      if (Array.isArray(payload)) {
        setColleges(payload);
      } else {
        console.warn("Unexpected colleges payload:", payload);
        setColleges([]);
      }
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
    } finally {
      setFetchingColleges(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.userName || !formData.email || !formData.password || !formData.college) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/auth/signup", formData);
      if (response.data) {
        toast.success("Account created successfully!");
        navigate("/signin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Floating tabs - repositioned to left above Lottie
  const floatingTabs = [
    { label: "Campus", position: { top: "12%", left: "12%" }, delay: 200, color: theme.palette.primary.main },
    { label: "Market", position: { top: "32%", left: "6%" }, delay: 400, color: theme.palette.secondary.main },
    { label: "Place", position: { bottom: "28%", left: "14%" }, delay: 600, color: theme.palette.info.main },
  ];

  return (
    <Box
      sx={{
        height: { md: "calc(100vh - 64px)", xs: "auto" }, // Subtracting common header height
        minHeight: { xs: "calc(100vh - 64px)" },
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden", // Fix scroll
        p: { xs: 2, md: 4 },
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 20 }}>
        <Grid container spacing={{ xs: 2, md: 8 }} alignItems="center" justifyContent="center">
          {/* Left Side - Lottie Animation + Floating Tabs */}
          <Grid 
            size={{ xs: 12, md: 6 }} 
            sx={{ 
              display: { xs: "none", md: "flex" }, 
              justifyContent: "center", 
              order: { xs: 1, md: 1 },
              position: "relative"
            }}
          >
            {floatingTabs.map((tab, index) => (
              <FloatingTab key={index} {...tab} />
            ))}
            <Box
              sx={{
                width: "100%",
                maxWidth: { md: 400, lg: 450 },
                filter: theme.palette.mode === "dark" 
                  ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4)) brightness(0.9)" 
                  : "drop-shadow(0 20px 40px rgba(0,0,0,0.1))",
              }}
            >
              <Lottie animationData={signupAnimation} loop={true} />
            </Box>
          </Grid>

          {/* Right Side - Signup Form */}
          <Grid 
            size={{ xs: 12, md: 5 }} 
            sx={{ order: { xs: 1, md: 2 } }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 4,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: theme.palette.mode === "dark" 
                  ? "0 25px 50px -12px rgba(0,0,0,0.5)" 
                  : "0 25px 50px -12px rgba(0,0,0,0.08)",
                maxWidth: { xs: "100%", sm: 480 },
                mx: "auto",
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                align="center"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: "1.75rem", sm: "2.25rem" },
                  color: "text.primary",
                }}
              >
                Create Account
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Join Campus Market Place today
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Username Field */}
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="userName"
                  label="Username"
                  name="userName"
                  autoComplete="username"
                  autoFocus
                  value={formData.userName}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Email Field */}
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* College Select Field */}
                <FormControl fullWidth margin="dense" required>
                  <InputLabel id="college-label">College</InputLabel>
                  <Select
                    labelId="college-label"
                    id="college"
                    name="college"
                    value={formData.college}
                    label="College"
                    onChange={handleChange}
                    disabled={loading || fetchingColleges}
                    startAdornment={
                      <InputAdornment position="start">
                        <School color="primary" sx={{ ml: 1 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {fetchingColleges ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading colleges...
                      </MenuItem>
                    ) : colleges.length === 0 ? (
                      <MenuItem disabled>No colleges available</MenuItem>
                    ) : (
                      colleges.map((college) => {
                        const id = college._id ?? college.id ?? college;
                        const name = college.collegeName ?? college.name ?? String(college);
                        return (
                          <MenuItem key={id} value={id}>
                            {name}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                {/* Sign In Link */}
                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link
                      to="/signin"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Signup;