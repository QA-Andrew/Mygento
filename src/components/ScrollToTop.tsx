import { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="group bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 animate-fade-in"
          title="Наверх"
        >
          {/* Animated arrow icon */}
          <svg 
            className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 15l7-7 7 7" 
            />
          </svg>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full animate-twinkle opacity-60"></div>
            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-twinkle opacity-50" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-cyan-200 rounded-full animate-twinkle opacity-70" style={{animationDelay: '1s'}}></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-pink-200 rounded-full animate-twinkle opacity-60" style={{animationDelay: '1.5s'}}></div>
          </div>

          {/* Pulse ring effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300"></div>
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;