import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, Eye, Edit, Trash2, Search, Filter, Users, Clock, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SystemDesignBoard {
  id: string;
  title: string;
  description: string;
  board_data: any;
  question_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_template: boolean;
  is_public: boolean;
  created_at: string;
}

const SystemDesign: React.FC = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<SystemDesignBoard[]>([]);
  const [templates, setTemplates] = useState<SystemDesignBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'my-boards' | 'templates'>('templates');
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const [newBoard, setNewBoard] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as const,
    is_public: false
  });

  useEffect(() => {
    fetchBoards();
    fetchTemplates();
  }, [user]);

  const fetchBoards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('system_design_boards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_template', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoards(data || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('system_design_boards')
        .select('*')
        .eq('is_template', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const boardData = {
        user_id: user.id,
        title: newBoard.title,
        description: newBoard.description,
        difficulty: newBoard.difficulty,
        is_public: newBoard.is_public,
        board_data: {
          components: [],
          connections: [],
          notes: ''
        }
      };

      const { error } = await supabase
        .from('system_design_boards')
        .insert([boardData]);

      if (error) throw error;

      setShowCreateBoard(false);
      setNewBoard({
        title: '',
        description: '',
        difficulty: 'medium',
        is_public: false
      });
      fetchBoards();
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const createFromTemplate = async (template: SystemDesignBoard) => {
    if (!user) return;

    try {
      const boardData = {
        user_id: user.id,
        title: `${template.title} - My Solution`,
        description: template.description,
        difficulty: template.difficulty,
        board_data: template.board_data,
        question_type: 'custom',
        is_template: false,
        is_public: false
      };

      const { error } = await supabase
        .from('system_design_boards')
        .insert([boardData]);

      if (error) throw error;
      fetchBoards();
      setActiveTab('my-boards');
    } catch (error) {
      console.error('Error creating from template:', error);
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board?')) return;

    try {
      const { error } = await supabase
        .from('system_design_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;
      fetchBoards();
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentBoards = activeTab === 'templates' ? templates : boards;
  const filteredBoards = currentBoards.filter(board => {
    const matchesSearch = searchTerm === '' || 
      board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = selectedDifficulty === 'all' || board.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏗️ System Design</h1>
              <p className="text-gray-600">Practice system design with visual boards and AI guidance</p>
            </div>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Templates</span>
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'templates' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {templates.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('my-boards')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my-boards'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>My Boards</span>
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'my-boards' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {boards.length}
                </span>
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search system design problems..."
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
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </motion.div>

        {/* Boards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBoards.map((board, index) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{board.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(board.difficulty)}`}>
                      {board.difficulty}
                    </span>
                    {board.is_template && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Template
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{board.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(board.created_at).toLocaleDateString()}
                </div>
                {board.board_data?.components && (
                  <div className="flex items-center">
                    <Database className="w-4 h-4 mr-1" />
                    {board.board_data.components.length} components
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {board.is_template ? (
                  <button
                    onClick={() => createFromTemplate(board)}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Use Template</span>
                  </button>
                ) : (
                  <>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredBoards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'templates' ? 'No templates found' : 'No boards yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'templates' 
                ? 'Try adjusting your search or filters'
                : 'Create your first system design board to get started'
              }
            </p>
            {activeTab === 'my-boards' && (
              <button
                onClick={() => setShowCreateBoard(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Board
              </button>
            )}
          </motion.div>
        )}

        {/* Create Board Modal */}
        {showCreateBoard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Board</h3>
              
              <form onSubmit={handleCreateBoard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newBoard.title}
                    onChange={(e) => setNewBoard({...newBoard, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Design a Chat System"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newBoard.description}
                    onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the system you want to design..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={newBoard.difficulty}
                    onChange={(e) => setNewBoard({...newBoard, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={newBoard.is_public}
                    onChange={(e) => setNewBoard({...newBoard, is_public: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                    Make this board public
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateBoard(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Board
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

export default SystemDesign;