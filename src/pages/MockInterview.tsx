import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Video, Code, Database, Users, ArrowRight, Clock, Award, TrendingUp } from 'lucide-react';
import MockInterviewSession from '../components/MockInterview/MockInterviewSession';

const MockInterview: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'coding' | 'system-design' | 'behavioral' | 'mixed' | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showSession, setShowSession] = useState(false);
  const [sessionResults, setSessionResults] = useState<any>(null);

  const interviewTypes = [
    {
      id: 'coding' as const,
      name: 'Coding Interview',
      description: 'Practice algorithms and data structures problems',
      icon: Code,
      color: 'from-blue-500 to-blue-600',
      duration: '45-60 minutes',
      questions: '2-3 coding problems'
    },
    {
      id: 'system-design' as const,
      name: 'System Design',
      description: 'Design scalable systems and architectures',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      duration: '45-60 minutes',
      questions: '1-2 design problems'
    },
    {
      id: 'behavioral' as const,
      name: 'Behavioral Interview',
      description: 'Practice STAR method and leadership scenarios',
      icon: Users,
      color: 'from-green-500 to-green-600',
      duration: '30-45 minutes',
      questions: '5-7 behavioral questions'
    },
    {
      id: 'mixed' as const,
      name: 'Full Interview',
      description: 'Complete interview simulation with all rounds',
      icon: Award,
      color: 'from-orange-500 to-orange-600',
      duration: '90-120 minutes',
      questions: 'Mixed question types'
    }
  ];

  const companies = ['Meta', 'Amazon', 'Apple', 'Netflix', 'Google'];
  const roleLevels = ['sde-1', 'sde-2', 'sde-3', 'senior', 'staff', 'principal'];

  const handleStartInterview = () => {
    if (selectedType) {
      setShowSession(true);
    }
  };

  const handleSessionComplete = (results: any) => {
    setSessionResults(results);
    setShowSession(false);
  };

  const handleSessionCancel = () => {
    setShowSession(false);
    setSelectedType(null);
  };

  if (showSession && selectedType) {
    return (
      <MockInterviewSession
        interviewType={selectedType}
        company={selectedCompany}
        roleLevel={selectedRole}
        onComplete={handleSessionComplete}
        onCancel={handleSessionCancel}
      />
    );
  }

  if (sessionResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
              <p className="text-gray-600">Here's your performance summary</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{sessionResults.overall_score}%</div>
                <div className="text-sm text-blue-800">Overall Score</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{sessionResults.technical_score}%</div>
                <div className="text-sm text-green-800">Technical Skills</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">{sessionResults.communication_score}%</div>
                <div className="text-sm text-purple-800">Communication</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {sessionResults.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {sessionResults.areas_for_improvement.map((area: string, index: number) => (
                    <li key={index} className="flex items-center text-orange-700">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setSessionResults(null);
                  setSelectedType(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Another Interview
              </button>
              <button
                onClick={() => window.location.href = '/practice'}
                className="px-6 py-3 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Practice More Questions
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎤 Mock Interview Practice</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with AI-powered mock interviews. Get real-time feedback and improve your interview skills.
          </p>
        </motion.div>

        {/* Interview Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Interview Type</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {type.duration}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {type.questions}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Configuration */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Interview Configuration</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Company (Optional)
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Company</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Level (Optional)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Level</option>
                  {roleLevels.map(role => (
                    <option key={role} value={role}>{role.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">What to Expect:</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• AI-powered questions tailored to your selections</li>
                <li>• Real-time feedback and scoring</li>
                <li>• Detailed performance analysis</li>
                <li>• Areas for improvement and strengths</li>
                <li>• Optional voice and video recording</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartInterview}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-lg"
              >
                <Mic className="w-5 h-5" />
                <span>Start Mock Interview</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Questions</h3>
            <p className="text-gray-600">Get realistic interview questions powered by advanced AI technology</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Feedback</h3>
            <p className="text-gray-600">Receive instant feedback on your performance and communication skills</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
            <p className="text-gray-600">Get comprehensive analysis with strengths and improvement areas</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MockInterview;