import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

// Importing the localized styles
import './client-layout.css';
import './learners-layout.css'; // Keep if you want fallback/shared utilities accessible
import './prof-layout.css';

const ProfessorLayout = ({ children, currentPage }) => {
  
  useEffect(() => {
    // 1. When a professor page loads, add the data-role attribute to the body
    document.body.setAttribute('data-role', 'prof');
    
    // 2. Cleanup: When the user navigates away to a non-professor page, remove it.
    // This strictly isolates your CSS so body[data-role="prof"] only triggers here.
    return () => {
      document.body.removeAttribute('data-role');
    };
  }, []);

  useEffect(() => {
    // Dev helper: rewrite any <img src="/assets/..."> to Vite-served /src/assets/ so images load
    // This keeps your existing absolute paths working in the dev server without copying assets.
    const fixAssets = () => {
      document.querySelectorAll('img').forEach((img) => {
        const raw = img.getAttribute('src');
        if (raw && raw.startsWith('/assets/')) {
          img.setAttribute('src', `/src${raw}`);
        }
      });
    };

    // Run immediately and also after a short delay (in case images are injected later)
    fixAssets();
    const t = setTimeout(fixAssets, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dashboard">
      <Sidebar currentPage={currentPage} />
      
      <section className="right-container">
        <Topbar />
        
        <div className="prof-content">
          {/* Inject the specific page content here */}
          {children}
          <Footer />
        </div>
        
      </section>
    </div>
  );
};

export default ProfessorLayout;