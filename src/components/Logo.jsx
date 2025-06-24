import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: { container: 'w-6 h-6', text: 'text-sm' },
    default: { container: 'w-8 h-8', text: 'text-xl' },
    large: { container: 'w-10 h-10', text: 'text-2xl' }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size].container} bg-[#7C3AED] rounded flex items-center justify-center`}>
        <svg 
          className="w-2/3 h-2/3 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
      </div>
      <span className={`${sizeClasses[size].text} font-bold text-gray-900`}>PersonaPost AI</span>
    </div>
  );
};

export default Logo;
