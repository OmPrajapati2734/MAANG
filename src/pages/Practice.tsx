import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Users, ArrowRight, Filter, Search, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PracticeQuestion from '../components/Practice/PracticeQuestion';
import CodeEditor from '../components/CodeEditor/CodeEditor';

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'dsa' | 'system-design' | 'behavioral' | 'company-specific';
  company: string | null;
  role_level: string | null;
  round_type: string | null;
  tags: string[];
  test_cases?: any[];
  constraints?: string;
  platform?: string;
  platform_url?: string;
}

const Practice: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dsa' | 'system-design' | 'behavioral' | 'company-specific'>('dsa');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedRoleLevel, setSelectedRoleLevel] = useState<string>('all');
  const [selectedRoundType, setSelectedRoundType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const tabs = [
    { id: 'dsa', name: 'Data Structures & Algorithms', icon: Code },
    { id: 'system-design', name: 'System Design', icon: Database },
    { id: 'behavioral', name: 'Behavioral', icon: Users },
    { id: 'company-specific', name: 'Company Specific', icon: ArrowRight },
  ];

  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const companies = ['all', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Google'];
  const roleLevels = ['all', 'sde-1', 'sde-2', 'sde-3', 'senior', 'staff', 'principal'];
  const roundTypes = ['all', 'online', 'phone', 'onsite', 'final'];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add platform information for external links
      const questionsWithPlatforms = (data || []).map(q => ({
        ...q,
        platform: getPlatformForQuestion(q),
        platform_url: getPlatformUrl(q)
      }));

      setQuestions(questionsWithPlatforms);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformForQuestion = (question: any): string | undefined => {
    const title = question.title.toLowerCase();
    
    // Map to actual platforms
    if (question.category === 'dsa') {
      return 'LeetCode';
    }
    
    if (question.category === 'system-design') {
      return 'System Design Primer';
    }
    
    if (question.category === 'behavioral') {
      return 'AI Mentor';
    }
    
    return 'Practice Platform';
  };

  const getPlatformUrl = (question: any): string | undefined => {
    const title = question.title.toLowerCase();
    
    // Map to working URLs
    if (title.includes('two sum')) {
      return 'https://leetcode.com/problems/two-sum/';
    }
    if (title.includes('reverse linked list')) {
      return 'https://leetcode.com/problems/reverse-linked-list/';
    }
    if (title.includes('binary tree') && title.includes('path sum')) {
      return 'https://leetcode.com/problems/binary-tree-maximum-path-sum/';
    }
    
    if (question.category === 'system-design') {
      return 'https://github.com/donnemartin/system-design-primer';
    }
    
    // Default to LeetCode for DSA problems
    if (question.category === 'dsa') {
      return 'https://leetcode.com/problemset/all/';
    }
    
    return undefined;
  };

  const getCurrentQuestions = () => {
    return questions.filter(q => {
      const matchesCategory = q.category === activeTab;
      const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchesCompany = selectedCompany === 'all' || q.company === selectedCompany;
      const matchesRoleLevel = selectedRoleLevel === 'all' || q.role_level === selectedRoleLevel;
      const matchesRoundType = selectedRoundType === 'all' || q.round_type === selectedRoundType;
      const matchesSearch = searchTerm === '' || 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesDifficulty && matchesCompany && matchesRoleLevel && matchesRoundType && matchesSearch;
    });
  };

  const handleQuestionClick = (question: Question) => {
    // For DSA questions, open code editor
    if (question.category === 'dsa') {
      setSelectedQuestion(question);
      setShowCodeEditor(true);
    }
    // For behavioral questions or questions without external links, open AI mentor
    else if (question.category === 'behavioral' || !question.platform_url) {
      window.location.href = '/mentor';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestions = getCurrentQuestions();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💻 Practice Questions</h1>
          <p className="text-gray-600">Sharpen your skills with curated interview questions and integrated code editor</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const count = questions.filter(q => q.category === tab.id).length;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {companies.map(company => (
                <option key={company} value={company}>
                  {company === 'all' ? 'All Companies' : company}
                </option>
              ))}
            </select>

            <select
              value={selectedRoleLevel}
              onChange={(e) => setSelectedRoleLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roleLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={selectedRoundType}
              onChange={(e) => setSelectedRoundType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roundTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Rounds' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {activeTab === 'dsa' && (
              <button
                onClick={() => {
                  const dsaQuestion = currentQuestions.find(q => q.category === 'dsa');
                  if (dsaQuestion) {
                    setSelectedQuestion(dsaQuestion);
                    setShowCodeEditor(true);
                  }
                }}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Code Editor</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Questions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6"
        >
          {currentQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PracticeQuestion
                question={question}
                onClick={() => handleQuestionClick(question)}
              />
            </motion.div>
          ))}
        </motion.div>

        {currentQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Code className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </motion.div>
        )}

        {/* Code Editor Modal */}
        {showCodeEditor && selectedQuestion && (
          <CodeEditor
            questionId={selectedQuestion.id}
            question={{
              title: selectedQuestion.title,
              description: selectedQuestion.description,
              constraints: selectedQuestion.constraints,
              testCases: selectedQuestion.test_cases
            }}
            onClose={() => {
              setShowCodeEditor(false);
              setSelectedQuestion(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Practice;