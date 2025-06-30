import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import { Code, Users, Trophy, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const features = [
    {
      icon: Code,
      title: 'Company-Specific Prep',
      description: 'Tailored roadmaps for Meta, Amazon, Apple, Netflix, and Google interviews'
    },
    {
      icon: Users,
      title: 'AI Mentor Support',
      description: 'Get personalized guidance through voice and video interactions'
    },
    {
      icon: Trophy,
      title: 'Practice & Quizzes',
      description: 'Test your knowledge with DSA, system design, and behavioral questions'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and achievements'
    }
  ];

  const renderAuthForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <LoginForm
            onToggleMode={() => setAuthMode('signup')}
            onForgotPassword={() => setAuthMode('forgot')}
          />
        );
      case 'signup':
        return (
          <SignupForm onToggleMode={() => setAuthMode('login')} />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm onBack={() => setAuthMode('login')} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Master{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MAANG
                </span>{' '}
                Interviews
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Your comprehensive platform for landing dream jobs at Meta, Amazon, Apple, Netflix, and Google. 
                Get personalized roadmaps, practice questions, and AI mentorship.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Users Prepared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Practice Questions</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {renderAuthForm()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;