import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, RotateCcw, CheckCircle, X, Clock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface CodeEditorProps {
  questionId: string;
  question: {
    title: string;
    description: string;
    constraints?: string;
    testCases?: TestCase[];
  };
  onClose: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ questionId, question, onClose }) => {
  const { user } = useAuth();
  const [code, setCode] = useState(`def solution(nums, target):
    """
    Your solution here
    """
    pass

# Test your solution
if __name__ == "__main__":
    # Example test case
    nums = [2, 7, 11, 15]
    target = 9
    result = solution(nums, target)
    print(f"Result: {result}")
`);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const languages = [
    { value: 'python', label: 'Python', template: `def solution(nums, target):
    """
    Your solution here
    """
    pass` },
    { value: 'javascript', label: 'JavaScript', template: `function solution(nums, target) {
    // Your solution here
    return [];
}` },
    { value: 'java', label: 'Java', template: `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}` },
    { value: 'cpp', label: 'C++', template: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Your solution here
        return {};
    }
};` }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    const template = languages.find(lang => lang.value === newLanguage)?.template || '';
    setLanguage(newLanguage);
    setCode(template);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);
    
    try {
      // Simulate code execution (in a real app, this would call a code execution service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock execution results
      const mockResults = [
        { input: '[2, 7, 11, 15], 9', output: '[0, 1]', expected: '[0, 1]', passed: true },
        { input: '[3, 2, 4], 6', output: '[1, 2]', expected: '[1, 2]', passed: true },
        { input: '[3, 3], 6', output: '[0, 1]', expected: '[0, 1]', passed: true }
      ];
      
      setTestResults(mockResults);
      setExecutionTime(Math.floor(Math.random() * 100) + 50);
      setMemoryUsage(Math.floor(Math.random() * 1000) + 500);
      setIsCorrect(mockResults.every(result => result.passed));
      setOutput('Code executed successfully!\nAll test cases passed.');
      
      // Save submission
      await saveSubmission(mockResults);
      
    } catch (error) {
      setOutput('Error: Failed to execute code');
      console.error('Code execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const saveSubmission = async (results: any[]) => {
    if (!user) return;

    try {
      const submissionData = {
        user_id: user.id,
        question_id: questionId,
        language,
        code,
        test_results: results,
        execution_time_ms: executionTime,
        memory_usage_kb: memoryUsage,
        is_correct: results.every(r => r.passed),
        time_complexity: 'O(n)', // Mock complexity analysis
        space_complexity: 'O(1)',
        ai_feedback: 'Good solution! Consider optimizing for edge cases.'
      };

      const { error } = await supabase
        .from('code_submissions')
        .insert([submissionData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving submission:', error);
    }
  };

  const resetCode = () => {
    const template = languages.find(lang => lang.value === language)?.template || '';
    setCode(template);
    setOutput('');
    setTestResults([]);
    setExecutionTime(null);
    setMemoryUsage(null);
    setIsCorrect(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{question.title}</h2>
            <p className="text-sm text-gray-600">Code Editor</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Problem Description */}
          <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{question.description}</p>
              
              {question.constraints && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Constraints:</h4>
                  <p className="text-yellow-800 text-sm">{question.constraints}</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Example:</h4>
                <div className="text-blue-800 text-sm font-mono">
                  <div>Input: nums = [2,7,11,15], target = 9</div>
                  <div>Output: [0,1]</div>
                  <div className="mt-2 text-blue-700">
                    Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel - Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
                <button
                  onClick={resetCode}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
              
              {executionTime && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{executionTime}ms</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>{memoryUsage}KB</span>
                  </div>
                  {isCorrect && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Accepted</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none"
                placeholder="Write your code here..."
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </div>

          {/* Right Panel - Output & Test Results */}
          <div className="w-1/3 border-l border-gray-200 flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Output & Test Results</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Console Output */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Console Output</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm min-h-[100px]">
                  {output || 'Run your code to see output...'}
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Test Results</h4>
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.passed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Test Case {index + 1}</span>
                          {result.passed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs font-mono space-y-1">
                          <div><span className="text-gray-600">Input:</span> {result.input}</div>
                          <div><span className="text-gray-600">Output:</span> {result.output}</div>
                          <div><span className="text-gray-600">Expected:</span> {result.expected}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeEditor;