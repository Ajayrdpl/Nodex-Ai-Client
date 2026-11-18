import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import bgImage from '/bg.webp'; 
import Sidebar from '../../components/Screen/UserPanel/Sidebar';
import Header3 from '../../components/Screen/UserPanel/Header3';
import Breadcrumb from '../../components/Screen/UserPanel/BreadCrumb';
import { AuthenticatedUserRouters } from '../../constants/routes';

const DashboardLayout2 = () => {
    // State to manage the sidebar's visibility on mobile
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const role = useSelector((state) => state?.isLoggedUser?.role);

    // Remove sidebar on User Dashboard per user request
    const isUserDashboard = role === "USER" && (
        location.pathname === AuthenticatedUserRouters.DASHBOARD ||
        location.pathname === "/" ||
        location.pathname === "/user" ||
        location.pathname === "/user/" ||
        location.pathname === "/user/dashboard"
    );

    return (
        <div
            style={{ '--bg-image-url': `url(${bgImage})` }}
            className="bg-rich-black text-hero-primary flex h-screen overflow-hidden main-bg-image"
        >
            {!isUserDashboard && (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            )}
            {!isUserDashboard && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className={`fixed inset-0 bg-black/75 backdrop-blur-xs z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                ></div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
                <div className="px-3 sm:px-6 pt-2.5 sm:pt-3.5">
                    <Header3 
                        onMenuClick={() => setSidebarOpen(true)} 
                        hideSidebar={isUserDashboard}
                    />
                    <Breadcrumb />
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-6 custom-scrollbar">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout2;