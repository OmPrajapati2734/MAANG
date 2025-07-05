import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trophy, Clock, Play } from 'lucide-react';
import RoadmapStep from '../components/Roadmap/RoadmapStep';
import StepDetail from '../components/Roadmap/StepDetail';
import { companies, roadmaps } from '../data/companies';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Roadmap: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);

  const company = companies.find(c => c.id === companyId);
  const roadmap = companyId ? roadmaps[companyId as keyof typeof roadmaps] : [];

  useEffect(() => {
    if (user && companyId) {
      loadUserProgress();
    }
  }, [user, companyId]);

  const loadUserProgress = async () => {
    if (!user || !companyId) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('company', company?.name);

      if (error) throw error;

      const completed = new Set(
        data?.filter(p => p.completed).map(p => p.step_id) || []
      );
      setCompletedSteps(completed);
      setUserProgress(data || []);

      // Set active step to first incomplete step
      const firstIncomplete = roadmap.find(step => !completed.has(step.id));
      if (firstIncomplete) {
        setActiveStep(firstIncomplete.id);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  if (!company || !roadmap) {
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

  const progressPercentage = (completedSteps.size / roadmap.length) * 100;

  const handleStepClick = (step: any) => {
    setSelectedStep({
      ...step,
      company: company.name
    });
  };

  const handleStepComplete = async (stepId: string) => {
    if (!user) return;

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
      
      // Move to next step
      const currentIndex = roadmap.findIndex(s => s.id === stepId);
      if (currentIndex < roadmap.length - 1) {
        setActiveStep(roadmap[currentIndex + 1].id);
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const totalTimeEstimate = roadmap.reduce((total, step) => {
    const duration = step.duration.match(/\d+/);
    return total + (duration ? parseInt(duration[0]) : 0);
  }, 0);

  const averageScore = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length)
    : 0;

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
                <h1 className="text-3xl font-bold mb-2">{company.name} Interview Prep</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {completedSteps.size}/{roadmap.length}
                  </div>
                  <div className="text-sm text-gray-600">Steps Completed</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {totalTimeEstimate} days
                  </div>
                  <div className="text-sm text-gray-600">Estimated Time</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">{averageScore}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Play className="w-5 h-5 text-purple-500 mr-2" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {userProgress.filter(p => p.video_progress && Object.keys(p.video_progress).length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Videos Watched</div>
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
          <h2 className="text-xl font-semibold text-gray-900">Preparation Roadmap</h2>
          
          <div className="space-y-4">
            {roadmap.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RoadmapStep
                  step={step}
                  isCompleted={completedSteps.has(step.id)}
                  isActive={activeStep === step.id}
                  onClick={() => handleStepClick(step)}
                />
              </motion.div>
            ))}
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
            onClick={() => navigate('/mentor')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Ask AI Mentor
          </button>
          <button
            onClick={() => navigate('/resources')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            View Resources
          </button>
        </motion.div>

        {/* Step Detail Modal */}
        {selectedStep && (
          <StepDetail
            step={selectedStep}
            onClose={() => setSelectedStep(null)}
            onComplete={() => handleStepComplete(selectedStep.id)}
            isCompleted={completedSteps.has(selectedStep.id)}
          />
        )}
      </div>
    </div>
  );
};

export default Roadmap;