import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Calendar, Building, Plus, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SuccessStory {
  id: string;
  author_name: string;
  company: string;
  role: string;
  title: string;
  content: string;
  preparation_time: string;
  key_tips: string[];
  difficulty_rating: number;
  is_featured: boolean;
  created_at: string;
}

const SuccessStories: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [showAddStory, setShowAddStory] = useState(false);

  const [newStory, setNewStory] = useState({
    author_name: '',
    company: '',
    role: '',
    title: '',
    content: '',
    preparation_time: '',
    key_tips: [''],
    difficulty_rating: 3
  });

  const companies = ['Meta', 'Amazon', 'Apple', 'Netflix', 'Google', 'Microsoft', 'Other'];

  useEffect(() => {
    fetchSuccessStories();
  }, []);

  const fetchSuccessStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const storyData = {
        user_id: user.id,
        ...newStory,
        key_tips: newStory.key_tips.filter(tip => tip.trim() !== ''),
        is_approved: false // Requires admin approval
      };

      const { error } = await supabase
        .from('success_stories')
        .insert([storyData]);

      if (error) throw error;

      setShowAddStory(false);
      setNewStory({
        author_name: '',
        company: '',
        role: '',
        title: '',
        content: '',
        preparation_time: '',
        key_tips: [''],
        difficulty_rating: 3
      });

      // Show success message
      alert('Your success story has been submitted for review!');
    } catch (error) {
      console.error('Error adding success story:', error);
    }
  };

  const addTipField = () => {
    setNewStory(prev => ({
      ...prev,
      key_tips: [...prev.key_tips, '']
    }));
  };

  const updateTip = (index: number, value: string) => {
    setNewStory(prev => ({
      ...prev,
      key_tips: prev.key_tips.map((tip, i) => i === index ? value : tip)
    }));
  };

  const removeTip = (index: number) => {
    setNewStory(prev => ({
      ...prev,
      key_tips: prev.key_tips.filter((_, i) => i !== index)
    }));
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = searchTerm === '' || 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'all' || story.company === selectedCompany;
    
    return matchesSearch && matchesCompany;
  });

  const getDifficultyColor = (rating: number) => {
    if (rating <= 2) return 'text-green-600 bg-green-100';
    if (rating <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (rating: number) => {
    if (rating <= 2) return 'Easy';
    if (rating <= 3) return 'Medium';
    return 'Hard';
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏆 Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from real interview experiences and success stories from candidates who landed their dream jobs at top tech companies.
          </p>
        </motion.div>

        {/* Actions & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddStory(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Share Your Story</span>
          </button>
        </motion.div>

        {/* Featured Stories */}
        {stories.some(story => story.is_featured) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">⭐ Featured Stories</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {stories.filter(story => story.is_featured).slice(0, 2).map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-blue-700">Featured Story</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{story.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{story.role}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{story.title}</h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">{story.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">by {story.author_name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(story.difficulty_rating)}`}>
                      {getDifficultyLabel(story.difficulty_rating)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Success Stories</h2>
          
          {filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
              <p className="text-gray-600 mb-4">Be the first to share your success story!</p>
              <button
                onClick={() => setShowAddStory(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Your Story
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{story.company}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{story.role}</span>
                      </div>
                      {story.preparation_time && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">{story.preparation_time}</span>
                        </div>
                      )}
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(story.difficulty_rating)}`}>
                      {getDifficultyLabel(story.difficulty_rating)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{story.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{story.content}</p>
                  
                  {story.key_tips.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Key Tips:</h4>
                      <ul className="space-y-1">
                        {story.key_tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start text-gray-700 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>by {story.author_name}</span>
                    <span>{new Date(story.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Story Modal */}
        {showAddStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Share Your Success Story</h3>
              
              <form onSubmit={handleAddStory} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={newStory.author_name}
                      onChange={(e) => setNewStory({...newStory, author_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <select
                      value={newStory.company}
                      onChange={(e) => setNewStory({...newStory, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map(company => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={newStory.role}
                      onChange={(e) => setNewStory({...newStory, role: e.target.value})}
                      placeholder="e.g., Software Engineer, SDE-2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time</label>
                    <input
                      type="text"
                      value={newStory.preparation_time}
                      onChange={(e) => setNewStory({...newStory, preparation_time: e.target.value})}
                      placeholder="e.g., 3 months, 6 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
                  <input
                    type="text"
                    value={newStory.title}
                    onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                    placeholder="e.g., How I landed my dream job at Google"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Story</label>
                  <textarea
                    value={newStory.content}
                    onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                    rows={6}
                    placeholder="Share your interview experience, preparation strategy, challenges faced, and how you overcame them..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Tips</label>
                  {newStory.key_tips.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateTip(index, e.target.value)}
                        placeholder="Enter a key tip..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {newStory.key_tips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTip(index)}
                          className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTipField}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add another tip
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Difficulty (1-5)
                  </label>
                  <select
                    value={newStory.difficulty_rating}
                    onChange={(e) => setNewStory({...newStory, difficulty_rating: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 - Very Easy</option>
                    <option value={2}>2 - Easy</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Hard</option>
                    <option value={5}>5 - Very Hard</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddStory(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Story
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

export default SuccessStories;