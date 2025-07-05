import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, CheckCircle, Clock, ExternalLink, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface StepDetailProps {
  step: {
    id: string;
    title: string;
    description: string;
    duration: string;
    resources: string[];
    company: string;
  };
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'book' | 'course';
  url: string | null;
  content: string | null;
  video_duration: number | null;
}

const StepDetail: React.FC<StepDetailProps> = ({ step, onClose, onComplete, isCompleted }) => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState<{ [key: string]: number }>({});
  const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStepResources();
    loadProgress();
  }, [step.id]);

  const fetchStepResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .or(`step_id.eq.${step.id},company.eq.${step.company}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('step_id', step.id)
        .single();

      if (data) {
        setVideoProgress(data.video_progress || {});
        setCompletedResources(new Set(data.completed_resources || []));
      }
    } catch (error) {
      // Progress doesn't exist yet, that's fine
    }
  };

  const updateProgress = async () => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        company: step.company,
        step_id: step.id,
        completed: completedResources.size === resources.length && resources.length > 0,
        video_progress: videoProgress,
        completed_resources: Array.from(completedResources)
      };

      const { error } = await supabase
        .from('user_progress')
        .upsert(progressData);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleResourceComplete = (resourceId: string) => {
    const newCompleted = new Set(completedResources);
    if (newCompleted.has(resourceId)) {
      newCompleted.delete(resourceId);
    } else {
      newCompleted.add(resourceId);
    }
    setCompletedResources(newCompleted);
    
    // Auto-save progress
    setTimeout(updateProgress, 500);
  };

  const handleVideoProgress = (resourceId: string, progress: number) => {
    setVideoProgress(prev => ({
      ...prev,
      [resourceId]: progress
    }));
    
    // Auto-save progress
    setTimeout(updateProgress, 1000);
  };

  const handleStepComplete = () => {
    onComplete();
    updateProgress();
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'article': return BookOpen;
      case 'book': return BookOpen;
      case 'course': return Play;
      default: return BookOpen;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-red-600 bg-red-100';
      case 'article': return 'text-blue-600 bg-blue-100';
      case 'book': return 'text-green-600 bg-green-100';
      case 'course': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const progressPercentage = resources.length > 0 ? (completedResources.size / resources.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{step.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-white/90 mb-4">{step.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white/80">
                <Clock className="w-4 h-4 mr-2" />
                {step.duration}
              </div>
              <div className="flex items-center text-white/80">
                <BookOpen className="w-4 h-4 mr-2" />
                {resources.length} resources
              </div>
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
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Resources</h3>
                <div className="space-y-4">
                  {resources.map((resource) => {
                    const ResourceIcon = getResourceIcon(resource.type);
                    const isCompleted = completedResources.has(resource.id);
                    const videoProgressPercent = videoProgress[resource.id] || 0;
                    
                    return (
                      <div
                        key={resource.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className={`w-10 h-10 rounded-lg ${getResourceColor(resource.type)} flex items-center justify-center`}>
                              <ResourceIcon className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{resource.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResourceColor(resource.type)}`}>
                                  {resource.type}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                              
                              {resource.type === 'video' && resource.video_duration && (
                                <div className="mb-3">
                                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(videoProgressPercent)}% ({Math.round(videoProgressPercent * resource.video_duration / 100)} / {resource.video_duration} min)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${videoProgressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {resource.content && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-gray-700 line-clamp-3">{resource.content}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-3">
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Open Resource</span>
                                  </a>
                                )}
                                
                                <button
                                  onClick={() => handleResourceComplete(resource.id)}
                                  className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    isCompleted
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {completedResources.size} of {resources.length} resources completed
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              
              {!isCompleted && progressPercentage === 100 && (
                <button
                  onClick={handleStepComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Step
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepDetail;