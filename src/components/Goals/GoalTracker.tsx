import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Calendar, TrendingUp, Award, Flame, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Goal {
  id: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  target_type: 'questions_solved' | 'hours_studied' | 'topics_completed' | 'mock_interviews';
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  created_at: string;
}

const GoalTracker: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const [newGoal, setNewGoal] = useState({
    goal_type: 'daily' as const,
    target_type: 'questions_solved' as const,
    target_value: 1
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchUserStats();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch streak and points from user progress
      const { data, error } = await supabase
        .from('user_progress')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .order('current_streak', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStreak(data[0].current_streak || 0);
      }

      // Calculate total points based on completed goals
      const completedGoals = goals.filter(g => g.is_completed).length;
      setTotalPoints(completedGoals * 10);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      
      switch (newGoal.goal_type) {
        case 'daily':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
      }

      const goalData = {
        user_id: user.id,
        goal_type: newGoal.goal_type,
        target_type: newGoal.target_type,
        target_value: newGoal.target_value,
        current_value: 0,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_completed: false
      };

      const { error } = await supabase
        .from('user_goals')
        .insert([goalData]);

      if (error) throw error;

      setShowAddGoal(false);
      setNewGoal({
        goal_type: 'daily',
        target_type: 'questions_solved',
        target_value: 1
      });
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateGoalProgress = async (goalId: string, increment: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.min(goal.current_value + increment, goal.target_value);
      const isCompleted = newValue >= goal.target_value;

      const { error } = await supabase
        .from('user_goals')
        .update({
          current_value: newValue,
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'questions_solved': return Target;
      case 'hours_studied': return Calendar;
      case 'topics_completed': return Award;
      case 'mock_interviews': return TrendingUp;
      default: return Target;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'questions_solved': return 'Questions Solved';
      case 'hours_studied': return 'Hours Studied';
      case 'topics_completed': return 'Topics Completed';
      case 'mock_interviews': return 'Mock Interviews';
      default: return type;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-green-600';
    if (percentage >= 75) return 'from-blue-500 to-blue-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Goal Tracker</h2>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {goals.filter(g => g.is_completed).length}
            </div>
            <div className="text-sm text-gray-600">Goals Completed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="p-6">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
            <p className="text-gray-600 mb-4">Set your first goal to start tracking your progress</p>
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const GoalIcon = getGoalTypeIcon(goal.target_type);
              const progressPercentage = (goal.current_value / goal.target_value) * 100;
              const isExpired = new Date(goal.end_date) < new Date() && !goal.is_completed;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    goal.is_completed
                      ? 'bg-green-50 border-green-200'
                      : isExpired
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getProgressColor(progressPercentage)} flex items-center justify-center`}>
                        <GoalIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getGoalTypeLabel(goal.target_type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Goal
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {goal.current_value}/{goal.target_value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round(progressPercentage)}%
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progressPercentage)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Ends: {new Date(goal.end_date).toLocaleDateString()}
                    </div>
                    
                    {!goal.is_completed && !isExpired && (
                      <button
                        onClick={() => updateGoalProgress(goal.id, 1)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        +1 Progress
                      </button>
                    )}
                    
                    {goal.is_completed && (
                      <span className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed!</span>
                      </span>
                    )}
                    
                    {isExpired && (
                      <span className="text-red-600 text-sm font-medium">Expired</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
              <button
                onClick={() => setShowAddGoal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                <select
                  value={newGoal.goal_type}
                  onChange={(e) => setNewGoal({...newGoal, goal_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                <select
                  value={newGoal.target_type}
                  onChange={(e) => setNewGoal({...newGoal, target_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="questions_solved">Questions Solved</option>
                  <option value="hours_studied">Hours Studied</option>
                  <option value="topics_completed">Topics Completed</option>
                  <option value="mock_interviews">Mock Interviews</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({...newGoal, target_value: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;