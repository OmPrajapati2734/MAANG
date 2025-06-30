import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    logo: string;
    color: string;
    description: string;
  };
  progress?: {
    completed: number;
    total: number;
  };
  onClick: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, progress, onClick }) => {
  const progressPercentage = progress ? (progress.completed / progress.total) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className={`h-32 bg-gradient-to-br ${company.color} p-6 relative`}>
        <div className="flex items-center justify-between h-full">
          <div className="text-white">
            <div className="text-3xl mb-2">{company.logo}</div>
            <h3 className="text-xl font-bold">{company.name}</h3>
          </div>
          {progress && progress.completed > 0 && (
            <div className="text-white text-right">
              <CheckCircle className="w-6 h-6 mb-1" />
              <div className="text-sm font-medium">
                {progress.completed}/{progress.total}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {company.description}
        </p>

        {progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">PROGRESS</span>
              <span className="text-xs font-medium text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${company.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {progress && progress.completed > 0 ? 'Continue Prep' : 'Start Prep'}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyCard;