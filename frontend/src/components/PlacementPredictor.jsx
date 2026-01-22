import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  Recommend as RecommendIcon,
  RestartAlt as RestartAltIcon,
} from '@mui/icons-material';

export default function PlacementPredictor({ student }) {
  const [usn, setUsn] = useState(student?.USN || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    if (!usn.trim()) {
      setError('Please enter a USN');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/predict/${usn.trim().toUpperCase()}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Student not found');
        } else if (response.status === 500) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Prediction failed');
        } else {
          throw new Error('Prediction failed');
        }
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 40) return '#FF9800';
    return '#f44336';
  };

  const getScoreStatus = (score) => {
    if (score >= 70) return { text: 'High Probability', icon: <CheckCircleIcon />, color: '#4CAF50' };
    if (score >= 40) return { text: 'Moderate Probability', icon: <WarningIcon />, color: '#FF9800' };
    return { text: 'Needs Improvement', icon: <WarningIcon />, color: '#f44336' };
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ 
          mb: 2, 
          fontWeight: 700, 
          color: 'rgba(255, 255, 255, 0.95)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <TrendingUpIcon sx={{ color: '#667eea' }} />
        Placement Predictor
      </Typography>
      <Typography variant="body2" sx={{ 
        mb: 4, 
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 400,
      }}>
        AI-powered prediction of your placement chances based on academic performance
      </Typography>

      {/* Input Section */}
      <Paper
        elevation={0}
        sx={{ 
          p: 3, 
          bgcolor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 2, 
          mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="body2" sx={{ 
              mb: 1, 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500,
              fontSize: '0.9rem',
            }}>
              Student USN
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter USN (e.g., 1MS21CS001)"
              value={usn}
              onChange={(e) => setUsn(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
              disabled={loading}
              InputProps={{
                startAdornment: <SchoolIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: '2px',
                  },
                  '& input': {
                    color: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 14px',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handlePredict}
              disabled={loading}
              sx={{
                height: 56,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8e 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                <>
                  <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
                  Predict
                </>
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: '#667eea',
              mb: 2,
            }} 
          />
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}>
            <InsightsIcon sx={{ fontSize: 16 }} />
            Analyzing student profile...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            '& .MuiAlert-icon': {
              color: '#f44336',
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Paper
          elevation={0}
          sx={{ 
            p: 4, 
            bgcolor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Student Info */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              mb: 1,
            }}>
              Prediction for
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: 'rgba(255, 255, 255, 0.95)',
              mb: 0.5,
            }}>
              {result.name}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
            }}>
              {result.usn}
            </Typography>
          </Box>

          {/* Score Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                color: getScoreColor(result.placement_score),
                fontSize: { xs: '2.5rem', sm: '3.5rem' }, // Smaller than before,
                mb: 1,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              {result.placement_score.toFixed(1)}%
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1, 
              mb: 2 
            }}>
              {getScoreStatus(result.placement_score).icon}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: getScoreStatus(result.placement_score).color,
                }}
              >
                {result.prediction}
              </Typography>
            </Box>

            {/* Confidence Bar */}
            <Box sx={{ mt: 3, px: 4 }}>
              <Typography variant="body2" sx={{ 
                mb: 1.5, 
                display: 'block',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
              }}>
                Model Confidence: {(result.confidence * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={result.confidence * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getScoreColor(result.placement_score),
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Features Grid */}
          <Typography variant="h6" sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <AnalyticsIcon sx={{ color: '#667eea' }} />
            Performance Metrics
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Object.entries(result.features).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ 
                      display: 'block', 
                      mb: 1.5, 
                      textTransform: 'capitalize',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                    }}
                  >
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: 'rgba(255, 255, 255, 0.95)' 
                  }}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Recommendation */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: result.placement_score >= 70 
                ? 'rgba(76, 175, 80, 0.1)' 
                : result.placement_score >= 40
                ? 'rgba(255, 152, 0, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
              borderRadius: 2,
              borderLeft: '4px solid',
              borderLeftColor: getScoreColor(result.placement_score),
              border: '1px solid',
              borderColor: result.placement_score >= 70 
                ? 'rgba(76, 175, 80, 0.2)' 
                : result.placement_score >= 40
                ? 'rgba(255, 152, 0, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <RecommendIcon sx={{ 
                color: getScoreColor(result.placement_score), 
                fontSize: 28,
                mt: 0.5,
              }} />
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  mb: 1.5,
                  color: 'rgba(255, 255, 255, 0.95)',
                }}>
                  Personalized Recommendation
                </Typography>
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'pre-line', 
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.8)',
                }}>
                  {result.recommendation}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setUsn(student?.USN || '');
              }}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: '#667eea',
                  color: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <RestartAltIcon sx={{ mr: 1, fontSize: 20 }} />
              Clear Results
            </Button>
            <Button
              variant="contained"
              onClick={handlePredict}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8e 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <AutoAwesomeIcon sx={{ mr: 1, fontSize: 20 }} />
              Predict Again
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}