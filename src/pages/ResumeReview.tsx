import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Download, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/Resources/FileUpload';

interface ResumeReview {
  id: string;
  file_name: string;
  file_url: string;
  ai_feedback: any;
  ats_score: number;
  suggestions: string[];
  missing_keywords: string[];
  formatting_issues: string[];
  strengths: string[];
  overall_rating: string;
  created_at: string;
}

const ResumeReview: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ResumeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ResumeReview | null>(null);

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resume_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = async (fileData: any) => {
    setAnalyzing(true);
    
    try {
      // Simulate AI analysis (in real app, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock AI feedback
      const mockFeedback = {
        ats_score: Math.floor(Math.random() * 30) + 70,
        suggestions: [
          'Add more quantifiable achievements with specific metrics',
          'Include relevant keywords for your target role',
          'Improve formatting consistency throughout the document',
          'Add a professional summary section at the top'
        ],
        missing_keywords: [
          'React', 'Node.js', 'AWS', 'Agile', 'Leadership', 'Problem-solving'
        ],
        formatting_issues: [
          'Inconsistent bullet point formatting',
          'Font size variations',
          'Uneven spacing between sections'
        ],
        strengths: [
          'Clear work experience progression',
          'Good use of action verbs',
          'Relevant technical skills listed',
          'Appropriate length for experience level'
        ],
        overall_rating: ['good', 'excellent'][Math.floor(Math.random() * 2)]
      };

      const reviewData = {
        user_id: user.id,
        file_id: fileData.id,
        file_name: fileData.file_name,
        file_url: fileData.file_url,
        ai_feedback: mockFeedback,
        ats_score: mockFeedback.ats_score,
        suggestions: mockFeedback.suggestions,
        missing_keywords: mockFeedback.missing_keywords,
        formatting_issues: mockFeedback.formatting_issues,
        strengths: mockFeedback.strengths,
        overall_rating: mockFeedback.overall_rating
      };

      const { error } = await supabase
        .from('resume_reviews')
        .insert([reviewData]);

      if (error) throw error;
      
      fetchReviews();
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Resume Review</h1>
          <p className="text-gray-600">Get AI-powered feedback to optimize your resume for ATS and recruiters</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
              
              {analyzing ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Resume...</h3>
                  <p className="text-gray-600">Our AI is reviewing your resume for ATS optimization and best practices.</p>
                </div>
              ) : (
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  acceptedTypes={['.pdf', '.doc', '.docx']}
                  maxSize={5}
                  uploadType="resume"
                />
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">What we analyze:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• ATS compatibility score</li>
                  <li>• Keyword optimization</li>
                  <li>• Formatting consistency</li>
                  <li>• Content structure</li>
                  <li>• Industry best practices</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
              
              {reviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Upload your first resume to get AI-powered feedback</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedReview(review)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="font-medium text-gray-900">{review.file_name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.overall_rating)}`}>
                              {review.overall_rating}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${getScoreColor(review.ats_score)}`}>
                                {review.ats_score}%
                              </div>
                              <div className="text-xs text-gray-500">ATS Score</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {review.strengths.length}
                              </div>
                              <div className="text-xs text-gray-500">Strengths</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {review.suggestions.length}
                              </div>
                              <div className="text-xs text-gray-500">Suggestions</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {review.formatting_issues.length}
                              </div>
                              <div className="text-xs text-gray-500">Issues</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            Reviewed: {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(review.file_url, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(review.file_url, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Detailed Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedReview.file_name}</h2>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Strengths */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-green-700 mb-4">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {selectedReview.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-orange-700 mb-4">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Suggestions
                    </h3>
                    <ul className="space-y-2">
                      {selectedReview.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start text-orange-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-blue-700 mb-4">
                      <FileText className="w-5 h-5 mr-2" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReview.missing_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formatting Issues */}
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-red-700 mb-4">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Formatting Issues
                    </h3>
                    <ul className="space-y-2">
                      {selectedReview.formatting_issues.map((issue, index) => (
                        <li key={index} className="flex items-start text-red-700">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeReview;