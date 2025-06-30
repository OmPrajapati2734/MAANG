import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Award, Users, ArrowRight } from 'lucide-react';

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    questions: any[];
  };
  onStart: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{quiz.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
          <div className="text-xs text-gray-500">Questions</div>
        </div>
      </div>

      <div className="flex items-center space-x-6 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {quiz.timeLimit} mins
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Award className="w-4 h-4 mr-2" />
          Multiple Choice
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          Beginner-Advanced
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
      >
        <span>Start Quiz</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default QuizCard;