import React, { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { FileUploader } from '../components/FileUploader';
import { Loader } from '../components/Loader';
import { AnalysisResultDisplay } from '../components/AnalysisResultDisplay';
import { analyzeMedia } from '../services/geminiService';
import { type AnalysisResult } from '../types';
import { extractVideoFramesAsBase64, fileToBase64 } from '../utils/mediaUtils';
import { Icon } from '../components/Icon';

export const MediaInsight: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaForAnalysis, setMediaForAnalysis] = useState<string[] | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<'upload' | 'url'>('upload');
    const [urlInput, setUrlInput] = useState<string>('');

    const handleFileSelect = useCallback(async (file: File) => {
        setError(null);
        setAnalysisResult(null);
        setSelectedFile(file);

        try {
            setIsLoading(true);
            if (file.type.startsWith('video/')) {
                const videoDataUrl = await fileToBase64(file);
                setMediaForAnalysis([videoDataUrl]);

                try {
                    const previewFrames = await extractVideoFramesAsBase64(file, 1);
                    if (previewFrames.length > 0) {
                        setPreviewUrl(previewFrames[0]);
                    } else {
                        console.warn("Could not extract a preview frame from the video.");
                    }
                } catch (previewError) {
                    console.error("Failed to extract video preview frame:", previewError);
                }
            } else if (file.type.startsWith('image/')) {
                const dataUrl = await fileToBase64(file);
                setPreviewUrl(dataUrl);
                setMediaForAnalysis([dataUrl]);
            } else {
                setError('Unsupported file type. Please upload an image or video.');
                setPreviewUrl(null);
                setSelectedFile(null);
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.error("File processing error:", err);
            setError(err instanceof Error ? err.message : 'Could not process the selected file.');
            setPreviewUrl(null);
            setSelectedFile(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAnalyzeClick = async () => {
        if (!selectedFile || !mediaForAnalysis) {
            setError('Please select a file to analyze.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeMedia(mediaForAnalysis, selectedFile.type, prompt);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setMediaForAnalysis(null);
        setPrompt('');
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        setUrlInput('');
        setAnalysisMode('upload');
    };

    const handleUrlSubmit = async () => {
        if (!urlInput) {
            setError('Please enter a valid URL.');
            return;
        }
        setError(null);
        setAnalysisResult(null);
        setIsLoading(true);

        try {
            const response = await fetch(urlInput);
            if (!response.ok) {
                throw new Error(`Failed to fetch media. Server responded with status: ${response.status}`);
            }

            const mimeType = response.headers.get('Content-Type');
            if (!mimeType || (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))) {
                throw new Error('The URL does not point to a supported image or video file.');
            }

            const blob = await response.blob();
            const fileName = urlInput.substring(urlInput.lastIndexOf('/') + 1) || 'media-from-url';
            const file = new File([blob], fileName, { type: mimeType });

            await handleFileSelect(file);

        } catch (err) {
            console.error("URL fetching error:", err);
            let errorMessage = 'Could not fetch or process the media from the URL.';
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                errorMessage = 'Could not fetch media. This is likely due to browser security restrictions (CORS). The media server must allow cross-origin requests. Please try another URL or upload the file directly.';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setSelectedFile(null);
            setPreviewUrl(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-grow bg-[#0f1115] text-gray-200 min-h-screen font-sans selection:bg-blue-500/30">
            <Header />
            
            {/* High-end Header Section */}
            <header className="relative overflow-hidden text-center py-16 md:py-24 border-b border-gray-800 bg-[#0f1115]">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] transform transition-transform hover:scale-105">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 tracking-tight leading-tight mb-4">
                            Media Insight AI
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light">
                            Predict social media performance, detect deep emotions, and understand your content's audience reaction instantly.
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center -mt-8 relative z-20">
                <div className="w-full max-w-5xl space-y-8">
                    {!selectedFile && (
                        <div className="bg-[#1a1d24]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800/50">
                            <div className="flex border-b border-gray-800 mb-8 pb-2">
                                <button
                                    onClick={() => setAnalysisMode('upload')}
                                    className={`py-2 px-6 font-semibold transition-all rounded-t-xl ${analysisMode === 'upload' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                                >
                                    Upload File
                                </button>
                                <button
                                    onClick={() => setAnalysisMode('url')}
                                    className={`py-2 px-6 font-semibold transition-all rounded-t-xl ${analysisMode === 'url' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}`}
                                >
                                    From URL
                                </button>
                            </div>

                            {analysisMode === 'upload' && <FileUploader onFileSelect={handleFileSelect} disabled={isLoading} />}

                            {analysisMode === 'url' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Icon name="link" className="text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="Enter public image or video URL..."
                                            className="w-full py-4 pl-12 pr-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-600 text-gray-200 shadow-inner outline-none"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button
                                        onClick={handleUrlSubmit}
                                        disabled={isLoading || !urlInput}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed disabled:text-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:shadow-none"
                                    >
                                        {isLoading ? <Loader /> : <Icon name="download" />}
                                        <span className="text-lg whitespace-nowrap">{isLoading ? 'Fetching Source...' : 'Fetch & Prepare Media'}</span>
                                    </button>
                                    <p className="text-xs text-gray-500/80 mt-4 text-center">
                                        Note: Media analysis from a URL requires the source server to permit direct access (CORS). If you see an error, please download the media and upload it directly.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedFile && (
                        <div className="bg-[#1a1d24]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800/50 transition-all duration-500 animate-fade-in-up">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Media Preview Area */}
                                <div className="w-full lg:w-1/2 flex flex-col relative group">
                                    <div className="aspect-square lg:aspect-video bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 relative shadow-inner group-hover:border-white/10 transition-colors">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-60"></div>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Media preview" className="w-full h-full object-contain relative z-0" />
                                        ) : (
                                            <div className="text-gray-500 flex flex-col items-center gap-2">
                                                <Icon name="analysis" className="opacity-50 w-8 h-8" />
                                                <span>Preview not available</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="mt-4 self-center md:self-start flex items-center gap-2 text-sm text-red-500/80 hover:text-red-400 bg-red-500/10 px-4 py-2 rounded-lg transition-colors border border-red-500/20"
                                    >
                                        <Icon name="trash" />
                                        Cancel & Start Over
                                    </button>
                                </div>

                                {/* Custom Prompting Area */}
                                <div className="w-full lg:w-1/2 flex flex-col">
                                    <h3 className="text-2xl font-bold mb-4 text-gray-100 flex items-center gap-2">
                                        <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400">
                                            <Icon name="analysis" className="w-5 h-5"/>
                                        </span>
                                        Agency Console
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">Customize your analysis point-of-view. Tell the AI context about your campaign.</p>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="E.g., 'Analyze this ad for youth fashion. Focus on the expressions and predict Gen-Z engagement levels...'"
                                        className="w-full flex-grow min-h-[120px] p-4 bg-gray-900/50 border border-gray-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-600 text-gray-200 resize-none shadow-inner outline-none custom-scrollbar mb-6 leading-relaxed"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleAnalyzeClick}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-900 disabled:cursor-not-allowed disabled:text-gray-600 disabled:border disabled:border-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(79,70,229,0.2)] disabled:shadow-none"
                                    >
                                        {isLoading ? (
                                            <>
                                              <Loader />
                                              <span className="text-lg font-medium tracking-wide">AI Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                              <Icon name="sparkles" />
                                              <span className="text-lg whitespace-nowrap uppercase tracking-wider">Generate Agency Report</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-2xl relative shadow-lg animate-fade-in flex items-start gap-4" role="alert">
                            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                                <strong className="block font-bold mb-1">Analysis Stopped</strong>
                                <span className="block text-sm opacity-90">{error}</span>
                                {error.includes('CORS') && (
                                    <button
                                        onClick={() => setAnalysisMode('upload')}
                                        className="mt-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                                    >
                                        Switch to File Upload Instead
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {analysisResult && <AnalysisResultDisplay result={analysisResult} />}
                </div>
            </main>

            <footer className="text-center p-8 text-gray-500 text-sm mt-auto border-t border-gray-800 bg-[#0f1115] relative z-20">
                <p className="font-medium text-gray-400">Designed with ❤️ for DJ Sanghvi FYP</p>
                <p className="mt-2 text-xs opacity-50 font-mono">POWERED BY MEDIA INSIGHT AI ⚡</p>
            </footer>
        </div>
    );
};
