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
                // For the analysis, convert the entire video file to base64.
                const videoDataUrl = await fileToBase64(file);
                setMediaForAnalysis([videoDataUrl]);

                // For the UI preview, try to get the first frame. This is non-critical.
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
        <div className="flex flex-col flex-grow">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-8">
                    {!selectedFile && (
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                            <div className="flex border-b border-gray-700 mb-6">
                                <button
                                    onClick={() => setAnalysisMode('upload')}
                                    className={`py-2 px-4 font-semibold transition-colors ${analysisMode === 'upload' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Upload File
                                </button>
                                <button
                                    onClick={() => setAnalysisMode('url')}
                                    className={`py-2 px-4 font-semibold transition-colors ${analysisMode === 'url' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    From URL
                                </button>
                            </div>

                            {analysisMode === 'upload' && <FileUploader onFileSelect={handleFileSelect} disabled={isLoading} />}

                            {analysisMode === 'url' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <Icon name="link" />
                                        <input
                                            type="text"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="Enter public image or video URL..."
                                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-200"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <button
                                        onClick={handleUrlSubmit}
                                        disabled={isLoading || !urlInput}
                                        className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        {isLoading ? <Loader /> : <Icon name="download" />}
                                        <span>{isLoading ? 'Fetching...' : 'Fetch & Prepare Media'}</span>
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Note: Media analysis from a URL requires the source server to permit direct access (CORS). If you see an error, please download the media and upload it directly.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedFile && (
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-500">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/2 flex-shrink-0">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Media preview" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <div className="text-gray-500">Preview not available</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Icon name="trash" />
                                        Remove and start over
                                    </button>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-100">Analysis Console</h3>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Optional: Add specific instructions... e.g., 'Focus on the emotions of the people in the scene.' or 'Identify the brand of the car.'"
                                        className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-500 text-gray-200 resize-none"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleAnalyzeClick}
                                        disabled={isLoading}
                                        className="mt-4 w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        {isLoading ? <Loader /> : <Icon name="sparkles" />}
                                        <span>{isLoading ? 'Analyzing...' : 'Analyze Media'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            {error.includes('CORS') && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => setAnalysisMode('upload')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors"
                                    >
                                        Switch to File Upload
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {analysisResult && <AnalysisResultDisplay result={analysisResult} />}
                </div>
            </main>
            <footer className="text-center p-4 text-gray-500 text-sm">
                Dj Sanghvi
            </footer>
        </div>
    );
};
