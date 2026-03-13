# Media Insight & YouTube Sentiment Analysis

This project merges "Media Insight AI" (React) and "YouTube Sentiment Analysis" (Python/Flask) into a single unified application.

## Structure

- **frontend/**: React application (Vite) handling the UI for both Media Analysis and YouTube Sentiment Analysis.
- **backend/**: Python Flask API providing the YouTube scraping and sentiment analysis logic.

## Prerequisites

- Node.js (v18+)
- Python (v3.9+)

## Setup & Running

### 1. Backend

The backend runs on port `8000`.

```bash
cd backend
# Activate the virtual environment
source venv/bin/activate 
# Install dependencies (if not already installed)
pip install -r requirements.txt
# Run the server
python main.py
```

### 2. Frontend

The frontend runs on port `5173` (by default).

```bash
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev
```

## Usage

1. Open `http://localhost:5173` in your browser.
2. Use the **Navigation Bar** to switch between:
   - **Media Insight**: Upload images/videos or providing URLs for Gemini-based analysis.
   - **YouTube Analysis**: Paste a YouTube link to analyze comments and channel statistics.
