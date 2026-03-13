
import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="text-center py-6 md:py-10 border-b border-gray-700/50 bg-gray-900">
      <div className="flex items-center justify-center gap-4">
        <div className="bg-blue-600 p-3 rounded-full">
          <Icon name="logo" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Media Insight AI
          </h1>
          <p className="text-md text-gray-400 mt-1">
            Content & Sentiment Analysis
          </p>
        </div>
      </div>
    </header>
  );
};
