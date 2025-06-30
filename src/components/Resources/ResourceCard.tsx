import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Video, Book, GraduationCap, Eye } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'book' | 'course';
  url: string | null;
  content: string | null;
  company: string | null;
  step_id: string | null;
}

interface ResourceCardProps {
  resource: Resource;
  showCompany?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, showCompany = false }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'video': return Video;
      case 'book': return Book;
      case 'course': return GraduationCap;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-blue-600 bg-blue-100';
      case 'video': return 'text-red-600 bg-red-100';
      case 'book': return 'text-green-600 bg-green-100';
      case 'course': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewResource = () => {
    if (resource.url) {
      // Open external link in new tab
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else if (resource.content) {
      // Open content in a modal or new window
      const contentWindow = window.open('', '_blank');
      if (contentWindow) {
        contentWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${resource.title}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 2rem;
                  line-height: 1.6;
                  color: #333;
                }
                h1 {
                  color: #1f2937;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 1rem;
                }
                .meta {
                  background: #f9fafb;
                  padding: 1rem;
                  border-radius: 8px;
                  margin-bottom: 2rem;
                  border-left: 4px solid #3b82f6;
                }
                .content {
                  white-space: pre-wrap;
                  line-height: 1.8;
                }
              </style>
            </head>
            <body>
              <h1>${resource.title}</h1>
              <div class="meta">
                <p><strong>Type:</strong> ${resource.type}</p>
                <p><strong>Description:</strong> ${resource.description}</p>
                ${resource.company ? `<p><strong>Company:</strong> ${resource.company}</p>` : ''}
              </div>
              <div class="content">${resource.content}</div>
            </body>
          </html>
        `);
        contentWindow.document.close();
      }
    }
  };

  const TypeIcon = getTypeIcon(resource.type);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-lg ${getTypeColor(resource.type)} flex items-center justify-center flex-shrink-0`}>
          <TypeIcon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
              {resource.type}
            </span>
            {showCompany && resource.company && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {resource.company}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>
          
          {resource.content && !resource.url && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">{resource.content}</p>
            </div>
          )}
          
          <button
            onClick={handleViewResource}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
          >
            {resource.url ? (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Open Link</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>View Content</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;