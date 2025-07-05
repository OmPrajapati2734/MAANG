import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Video, MessageCircle, Send, Bot, User, Loader, Lightbulb } from 'lucide-react';
import { aiService, ChatMessage } from '../services/aiService';

const Mentor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI interview mentor powered by advanced AI. I can help you prepare for MAANG interviews with personalized guidance, mock interviews, and detailed explanations. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "Help me prepare for Meta interviews",
        "Practice system design questions", 
        "Review behavioral interview techniques",
        "Create a study plan"
      ]
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation context for AI
      const chatHistory: ChatMessage[] = messages
        .slice(-5) // Last 5 messages for context
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      chatHistory.push({ role: 'user', content: message });

      const aiResponse = await aiService.sendMessage(chatHistory);
      
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: aiResponse.message,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: "I apologize, but I'm having trouble connecting to my AI services right now. Let me provide some general guidance based on your question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      // Simulate voice input
      setTimeout(() => {
        setMessage("I'd like to practice for a Google system design interview");
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleVideoToggle = () => {
    setIsVideoCall(!isVideoCall);
    // In a real app, this would start/stop video call
  };

  const startMockInterview = async (type: 'coding' | 'system-design' | 'behavioral') => {
    setIsTyping(true);
    try {
      const mockQuestion = await aiService.generateMockInterview(type);
      const mockMessage = {
        id: messages.length + 1,
        type: 'ai' as const,
        content: `🎯 **Mock ${type.replace('-', ' ')} Interview**\n\n${mockQuestion.question}\n\nTake your time to think through this. I'll provide feedback and guidance as you work through it.`,
        timestamp: new Date(),
        suggestions: mockQuestion.hints
      };
      setMessages(prev => [...prev, mockMessage]);
    } catch (error) {
      console.error('Mock interview error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Interview Mentor</h1>
          <p className="text-gray-600">Get personalized guidance powered by advanced AI technology</p>
        </motion.div>

        {/* Mentor Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Video/Audio Controls */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">AI Mentor</h3>
                  <p className="text-sm text-white/80">Powered by advanced AI • Ready to help you succeed</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleVoiceToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  <Mic className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={handleVideoToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoCall
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                  title={isVideoCall ? 'End video call' : 'Start video call'}
                >
                  <Video className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {isVideoCall && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 200 }}
                className="mt-4 bg-black/20 rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-white/80">
                  <Video className="w-12 h-12 mx-auto mb-2" />
                  <p>Video call interface would appear here</p>
                  <p className="text-sm">Connect with AI mentor for face-to-face practice</p>
                </div>
              </motion.div>
            )}

            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 60 }}
                className="mt-4 bg-red-500/20 rounded-lg flex items-center justify-center"
              >
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                  <span>Listening... Speak your question</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                  msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {msg.type === 'user' ? 
                      <User className="w-4 h-4 text-white" /> : 
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`rounded-lg p-3 ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                    
                    {/* AI Suggestions */}
                    {msg.type === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Lightbulb className="w-3 h-3" />
                          <span>Suggestions:</span>
                        </div>
                        {msg.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about interview preparation..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !message.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mock Interview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Mock Interview</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => startMockInterview('coding')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Coding Interview</h4>
                  <p className="text-sm text-gray-600">Practice algorithms and data structures</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startMockInterview('system-design')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">System Design</h4>
                  <p className="text-sm text-gray-600">Design scalable systems</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startMockInterview('behavioral')}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Behavioral</h4>
                  <p className="text-sm text-gray-600">Practice STAR method responses</p>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "What should I prepare for a Meta system design interview?",
              "How do I approach behavioral questions at Amazon?",
              "What coding patterns are most important for Google?",
              "Can you help me practice a mock interview?",
              "How long should I prepare for MAANG interviews?",
              "What's the best way to negotiate salary offers?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{question}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Mentor;