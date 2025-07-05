/*
  # Sample Data Population
  
  This migration adds sample data for:
  1. Default companies (Meta, Amazon, Apple, Netflix, Google)
  2. Sample questions for each category
  3. Sample resources for learning
  
  This runs after the initial setup to populate the database with useful data.
*/

-- Insert default companies
INSERT INTO companies (name, logo, color, description) VALUES
  ('Meta', '🔵', 'from-blue-500 to-blue-600', 'Prepare for Meta (Facebook) interviews with focus on behavioral, system design, and coding challenges.'),
  ('Amazon', '🟠', 'from-orange-500 to-orange-600', 'Master Amazon''s leadership principles and technical interviews with comprehensive preparation.'),
  ('Apple', '🍎', 'from-gray-700 to-gray-800', 'Excel in Apple interviews with design thinking, technical depth, and innovation focus.'),
  ('Netflix', '🔴', 'from-red-500 to-red-600', 'Navigate Netflix''s culture-focused interviews and technical challenges effectively.'),
  ('Google', '🟢', 'from-green-500 to-green-600', 'Ace Google interviews with algorithmic thinking, system design, and Googleyness.')
ON CONFLICT (name) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (title, description, difficulty, category, company, options, correct_answer, explanation, tags) VALUES 
  (
    'Two Sum Problem',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'easy',
    'dsa',
    NULL,
    NULL,
    NULL,
    'Use a hash map to store the complement of each number and its index. For each number, check if its complement exists in the hash map.',
    ARRAY['array', 'hash-table', 'two-pointers']
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
    ARRAY['system-design', 'websockets', 'scalability']
  ),
  (
    'Tell me about a time you disagreed with your manager',
    'Behavioral question to assess conflict resolution and communication skills.',
    'medium',
    'behavioral',
    'Amazon',
    '["Describe the situation and disagreement clearly", "Explain how you approached the conversation respectfully", "Share the outcome and what you learned", "Focus on the process rather than who was right"]'::jsonb,
    1,
    'Use the STAR method (Situation, Task, Action, Result) and focus on how you handled the disagreement professionally while maintaining a good working relationship.',
    ARRAY['behavioral', 'conflict-resolution', 'communication']
  ),
  (
    'Meta Specific: How would you improve Facebook News Feed?',
    'Product design question specific to Meta focusing on user engagement and content relevance.',
    'hard',
    'company-specific',
    'Meta',
    '["Analyze current user engagement metrics", "Implement better content filtering algorithms", "Add more personalization features", "Focus on reducing misinformation"]'::jsonb,
    0,
    'Start by understanding current pain points, then propose data-driven solutions that align with Meta''s goals of meaningful social interactions.',
    ARRAY['product-design', 'meta', 'algorithms']
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
    ARRAY['linked-list', 'pointers', 'iteration']
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
    ARRAY['system-design', 'encoding', 'caching']
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
    ARRAY['tree', 'dfs', 'recursion']
  )
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (title, description, type, url, company, step_id) VALUES 
  (
    'Meta System Design Interview Guide',
    'Comprehensive guide covering Meta''s system design interview process and expectations.',
    'article',
    'https://engineering.fb.com/2021/03/22/production-engineering/facebook-system-design/',
    'Meta',
    'meta-3'
  ),
  (
    'Amazon Leadership Principles Deep Dive',
    'Complete guide to Amazon''s 16 leadership principles with real examples.',
    'article',
    'https://www.amazon.jobs/en/principles',
    'Amazon',
    'amazon-1'
  ),
  (
    'Cracking the Coding Interview',
    'Essential book for technical interview preparation covering algorithms and data structures.',
    'book',
    'https://www.crackingthecodinginterview.com/',
    NULL,
    NULL
  ),
  (
    'Google Interview Preparation Course',
    'Complete guide to Google''s interview process and culture.',
    'article',
    'https://careers.google.com/how-we-hire/',
    'Google',
    'google-1'
  ),
  (
    'Apple Design Philosophy',
    'Understanding Apple''s approach to product design and user experience.',
    'article',
    'https://developer.apple.com/design/human-interface-guidelines/',
    'Apple',
    'apple-1'
  ),
  (
    'Netflix Culture Deck',
    'Deep dive into Netflix''s unique culture and values.',
    'article',
    'https://jobs.netflix.com/culture',
    'Netflix',
    'netflix-1'
  ),
  (
    'System Design Fundamentals',
    'Core concepts for designing scalable distributed systems.',
    'course',
    'https://github.com/donnemartin/system-design-primer',
    NULL,
    NULL
  ),
  (
    'Behavioral Interview Mastery',
    'Complete guide to acing behavioral interviews with the STAR method.',
    'article',
    'https://www.indeed.com/career-advice/interviewing/how-to-prepare-for-a-behavioral-interview',
    NULL,
    NULL
  ),
  (
    'Data Structures and Algorithms in Python',
    'Comprehensive resource for mastering DSA concepts with Python examples.',
    'book',
    'https://runestone.academy/runestone/books/published/pythonds/index.html',
    NULL,
    NULL
  ),
  (
    'Meta Engineering Blog',
    'Latest insights from Meta''s engineering team on scalable systems.',
    'article',
    'https://engineering.fb.com/',
    'Meta',
    NULL
  )
ON CONFLICT DO NOTHING;