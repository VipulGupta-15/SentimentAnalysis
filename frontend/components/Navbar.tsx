import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center h-16 gap-8">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md transition-colors font-medium ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`
                        }
                    >
                        Media Insight
                    </NavLink>
                    <NavLink
                        to="/youtube"
                        className={({ isActive }) =>
                            `px-4 py-2 rounded-md transition-colors font-medium ${isActive
                                ? 'bg-red-600/10 text-red-400'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`
                        }
                    >
                        YouTube Analysis
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};
