import React from 'react';
import { type AnalysisResult, type Sentiment, type Emotion, type BrandSafety } from '../types';
import { Icon } from './Icon';

const SentimentGauge: React.FC<{ sentiment: Sentiment }> = ({ sentiment }) => {
  const getSentimentStyling = () => {
    switch (sentiment.label) {
      case 'Positive':
        return { color: 'text-emerald-400', barBg: 'bg-emerald-500', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
      case 'Negative':
        return { color: 'text-red-400', barBg: 'bg-red-500', icon: 'M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
      default:
        return { color: 'text-amber-400', barBg: 'bg-amber-500', icon: 'M14.5 14h-5M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
    }
  };

  const { color, barBg, icon } = getSentimentStyling();
  const scorePercentage = ((sentiment.score + 1) / 2) * 100;

  return (
    <div className="bg-gray-900/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-lg font-bold ${color} flex items-center gap-2`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
            {sentiment.label} Sentiment
        </h4>
        <div className="text-right">
            <span className="text-2xl font-black text-white">{sentiment.score.toFixed(2)}</span>
            <span className="text-xs text-gray-500 block uppercase tracking-widest">Score</span>
        </div>
      </div>
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-800">
          <div style={{ width: `${scorePercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${barBg} transition-all duration-1000`}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
            <span>-1.0 (Negative)</span>
            <span>0</span>
            <span>+1.0 (Positive)</span>
        </div>
      </div>
    </div>
  );
};

const EmotionCard: React.FC<{ emotion: Emotion }> = ({ emotion }) => {
  const getEmotionDetails = () => {
    const label = emotion.label;
    if (label === 'Happy (Joy)') return { color: 'text-amber-300', iconName: 'joy' };
    if (label === 'Sad') return { color: 'text-blue-400', iconName: 'sadness' };
    if (label === 'Angry') return { color: 'text-red-500', iconName: 'anger' };
    if (label === 'Surprised') return { color: 'text-fuchsia-400', iconName: 'surprise' };
    if (label === 'Disgusted') return { color: 'text-green-500', iconName: 'disgust' }; 
    if (label === 'Fearful') return { color: 'text-indigo-400', iconName: 'fear' };
    return { color: 'text-gray-300', iconName: 'emotion_default' };
  };

  const { color, iconName } = getEmotionDetails();
  const scorePercentage = emotion.score * 100;

  return (
    <div className="bg-gray-900/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-center h-full relative overflow-hidden">
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 bg-current ${color}`}></div>
      <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-black/40 rounded-xl ${color}`}>
                <Icon name={iconName} className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Dominant Emotion</h4>
              <p className={`text-2xl font-bold ${color}`}>{emotion.label}</p>
            </div>
          </div>
          <div className="text-right">
              <span className="text-xl font-bold text-white">{emotion.score.toFixed(2)}</span>
              <span className="text-xs text-gray-500 block uppercase tracking-widest mb-2">Confidence</span>
          </div>
      </div>
      <div className="relative z-10 mt-4 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-gray-600 to-current transition-all duration-1000" style={{ width: `${scorePercentage}%`, color: `var(--tw-text-opacity) ${color}` }}></div>
      </div>
    </div>
  );
};

const BrandSafetyCard: React.FC<{ safety: BrandSafety }> = ({ safety }) => {
    const isSafe = safety.riskLevel === 'Low';
    const isWarn = safety.riskLevel === 'Medium';
    
    const color = isSafe ? 'text-green-400' : isWarn ? 'text-yellow-400' : 'text-red-500';
    const bgGlow = isSafe ? 'bg-green-500/20' : isWarn ? 'bg-yellow-500/20' : 'bg-red-500/20';
    const borderColor = isSafe ? 'border-green-500/30' : isWarn ? 'border-yellow-500/30' : 'border-red-500/30';

    return (
        <div className={`bg-gray-900/40 p-5 rounded-2xl border ${borderColor} hover:bg-gray-800/40 transition-colors col-span-1 lg:col-span-2 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -z-10 ${bgGlow}`}></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full bg-black/50 border border-white/5 ${color}`}>
                        {isSafe ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-1">Corporate Brand Safety</h4>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-2xl font-bold ${color}`}>{safety.riskLevel} Risk</p>
                            <span className="text-sm font-medium text-gray-500">({safety.score}/100 Safe)</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full bg-black/30 p-4 rounded-xl border border-white/5">
                    {safety.flags.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            {safety.flags.map((flag, idx) => (
                                <li key={idx} className="text-red-300">{flag}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-green-400/80 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Clear for all corporate channels. No toxic elements detected.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AnalysisResultDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  return (
    <div className="bg-[#1a1d24]/90 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl animate-fade-in-up mt-8">
      
      {/* Header Section */}
      <div className="border-b border-gray-800 pb-6 mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl text-blue-500">
                <Icon name="analysis" className="w-6 h-6"/>
            </div>
            Media Insights Report
          </h2>
          <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-gray-400 text-sm font-mono tracking-wider text-green-400">ANALYSIS COMPLETE</span>
          </div>
      </div>

      {/* Executive Summary */}
      {result.executiveSummary && (
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-l-4 border-blue-500 p-6 rounded-r-2xl mb-8 relative group">
             <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Icon name="sparkles" className="w-12 h-12 text-blue-400" />
             </div>
             <h3 className="text-lg font-bold text-blue-400 mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                 Executive Summary
             </h3>
             <p className="text-gray-300 leading-relaxed z-10 relative">
                 {result.executiveSummary}
             </p>
          </div>
      )}
      
      {/* Grid Layout for Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SentimentGauge sentiment={result.sentiment} />
        <EmotionCard emotion={result.emotion} />
        <BrandSafetyCard safety={result.brandSafety} />
      </div>

      {/* Predicted Audience Reaction Section */}
      <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-gray-900/50 p-8 rounded-3xl border border-purple-500/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-purple-600/20 transition-colors duration-700"></div>
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 z-10 relative">
             <div className="flex-1">
                 <h3 className="text-sm font-bold tracking-widest text-purple-300 uppercase mb-4 flex items-center gap-2">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     {result.targetPlatform ? `${result.targetPlatform} Virality Predictor` : 'Social Media Predictor'}
                 </h3>
                 <p className="text-xl font-bold text-white leading-tight mb-4">
                     "{result.audienceReaction.prediction}"
                 </p>
                 {result.targetDemographic && (
                     <div className="mb-6 inline-block bg-purple-500/20 text-purple-200 text-sm font-medium px-4 py-1.5 rounded-full border border-purple-500/30 shadow-inner">
                         Tailored for <span className="font-bold text-white">{result.targetDemographic}</span>
                     </div>
                 )}
                 
                 <div className="w-full">
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-sm text-gray-400 font-medium">Estimated Growth / Engagement Potential</span>
                         <span className="text-white font-black text-xl">{result.audienceReaction.growthPercent}<span className="text-purple-400">%</span></span>
                     </div>
                     <div className="w-full bg-gray-800/80 h-3 rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${result.audienceReaction.growthPercent}%` }}></div>
                     </div>
                 </div>
             </div>

             <div className="w-full md:w-auto min-w-[250px] bg-black/30 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                 <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Predicted Keywords</h4>
                 <div className="flex flex-wrap gap-2">
                     {result.audienceReaction.keywords.map((keyword, index) => (
                         <span key={index} className="bg-purple-500/10 text-purple-300 text-sm font-semibold px-4 py-2 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                             #{keyword}
                         </span>
                     ))}
                 </div>
             </div>
         </div>
      </div>
      
    </div>
  );
};