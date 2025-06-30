import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Plus, Edit, Trash2, Search, Filter, Clock, Users, BookOpen } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'dsa' | 'system-design' | 'behavioral' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  company_id: string | null;
  time_limit: number;
  is_active: boolean;
  created_at: string;
  companies?: { name: string };
  quiz_questions?: { question_id: string }[];
}

interface Question {
  id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface Company {
  id: string;
  name: string;
}

const QuizManager: React.FC = () => {
  const { adminUser } = useAdmin();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'dsa' as const,
    difficulty: 'medium' as const,
    company_id: '',
    time_limit: 30,
    selectedQuestions: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesResult, questionsResult, companiesResult] = await Promise.all([
        supabase
          .from('quizzes')
          .select(`
            *,
            companies(name),
            quiz_questions(question_id)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('questions')
          .select('id, title, difficulty, category')
          .order('title'),
        supabase
          .from('companies')
          .select('id, name')
          .order('name')
      ]);

      if (quizzesResult.error) throw quizzesResult.error;
      if (questionsResult.error) throw questionsResult.error;
      if (companiesResult.error) throw companiesResult.error;

      setQuizzes(quizzesResult.data || []);
      setQuestions(questionsResult.data || []);
      setCompanies(companiesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;

    try {
      const quizData = {
        title: newQuiz.title,
        description: newQuiz.description,
        category: newQuiz.category,
        difficulty: newQuiz.difficulty,
        company_id: newQuiz.company_id || null,
        time_limit: newQuiz.time_limit,
        created_by: adminUser.id
      };

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([quizData])
        .select()
        .single();

      if (quizError) throw quizError;

      // Add selected questions to the quiz
      if (newQuiz.selectedQuestions.length > 0) {
        const quizQuestions = newQuiz.selectedQuestions.map((questionId, index) => ({
          quiz_id: quiz.id,
          question_id: questionId,
          order_index: index + 1
        }));

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(quizQuestions);

        if (questionsError) throw questionsError;
      }

      setShowAddForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding quiz:', error);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const resetForm = () => {
    setNewQuiz({
      title: '',
      description: '',
      category: 'dsa',
      difficulty: 'medium',
      company_id: '',
      time_limit: 30,
      selectedQuestions: []
    });
    setEditingQuiz(null);
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Manager</h1>
              <p className="text-gray-600">Create and manage practice quizzes</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Quiz</span>
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="dsa">DSA</option>
              <option value="system-design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="company-specific">Company Specific</option>
            </select>
          </div>
        </motion.div>

        {/* Quizzes Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(quiz.category)}`}>
                      {quiz.category.replace('-', ' ')}
                    </span>
                    {quiz.companies && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {quiz.companies.name}
                      </span>
                    )}
                    {!quiz.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {quiz.time_limit} mins
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {quiz.quiz_questions?.length || 0} questions
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Created: {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setEditingQuiz(quiz);
                      setShowAddForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add/Edit Quiz Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}
              </h2>
              
              <form onSubmit={handleAddQuiz} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={newQuiz.time_limit}
                      onChange={(e) => setNewQuiz({...newQuiz, time_limit: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="5"
                      max="180"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz({...newQuiz, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newQuiz.category}
                      onChange={(e) => setNewQuiz({...newQuiz, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="dsa">DSA</option>
                      <option value="system-design">System Design</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="company-specific">Company Specific</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={newQuiz.difficulty}
                      onChange={(e) => setNewQuiz({...newQuiz, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company (Optional)</label>
                    <select
                      value={newQuiz.company_id}
                      onChange={(e) => setNewQuiz({...newQuiz, company_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Companies</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Questions</label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {questions
                      .filter(q => newQuiz.category === 'all' || q.category === newQuiz.category)
                      .map(question => (
                        <label key={question.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newQuiz.selectedQuestions.includes(question.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewQuiz({
                                  ...newQuiz,
                                  selectedQuestions: [...newQuiz.selectedQuestions, question.id]
                                });
                              } else {
                                setNewQuiz({
                                  ...newQuiz,
                                  selectedQuestions: newQuiz.selectedQuestions.filter(id => id !== question.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{question.title}</div>
                            <div className="text-sm text-gray-500">
                              {question.difficulty} • {question.category}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {newQuiz.selectedQuestions.length} questions selected
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManager;