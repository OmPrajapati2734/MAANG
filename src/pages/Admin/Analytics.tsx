import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, TrendingUp, Award, Calendar, Target } from 'lucide-react';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisWeek: 0
    },
    questionStats: {
      totalQuestions: 0,
      totalAttempts: 0,
      averageScore: 0
    },
    companyProgress: [] as any[],
    difficultyDistribution: [] as any[],
    categoryPerformance: [] as any[],
    weeklyActivity: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch user statistics
      const { data: profiles } = await supabase.from('profiles').select('created_at');
      const { data: quizAttempts } = await supabase.from('quiz_attempts').select('*');
      const { data: questions } = await supabase.from('questions').select('difficulty, category');
      const { data: userProgress } = await supabase.from('user_progress').select('company, completed');

      // Calculate user stats
      const totalUsers = profiles?.length || 0;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const newUsersThisWeek = profiles?.filter(p => new Date(p.created_at) > weekAgo).length || 0;

      // Calculate question stats
      const totalQuestions = questions?.length || 0;
      const totalAttempts = quizAttempts?.length || 0;
      const averageScore = quizAttempts?.length 
        ? Math.round(quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / quizAttempts.length)
        : 0;

      // Company progress distribution
      const companyProgress = ['Meta', 'Amazon', 'Apple', 'Netflix', 'Google'].map(company => {
        const companyData = userProgress?.filter(p => p.company === company) || [];
        const completed = companyData.filter(p => p.completed).length;
        const total = companyData.length;
        return {
          company,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      });

      // Difficulty distribution
      const difficultyDistribution = ['easy', 'medium', 'hard'].map(difficulty => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        count: questions?.filter(q => q.difficulty === difficulty).length || 0
      }));

      // Category performance
      const categoryPerformance = ['dsa', 'system-design', 'behavioral', 'company-specific'].map(category => {
        const categoryAttempts = quizAttempts?.filter(a => a.quiz_id.includes(category)) || [];
        const avgScore = categoryAttempts.length 
          ? Math.round(categoryAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / categoryAttempts.length)
          : 0;
        return {
          category: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          score: avgScore,
          attempts: categoryAttempts.length
        };
      });

      // Weekly activity (mock data for demonstration)
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          users: Math.floor(Math.random() * 50) + 10,
          quizzes: Math.floor(Math.random() * 30) + 5
        };
      });

      setAnalytics({
        userStats: {
          totalUsers,
          activeUsers: Math.floor(totalUsers * 0.7), // Mock active users
          newUsersThisWeek
        },
        questionStats: {
          totalQuestions,
          totalAttempts,
          averageScore
        },
        companyProgress,
        difficultyDistribution,
        categoryPerformance,
        weeklyActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor user engagement and platform performance</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.userStats.totalUsers}</p>
                <p className="text-sm text-green-600">+{analytics.userStats.newUsersThisWeek} this week</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{analytics.userStats.activeUsers}</p>
                <p className="text-sm text-gray-500">
                  {Math.round((analytics.userStats.activeUsers / analytics.userStats.totalUsers) * 100)}% of total
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.questionStats.averageScore}%</p>
                <p className="text-sm text-gray-500">{analytics.questionStats.totalAttempts} attempts</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="quizzes" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Company Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Progress</h3>
            <div className="space-y-4">
              {analytics.companyProgress.map((company, index) => (
                <div key={company.company} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-medium text-gray-900">{company.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${company.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{company.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Question Difficulty Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Difficulty Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ difficulty, count }) => `${difficulty}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;