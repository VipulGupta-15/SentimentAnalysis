import os
import glob
from flask import Flask, request, jsonify
from flask_cors import CORS
from Senti import extract_video_id, analyze_sentiment
from YoutubeCommentScrapper import save_video_comments_to_csv, get_channel_info, youtube, get_channel_id, get_video_stats

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "youtube-sentiment-backend"})

@app.route('/api/analyze-youtube', methods=['POST'])
def analyze_youtube():
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400

    youtube_link = data['url']
    video_id = extract_video_id(youtube_link)

    if not video_id:
        return jsonify({"error": "Invalid YouTube URL"}), 400

    try:
        # 1. Get Channel ID and Info
        channel_id = get_channel_id(video_id)
        if not channel_id:
             return jsonify({"error": "Could not find channel for this video"}), 404
             
        channel_info = get_channel_info(youtube, channel_id)

        # 2. Get Video Stats
        stats = get_video_stats(video_id)
        if not stats:
             return jsonify({"error": "Could not fetch video stats"}), 404

        # 3. Fetch Comments and Save to CSV
        # Note: This creates a file named {video_id}.csv in the current directory
        csv_file = save_video_comments_to_csv(video_id)
        
        
        # 4. Analyze Sentiment
        sentiment_results = analyze_sentiment(csv_file)
        
        # 5. Virality Calculation
        # Safely convert strings to integers
        views = int(stats.get('viewCount', 0))
        likes = int(stats.get('likeCount', 0))
        comments = int(stats.get('commentCount', 0))
        
        num_pos = sentiment_results['num_positive']
        num_neg = sentiment_results['num_negative']
        total_sentiment = num_pos + num_neg + sentiment_results['num_neutral']
        
        # Avoid division by zero
        engagement_rate = ((likes + comments) / views * 100) if views > 0 else 0
        sentiment_ratio = (num_pos / total_sentiment * 100) if total_sentiment > 0 else 0
        
        # Heuristic Scoring (0-100)
        # Engagement contributes 70 points max (capped at 10% engagement)
        # Sentiment contributes 30 points max
        engagement_score = min((engagement_rate / 10) * 70, 70) 
        sentiment_score = min((sentiment_ratio / 100) * 30, 30)
        
        virality_score = round(engagement_score + sentiment_score, 1)
        
        if virality_score >= 80:
            verdict = "Viral Potential 🔥"
        elif virality_score >= 60:
             verdict = "Trendings 🚀"
        elif virality_score >= 40:
             verdict = "Good Performance 👍"
        else:
             verdict = "Average Performance 😐"

        virality_analysis = {
            "score": virality_score,
            "verdict": verdict,
            "engagement_rate": round(engagement_rate, 2),
            "sentiment_ratio": round(sentiment_ratio, 2)
        }
        
        # 6. Cleanup CSV file (Optional, but good practice)
        # For now, we might keep it or delete it. Let's delete it to keep clean.
        try:
            if os.path.exists(csv_file):
                os.remove(csv_file)
        except Exception as e:
            print(f"Error removing CSV: {e}")

        response_data = {
            "video_id": video_id,
            "channel_info": channel_info,
            "video_stats": stats,
            "sentiment_analysis": sentiment_results,
            "virality_analysis": virality_analysis
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"Error processing {youtube_link}: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
