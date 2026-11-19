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
        <div className="mb-2.5">
            <p className="text-slate-400 text-xs font-mono font-medium flex items-center gap-1.5">
                <Link to={dashboardPath} className="text-cyan-400 hover:text-amber-300 font-bold transition-colors">
                    Dashboard
                </Link>
                <span className="text-cyan-500/40">/</span>
                <span className="text-white font-black tracking-wide font-['Orbitron',sans-serif]">{generateBreadcrumb()}</span>
            </p>
        </div>
    );
};

export default Breadcrumb;