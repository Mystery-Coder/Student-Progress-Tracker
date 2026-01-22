// App.jsx - Updated for dark theme
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SupabaseClient';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function App() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          navigate('/login');
          return;
        }
        
        if (session) {
          // User is authenticated
          const userRole = localStorage.getItem('userRole');
          
          if (userRole === 'student') {
            navigate('/student-portal');
          } else if (userRole === 'teacher') {
            navigate('/teacher-blank');
          } else {
            // Role not set, go to login
            console.log('No userRole found, redirecting to login');
            navigate('/login');
          }
        } else {
          // No session, go to login
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    // Small delay to ensure supabase is initialized
    setTimeout(() => {
      checkAuth();
    }, 100);
  }, [navigate]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: '#667eea',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 300,
          }}
        >
          Loading...
        </Typography>
      </Box>
    );
  }

  return null;
}