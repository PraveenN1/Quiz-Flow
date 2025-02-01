import React from 'react'

const Button = ({ children, className = "", ...props }) => (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${
          props.disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md hover:shadow-lg"
        } 
        ${className}`}
      {...props}
    >
      {children}
    </button>
);


export default Button