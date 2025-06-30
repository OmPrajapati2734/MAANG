-- Insert sample questions
INSERT INTO questions (title, description, difficulty, category, company, options, correct_answer, explanation, tags, created_at, updated_at)
VALUES 
  (
    'Two Sum Problem',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'easy',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use a hash map to store the complement of each number and its index. For each number, check if its complement exists in the hash map.',
    ARRAY['array', 'hash-table', 'two-pointers'],
    now(),
    now()
  ),
  (
    'Design a Chat System',
    'Design a real-time chat application that can handle millions of users like WhatsApp or Slack.',
    'hard',
    'system-design',
    NULL,
    NULL,
    NULL,
    'Key components: WebSocket connections for real-time messaging, message queues for reliability, database sharding for scalability, CDN for media files.',
    ARRAY['system-design', 'websockets', 'scalability'],
    now(),
    now()
  ),
  (
    'Tell me about a time you disagreed with your manager',
    'Behavioral question to assess conflict resolution and communication skills.',
    'medium',
    'behavioral',
    'Amazon',
    '["Describe the situation and disagreement clearly", "Explain how you approached the conversation respectfully", "Share the outcome and what you learned", "Focus on the process rather than who was right"]'::jsonb,
    2,
    'Use the STAR method (Situation, Task, Action, Result) and focus on how you handled the disagreement professionally while maintaining a good working relationship.',
    ARRAY['behavioral', 'conflict-resolution', 'communication'],
    now(),
    now()
  ),
  (
    'Meta Specific: How would you improve Facebook News Feed?',
    'Product design question specific to Meta focusing on user engagement and content relevance.',
    'hard',
    'company-specific',
    'Meta',
    '["Analyze current user engagement metrics", "Implement better content filtering algorithms", "Add more personalization features", "Focus on reducing misinformation"]'::jsonb,
    1,
    'Start by understanding current pain points, then propose data-driven solutions that align with Meta''s goals of meaningful social interactions.',
    ARRAY['product-design', 'meta', 'algorithms'],
    now(),
    now()
  ),
  (
    'Reverse a Linked List',
    'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    'easy',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use three pointers: prev, current, and next. Iterate through the list and reverse the links.',
    ARRAY['linked-list', 'pointers', 'iteration'],
    now(),
    now()
  ),
  (
    'Design URL Shortener',
    'Design a URL shortening service like bit.ly or tinyurl.com.',
    'medium',
    'system-design',
    NULL,
    NULL,
    NULL,
    'Key components: Base62 encoding, database design for URL mapping, caching layer, rate limiting, analytics.',
    ARRAY['system-design', 'encoding', 'caching'],
    now(),
    now()
  ),
  (
    'Why do you want to work at Google?',
    'Common interview question to assess motivation and company knowledge.',
    'easy',
    'behavioral',
    'Google',
    '["Research the company mission and values", "Connect your skills to their needs", "Show genuine enthusiasm", "Mention specific products or initiatives"]'::jsonb,
    1,
    'Research Google''s mission, recent projects, and culture. Connect your personal goals and values with what Google stands for.',
    ARRAY['behavioral', 'motivation', 'company-research'],
    now(),
    now()
  ),
  (
    'Apple Design Philosophy Question',
    'How would you design a feature that embodies Apple''s design principles?',
    'medium',
    'company-specific',
    'Apple',
    '["Focus on simplicity and elegance", "Prioritize user experience over features", "Consider the entire ecosystem", "Think about accessibility"]'::jsonb,
    0,
    'Apple values simplicity, elegance, and user-centered design. Focus on how the feature would integrate seamlessly into the Apple ecosystem.',
    ARRAY['design', 'apple', 'user-experience'],
    now(),
    now()
  ),
  (
    'Netflix Culture Question',
    'How do you handle feedback and criticism?',
    'medium',
    'behavioral',
    'Netflix',
    '["Show openness to feedback", "Demonstrate growth mindset", "Provide specific examples", "Explain how you implement changes"]'::jsonb,
    0,
    'Netflix values direct feedback and continuous improvement. Show how you actively seek and apply feedback.',
    ARRAY['behavioral', 'feedback', 'growth'],
    now(),
    now()
  ),
  (
    'Binary Tree Maximum Path Sum',
    'Given a non-empty binary tree, find the maximum path sum.',
    'hard',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use DFS with a global maximum variable. For each node, calculate the maximum path sum that includes that node.',
    ARRAY['tree', 'dfs', 'recursion'],
    now(),
    now()
  )
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, description, type, url, company, step_id, created_at, updated_at)
VALUES 
  (
    'Meta System Design Interview Guide',
    'Comprehensive guide covering Meta''s system design interview process and expectations.',
    'article',
    'https://example.com/meta-system-design',
    'Meta',
    'meta-3',
    now(),
    now()
  ),
  (
    'Amazon Leadership Principles Deep Dive',
    'Video series explaining Amazon''s 16 leadership principles with real examples.',
    'video',
    'https://example.com/amazon-leadership',
    'Amazon',
    'amazon-1',
    now(),
    now()
  ),
  (
    'Cracking the Coding Interview',
    'Essential book for technical interview preparation covering algorithms and data structures.',
    'book',
    'https://example.com/ctci',
    NULL,
    NULL,
    now(),
    now()
  ),
  (
    'Google Interview Preparation Course',
    'Complete online course covering Google''s interview process from start to finish.',
    'course',
    'https://example.com/google-course',
    'Google',
    'google-1',
    now(),
    now()
  ),
  (
    'Apple Design Philosophy',
    'Understanding Apple''s approach to product design and user experience.',
    'article',
    'https://example.com/apple-design',
    'Apple',
    'apple-1',
    now(),
    now()
  ),
  (
    'Netflix Culture Deck',
    'Deep dive into Netflix''s unique culture and values.',
    'article',
    'https://example.com/netflix-culture',
    'Netflix',
    'netflix-1',
    now(),
    now()
  ),
  (
    'System Design Fundamentals',
    'Core concepts for designing scalable distributed systems.',
    'course',
    'https://example.com/system-design-fundamentals',
    NULL,
    NULL,
    now(),
    now()
  ),
  (
    'Behavioral Interview Mastery',
    'Complete guide to acing behavioral interviews with the STAR method.',
    'video',
    'https://example.com/behavioral-interviews',
    NULL,
    NULL,
    now(),
    now()
  ),
  (
    'Data Structures and Algorithms in Python',
    'Comprehensive resource for mastering DSA concepts with Python examples.',
    'book',
    'https://example.com/dsa-python',
    NULL,
    NULL,
    now(),
    now()
  ),
  (
    'Meta Engineering Blog',
    'Latest insights from Meta''s engineering team on scalable systems.',
    'article',
    'https://engineering.fb.com',
    'Meta',
    NULL,
    now(),
    now()
  )
ON CONFLICT DO NOTHING;