import React from 'react';
import { type AnalysisResult, type Sentiment, type Emotion } from '../types';
import { Icon } from './Icon';

const SentimentIndicator: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
  const getSentimentDetails = () => {
    switch (sentiment.label) {
      case 'Positive':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/50',
          icon: <Icon name="positive" />,
        };
      case 'Negative':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/50',
          icon: <Icon name="negative" />,
        };
      default:
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/50',
          icon: <Icon name="neutral" />,
        };
    }
  };

  const { color, bgColor, icon } = getSentimentDetails();
  const scorePercentage = ((sentiment.score + 1) / 2) * 100;

  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className={`text-3xl ${color}`}>{icon}</div>
        <div>
          <h4 className={`text-md font-semibold ${color}`}>{sentiment.label} Sentiment</h4>
          <p className="text-sm text-gray-400">
            Score: <span className="font-bold text-gray-200">{sentiment.score.toFixed(2)}</span>
          </p>
        </div>
      </div>
       <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${sentiment.label === 'Positive' ? 'bg-green-500' : sentiment.label === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'}`}
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
    </div>
  );
};

const EmotionIndicator: React.FC<{ emotion: Emotion }> = ({ emotion }) => {
  const getEmotionDetails = () => {
    const label = emotion.label.toLowerCase();
    if (label.includes('joy') || label.includes('happy')) return { color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', icon: <Icon name="joy" /> };
    if (label.includes('sad') || label.includes('sorrow')) return { color: 'text-blue-400', bgColor: 'bg-blue-900/50', icon: <Icon name="sadness" /> };
    if (label.includes('anger') || label.includes('angry')) return { color: 'text-red-500', bgColor: 'bg-red-900/50', icon: <Icon name="anger" /> };
    if (label.includes('surprise')) return { color: 'text-purple-400', bgColor: 'bg-purple-900/50', icon: <Icon name="surprise" /> };
    if (label.includes('calm') || label.includes('peace')) return { color: 'text-teal-400', bgColor: 'bg-teal-900/50', icon: <Icon name="calm" /> };
    if (label.includes('fear')) return { color: 'text-indigo-400', bgColor: 'bg-indigo-900/50', icon: <Icon name="fear" /> };
    return { color: 'text-gray-300', bgColor: 'bg-gray-700/50', icon: <Icon name="emotion_default" /> };
  };

  const { color, bgColor, icon } = getEmotionDetails();
  const scorePercentage = emotion.score * 100;

  return (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <div className="flex items-center gap-4">
        <div className={`text-3xl ${color}`}>{icon}</div>
        <div>
          <h4 className={`text-md font-semibold ${color}`}>{emotion.label}</h4>
          <p className="text-sm text-gray-400">
            Confidence: <span className="font-bold text-gray-200">{emotion.score.toFixed(2)}</span>
          </p>
        </div>
      </div>
      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-gray-500 to-current"
          style={{ width: `${scorePercentage}%`, color: `var(${color})` }}
        ></div>
      </div>
    </div>
  );
};


export const AnalysisResultDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl shadow-lg animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Icon name="analysis" />
        Analysis Report
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Sentiment</h3>
                <SentimentIndicator sentiment={result.sentiment} />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Dominant Emotion</h3>
                <EmotionIndicator emotion={result.emotion} />
            </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <Icon name="reaction" className="h-5 w-5"/>
                Predicted Audience Reaction
            </h3>
            <div className="flex flex-wrap gap-2">
                {result.userReaction.map((reaction, index) => (
                    <span key={index} className="bg-blue-900/70 text-blue-300 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">
                        {reaction}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};