import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function COMarksUploadBot({ teacherData, onClose, open }) {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('main_menu');
  const [mode, setMode] = useState(null);
  const [sessionData, setSessionData] = useState({
    groupId: null,
    groupName: null,
    currentYear: null,
    studentUSN: null,
    studentName: null,
    courseCode: null,
    courseName: null,
    examType: null,
    coData: {},
    currentCO: 1,
    analyticsType: null,
    selectedStudent1: null,
    selectedStudent2: null,
    analyticsView: null,
  });
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState({ maxMarks: '', obtainedMarks: '' });
  const [analyticsData, setAnalyticsData] = useState(null);
  const messagesEndRef = useRef(null);

  // Utility function to add messages
  const addMessage = (type, text, options = {}) => {
    setMessages((prev) => [
      ...prev,
      { type, text, timestamp: new Date(), ...options },
    ]);
  };

  // Initialize bot
  const initializeBot = () => {
    setMessages([
      {
        type: 'bot',
        text: "👋 Hi! I'm your CO Marks Assistant. How can I help you today?",
        timestamp: new Date(),
        options: [
          { label: '📤 Upload Marks', value: 'upload' },
          { label: '📊 Analytics', value: 'analytics' },
        ],
      },
    ]);
    setCurrentStep('main_menu');
    setMode(null);
    setSessionData({
      groupId: null,
      groupName: null,
      currentYear: null,
      studentUSN: null,
      studentName: null,
      courseCode: null,
      courseName: null,
      examType: null,
      coData: {},
      currentCO: 1,
      analyticsType: null,
      selectedStudent1: null,
      selectedStudent2: null,
      analyticsView: null,
    });
  };

  // Fetch functions
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../SupabaseClient');
      const { data, error } = await supabase.rpc('get_groups_by_admin', {
        p_admin_id: teacherData?.Admin_ID,
      });

      if (error) throw error;

      const groupsMap = {};
      (data || []).forEach((row) => {
        if (!groupsMap[row.group_id]) {
          groupsMap[row.group_id] = {
            Group_ID: row.group_id,
            Group_Name: row.group_name,
            Current_Year: row.current_year,
          };
        }
      });

      const groupsList = Object.values(groupsMap);
      setGroups(groupsList);

      if (groupsList.length === 0) {
        addMessage('bot', "You haven't created any groups yet. Please create a group first from the 'Manage Groups' section.");
        setCurrentStep('end');
      } else {
        addMessage('bot', 'Please select a group:', { options: groupsList });
      }
    } catch (err) {
      addMessage('bot', `Error fetching groups: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (groupId) => {
    try {
      setLoading(true);
      const { supabase } = await import('../SupabaseClient');
      const { data, error } = await supabase.rpc('get_students_by_group', {
        p_group_id: groupId,
      });

      if (error) throw error;

      setStudents(data || []);

      if (!data || data.length === 0) {
        addMessage('bot', `No students found in this group. Please add students first.`);
        setCurrentStep('end');
      } else {
        return data;
      }
    } catch (err) {
      addMessage('bot', `Error fetching students: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (year) => {
    try {
      setLoading(true);
      const { supabase } = await import('../SupabaseClient');
      const { data, error } = await supabase.rpc('get_courses_by_year', {
        p_year: year,
      });

      if (error) throw error;

      setCourses(data || []);

      if (!data || data.length === 0) {
        addMessage('bot', `No courses found for Year ${year}. Please add courses for this year first.`);
        setCurrentStep('end');
      } else {
        addMessage('bot', `Great! Now select the subject/course:`, { options: data });
      }
    } catch (err) {
      addMessage('bot', `Error fetching courses: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAnalytics = async (usn, groupId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/co-marks/${usn}/${groupId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No marks data found for this student');
        }
        throw new Error('Failed to fetch analytics data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error('No data found');
    } catch (err) {
      addMessage('bot', `❌ Error: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save to MongoDB
  const handleSaveToMongoDB = async () => {
    try {
      setLoading(true);
      addMessage('bot', '💾 Saving data to MongoDB...');

      const payload = {
        group_id: sessionData.groupId,
        group_name: sessionData.groupName,
        year: sessionData.currentYear,
        student_usn: sessionData.studentUSN,
        student_name: sessionData.studentName,
        course_code: sessionData.courseCode,
        course_name: sessionData.courseName,
        exam_type: sessionData.examType,
        co_data: sessionData.coData,
        uploaded_by: teacherData?.Admin_ID,
      };

      const response = await fetch('http://localhost:5000/api/co-marks/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save data to MongoDB');
      }

      addMessage('bot', `✅ Success! ${result.message}`);
      
      setTimeout(() => {
        initializeBot();
      }, 1500);

    } catch (err) {
      addMessage('bot', `❌ Error saving data: ${err.message}\n\nPlease check your backend connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Render functions
  const renderChart = (chartData) => {
    if (chartData.type === 'line') {
      return (
        <div style={{ width: '100%', height: 300, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="co" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.lines.map((line, i) => (
                <Line 
                  key={line} 
                  type="monotone" 
                  dataKey={line} 
                  stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'][i % 4]} 
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartData.type === 'trend') {
      return (
        <div style={{ width: '100%', height: 250, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartData.type === 'bar') {
      return (
        <div style={{ width: '100%', height: 300, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exam" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartData.students[0]} fill="#8884d8" />
              <Bar dataKey={chartData.students[1]} fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  const renderTable = (data) => {
    return (
      <div style={{ marginTop: 8, marginBottom: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
              <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Subject</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Marks</th>
              <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>%</th>
              <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row.subject}</td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{row.obtained}/{row.max}</td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{row.percentage}%</td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: row.grade.startsWith('A') ? '#4caf50' : row.grade.includes('B') ? '#2196f3' : '#ff9800',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {row.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMastery = (data) => {
    return (
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>{item.co}</span>
              <span style={{ color: item.status === 'Strong' ? '#4caf50' : item.status === 'Average' ? '#ff9800' : '#f44336' }}>
                {item.percentage}% - {item.status}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: 8, 
              backgroundColor: '#e0e0e0', 
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${item.percentage}%`,
                height: '100%',
                backgroundColor: item.status === 'Strong' ? '#4caf50' : item.status === 'Average' ? '#ff9800' : '#f44336',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Analytics rendering functions
  const renderCOPerformance = (studentData) => {
    const courses = studentData.courses || {};
    const coursesList = Object.keys(courses);
    
    if (coursesList.length === 0) {
      return addMessage('bot', '❌ No course data available for this analysis.');
    }

    const courseOptions = coursesList.map(code => ({
      Course_Code: code,
      Course_Name: courses[code].course_name,
    }));

    addMessage('bot', 'Select a subject to see CO performance:', { options: courseOptions });
    setCurrentStep('analytics_select_co_subject');
  };

  const renderCOChart = (course) => {
    const exams = course.exams || {};
    const examList = Object.keys(exams);
    
    if (examList.length === 0) {
      return addMessage('bot', '❌ No exam data available for CO performance analysis.');
    }

    const coNumbers = new Set();
    Object.values(exams).forEach(exam => {
      Object.keys(exam.co_data || {}).forEach(co => coNumbers.add(co));
    });

    if (coNumbers.size === 0) {
      return addMessage('bot', '❌ No CO data available for this course.');
    }

    const chartData = Array.from(coNumbers).sort().map(co => {
      const dataPoint = { co };
      Object.entries(exams).forEach(([examType, examData]) => {
        const coMark = examData.co_data[co];
        if (coMark) {
          dataPoint[examType] = ((coMark.obtained / coMark.max) * 100).toFixed(1);
        }
      });
      return dataPoint;
    });

    // Dynamic message based on number of exams
    let performanceMsg = '';
    if (examList.length === 1) {
      performanceMsg = `📈 CO Performance for ${course.course_name}\n(Based on ${examList[0]} only)`;
    } else {
      performanceMsg = `📈 CO Performance Comparison for ${course.course_name}\n(Across ${examList.length} exams: ${examList.join(', ')})`;
    }

    addMessage('bot', performanceMsg, {
      chart: {
        type: 'line',
        data: chartData,
        lines: examList,
      },
    });

    // Calculate insights
    const coAverages = chartData.map(d => {
      const scores = Object.keys(d).filter(k => k !== 'co').map(k => parseFloat(d[k])).filter(v => !isNaN(v));
      return {
        co: d.co,
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      };
    });

    if (coAverages.length > 0) {
      const bestCO = coAverages.reduce((max, co) => co.avg > max.avg ? co : max);
      const worstCO = coAverages.reduce((min, co) => co.avg < min.avg ? co : min);

      let insightMsg = `💡 Insights:\n✅ Strongest: ${bestCO.co} (${bestCO.avg.toFixed(1)}%)\n⚠️ Needs attention: ${worstCO.co} (${worstCO.avg.toFixed(1)}%)`;
      
      // If multiple exams, show trend analysis
      if (examList.length > 1) {
        const improvingCOs = [];
        const decliningCOs = [];
        
        chartData.forEach(coData => {
          const values = examList.map(exam => parseFloat(coData[exam])).filter(v => !isNaN(v));
          if (values.length >= 2) {
            const trend = values[values.length - 1] - values[0];
            if (trend > 5) improvingCOs.push(coData.co);
            if (trend < -5) decliningCOs.push(coData.co);
          }
        });

        if (improvingCOs.length > 0) {
          insightMsg += `\n📈 Improving: ${improvingCOs.join(', ')}`;
        }
        if (decliningCOs.length > 0) {
          insightMsg += `\n📉 Declining: ${decliningCOs.join(', ')}`;
        }
      }

      addMessage('bot', insightMsg);
    }
  };

  const renderSubjectPerformance = (studentData) => {
    const courses = studentData.courses || {};
    
    if (Object.keys(courses).length === 0) {
      return addMessage('bot', '❌ No subject data available.');
    }

    const performanceData = Object.entries(courses).map(([code, course]) => {
      let totalObtained = 0;
      let totalMax = 0;

      Object.values(course.exams || {}).forEach(exam => {
        Object.values(exam.co_data || {}).forEach(mark => {
          totalObtained += mark.obtained;
          totalMax += mark.max;
        });
      });

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      const grade = percentage >= 90 ? 'A+' : 
                   percentage >= 80 ? 'A' : 
                   percentage >= 70 ? 'B+' : 
                   percentage >= 60 ? 'B' : 
                   percentage >= 50 ? 'C' : 'F';

      return {
        subject: course.course_name,
        percentage: percentage.toFixed(1),
        obtained: totalObtained,
        max: totalMax,
        grade,
      };
    });

    addMessage('bot', `📚 Subject-wise Performance`, {
      table: performanceData,
    });

    const best = performanceData.reduce((max, s) => parseFloat(s.percentage) > parseFloat(max.percentage) ? s : max);
    const needsAttention = performanceData.reduce((min, s) => parseFloat(s.percentage) < parseFloat(min.percentage) ? s : min);

    addMessage('bot', `💡 Insights:\n🏆 Best subject: ${best.subject} (${best.percentage}%)\n📖 Needs attention: ${needsAttention.subject} (${needsAttention.percentage}%)`);
  };

  const renderInternalTrends = (studentData) => {
    const courses = studentData.courses || {};
    
    if (Object.keys(courses).length === 0) {
      return addMessage('bot', '❌ No data available for trend analysis.');
    }

    const courseOptions = Object.entries(courses).map(([code, course]) => ({
      Course_Code: code,
      Course_Name: course.course_name,
    }));

    addMessage('bot', 'Select a subject to see internal assessment trends:', { options: courseOptions });
    setCurrentStep('analytics_select_trend_subject');
  };

  const renderTrendChart = (course) => {
    const exams = course.exams || {};
    const internals = ['Internal 1', 'Internal 2', 'Internal 3'].filter(exam => exams[exam]);

    if (internals.length === 0) {
      return addMessage('bot', '❌ No internal assessment data available.');
    }

    const trendData = internals.map(examType => {
      const exam = exams[examType];
      let totalObtained = 0;
      let totalMax = 0;

      Object.values(exam.co_data || {}).forEach(mark => {
        totalObtained += mark.obtained;
        totalMax += mark.max;
      });

      return {
        exam: examType,
        percentage: totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0,
        obtained: totalObtained,
        max: totalMax,
      };
    });

    // Dynamic message based on number of internals
    let trendMsg = '';
    if (internals.length === 1) {
      trendMsg = `📊 Internal Assessment for ${course.course_name}\n(Only ${internals[0]} data available)`;
    } else {
      trendMsg = `📊 Internal Assessment Trends for ${course.course_name}\n(${internals.length} assessments: ${internals.join(', ')})`;
    }

    addMessage('bot', trendMsg, {
      chart: {
        type: 'trend',
        data: trendData,
      },
    });

    // Show detailed breakdown
    let breakdownMsg = '📝 Score Breakdown:\n';
    trendData.forEach(data => {
      breakdownMsg += `• ${data.exam}: ${data.obtained}/${data.max} (${data.percentage}%)\n`;
    });
    addMessage('bot', breakdownMsg.trim());

    // Trend analysis - only if multiple assessments
    if (internals.length >= 2) {
      const first = parseFloat(trendData[0].percentage);
      const last = parseFloat(trendData[trendData.length - 1].percentage);
      const change = last - first;

      let trendAnalysis = '\n📈 Trend Analysis:\n';
      
      if (change > 5) {
        trendAnalysis += `✅ Excellent improvement! Score increased by ${change.toFixed(1)}% from ${trendData[0].exam} to ${trendData[trendData.length - 1].exam}`;
      } else if (change > 0) {
        trendAnalysis += `📈 Slight improvement of ${change.toFixed(1)}%. Keep up the good work!`;
      } else if (change < -5) {
        trendAnalysis += `⚠️ Significant decline of ${Math.abs(change).toFixed(1)}%. Consider additional support and review.`;
      } else if (change < 0) {
        trendAnalysis += `📉 Minor decline of ${Math.abs(change).toFixed(1)}%. May need attention.`;
      } else {
        trendAnalysis += `➡️ Consistent performance maintained across assessments.`;
      }

      // Check for consistency across all assessments
      if (internals.length >= 3) {
        const percentages = trendData.map(d => parseFloat(d.percentage));
        const maxDiff = Math.max(...percentages) - Math.min(...percentages);
        
        if (maxDiff < 5) {
          trendAnalysis += `\n🎯 Very consistent performance (variation: ${maxDiff.toFixed(1)}%)`;
        } else if (maxDiff > 15) {
          trendAnalysis += `\n⚡ High variation in performance (${maxDiff.toFixed(1)}%). Focus on consistency.`;
        }
      }

      addMessage('bot', trendAnalysis);
    } else {
      // Single assessment - provide context
      const score = parseFloat(trendData[0].percentage);
      let performanceMsg = '\n💡 Performance Status:\n';
      
      if (score >= 80) {
        performanceMsg += '🌟 Excellent start! Keep this momentum going.';
      } else if (score >= 60) {
        performanceMsg += '👍 Good performance. There\'s room for improvement in upcoming assessments.';
      } else if (score >= 40) {
        performanceMsg += '📚 Average performance. Focus on weak areas before the next assessment.';
      } else {
        performanceMsg += '⚠️ Needs attention. Consider extra study sessions and clarifying doubts.';
      }
      
      performanceMsg += '\n\n📅 More trend data will be available after subsequent assessments.';
      
      addMessage('bot', performanceMsg);
    }
  };

  const renderCOMastery = (studentData) => {
    const courses = studentData.courses || {};
    const coAggregates = {};

    Object.values(courses).forEach(course => {
      Object.values(course.exams || {}).forEach(exam => {
        Object.entries(exam.co_data || {}).forEach(([co, mark]) => {
          if (!coAggregates[co]) {
            coAggregates[co] = { obtained: 0, max: 0 };
          }
          coAggregates[co].obtained += mark.obtained;
          coAggregates[co].max += mark.max;
        });
      });
    });

    const masteryData = Object.entries(coAggregates).map(([co, data]) => ({
      co,
      percentage: data.max > 0 ? ((data.obtained / data.max) * 100).toFixed(1) : 0,
      status: data.max > 0 ? 
        (data.obtained / data.max) * 100 >= 70 ? 'Strong' : 
        (data.obtained / data.max) * 100 >= 50 ? 'Average' : 'Weak' : 'No data',
    })).sort((a, b) => b.percentage - a.percentage);

    addMessage('bot', `🎯 CO Mastery Level`, {
      mastery: masteryData,
    });

    const strong = masteryData.filter(d => parseFloat(d.percentage) >= 70);
    const weak = masteryData.filter(d => parseFloat(d.percentage) < 50);

    addMessage('bot', `💡 Insights:\n✅ Strong in: ${strong.map(d => d.co).join(', ') || 'None'}\n⚠️ Weak in: ${weak.map(d => d.co).join(', ') || 'None'}`);
  };

  const renderComparison = (course1, course2, courseName) => {
    const exams1 = course1.exams || {};
    const exams2 = course2.exams || {};

    const commonExams = Object.keys(exams1).filter(exam => exams2[exam]);

    if (commonExams.length === 0) {
      return addMessage('bot', '❌ No common exams found for comparison.');
    }

    const comparisonData = commonExams.map(examType => {
      const exam1 = exams1[examType];
      const exam2 = exams2[examType];

      let total1 = 0, max1 = 0, total2 = 0, max2 = 0;

      Object.values(exam1.co_data || {}).forEach(mark => {
        total1 += mark.obtained;
        max1 += mark.max;
      });

      Object.values(exam2.co_data || {}).forEach(mark => {
        total2 += mark.obtained;
        max2 += mark.max;
      });

      return {
        exam: examType,
        [sessionData.selectedStudent1.name]: max1 > 0 ? ((total1 / max1) * 100).toFixed(1) : 0,
        [sessionData.selectedStudent2.name]: max2 > 0 ? ((total2 / max2) * 100).toFixed(1) : 0,
      };
    });

    addMessage('bot', `👥 Comparison for ${courseName}`, {
      chart: {
        type: 'bar',
        data: comparisonData,
        students: [sessionData.selectedStudent1.name, sessionData.selectedStudent2.name],
      },
    });
  };

  // Handler functions
  const handleMainMenu = async (option) => {
    addMessage('user', option.label);
    setMode(option.value);

    if (option.value === 'upload') {
      setCurrentStep('upload_select_group');
      addMessage('bot', "Let's start by selecting a group for marks upload.");
      await fetchGroups();
    } else if (option.value === 'analytics') {
      addMessage('bot', 'What type of analysis would you like to see?', {
        options: [
          { label: '📊 Individual Student Analysis', value: 'individual' },
          { label: '👥 Compare Students', value: 'compare' },
          { label: '⬅️ Back to Main Menu', value: 'back' },
        ],
      });
      setCurrentStep('analytics_type');
    }
  };

  const handleAnalyticsType = async (option) => {
    if (option.value === 'back') {
      initializeBot();
      return;
    }

    addMessage('user', option.label);
    setSessionData(prev => ({ ...prev, analyticsType: option.value }));

    if (option.value === 'individual') {
      setCurrentStep('analytics_select_group');
      addMessage('bot', 'Please select a group:');
      await fetchGroups();
    } else if (option.value === 'compare') {
      setCurrentStep('compare_select_group');
      addMessage('bot', 'Please select a group to compare students from:');
      await fetchGroups();
    }
  };

  const handleGroupSelect = async (group, context) => {
    setSessionData((prev) => ({
      ...prev,
      groupId: group.Group_ID,
      groupName: group.Group_Name,
      currentYear: group.Current_Year,
    }));

    addMessage('user', `Selected: ${group.Group_Name} (Year ${group.Current_Year})`);

    if (context === 'upload') {
      addMessage('bot', `Perfect! Fetching students from this group...`);
      setCurrentStep('upload_select_student');
      const studentData = await fetchStudents(group.Group_ID);
      if (studentData && studentData.length > 0) {
        addMessage('bot', `Great! Now select the student:`, { options: studentData });
      }
    } else if (context === 'analytics_individual') {
      addMessage('bot', `Fetching students...`);
      setCurrentStep('analytics_select_student');
      const studentData = await fetchStudents(group.Group_ID);
      if (studentData && studentData.length > 0) {
        addMessage('bot', `Select a student to analyze:`, { options: studentData });
      }
    } else if (context === 'compare') {
      addMessage('bot', `Fetching students...`);
      setCurrentStep('compare_select_student1');
      const studentData = await fetchStudents(group.Group_ID);
      if (studentData && studentData.length > 0) {
        addMessage('bot', `Select the first student:`, { options: studentData });
      }
    }
  };

  const handleStudentSelect = async (student, context) => {
    if (context === 'upload') {
      setSessionData((prev) => ({
        ...prev,
        studentUSN: student.usn,
        studentName: `${student.first_name} ${student.last_name}`,
      }));

      addMessage('user', `Selected: ${student.first_name} ${student.last_name} (${student.usn})`);
      addMessage('bot', `Great! Now fetching courses for Year ${sessionData.currentYear}...`);

      setCurrentStep('upload_select_course');
      await fetchCourses(sessionData.currentYear);
    } else if (context === 'analytics') {
      setSessionData((prev) => ({
        ...prev,
        studentUSN: student.usn,
        studentName: `${student.first_name} ${student.last_name}`,
      }));

      addMessage('user', `Selected: ${student.first_name} ${student.last_name}`);
      
      const data = await fetchStudentAnalytics(student.usn, sessionData.groupId);
      if (data && data.courses) {
        setAnalyticsData(data);
        addMessage('bot', `What would you like to see for ${student.first_name} ${student.last_name}?`, {
          options: [
            { label: '📈 CO Performance Across Exams', value: 'co_performance' },
            { label: '📚 Subject-wise Performance', value: 'subject_performance' },
            { label: '📊 Internal Assessment Trends', value: 'internal_trends' },
            { label: '🎯 CO Mastery Level', value: 'co_mastery' },
            { label: '⬅️ Back to Main Menu', value: 'back' },
          ],
        });
        setCurrentStep('analytics_view_menu');
      }
    } else if (context === 'compare1') {
      setSessionData((prev) => ({
        ...prev,
        selectedStudent1: {
          usn: student.usn,
          name: `${student.first_name} ${student.last_name}`,
        },
      }));

      addMessage('user', `First student: ${student.first_name} ${student.last_name}`);
      addMessage('bot', `Now select the second student to compare:`, { 
        options: students.filter(s => s.usn !== student.usn) 
      });
      setCurrentStep('compare_select_student2');
    } else if (context === 'compare2') {
      setSessionData((prev) => ({
        ...prev,
        selectedStudent2: {
          usn: student.usn,
          name: `${student.first_name} ${student.last_name}`,
        },
      }));

      addMessage('user', `Second student: ${student.first_name} ${student.last_name}`);
      
      const data1 = await fetchStudentAnalytics(sessionData.selectedStudent1.usn, sessionData.groupId);
      const data2 = await fetchStudentAnalytics(student.usn, sessionData.groupId);
      
      if (data1 && data2 && data1.courses && data2.courses) {
        const commonCourses = Object.keys(data1.courses).filter(code => 
          data2.courses[code]
        );
        
        if (commonCourses.length > 0) {
          const courseOptions = commonCourses.map(code => ({
            Course_Code: code,
            Course_Name: data1.courses[code].course_name,
          }));
          
          addMessage('bot', `Select a subject to compare:`, { options: courseOptions });
          setAnalyticsData({ student1: data1, student2: data2 });
          setCurrentStep('compare_select_subject');
        } else {
          addMessage('bot', '❌ No common subjects found between these students.');
        }
      }
    }
  };

  const handleCourseSelect = async (course) => {
    setSessionData((prev) => ({
      ...prev,
      courseCode: course.Course_Code,
      courseName: course.Course_Name,
    }));

    addMessage('user', `Selected: ${course.Course_Name}`);

    addMessage('bot', 'Now, select the exam type:', {
      options: [
        { label: 'Internal 1', value: 'Internal 1' },
        { label: 'Internal 2', value: 'Internal 2' },
        { label: 'Internal 3', value: 'Internal 3' },
        { label: 'External', value: 'External' },
      ],
    });

    setCurrentStep('upload_select_exam');
  };

  const handleExamSelect = (examType) => {
    setSessionData((prev) => ({
      ...prev,
      examType: examType.value,
      coData: {},
      currentCO: 1,
    }));

    addMessage('user', `Selected: ${examType.label}`);
    addMessage('bot', `Perfect! Now let's enter the CO-wise marks for ${sessionData.studentName}.\n\nI'll ask for each CO one by one. You can stop anytime by clicking "Done with COs".`);
    addMessage('bot', `Please enter marks for CO1:`);

    setCurrentStep('upload_enter_co_marks');
  };

  const handleCOSubmit = () => {
    const { maxMarks, obtainedMarks } = inputValues;

    if (!maxMarks || !obtainedMarks) {
      addMessage('bot', '⚠️ Please enter both maximum and obtained marks.');
      return;
    }

    const max = parseFloat(maxMarks);
    const obtained = parseFloat(obtainedMarks);

    if (isNaN(max) || isNaN(obtained)) {
      addMessage('bot', '⚠️ Please enter valid numbers.');
      return;
    }

    if (obtained > max) {
      addMessage('bot', '⚠️ Obtained marks cannot be greater than maximum marks.');
      return;
    }

    if (max < 0 || obtained < 0) {
      addMessage('bot', '⚠️ Marks cannot be negative.');
      return;
    }

    const currentCO = sessionData.currentCO;
    setSessionData((prev) => ({
      ...prev,
      coData: {
        ...prev.coData,
        [`CO${currentCO}`]: { max, obtained },
      },
      currentCO: currentCO + 1,
    }));

    addMessage('user', `CO${currentCO}: ${obtained}/${max} marks`);
    addMessage('bot', `✓ CO${currentCO} marks recorded.`);

    addMessage('bot', `Would you like to enter CO${currentCO + 1}?`, {
      options: [
        { label: `✓ Yes, Enter CO${currentCO + 1}`, value: 'continue' },
        { label: '✓ Done with COs', value: 'done' },
      ],
    });

    setInputValues({ maxMarks: '', obtainedMarks: '' });
    setCurrentStep('upload_ask_next_co');
  };

  const handleNextCODecision = (option) => {
    if (option.value === 'continue') {
      addMessage('user', `Yes, continue to CO${sessionData.currentCO}`);
      addMessage('bot', `Please enter marks for CO${sessionData.currentCO}:`);
      setCurrentStep('upload_enter_co_marks');
    } else {
      const coEntries = Object.entries(sessionData.coData);
      const summary = coEntries.map(([co, marks]) => 
        `• ${co}: ${marks.obtained}/${marks.max}`
      ).join('\n');

      const totalObtained = coEntries.reduce((sum, [, marks]) => sum + marks.obtained, 0);
      const totalMax = coEntries.reduce((sum, [, marks]) => sum + marks.max, 0);
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

      addMessage('user', 'Done with COs');
      addMessage('bot', `📊 Summary for ${sessionData.studentName} - ${sessionData.examType}:\n\n${summary}\n\nTotal: ${totalObtained}/${totalMax} (${percentage}%)\nCOs Entered: ${coEntries.length}`);
      addMessage('bot', 'Would you like to save this data?', {
        options: [
          { label: '✓ Yes, Save to MongoDB', value: 'save' },
          { label: '✗ Cancel', value: 'cancel' },
        ],
      });

      setCurrentStep('upload_confirm_save');
    }
  };

  const handleAnalyticsView = async (option) => {
    if (option.value === 'back') {
      initializeBot();
      return;
    }

    addMessage('user', option.label);

    switch (option.value) {
      case 'co_performance':
        renderCOPerformance(analyticsData);
        break;
      case 'subject_performance':
        renderSubjectPerformance(analyticsData);
        setTimeout(() => {
          addMessage('bot', 'What else would you like to see?', {
            options: [
              { label: '⬅️ Back to Analysis Menu', value: 'back_analysis' },
              { label: '🏠 Main Menu', value: 'main' },
            ],
          });
          setCurrentStep('analytics_navigation');
        }, 500);
        break;
      case 'internal_trends':
        renderInternalTrends(analyticsData);
        break;
      case 'co_mastery':
        renderCOMastery(analyticsData);
        setTimeout(() => {
          addMessage('bot', 'What else would you like to see?', {
            options: [
              { label: '⬅️ Back to Analysis Menu', value: 'back_analysis' },
              { label: '🏠 Main Menu', value: 'main' },
            ],
          });
          setCurrentStep('analytics_navigation');
        }, 500);
        break;
    }
  };

  const handleOptionClick = async (option) => {
    if (currentStep === 'main_menu') {
      handleMainMenu(option);
    } else if (currentStep === 'analytics_type') {
      handleAnalyticsType(option);
    } else if (currentStep === 'upload_select_group') {
      handleGroupSelect(option, 'upload');
    } else if (currentStep === 'analytics_select_group') {
      handleGroupSelect(option, 'analytics_individual');
    } else if (currentStep === 'compare_select_group') {
      handleGroupSelect(option, 'compare');
    } else if (currentStep === 'upload_select_student') {
      handleStudentSelect(option, 'upload');
    } else if (currentStep === 'analytics_select_student') {
      handleStudentSelect(option, 'analytics');
    } else if (currentStep === 'compare_select_student1') {
      handleStudentSelect(option, 'compare1');
    } else if (currentStep === 'compare_select_student2') {
      handleStudentSelect(option, 'compare2');
    } else if (currentStep === 'upload_select_course') {
      handleCourseSelect(option);
    } else if (currentStep === 'upload_select_exam') {
      handleExamSelect(option);
    } else if (currentStep === 'upload_ask_next_co') {
      handleNextCODecision(option);
    } else if (currentStep === 'upload_confirm_save') {
      if (option.value === 'save') {
        handleSaveToMongoDB();
      } else {
        onClose();
      }
    } else if (currentStep === 'analytics_view_menu') {
      handleAnalyticsView(option);
    } else if (currentStep === 'analytics_select_co_subject') {
      addMessage('user', option.Course_Name);
      const course = analyticsData.courses[option.Course_Code];
      renderCOChart(course);
      setTimeout(() => {
        addMessage('bot', 'What else would you like to see?', {
          options: [
            { label: '⬅️ Back to Analysis Menu', value: 'back_analysis' },
            { label: '🏠 Main Menu', value: 'main' },
          ],
        });
        setCurrentStep('analytics_navigation');
      }, 500);
    } else if (currentStep === 'analytics_select_trend_subject') {
      addMessage('user', option.Course_Name);
      const course = analyticsData.courses[option.Course_Code];
      renderTrendChart(course);
      setTimeout(() => {
        addMessage('bot', 'What else would you like to see?', {
          options: [
            { label: '⬅️ Back to Analysis Menu', value: 'back_analysis' },
            { label: '🏠 Main Menu', value: 'main' },
          ],
        });
        setCurrentStep('analytics_navigation');
      }, 500);
    } else if (currentStep === 'compare_select_subject') {
      addMessage('user', option.Course_Name);
      const course1 = analyticsData.student1.courses[option.Course_Code];
      const course2 = analyticsData.student2.courses[option.Course_Code];
      renderComparison(course1, course2, option.Course_Name);
    } else if (currentStep === 'analytics_navigation') {
      if (option.value === 'back_analysis') {
        addMessage('bot', `What would you like to see for ${sessionData.studentName}?`, {
          options: [
            { label: '📈 CO Performance Across Exams', value: 'co_performance' },
            { label: '📚 Subject-wise Performance', value: 'subject_performance' },
            { label: '📊 Internal Assessment Trends', value: 'internal_trends' },
            { label: '🎯 CO Mastery Level', value: 'co_mastery' },
            { label: '⬅️ Back to Main Menu', value: 'back' },
          ],
        });
        setCurrentStep('analytics_view_menu');
      } else if (option.value === 'main') {
        initializeBot();
      }
    }
  };

  // Effects
  useEffect(() => {
    if (open) {
      initializeBot();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render UI
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 450,
      height: 600,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 12,
      overflow: 'hidden',
      zIndex: 1300,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      backgroundColor: 'white',
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>CO Marks Assistant</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {mode === 'upload' ? 'Upload Mode' : mode === 'analytics' ? 'Analytics Mode' : 'Ready to Help'}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: 4,
        }}>
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: 16,
        overflowY: 'auto',
        backgroundColor: '#f5f7fa',
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: msg.type === 'bot' ? 'flex-start' : 'flex-end',
              animation: 'fadeIn 0.3s ease-in',
            }}
          >
            {msg.type === 'bot' && (
              <div style={{
                width: 32,
                height: 32,
                marginRight: 8,
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                🤖
              </div>
            )}

            <div style={{ maxWidth: '85%' }}>
              <div style={{
                padding: 12,
                backgroundColor: msg.type === 'bot' ? 'white' : '#667eea',
                color: msg.type === 'bot' ? '#333' : 'white',
                borderRadius: 8,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}>
                <div style={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
                  {msg.text}
                </div>

                {msg.chart && renderChart(msg.chart)}
                {msg.table && renderTable(msg.table)}
                {msg.mastery && renderMastery(msg.mastery)}

                {msg.options && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {msg.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(option)}
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          backgroundColor: msg.type === 'bot' ? '#667eea' : 'rgba(255,255,255,0.2)',
                          color: msg.type === 'bot' ? 'white' : 'white',
                          border: msg.type === 'bot' ? 'none' : '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 16,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = msg.type === 'bot' ? '#5568d3' : 'rgba(255,255,255,0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = msg.type === 'bot' ? '#667eea' : 'rgba(255,255,255,0.2)';
                        }}
                      >
                        {option.Group_Name || 
                         option.Course_Name || 
                         (option.first_name ? `${option.first_name} ${option.last_name}` : '') ||
                         option.label || 
                         option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                fontSize: '0.7rem',
                marginTop: 4,
                marginLeft: 8,
                color: '#666',
              }}>
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {msg.type === 'user' && (
              <div style={{
                width: 32,
                height: 32,
                marginLeft: 8,
                borderRadius: '50%',
                backgroundColor: '#764ba2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              🤖
            </div>
            <div style={{
              padding: 12,
              backgroundColor: 'white',
              borderRadius: 8,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1s infinite' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1s infinite 0.2s' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1s infinite 0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area for CO Marks */}
      {currentStep === 'upload_enter_co_marks' && (
        <div style={{
          padding: 16,
          backgroundColor: 'white',
          borderTop: '1px solid #e0e0e0',
        }}>
          <div style={{ fontSize: '0.75rem', marginBottom: 8, fontWeight: 600, color: '#667eea' }}>
            CO{sessionData.currentCO} Marks Entry
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              placeholder="Maximum Marks"
              value={inputValues.maxMarks}
              onChange={(e) => setInputValues(prev => ({ ...prev, maxMarks: e.target.value }))}
              disabled={loading}
              min="0"
              step="0.5"
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '0.875rem',
              }}
            />
            <input
              type="number"
              placeholder="Obtained Marks"
              value={inputValues.obtainedMarks}
              onChange={(e) => setInputValues(prev => ({ ...prev, obtainedMarks: e.target.value }))}
              disabled={loading}
              min="0"
              step="0.5"
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button
            onClick={handleCOSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            ✓ Submit CO{sessionData.currentCO}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}