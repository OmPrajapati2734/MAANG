import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

const BreadcrumbNavigation: React.FC = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' }
    ];

    // Map path segments to readable labels
    const pathLabels: { [key: string]: string } = {
      dashboard: 'Dashboard',
      practice: 'Practice',
      'system-design': 'System Design',
      'mock-interview': 'Mock Interview',
      resources: 'Resources',
      'success-stories': 'Success Stories',
      mentor: 'AI Mentor',
      goals: 'Goals',
      analytics: 'Analytics',
      github: 'GitHub Sync',
      'resume-review': 'Resume Review',
      admin: 'Admin',
      questions: 'Questions',
      quizzes: 'Quizzes',
      companies: 'Companies',
      roadmap: 'Roadmap'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          
          {breadcrumb.href ? (
            <Link
              to={breadcrumb.href}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{breadcrumb.label}</span>
            </Link>
          ) : (
            <span className={`flex items-center space-x-1 ${
              breadcrumb.isActive ? 'text-gray-900 font-medium' : ''
            }`}>
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{breadcrumb.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;