// AI Service for external API integration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_BASE_URL = 'https://api.openai.com/v1';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
}

class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENAI_API_KEY || '';
  }

  async sendMessage(messages: ChatMessage[]): Promise<AIResponse> {
    // Enhanced AI service that can handle any question
    try {
      // If no API key, use enhanced local responses
      if (!this.apiKey) {
        return this.getEnhancedLocalResponse(messages[messages.length - 1].content);
      }

      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert interview coach and software engineering mentor specializing in MAANG (Meta, Amazon, Apple, Netflix, Google) company interviews. You can help with:

- Technical interview preparation (DSA, System Design, Coding)
- Behavioral interview coaching (STAR method, leadership stories)
- Company-specific interview processes and culture
- Career advice and growth strategies
- Mock interviews and practice sessions
- Resume and portfolio optimization
- Salary negotiation strategies
- General software engineering questions

Provide detailed, actionable advice with specific examples. Always be encouraging and supportive while being honest about challenges. If you don't know something specific, acknowledge it and provide the best guidance you can based on general principles.`
            },
            ...messages
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const message = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      return {
        message,
        suggestions: this.generateSuggestions(message)
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getEnhancedLocalResponse(messages[messages.length - 1].content);
    }
  }

  private getEnhancedLocalResponse(userMessage: string): AIResponse {
    const msg = userMessage.toLowerCase();
    
    // Enhanced responses for any type of question
    if (msg.includes('salary') || msg.includes('negotiate') || msg.includes('compensation')) {
      return {
        message: `Here's comprehensive guidance on salary negotiation for tech roles:

**Research Phase**:
- Use Levels.fyi, Glassdoor, and Blind for salary data
- Consider total compensation: base + bonus + equity + benefits
- Research company-specific compensation structures
- Know your market value based on experience and location

**Negotiation Strategy**:
- Always negotiate - companies expect it
- Focus on total compensation, not just base salary
- Have multiple offers to strengthen your position
- Be prepared to justify your ask with data

**What to Negotiate**:
- Base salary (usually 10-20% room)
- Signing bonus (easier to negotiate)
- Equity/RSUs (significant long-term value)
- Start date (can impact vesting schedules)
- Vacation time and benefits

**MAANG-Specific Tips**:
- **Meta/Google**: Strong equity packages, negotiate RSU grants
- **Amazon**: Lower base but high equity, negotiate signing bonus
- **Apple**: Conservative but fair, focus on base salary
- **Netflix**: High cash compensation, limited equity

**Negotiation Scripts**:
- "Based on my research and experience, I was hoping for X"
- "Is there flexibility in the total compensation package?"
- "I'm excited about the role, can we work together on the offer?"`,
        suggestions: [
          "How to research salary ranges",
          "Negotiating with multiple offers",
          "Understanding equity compensation",
          "When to accept vs counter-offer"
        ]
      };
    }

    if (msg.includes('resume') || msg.includes('cv') || msg.includes('portfolio')) {
      return {
        message: `Here's how to create a standout tech resume for MAANG companies:

**Resume Structure**:
1. **Header**: Name, email, phone, LinkedIn, GitHub
2. **Summary**: 2-3 lines highlighting your expertise
3. **Experience**: Focus on impact and achievements
4. **Projects**: 2-3 impressive technical projects
5. **Skills**: Relevant technologies and tools
6. **Education**: Degree, relevant coursework

**Experience Section Best Practices**:
- Use action verbs (Built, Designed, Implemented, Optimized)
- Quantify impact with metrics (improved performance by 40%)
- Follow this format: "Action + Technology + Result"
- Focus on business impact, not just technical details

**Project Section**:
- Include live demos and GitHub links
- Explain the problem you solved
- Highlight technologies used
- Show scalability and best practices

**MAANG-Specific Tips**:
- **Meta**: Emphasize scale and user impact
- **Amazon**: Show ownership and customer obsession
- **Google**: Highlight algorithmic thinking and innovation
- **Apple**: Focus on user experience and design
- **Netflix**: Demonstrate data-driven decisions

**ATS Optimization**:
- Use standard section headers
- Include relevant keywords from job descriptions
- Save as PDF to preserve formatting
- Keep to 1-2 pages maximum`,
        suggestions: [
          "Review my resume format",
          "How to quantify achievements",
          "Technical project descriptions",
          "ATS-friendly formatting tips"
        ]
      };
    }

    if (msg.includes('career') || msg.includes('growth') || msg.includes('promotion')) {
      return {
        message: `Strategic career growth advice for software engineers:

**Career Progression Paths**:
- **Individual Contributor**: Senior → Staff → Principal → Distinguished
- **Management**: Team Lead → Engineering Manager → Director → VP
- **Specialist**: Domain expert in specific areas (ML, Security, etc.)

**Skills for Each Level**:
- **Junior → Mid**: Master fundamentals, deliver features independently
- **Mid → Senior**: Lead projects, mentor others, system design
- **Senior → Staff**: Cross-team impact, technical strategy, architecture
- **Staff+**: Organizational impact, technology vision, industry influence

**Building Your Brand**:
- Contribute to open source projects
- Write technical blog posts
- Speak at conferences and meetups
- Build a strong LinkedIn presence
- Network within and outside your company

**Performance Review Strategy**:
- Document your achievements throughout the year
- Seek feedback regularly, not just during reviews
- Set clear goals with your manager
- Volunteer for high-visibility projects
- Find sponsors and advocates

**Switching Companies for Growth**:
- Every 2-3 years is typical in tech
- Target 20-30% compensation increases
- Look for roles with expanded scope
- Consider company stage (startup vs big tech)
- Evaluate learning opportunities and mentorship`,
        suggestions: [
          "How to get promoted faster",
          "Building technical leadership skills",
          "When to switch companies",
          "Creating a career development plan"
        ]
      };
    }

    if (msg.includes('leetcode') || msg.includes('practice') || msg.includes('coding problem')) {
      return {
        message: `Effective LeetCode and coding practice strategy:

**Study Plan Structure**:
- **Week 1-2**: Arrays, Strings, Hash Tables (Easy problems)
- **Week 3-4**: Linked Lists, Stacks, Queues (Easy to Medium)
- **Week 5-6**: Trees and Graphs (Medium problems)
- **Week 7-8**: Dynamic Programming (Medium to Hard)
- **Week 9-10**: Advanced topics and Hard problems

**Daily Practice Routine**:
- 1-2 problems per day consistently
- Focus on understanding patterns, not memorizing solutions
- Time yourself: 20-30 minutes for Easy, 45 minutes for Medium
- Review solutions and discuss time/space complexity
- Implement multiple approaches when possible

**Problem-Solving Framework**:
1. **Understand**: Read carefully, ask clarifying questions
2. **Plan**: Think of approach before coding
3. **Code**: Write clean, readable solution
4. **Test**: Verify with examples and edge cases
5. **Optimize**: Improve time/space complexity

**Key Patterns to Master**:
- Two Pointers / Sliding Window
- Fast & Slow Pointers
- Merge Intervals
- Cyclic Sort
- Tree BFS/DFS
- Graph algorithms
- Dynamic Programming patterns

**Platform Recommendations**:
- **LeetCode**: Best for interview prep, company-specific questions
- **HackerRank**: Good for fundamentals and contests
- **CodeSignal**: Practice for specific company assessments
- **Pramp**: Mock interviews with peers`,
        suggestions: [
          "Create a 3-month study plan",
          "Master two-pointer technique",
          "Practice dynamic programming",
          "Mock interview preparation"
        ]
      };
    }

    if (msg.includes('system design') || msg.includes('architecture') || msg.includes('scalability')) {
      return {
        message: `Comprehensive system design interview preparation:

**System Design Interview Process**:
1. **Requirements Clarification (5-10 min)**
   - Functional requirements: What features to build?
   - Non-functional: Scale, performance, availability
   - Constraints: Budget, timeline, technology

2. **High-Level Design (10-15 min)**
   - Draw major components and data flow
   - Identify key services and databases
   - Show client-server interactions

3. **Detailed Design (15-20 min)**
   - Database schema and data models
   - API design and endpoints
   - Algorithm choices and data structures

4. **Scale and Optimize (10-15 min)**
   - Identify bottlenecks
   - Caching strategies (Redis, CDN)
   - Load balancing and sharding
   - Monitoring and alerting

**Common System Design Questions**:
- Design a chat system (WhatsApp, Slack)
- Design a social media feed (Facebook, Twitter)
- Design a video streaming service (Netflix, YouTube)
- Design a ride-sharing service (Uber, Lyft)
- Design a URL shortener (bit.ly, tinyurl)

**Key Concepts to Master**:
- **Scalability**: Horizontal vs vertical scaling
- **Reliability**: Fault tolerance, redundancy
- **Consistency**: ACID properties, CAP theorem
- **Performance**: Latency, throughput optimization
- **Security**: Authentication, authorization, encryption

**Technology Stack Knowledge**:
- **Databases**: SQL vs NoSQL, sharding, replication
- **Caching**: Redis, Memcached, CDN
- **Message Queues**: Kafka, RabbitMQ, SQS
- **Load Balancers**: Layer 4 vs Layer 7
- **Monitoring**: Metrics, logging, alerting`,
        suggestions: [
          "Practice designing a chat system",
          "Learn about database sharding",
          "Understand caching strategies",
          "Study load balancing techniques"
        ]
      };
    }

    // General helpful response for any other question
    return {
      message: `I'm here to help you with any interview preparation or career questions! I can assist with:

**Technical Interview Prep**:
🔹 Data Structures & Algorithms practice
🔹 System Design fundamentals and practice
🔹 Coding interview strategies and patterns
🔹 Time/space complexity analysis

**Behavioral Interview Coaching**:
🔹 STAR method for storytelling
🔹 Leadership and teamwork examples
🔹 Conflict resolution scenarios
🔹 Company-specific cultural fit

**Company-Specific Guidance**:
🔹 **Meta**: System design, culture, and behavioral focus
🔹 **Amazon**: Leadership Principles mastery
🔹 **Apple**: Design thinking and technical depth
🔹 **Netflix**: High-performance culture alignment
🔹 **Google**: Algorithmic thinking and "Googleyness"

**Career Development**:
🔹 Resume and portfolio optimization
🔹 Salary negotiation strategies
🔹 Career progression planning
🔹 Networking and personal branding

**Mock Interviews & Practice**:
🔹 Coding interview simulations
🔹 System design walkthroughs
🔹 Behavioral question practice
🔹 Real-time feedback and improvement tips

What specific area would you like to explore? I can provide detailed guidance, practice problems, or help you prepare for any aspect of the interview process. Feel free to ask me anything - from technical concepts to career advice!`,
      suggestions: [
        "Help me prepare for a specific company",
        "Practice coding interview questions",
        "Review system design concepts",
        "Improve my behavioral interview skills"
      ]
    };
  }

  private generateSuggestions(message: string): string[] {
    const suggestions = [];
    
    if (message.includes('system design')) {
      suggestions.push("Practice designing a chat system", "Learn about load balancing", "Study database sharding", "Understand caching strategies");
    } else if (message.includes('coding') || message.includes('algorithm')) {
      suggestions.push("Practice two-pointer problems", "Review tree algorithms", "Study dynamic programming", "Master graph traversals");
    } else if (message.includes('behavioral')) {
      suggestions.push("Prepare STAR stories", "Practice leadership examples", "Work on conflict resolution", "Develop teamwork scenarios");
    } else if (message.includes('salary') || message.includes('career')) {
      suggestions.push("Research salary ranges", "Negotiate total compensation", "Plan career progression", "Build professional network");
    } else {
      suggestions.push(
        "Ask about specific companies",
        "Practice coding problems",
        "Prepare behavioral stories",
        "Schedule mock interviews"
      );
    }
    
    return suggestions.slice(0, 4);
  }

  async generateMockInterview(type: 'coding' | 'system-design' | 'behavioral', company?: string): Promise<any> {
    const prompt = this.getMockInterviewPrompt(type, company);
    
    try {
      const response = await this.sendMessage([
        { role: 'user', content: prompt }
      ]);
      
      return {
        question: response.message,
        type,
        company,
        hints: response.suggestions || []
      };
    } catch (error) {
      console.error('Mock interview generation error:', error);
      return this.getLocalMockInterview(type, company);
    }
  }

  private getMockInterviewPrompt(type: string, company?: string): string {
    const companyContext = company ? ` for ${company}` : '';
    
    switch (type) {
      case 'coding':
        return `Generate a ${type} interview question${companyContext}. Include the problem statement, constraints, and expected approach.`;
      case 'system-design':
        return `Generate a ${type} interview question${companyContext}. Include the requirements and key considerations.`;
      case 'behavioral':
        return `Generate a ${type} interview question${companyContext}. Include the question and what the interviewer is looking for.`;
      default:
        return `Generate an interview question${companyContext}.`;
    }
  }

  private getLocalMockInterview(type: string, company?: string): any {
    const questions = {
      coding: [
        "Implement a function to find the longest substring without repeating characters. Given a string, return the length of the longest substring without repeating characters.",
        "Design a data structure that supports insert, delete, and getRandom operations in O(1) time. Implement RandomizedSet class.",
        "Given a binary tree, find the maximum path sum between any two nodes. The path may start and end at any node in the tree."
      ],
      'system-design': [
        "Design a URL shortening service like bit.ly. Consider scalability, custom URLs, analytics, and rate limiting.",
        "Design a chat application like WhatsApp. Handle real-time messaging, group chats, message delivery, and offline users.",
        "Design a video streaming service like Netflix. Consider content delivery, recommendation system, and global scale."
      ],
      behavioral: [
        "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
        "Describe a situation where you had to learn a new technology quickly. What was your approach?",
        "Give me an example of when you had to make a decision with incomplete information. What was the outcome?"
      ]
    };

    const questionList = questions[type as keyof typeof questions] || questions.coding;
    const randomQuestion = questionList[Math.floor(Math.random() * questionList.length)];

    return {
      question: randomQuestion,
      type,
      company,
      hints: ["Think about edge cases", "Consider time complexity", "Explain your approach clearly", "Test with examples"]
    };
  }
}

export const aiService = new AIService();
export type { ChatMessage, AIResponse };