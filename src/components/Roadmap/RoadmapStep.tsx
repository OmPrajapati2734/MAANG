import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, BookOpen, PlayCircle } from 'lucide-react';

interface RoadmapStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    duration: string;
    resources: string[];
  };
  isCompleted: boolean;
  isActive: boolean;
  onClick: () => void;
}

const RoadmapStep: React.FC<RoadmapStepProps> = ({ step, isCompleted, isActive, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : isActive
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold ${
              isCompleted ? 'text-green-800' : isActive ? 'text-blue-800' : 'text-gray-800'
            }`}>
              {step.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {step.duration}
            </div>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {step.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 mr-2" />
              Key Resources:
            </div>
            <ul className="space-y-1">
              {step.resources.map((resource, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                  {resource}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className={`flex items-center text-sm font-medium ${
              isCompleted
                ? 'text-green-600 hover:text-green-700'
                : isActive
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-gray-600 hover:text-gray-700'
            }`}>
              <PlayCircle className="w-4 h-4 mr-2" />
              {isCompleted ? 'Review Step' : isActive ? 'Continue Step' : 'Start Step'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoadmapStep;