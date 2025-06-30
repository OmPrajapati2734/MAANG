import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CompanyCard from '../components/Dashboard/CompanyCard';
import ProgressCard from '../components/Dashboard/ProgressCard';
import { companies } from '../data/companies';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Calendar, Award, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Mock data - in real app, this would come from Supabase
  const progressData = [
    { company: 'Meta', completed: 2, total: 4, lastActivity: '2d ago', averageScore: 78 },
    { company: 'Amazon', completed: 1, total: 4, lastActivity: '1w ago', averageScore: 85 },
    { company: 'Google', completed: 3, total: 4, lastActivity: '1d ago', averageScore: 92 },
  ];

  const chartData = [
    { name: 'DSA', score: 85 },
    { name: 'System Design', score: 72 },
    { name: 'Behavioral', score: 90 },
    { name: 'Company Knowledge', score: 78 },
  ];

  const stats = [
    { icon: Target, label: 'Total Score', value: '81%', color: 'text-blue-600' },
    { icon: Calendar, label: 'Days Streak', value: '12', color: 'text-green-600' },
    { icon: Award, label: 'Completed', value: '6/12', color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Progress', value: '+15%', color: 'text-orange-600' },
  ];

  const handleCompanySelect = (companyId: string) => {
    navigate(`/roadmap/${companyId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'there'}! 👋
          </h1>
          <p className="text-gray-600">Ready to continue your MAANG interview preparation?</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
              <div className="grid gap-4">
                {progressData.map((progress) => (
                  <ProgressCard
                    key={progress.company}
                    company={progress.company}
                    completedSteps={progress.completed}
                    totalSteps={progress.total}
                    lastActivity={progress.lastActivity}
                    averageScore={progress.averageScore}
                  />
                ))}
              </div>
            </motion.div>

            {/* Companies Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Target Company</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {companies.map((company) => {
                  const progress = progressData.find(p => p.company === company.name);
                  return (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      progress={progress ? { completed: progress.completed, total: progress.total } : undefined}
                      onClick={() => handleCompanySelect(company.id)}
                    />
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/practice')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Practice Questions</div>
                  <div className="text-sm text-gray-600">Solve DSA and system design problems</div>
                </button>
                <button
                  onClick={() => navigate('/mentor')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">AI Mentor</div>
                  <div className="text-sm text-gray-600">Get personalized guidance</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;