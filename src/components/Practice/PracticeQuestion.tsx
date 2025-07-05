import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code, Database, Users, ArrowRight } from 'lucide-react';

interface PracticeQuestionProps {
  question: {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'dsa' | 'system-design' | 'behavioral' | 'company-specific';
    platform?: string;
    platform_url?: string;
    tags: string[];
  };
  onClick: () => void;
}

const PracticeQuestion: React.FC<PracticeQuestionProps> = ({ question, onClick }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dsa': return Code;
      case 'system-design': return Database;
      case 'behavioral': return Users;
      default: return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dsa': return 'text-blue-600 bg-blue-100';
      case 'system-design': return 'text-purple-600 bg-purple-100';
      case 'behavioral': return 'text-green-600 bg-green-100';
      case 'company-specific': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Generate working practice URLs based on question content
  const getPracticeUrl = () => {
    const title = question.title.toLowerCase();
    
    // Map common problems to actual LeetCode URLs
    if (title.includes('two sum')) {
      return 'https://leetcode.com/problems/two-sum/';
    }
    if (title.includes('reverse linked list')) {
      return 'https://leetcode.com/problems/reverse-linked-list/';
    }
    if (title.includes('binary tree') && title.includes('path sum')) {
      return 'https://leetcode.com/problems/binary-tree-maximum-path-sum/';
    }
    if (title.includes('longest substring')) {
      return 'https://leetcode.com/problems/longest-substring-without-repeating-characters/';
    }
    if (title.includes('merge intervals')) {
      return 'https://leetcode.com/problems/merge-intervals/';
    }
    if (title.includes('valid parentheses')) {
      return 'https://leetcode.com/problems/valid-parentheses/';
    }
    
    // For system design questions
    if (question.category === 'system-design') {
      if (title.includes('chat')) {
        return 'https://github.com/donnemartin/system-design-primer#design-a-chat-service';
      }
      if (title.includes('url shortener')) {
        return 'https://github.com/donnemartin/system-design-primer#design-pastebin';
      }
      return 'https://github.com/donnemartin/system-design-primer';
    }
    
    // For behavioral questions, return to internal practice
    if (question.category === 'behavioral') {
      return null; // Will use internal practice interface
    }
    
    // Default to LeetCode problems page
    return 'https://leetcode.com/problemset/all/';
  };

  const handlePracticeClick = () => {
    const practiceUrl = getPracticeUrl();
    
    if (practiceUrl) {
      // Open external platform
      window.open(practiceUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Open internal practice interface
      onClick();
    }
  };

  const CategoryIcon = getCategoryIcon(question.category);
  const practiceUrl = getPracticeUrl();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
      onClick={handlePracticeClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`w-10 h-10 rounded-lg ${getCategoryColor(question.category)} flex items-center justify-center`}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                {question.category.replace('-', ' ')}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3 leading-relaxed">{question.description}</p>
            
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {practiceUrl ? (
            <>
              <span>Practice on {question.category === 'system-design' ? 'System Design Primer' : 'LeetCode'}</span>
              <ExternalLink className="w-4 h-4" />
            </>
          ) : (
            <span>Practice with AI Mentor</span>
          )}
        </div>
        
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
          <span>Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default PracticeQuestion;