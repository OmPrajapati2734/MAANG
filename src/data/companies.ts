export const companies = [
  {
    id: 'meta',
    name: 'Meta',
    logo: '🔵',
    color: 'from-blue-500 to-blue-600',
    description: 'Prepare for Meta (Facebook) interviews with focus on behavioral, system design, and coding challenges.'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '🟠',
    color: 'from-orange-500 to-orange-600',
    description: 'Master Amazon\'s leadership principles and technical interviews with comprehensive preparation.'
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    color: 'from-gray-700 to-gray-800',
    description: 'Excel in Apple interviews with design thinking, technical depth, and innovation focus.'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🔴',
    color: 'from-red-500 to-red-600',
    description: 'Navigate Netflix\'s culture-focused interviews and technical challenges effectively.'
  },
  {
    id: 'google',
    name: 'Google',
    logo: '🟢',
    color: 'from-green-500 to-green-600',
    description: 'Ace Google interviews with algorithmic thinking, system design, and Googleyness.'
  }
];

export const roadmaps = {
  meta: [
    {
      id: 'meta-1',
      title: 'Company Research & Culture',
      description: 'Understand Meta\'s mission, values, and recent developments',
      duration: '2-3 days',
      resources: [
        'Meta\'s mission and vision statement',
        'Recent Meta news and product launches',
        'Meta engineering blog posts'
      ]
    },
    {
      id: 'meta-2',
      title: 'Data Structures & Algorithms',
      description: 'Master core DSA concepts commonly tested at Meta',
      duration: '2-3 weeks',
      resources: [
        'Arrays and strings manipulation',
        'Graph algorithms (BFS, DFS)',
        'Dynamic programming patterns'
      ]
    },
    {
      id: 'meta-3',
      title: 'System Design Fundamentals',
      description: 'Learn system design principles for Meta-scale applications',
      duration: '1-2 weeks',
      resources: [
        'Scalability concepts',
        'Database design patterns',
        'Caching strategies'
      ]
    },
    {
      id: 'meta-4',
      title: 'Behavioral Interview Prep',
      description: 'Practice Meta\'s behavioral interview questions and frameworks',
      duration: '1 week',
      resources: [
        'STAR method for storytelling',
        'Meta\'s core values alignment',
        'Leadership and teamwork examples'
      ]
    }
  ],
  amazon: [
    {
      id: 'amazon-1',
      title: 'Leadership Principles Deep Dive',
      description: 'Master Amazon\'s 16 Leadership Principles with concrete examples',
      duration: '1 week',
      resources: [
        'Customer Obsession examples',
        'Ownership and Dive Deep scenarios',
        'Invent and Simplify stories'
      ]
    },
    {
      id: 'amazon-2',
      title: 'Coding Interview Preparation',
      description: 'Focus on Amazon\'s preferred coding patterns and complexity',
      duration: '2-3 weeks',
      resources: [
        'Tree and graph problems',
        'String manipulation challenges',
        'Optimization problems'
      ]
    },
    {
      id: 'amazon-3',
      title: 'System Design for Scale',
      description: 'Learn to design systems at Amazon\'s massive scale',
      duration: '2 weeks',
      resources: [
        'Microservices architecture',
        'AWS services integration',
        'High availability patterns'
      ]
    },
    {
      id: 'amazon-4',
      title: 'Mock Interviews & Practice',
      description: 'Simulate real Amazon interview scenarios',
      duration: '1 week',
      resources: [
        'Behavioral question practice',
        'Technical problem solving',
        'System design walkthroughs'
      ]
    }
  ],
  apple: [
    {
      id: 'apple-1',
      title: 'Apple\'s Design Philosophy',
      description: 'Understand Apple\'s approach to product design and innovation',
      duration: '3-4 days',
      resources: [
        'Apple\'s design principles',
        'User experience focus',
        'Innovation case studies'
      ]
    },
    {
      id: 'apple-2',
      title: 'Technical Depth & Breadth',
      description: 'Prepare for Apple\'s technical interview style',
      duration: '2-3 weeks',
      resources: [
        'Low-level programming concepts',
        'Performance optimization',
        'Hardware-software integration'
      ]
    },
    {
      id: 'apple-3',
      title: 'Problem Solving Approach',
      description: 'Master Apple\'s structured problem-solving methodology',
      duration: '1-2 weeks',
      resources: [
        'Breaking down complex problems',
        'Creative solution generation',
        'Trade-off analysis'
      ]
    },
    {
      id: 'apple-4',
      title: 'Communication & Collaboration',
      description: 'Develop Apple-style communication and teamwork skills',
      duration: '1 week',
      resources: [
        'Clear technical communication',
        'Cross-functional collaboration',
        'Presentation skills'
      ]
    }
  ],
  netflix: [
    {
      id: 'netflix-1',
      title: 'Netflix Culture & Values',
      description: 'Deep dive into Netflix\'s unique culture and expectations',
      duration: '2-3 days',
      resources: [
        'Netflix culture deck study',
        'Freedom and responsibility principle',
        'High performance culture'
      ]
    },
    {
      id: 'netflix-2',
      title: 'Streaming Technology Stack',
      description: 'Understand Netflix\'s technical architecture and challenges',
      duration: '1-2 weeks',
      resources: [
        'Video streaming fundamentals',
        'Content delivery networks',
        'Microservices at scale'
      ]
    },
    {
      id: 'netflix-3',
      title: 'Data-Driven Decision Making',
      description: 'Learn Netflix\'s approach to data and experimentation',
      duration: '1 week',
      resources: [
        'A/B testing methodologies',
        'Analytics and metrics',
        'Machine learning applications'
      ]
    },
    {
      id: 'netflix-4',
      title: 'Innovation & Creativity',
      description: 'Prepare for Netflix\'s innovation-focused interviews',
      duration: '1 week',
      resources: [
        'Creative problem solving',
        'Industry trend analysis',
        'Product innovation examples'
      ]
    }
  ],
  google: [
    {
      id: 'google-1',
      title: 'Google\'s Mission & Products',
      description: 'Comprehensive understanding of Google\'s ecosystem',
      duration: '2-3 days',
      resources: [
        'Google\'s mission statement',
        'Product suite overview',
        'Recent Google innovations'
      ]
    },
    {
      id: 'google-2',
      title: 'Algorithmic Thinking',
      description: 'Master Google\'s algorithm-heavy interview style',
      duration: '3-4 weeks',
      resources: [
        'Advanced algorithms',
        'Complexity analysis',
        'Optimization techniques'
      ]
    },
    {
      id: 'google-3',
      title: 'Large Scale Systems',
      description: 'Design systems for Google-scale traffic and data',
      duration: '2 weeks',
      resources: [
        'Distributed systems concepts',
        'Google\'s infrastructure',
        'Scalability patterns'
      ]
    },
    {
      id: 'google-4',
      title: 'Googleyness & Leadership',
      description: 'Demonstrate Google\'s cultural fit and leadership potential',
      duration: '1 week',
      resources: [
        'Googleyness characteristics',
        'Leadership scenarios',
        'Collaboration examples'
      ]
    }
  ]
};