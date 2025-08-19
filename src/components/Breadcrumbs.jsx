import { NavLink } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

const Breadcrumbs = () => {
  const breadcrumbs = useBreadcrumbs();

  // Don't show breadcrumbs on the homepage
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-cream border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm font-medium py-2">
          {breadcrumbs.map(({ match, breadcrumb }, index) => (
            <div key={match.pathname} className="flex items-center">
              <NavLink to={match.pathname} className="text-muted hover:text-secondary">
                {breadcrumb}
              </NavLink>
              {index < breadcrumbs.length - 1 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;