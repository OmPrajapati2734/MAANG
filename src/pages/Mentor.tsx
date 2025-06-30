import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Video, MessageCircle, Send, Bot, User, Loader } from 'lucide-react';

const Mentor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI interview mentor. How can I help you prepare for your MAANG interviews today?",
      timestamp: new Date()
    }
  ]);

  // AI response templates based on keywords
  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('meta') || msg.includes('facebook')) {
      return "For Meta interviews, focus on these key areas:\n\n1. **System Design**: Practice designing scalable systems like News Feed, Messenger, or Instagram\n2. **Coding**: Master graph algorithms, trees, and dynamic programming\n3. **Behavioral**: Prepare stories around Meta's core values - Move Fast, Be Bold, Focus on Impact\n4. **Culture**: Understand Meta's mission to connect the world\n\nWould you like me to dive deeper into any of these areas?";
    }
    
    if (msg.includes('amazon')) {
      return "Amazon interviews are unique due to their Leadership Principles. Here's how to prepare:\n\n1. **Leadership Principles**: Master all 16 principles with concrete STAR examples\n2. **Coding**: Focus on arrays, strings, trees, and optimization problems\n3. **System Design**: Think about scalability, reliability, and cost optimization\n4. **Behavioral**: Every answer should tie back to a leadership principle\n\nKey principles to focus on: Customer Obsession, Ownership, Invent and Simplify, and Dive Deep. Need help with specific examples?";
    }
    
    if (msg.includes('google')) {
      return "Google interviews emphasize algorithmic thinking and 'Googleyness'. Here's your prep strategy:\n\n1. **Algorithms**: Master sorting, searching, graph algorithms, and dynamic programming\n2. **System Design**: Focus on distributed systems, caching, and load balancing\n3. **Googleyness**: Show intellectual curiosity, collaboration, and comfort with ambiguity\n4. **General Cognitive Ability**: Demonstrate problem-solving skills\n\nGoogle loves candidates who can think through problems systematically. Want to practice a coding problem?";
    }
    
    if (msg.includes('apple')) {
      return "Apple interviews focus heavily on design thinking and attention to detail:\n\n1. **Design Philosophy**: Understand Apple's focus on simplicity and user experience\n2. **Technical Depth**: Be ready for deep technical discussions about your experience\n3. **Problem Solving**: Show how you approach complex problems methodically\n4. **Culture Fit**: Demonstrate passion for creating amazing user experiences\n\nApple values candidates who can think differently and challenge the status quo. What specific role are you targeting?";
    }
    
    if (msg.includes('netflix')) {
      return "Netflix has a unique culture focused on high performance:\n\n1. **Culture**: Study the Netflix Culture Deck thoroughly\n2. **Freedom & Responsibility**: Show you can work independently and make good decisions\n3. **Technical Excellence**: Demonstrate expertise in your domain\n4. **Direct Feedback**: Be comfortable giving and receiving honest feedback\n\nNetflix hires only 'A-players' and expects exceptional performance. How familiar are you with their culture principles?";
    }
    
    if (msg.includes('system design') || msg.includes('design')) {
      return "System design interviews test your ability to architect large-scale systems. Here's a structured approach:\n\n1. **Clarify Requirements**: Ask about scale, features, and constraints\n2. **High-Level Design**: Start with basic components and data flow\n3. **Deep Dive**: Discuss database design, APIs, and key algorithms\n4. **Scale**: Address bottlenecks and scaling strategies\n5. **Wrap Up**: Discuss monitoring, security, and edge cases\n\nCommon topics: Chat systems, URL shorteners, social media feeds, video streaming. Which would you like to practice?";
    }
    
    if (msg.includes('coding') || msg.includes('algorithm') || msg.includes('dsa')) {
      return "For coding interviews, focus on these key areas:\n\n1. **Data Structures**: Arrays, LinkedLists, Trees, Graphs, Hash Tables\n2. **Algorithms**: Sorting, Searching, DFS/BFS, Dynamic Programming\n3. **Problem-Solving**: Break down problems, consider edge cases\n4. **Communication**: Explain your thought process clearly\n5. **Optimization**: Analyze time/space complexity\n\nPractice on LeetCode, focusing on medium-level problems. Start with patterns like Two Pointers, Sliding Window, and Tree Traversals. Need help with a specific topic?";
    }
    
    if (msg.includes('behavioral') || msg.includes('star')) {
      return "Behavioral interviews assess your soft skills and cultural fit. Use the STAR method:\n\n**S**ituation: Set the context\n**T**ask: Explain your responsibility\n**A**ction: Describe what you did\n**R**esult: Share the outcome and learnings\n\nCommon questions:\n- Tell me about a challenging project\n- Describe a time you disagreed with your manager\n- How do you handle tight deadlines?\n- Give an example of leadership\n\nPrepare 5-7 diverse stories that showcase different skills. Want to practice with a specific scenario?";
    }
    
    if (msg.includes('mock interview') || msg.includes('practice')) {
      return "Great idea! Mock interviews are crucial for preparation. Here's how we can practice:\n\n1. **Coding Mock**: I can give you a problem to solve step-by-step\n2. **System Design Mock**: We can design a system together\n3. **Behavioral Mock**: I can ask you behavioral questions\n4. **Company-Specific**: Focus on a particular company's style\n\nWhich type would you like to start with? I'll provide real-time feedback and suggestions for improvement.";
    }
    
    if (msg.includes('salary') || msg.includes('negotiation')) {
      return "Salary negotiation is crucial for maximizing your offer:\n\n1. **Research**: Know market rates for your role and location\n2. **Multiple Offers**: Having competing offers strengthens your position\n3. **Total Compensation**: Consider base salary, equity, bonuses, and benefits\n4. **Timing**: Negotiate after receiving the offer, not during interviews\n5. **Be Professional**: Express enthusiasm while advocating for fair compensation\n\nFor MAANG companies, total compensation often includes significant equity. Research levels.fyi for accurate data. Need help with negotiation strategies?";
    }
    
    if (msg.includes('timeline') || msg.includes('how long')) {
      return "Interview preparation timeline depends on your current level:\n\n**3-6 months** (Recommended):\n- Month 1-2: DSA fundamentals and easy problems\n- Month 3-4: Medium problems and system design basics\n- Month 5-6: Hard problems, mock interviews, behavioral prep\n\n**1-2 months** (Intensive):\n- Focus on your weak areas\n- Daily coding practice\n- Weekly mock interviews\n- Company-specific preparation\n\nConsistency is key - better to study 1-2 hours daily than cramming. What's your current timeline?";
    }
    
    // Default responses for general queries
    if (msg.includes('help') || msg.includes('start')) {
      return "I'm here to help you succeed in your MAANG interviews! I can assist with:\n\n🔹 **Company-specific preparation** (Meta, Amazon, Apple, Netflix, Google)\n🔹 **Technical topics** (DSA, System Design, Coding)\n🔹 **Behavioral interviews** (STAR method, leadership stories)\n🔹 **Mock interviews** (Practice with real-time feedback)\n🔹 **Study plans** (Customized preparation timelines)\n\nWhat specific area would you like to focus on today?";
    }
    
    // Fallback response
    return "That's a great question! While I can provide guidance on interview preparation, I'd recommend being more specific about what you'd like to focus on. For example:\n\n- 'Help me prepare for Meta system design interviews'\n- 'What coding patterns should I focus on for Google?'\n- 'Can you give me behavioral questions for Amazon?'\n- 'I want to practice a mock interview'\n\nWhat specific aspect of interview preparation interests you most?";
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: getAIResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
  };

  const handleVideoToggle = () => {
    setIsVideoCall(!isVideoCall);
    // In a real app, this would start/stop video call
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
          <p className="text-gray-600">Get personalized guidance for your interview preparation</p>
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
                  <p className="text-sm text-white/80">Ready to help you succeed</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleVoiceToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
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
                <p className="text-white/80">Video call would appear here</p>
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

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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