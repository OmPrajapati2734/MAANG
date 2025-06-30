export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'dsa' | 'system-design' | 'behavioral' | 'company-specific';
}

export const quizzes = {
  'dsa-basics': {
    id: 'dsa-basics',
    title: 'Data Structures & Algorithms Basics',
    description: 'Test your understanding of fundamental DSA concepts',
    timeLimit: 30,
    questions: [
      {
        id: 'dsa-1',
        question: 'What is the time complexity of searching in a balanced binary search tree?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'In a balanced BST, the height is log n, so search operations take O(log n) time.',
        difficulty: 'medium' as const,
        category: 'dsa' as const
      },
      {
        id: 'dsa-2',
        question: 'Which data structure is best for implementing a LRU cache?',
        options: ['Array', 'LinkedList', 'HashMap + DoublyLinkedList', 'Stack'],
        correctAnswer: 2,
        explanation: 'HashMap provides O(1) access while DoublyLinkedList allows O(1) insertion/deletion for LRU operations.',
        difficulty: 'hard' as const,
        category: 'dsa' as const
      },
      {
        id: 'dsa-3',
        question: 'What is the space complexity of merge sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'Merge sort requires O(n) extra space for the temporary arrays used during merging.',
        difficulty: 'medium' as const,
        category: 'dsa' as const
      }
    ]
  },
  'system-design-fundamentals': {
    id: 'system-design-fundamentals',
    title: 'System Design Fundamentals',
    description: 'Core concepts for designing scalable systems',
    timeLimit: 25,
    questions: [
      {
        id: 'sd-1',
        question: 'What is the primary purpose of a load balancer?',
        options: ['Data storage', 'Request distribution', 'Data encryption', 'User authentication'],
        correctAnswer: 1,
        explanation: 'Load balancers distribute incoming requests across multiple servers to ensure no single server is overwhelmed.',
        difficulty: 'easy' as const,
        category: 'system-design' as const
      },
      {
        id: 'sd-2',
        question: 'Which consistency model does Amazon S3 provide?',
        options: ['Strong consistency', 'Eventual consistency', 'Causal consistency', 'Sequential consistency'],
        correctAnswer: 0,
        explanation: 'Amazon S3 provides strong consistency for all operations since December 2020.',
        difficulty: 'medium' as const,
        category: 'system-design' as const
      }
    ]
  },
  'behavioral-interview': {
    id: 'behavioral-interview',
    title: 'Behavioral Interview Preparation',
    description: 'Practice common behavioral interview scenarios',
    timeLimit: 20,
    questions: [
      {
        id: 'beh-1',
        question: 'When describing a challenging project, which framework should you use?',
        options: ['SMART', 'STAR', 'SWOT', 'PDCA'],
        correctAnswer: 1,
        explanation: 'STAR (Situation, Task, Action, Result) is the standard framework for behavioral interview responses.',
        difficulty: 'easy' as const,
        category: 'behavioral' as const
      },
      {
        id: 'beh-2',
        question: 'What should you emphasize when discussing a team conflict?',
        options: ['Who was wrong', 'Your leadership role', 'Resolution and learning', 'Management involvement'],
        correctAnswer: 2,
        explanation: 'Focus on how you resolved the conflict and what you learned, showing growth and problem-solving skills.',
        difficulty: 'medium' as const,
        category: 'behavioral' as const
      }
    ]
  }
};

export const practiceQuestions = {
  dsa: [
    {
      id: 'dsa-practice-1',
      title: 'Two Sum Problem',
      difficulty: 'Easy',
      description: 'Given an array of integers and a target sum, return indices of two numbers that add up to the target.',
      tags: ['Array', 'Hash Table'],
      solution: 'Use a hash map to store complements and their indices for O(n) solution.'
    },
    {
      id: 'dsa-practice-2',
      title: 'Merge Intervals',
      difficulty: 'Medium',
      description: 'Given a collection of intervals, merge all overlapping intervals.',
      tags: ['Array', 'Sorting'],
      solution: 'Sort intervals by start time, then iterate and merge overlapping ones.'
    },
    {
      id: 'dsa-practice-3',
      title: 'Binary Tree Maximum Path Sum',
      difficulty: 'Hard',
      description: 'Find the maximum path sum in a binary tree where path can start and end at any nodes.',
      tags: ['Tree', 'DFS', 'Recursion'],
      solution: 'Use DFS with global maximum tracking, considering paths through each node.'
    }
  ],
  systemDesign: [
    {
      id: 'sd-practice-1',
      title: 'Design a Chat System',
      difficulty: 'Medium',
      description: 'Design a real-time chat application like WhatsApp or Slack.',
      tags: ['WebSocket', 'Database', 'Caching'],
      solution: 'Use WebSocket for real-time messaging, database for persistence, and caching for recent messages.'
    },
    {
      id: 'sd-practice-2',
      title: 'Design Netflix',
      difficulty: 'Hard',
      description: 'Design a video streaming service that can handle millions of users.',
      tags: ['CDN', 'Microservices', 'Load Balancing'],
      solution: 'Use CDN for content delivery, microservices architecture, and sophisticated recommendation systems.'
    }
  ],
  hr: [
    {
      id: 'hr-practice-1',
      title: 'Tell me about yourself',
      difficulty: 'Medium',
      description: 'A structured approach to introducing yourself professionally.',
      tags: ['Introduction', 'Career Summary'],
      solution: 'Use present-past-future framework: current role, relevant experience, career goals.'
    },
    {
      id: 'hr-practice-2',
      title: 'Describe a challenging situation',
      difficulty: 'Medium',
      description: 'How to effectively communicate about overcoming professional challenges.',
      tags: ['Problem Solving', 'Leadership'],
      solution: 'Use STAR method: Situation, Task, Action, Result with measurable outcomes.'
    }
  ]
};