import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Award } from 'lucide-react';

interface ProgressCardProps {
  company: string;
  completedSteps: number;
  totalSteps: number;
  lastActivity: string;
  averageScore: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  company,
  completedSteps,
  totalSteps,
  lastActivity,
  averageScore
}) => {
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  const companyColors = {
    Meta: 'from-blue-500 to-blue-600',
    Amazon: 'from-orange-500 to-orange-600',
    Apple: 'from-gray-700 to-gray-800',
    Netflix: 'from-red-500 to-red-600',
    Google: 'from-green-500 to-green-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{company}</h3>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${companyColors[company as keyof typeof companyColors]} flex items-center justify-center text-white font-bold text-lg`}>
          {company[0]}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">
              {completedSteps}/{totalSteps} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full bg-gradient-to-r ${companyColors[company as keyof typeof companyColors]}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{lastActivity}</div>
            <div className="text-xs text-gray-500">Last Active</div>
          </div>
          <div className="text-center">
            <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900">{averageScore}%</div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCard;