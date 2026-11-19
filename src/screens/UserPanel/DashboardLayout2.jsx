import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Screen/UserPanel/Sidebar';
import Header3 from '../../components/Screen/UserPanel/Header3';
import Breadcrumb from '../../components/Screen/UserPanel/BreadCrumb';

const DashboardLayout2 = () => {
    // State to manage the sidebar's visibility on mobile
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="bg-[#020817] text-white flex h-screen overflow-hidden relative selection:bg-cyan-500 selection:text-black">
            {/* Ambient Cosmic Glow Blobs identical to Landing Page */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
            
            {/* Tech Grid Background Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)",
              }}
            />

            {/* Sidebar for both Desktop and Mobile */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Backdrop Overlay */}
            <div 
                onClick={() => setSidebarOpen(false)}
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
            ></div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-10">
                <div className="px-3 sm:px-6 pt-2.5 sm:pt-3.5">
                    <Header3 
                        onMenuClick={() => setSidebarOpen(true)} 
                        hideSidebar={false}
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
