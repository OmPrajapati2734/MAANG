import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Play, Trophy, Target, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RoadmapStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  category: string;
  estimated_hours: number;
  prerequisites: string[];
  checkpoints: any;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
}

const CompanyRoadmap: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userProgress, setUserProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompanyAndRoadmap();
      if (user) {
        fetchUserProgress();
      }
    }
  }, [companyId, user]);

  const fetchCompanyAndRoadmap = async () => {
    try {
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch roadmap steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('roadmap_steps')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('step_number');

      if (stepsError) throw stepsError;
      setRoadmapSteps(stepsData || []);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user || !company) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('company', company.name);

      if (error) throw error;

      const progress = data?.reduce((acc, item) => {
        acc[item.step_id] = item;
        if (item.completed) {
          setCompletedSteps(prev => new Set([...prev, item.step_id]));
        }
        return acc;
      }, {}) || {};

      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handleStepComplete = async (stepId: string) => {
    if (!user || !company) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          company: company.name,
          step_id: stepId,
          completed: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCompletedSteps(prev => new Set([...prev, stepId]));
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dsa': return BookOpen;
      case 'system-design': return Target;
      case 'behavioral': return Trophy;
      case 'company-culture': return Play;
      default: return Clock;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dsa': return 'from-blue-500 to-blue-600';
      case 'system-design': return 'from-purple-500 to-purple-600';
      case 'behavioral': return 'from-green-500 to-green-600';
      case 'company-culture': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = roadmapSteps.length > 0 
    ? (completedSteps.size / roadmapSteps.length) * 100 
    : 0;

  const totalHours = roadmapSteps.reduce((sum, step) => sum + step.estimated_hours, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          <div className={`p-6 rounded-xl bg-gradient-to-r ${company.color} text-white mb-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl mb-2">{company.logo}</div>
                <h1 className="text-3xl font-bold mb-2">🧭 {company.name} Interview Roadmap</h1>
                <p className="text-white/90">{company.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-white/80">Complete</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {completedSteps.size}/{roadmapSteps.length}
                  </div>
                  <div className="text-sm text-gray-600">Steps Completed</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{totalHours}h</div>
                  <div className="text-sm text-gray-600">Total Time</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round((completedSteps.size / roadmapSteps.length) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Roadmap Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">Structured Learning Path</h2>
          
          <div className="space-y-4">
            {roadmapSteps.map((step, index) => {
              const CategoryIcon = getCategoryIcon(step.category);
              const isCompleted = completedSteps.has(step.id);
              const isUnlocked = index === 0 || completedSteps.has(roadmapSteps[index - 1]?.id);
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isUnlocked
                      ? 'bg-white border-blue-200 hover:border-blue-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getCategoryColor(step.category)} flex items-center justify-center flex-shrink-0`}>
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          isCompleted ? 'text-green-800' : isUnlocked ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          Step {step.step_number}: {step.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {step.estimated_hours}h
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {step.description}
                      </p>

                      {step.prerequisites.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Prerequisites:</div>
                          <div className="flex flex-wrap gap-2">
                            {step.prerequisites.map((prereq, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                              >
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            step.category === 'dsa' ? 'bg-blue-100 text-blue-700' :
                            step.category === 'system-design' ? 'bg-purple-100 text-purple-700' :
                            step.category === 'behavioral' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {step.category.replace('-', ' ')}
                          </span>
                        </div>
                        
                        {isUnlocked && !isCompleted && (
                          <button
                            onClick={() => handleStepComplete(step.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <button
            onClick={() => navigate('/practice')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Practice Questions
          </button>
          <button
            onClick={() => navigate('/mock-interview')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Mock Interview
          </button>
          <button
            onClick={() => navigate('/mentor')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            AI Mentor
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyRoadmap;