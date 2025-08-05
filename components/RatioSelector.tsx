
import React from 'react';
import { ASPECT_RATIOS } from '../constants';
import Icon from './Icon';

interface RatioSelectorProps {
  onRatioSelected: (ratio: number) => void;
}

const RatioSelector: React.FC<RatioSelectorProps> = ({ onRatioSelected }) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-6">
        <div className="flex items-center gap-3 text-2xl font-bold text-gray-200">
            <Icon icon="crop" className="w-8 h-8 text-indigo-400"/>
            <h2>Choose an Aspect Ratio</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            {ASPECT_RATIOS.map(({ name, value }) => (
                <button
                    key={name}
                    onClick={() => onRatioSelected(value)}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-center font-medium text-gray-300 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    {name}
                </button>
            ))}
        </div>
    </div>
  );
};

export default RatioSelector;
