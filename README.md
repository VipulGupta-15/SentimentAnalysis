# Media Insight AI: YouTube & Social Sentiment Engine

Media Insight AI is a full-stack intelligence platform that merges two powerful capabilities into a single unified application:
1. **Media Insight AI**: Upload images, videos, or provide URLs for deep semantic analysis of media content.
2. **YouTube Sentiment Analysis**: Paste any YouTube video link to scrape comments, analyze sentiment, and instantly gauge audience reaction and channel statistics.

## 🚀 Features
- **Dual-Stack Architecture**: A blazing fast React/Vite frontend powered by a robust Python/Flask machine learning backend.
- **Deep Media Analysis**: Utilizes AI to extract meaning, predict virality, and analyze emotional cadence from visual and audio media.
- **Audience Sentiment Tracking**: Real-time YouTube comment scraping with sentiment distribution analysis.
- **Premium UI/UX**: Minimalist, stunning, and responsive design tailored for modern web standards.

---

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS modules
- **Language**: TypeScript

### Backend (AI & Data Pipeline)
- **Framework**: Python Flask API
- **Machine Learning**: NLTK, Pandas
- **Data Visualization**: Plotly
- **APIs**: Google API Python Client (YouTube Data v3)

---

## 💻 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/) (v3.9+)
- A YouTube Data API Key (v3)

### 1. Starting the Python Backend
The backend application handles all the heavy lifting and data scraping. It runs on `http://localhost:8000`.

```bash
cd backend
# Create and activate the virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Start the Flask API server
python main.py
```

### 2. Starting the React Frontend
The frontend provides the user interface. It runs on `http://localhost:5173`.

```bash
cd frontend
# Install Node dependencies
npm install

# Start the development server
npm run dev
```

---

## 📘 How to Use

1. Launch both the backend and frontend servers.
2. Open your web browser and navigate to `http://localhost:5173`.
3. Use the integrated Navigation Bar to utilize the platform:
    - **Media Insight Hub**: Upload images or videos for brand safety, virality, and semantic analysis.
    - **YouTube Tracker**: Paste a valid YouTube URL to generate a comprehensive dashboard of audience sentiment based on recent comments.

## 🔒 Environment Variables
Be sure to set up your `.env.local` files securely. Never commit your API keys to public repositories.

---
*Created by Vipul Gupta*
