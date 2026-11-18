import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MainContent } from '../../../constants/mainContent';
import { AuthenticatedAdminRouters, AuthenticatedUserRouters } from '../../../constants/routes';

const Breadcrumb = () => {
    const location = useLocation();
    const role = useSelector((state) => state?.isLoggedUser?.role);

    // This function converts a URL path like "/smart-games" into "Smart Games"
    const generateBreadcrumb = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        
        if (pathnames.length === 0) {
            return MainContent.appName;
        }

        const currentPage = pathnames[pathnames.length - 1];
        return currentPage
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    const dashboardPath = role === "ADMIN" 
        ? AuthenticatedAdminRouters.ADMIN_DASHBOARD 
        : AuthenticatedUserRouters.DASHBOARD;

    return (
        <div className="mb-2">
            <p className="text-[#848e9c] text-xs font-medium">
                <Link to={dashboardPath} className="hover:text-[#f0b90b] transition-colors">
                    Dashboard
                </Link>
                {" / "}
                <span className="text-[#eaecef] font-semibold">{generateBreadcrumb()}</span>
            </p>
        </div>
    );
};

export default Breadcrumb;