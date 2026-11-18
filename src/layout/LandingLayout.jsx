import React from 'react';
import Header1 from '../components/UI/Header1';
import Footer1 from '../components/UI/Footer1';

const LandingLayout = ({ inner }) => {
  return (
    <div className="bg-[#020817] min-h-screen text-white selection:bg-cyan-500 selection:text-black">
      <Header1 />
      <main className="w-full overflow-hidden">
        {inner}
      </main>
      <Footer1 />
    </div>
  );
};

export default LandingLayout;