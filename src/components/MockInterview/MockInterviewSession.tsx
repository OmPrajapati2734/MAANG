import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Mic, Video, MessageCircle, CheckCircle, X, Play, Pause } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Question {
  id: string;
  question: string;
  type: 'coding' | 'system-design' | 'behavioral';
  difficulty: string;
  expectedAnswer?: string;
  hints?: string[];
}

interface MockInterviewSessionProps {
  interviewType: 'coding' | 'system-design' | 'behavioral' | 'mixed';
  company?: string;
  roleLevel?: string;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const MockInterviewSession: React.FC<MockInterviewSessionProps> = ({
  interviewType,
  company,
  roleLevel,
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuestions();
  }, [interviewType, company]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleCompleteInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionStarted, timeRemaining]);

  const generateQuestions = async () => {
    try {
      // Generate questions based on interview type
      const mockQuestions: Question[] = [];
      
      if (interviewType === 'coding' || interviewType === 'mixed') {
        mockQuestions.push({
          id: '1',
          question: 'Implement a function to find the longest substring without repeating characters. Explain your approach and analyze the time complexity.',
          type: 'coding',
          difficulty: 'medium',
          hints: ['Consider using a sliding window approach', 'Hash map can help track character positions']
        });
      }

      if (interviewType === 'system-design' || interviewType === 'mixed') {
        mockQuestions.push({
          id: '2',
          question: `Design a ${company ? company.toLowerCase() : 'large-scale'} chat application that can handle millions of users. Consider real-time messaging, scalability, and reliability.`,
          type: 'system-design',
          difficulty: 'hard',
          hints: ['Think about WebSocket connections', 'Consider message queues for reliability', 'Database sharding for scalability']
        });
      }

      if (interviewType === 'behavioral' || interviewType === 'mixed') {
        const behavioralQuestions = [
          'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
          'Describe a situation where you had to learn a new technology quickly. What was your approach?',
          'Give me an example of when you had to make a decision with incomplete information.',
          company === 'Amazon' ? 'Tell me about a time you demonstrated ownership in a project.' : 'Describe a time when you had to lead a project without formal authority.'
        ];
        
        mockQuestions.push({
          id: '3',
          question: behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)],
          type: 'behavioral',
          difficulty: 'medium',
          hints: ['Use the STAR method', 'Focus on your specific actions', 'Quantify the impact when possible']
        });
      }

      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteInterview();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleCompleteInterview = async () => {
    if (!user) return;

    try {
      const sessionData = {
        user_id: user.id,
        interview_type: interviewType,
        company: company || null,
        role_level: roleLevel || null,
        duration_minutes: Math.round((3600 - timeRemaining) / 60),
        questions_asked: questions,
        user_responses: responses,
        overall_score: Math.floor(Math.random() * 30) + 70, // Mock scoring
        technical_score: Math.floor(Math.random() * 30) + 70,
        communication_score: Math.floor(Math.random() * 30) + 70,
        problem_solving_score: Math.floor(Math.random() * 30) + 70,
        areas_for_improvement: [
          'Consider edge cases more thoroughly',
          'Explain your thought process more clearly',
          'Practice time management'
        ],
        strengths: [
          'Good problem-solving approach',
          'Clear communication',
          'Structured thinking'
        ],
        is_completed: true
      };

      const { error } = await supabase
        .from('mock_interviews')
        .insert([sessionData]);

      if (error) throw error;

      onComplete(sessionData);
    } catch (error) {
      console.error('Error saving interview session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎤 Mock Interview Session
            </h2>
            <p className="text-gray-600">
              {company && `${company} `}
              {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
              {roleLevel && ` - ${roleLevel.toUpperCase()}`}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Session Details</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Duration: 60 minutes</li>
                <li>• Questions: {questions.length}</li>
                <li>• Type: {interviewType}</li>
                <li>• Recording: Optional</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Tips for Success</h3>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Think out loud and explain your approach</li>
                <li>• Ask clarifying questions when needed</li>
                <li>• Take your time to understand the problem</li>
                <li>• Use the STAR method for behavioral questions</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Interview</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-2 rounded-lg transition-colors ${
                    isVideoOn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {currentQuestion.type.toUpperCase()} QUESTION
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestion.question}
              </h2>
              
              {currentQuestion.hints && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Hints:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    {currentQuestion.hints.map((hint, index) => (
                      <li key={index}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Complete Interview' : 'Next Question'}
              </button>
            </div>
          </div>

          {/* Response Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Response</h3>
            
            <textarea
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              placeholder="Type your response here... Explain your thought process, approach, and solution."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <div className="mt-4 text-sm text-gray-500">
              <p>💡 Tips:</p>
              <ul className="mt-2 space-y-1">
                <li>• Explain your thinking process clearly</li>
                <li>• Consider edge cases and constraints</li>
                <li>• Discuss time and space complexity</li>
                <li>• Ask clarifying questions if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Interview Progress</span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewSession;