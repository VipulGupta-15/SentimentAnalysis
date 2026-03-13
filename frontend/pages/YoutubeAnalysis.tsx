import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader } from '../components/Loader';

// Define types for the API response
interface ChannelInfo {
    channel_title: string;
    video_count: string;
    channel_logo_url: string;
    channel_created_date: string;
    subscriber_count: string;
    channel_description: string;
}

interface VideoStats {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
}

interface SentimentComment {
    username: string;
    text: string;
    compound: number;
}

interface SentimentAnalysis {
    num_neutral: number;
    num_positive: number;
    num_negative: number;
    top_positive?: SentimentComment[];
    top_negative?: SentimentComment[];
    top_neutral?: SentimentComment[];
}

interface ViralityAnalysis {
    score: number;
    verdict: string;
    engagement_rate: number;
    sentiment_ratio: number;
}

interface AnalysisResponse {
    video_id: string;
    channel_info: ChannelInfo;
    video_stats: VideoStats;
    sentiment_analysis: SentimentAnalysis;
    virality_analysis: ViralityAnalysis;
}

export const YoutubeAnalysis: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalysisResponse | null>(null);

    const handleAnalyze = async () => {
        if (!url) return;
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await axios.post('http://localhost:8000/api/analyze-youtube', { url });
            setData(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze video. Please check the URL and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = data ? [
        { name: 'Positive', value: data.sentiment_analysis.num_positive },
        { name: 'Negative', value: data.sentiment_analysis.num_negative },
        { name: 'Neutral', value: data.sentiment_analysis.num_neutral },
    ] : [];

    const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Amber

    const renderCommentSection = (title: string, comments: SentimentComment[] | undefined, colorClass: string, bgColor: string) => {
        if (!comments || comments.length === 0) return null;
        return (
            <div className={`p-6 rounded-2xl shadow-lg border ${bgColor} flex flex-col h-[500px]`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
                    <span className="w-3 h-3 rounded-full bg-current"></span>
                    {title} Comments
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                    {comments.map((c, i) => (
                        <div key={i} className="bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 transition-transform hover:scale-[1.02]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-gray-200 text-sm">@{c.username}</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded-full bg-black/30 ${colorClass}`}>
                                    Score: {c.compound.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm break-words">{c.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col flex-grow bg-[#0f1115] text-gray-200 min-h-screen font-sans selection:bg-red-500/30">
            {/* Header Section */}
            <header className="relative overflow-hidden text-center py-16 md:py-24 border-b border-gray-800 bg-[#0f1115]">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4">
                    <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] transform transition-transform hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight leading-tight mb-4">
                            Deep YouTube Insights
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                            Uncover the true sentiment behind comments, analyze channel metrics, and predict video virality with AI.
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center -mt-8 relative z-20">
                <div className="w-full max-w-6xl space-y-8">
                    {/* Input Section */}
                    <div className="bg-[#1a1d24]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800/50">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste your YouTube Video URL..."
                                className="flex-grow p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder-gray-500 text-gray-200 text-lg shadow-inner outline-none"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading || !url}
                                className="md:w-auto w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.2)] disabled:shadow-none"
                            >
                                {isLoading ? <Loader /> : <span className="text-lg whitespace-nowrap">Analyze Now</span>}
                            </button>
                        </div>
                        {error && (
                            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-xl text-red-400 text-center animate-fade-in">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {data && (
                        <div className="space-y-8 animate-fade-in-up mt-8">
                            
                            {/* Top Stats Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Channel Info */}
                                <div className="lg:col-span-2 bg-[#1a1d24]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-800 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
                                    <img src={data.channel_info.channel_logo_url} alt="Channel Logo" className="w-32 h-32 rounded-full border-4 border-gray-700 shadow-2xl" />
                                    <div className="text-center md:text-left z-10 w-full">
                                        <h2 className="text-3xl font-extrabold text-white mb-2">{data.channel_info.channel_title}</h2>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                                            <span className="bg-gray-800/80 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50 flex items-center shadow-inner">
                                                <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                                                <span className="text-gray-400 mr-2">Subs:</span>
                                                <span className="text-white">{parseInt(data.channel_info.subscriber_count).toLocaleString()}</span>
                                            </span>
                                            <span className="bg-gray-800/80 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-700/50 flex items-center shadow-inner">
                                                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
                                                <span className="text-gray-400 mr-2">Videos:</span>
                                                <span className="text-white">{parseInt(data.channel_info.video_count).toLocaleString()}</span>
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed max-w-2xl">{data.channel_info.channel_description}</p>
                                    </div>
                                </div>

                                {/* Virality Prediction */}
                                <div className="bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-gray-900/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-purple-500/30 relative overflow-hidden flex flex-col justify-center transition-transform hover:-translate-y-1 duration-500">
                                     <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/30 rounded-full blur-[60px]"></div>
                                     <h3 className="text-sm font-bold tracking-widest text-purple-300 uppercase mb-4 flex justify-between items-center z-10">
                                        Virality Score
                                        <span className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs border border-purple-500/30">AI Insights</span>
                                     </h3>
                                     
                                     <div className="flex items-end gap-2 mb-6 z-10">
                                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-200 leading-none">
                                            {data.virality_analysis?.score || 0}
                                        </span>
                                        <span className="text-xl text-purple-400 font-medium pb-1">/100</span>
                                     </div>

                                     <div className="space-y-5 z-10">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Engagement</span>
                                                <span className="text-white font-medium">{data.virality_analysis?.engagement_rate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${Math.min(data.virality_analysis?.engagement_rate, 100)}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-300">Sentiment Quality</span>
                                                <span className="text-white font-medium">{data.virality_analysis?.sentiment_ratio}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${Math.min(data.virality_analysis?.sentiment_ratio, 100)}%` }}></div>
                                            </div>
                                        </div>
                                     </div>

                                     <div className="mt-6 pt-4 border-t border-purple-500/20 z-10">
                                        <p className="text-sm text-gray-400 uppercase tracking-widest text-center">Verdict : <span className="font-bold text-white ml-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">{data.virality_analysis?.verdict}</span></p>
                                     </div>
                                </div>
                            </div>

                            {/* Metrics & Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Video Statistics */}
                                <div className="bg-[#1a1d24]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-800 flex flex-col justify-center transition-transform hover:-translate-y-1 duration-500">
                                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                        <span className="p-2 bg-gray-800 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </span>
                                        Video Metrics
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/40 transition-colors">
                                            <span className="text-gray-400 font-medium">Views</span>
                                            <span className="text-2xl font-bold text-white">{parseInt(data.video_stats.viewCount).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/40 transition-colors">
                                            <span className="text-gray-400 font-medium">Likes</span>
                                            <span className="text-2xl font-bold text-white">{parseInt(data.video_stats.likeCount).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-black/30 p-5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-black/40 transition-colors">
                                            <span className="text-gray-400 font-medium">Comments</span>
                                            <span className="text-2xl font-bold text-white">{parseInt(data.video_stats.commentCount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sentiment Charts */}
                                <div className="lg:col-span-2 bg-[#1a1d24]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-800 transition-transform hover:-translate-y-1 duration-500">
                                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                        <span className="p-2 bg-gray-800 rounded-lg">
                                            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        </span>
                                        Sentiment Distribution
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-72">
                                        {/* Pie Chart */}
                                        <div className="h-full relative bg-gray-900/30 rounded-2xl p-4 border border-white/5">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-md" />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: 'rgba(15, 17, 21, 0.95)', borderColor: '#374151', borderRadius: '12px', color: '#F3F4F6', backdropFilter: 'blur(12px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                                                        itemStyle={{ color: '#F3F4F6', fontWeight: 'bold' }} 
                                                        cursor={{fill: 'transparent'}}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-black text-white drop-shadow-lg">
                                                    {data.sentiment_analysis.num_positive + data.sentiment_analysis.num_negative + data.sentiment_analysis.num_neutral}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Total Comments</span>
                                            </div>
                                        </div>

                                        {/* Bar Chart */}
                                        <div className="h-full bg-gray-900/30 rounded-2xl p-4 border border-white/5">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                                                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                                                    <Tooltip 
                                                        cursor={{fill: 'rgba(255,255,255,0.03)'}} 
                                                        contentStyle={{ backgroundColor: 'rgba(15, 17, 21, 0.95)', borderColor: '#374151', borderRadius: '12px', color: '#F3F4F6', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                                    />
                                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Comments Section */}
                            <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-4">
                                    <div className="p-3 bg-red-600/20 rounded-xl border border-red-500/30 text-red-500">
                                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-white">Audience Voice</h2>
                                        <p className="text-gray-400 text-sm mt-1">Real comments categorized by sentiment</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="transform transition-transform hover:-translate-y-2 duration-500">
                                        {renderCommentSection("Positive", data.sentiment_analysis.top_positive, "text-emerald-400", "bg-emerald-900/10 border-emerald-500/20 backdrop-blur-md")}
                                    </div>
                                    <div className="transform transition-transform hover:-translate-y-2 duration-500 delay-100">
                                        {renderCommentSection("Neutral", data.sentiment_analysis.top_neutral, "text-amber-400", "bg-amber-900/10 border-amber-500/20 backdrop-blur-md")}
                                    </div>
                                    <div className="transform transition-transform hover:-translate-y-2 duration-500 delay-200">
                                        {renderCommentSection("Negative", data.sentiment_analysis.top_negative, "text-red-400", "bg-red-900/10 border-red-500/20 backdrop-blur-md")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="text-center p-8 text-gray-500 text-sm mt-auto border-t border-gray-800 bg-[#0f1115] relative z-20">
                <p className="font-medium text-gray-400">Designed with ❤️ for DJ Sanghvi FYP</p>
                <p className="mt-2 text-xs opacity-50 font-mono">POWERED BY MEDIA INSIGHT AI ⚡</p>
            </footer>
        </div>
    );
};
