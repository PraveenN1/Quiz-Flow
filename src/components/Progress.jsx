import React from 'react'

const Progress = ({ value }) => (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div
        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
);

export default Progress