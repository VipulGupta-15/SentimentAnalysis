import csv
import re
import pandas as pd
import nltk
nltk.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import plotly.express as px
import plotly.graph_objects as go
from colorama import Fore, Style
from typing import Dict


def extract_video_id(youtube_link):
    video_id_regex = r"^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu.be\/)([a-zA-Z0-9_-]{11})"
    match = re.search(video_id_regex, youtube_link)
    if match:
        video_id = match.group(1)
        return video_id
    else:
        return None

def analyze_sentiment(csv_file):
    # Initialize the sentiment analyzer
    sid = SentimentIntensityAnalyzer()

    # Read in the YouTube comments from the CSV file
    comments = []
    with open(csv_file, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            comments.append({
                "username": row.get('Username', 'Anonymous'),
                "text": row.get('Comment', '')
            })

    # Count the number of neutral, positive, and negative comments
    num_neutral = 0
    num_positive = 0
    num_negative = 0
    
    scored_comments = []

    for item in comments:
        comment_text = item['text']
        if not comment_text:
            continue
            
        sentiment_scores = sid.polarity_scores(comment_text)
        compound = sentiment_scores['compound']
        
        if compound == 0.0:
            num_neutral += 1
        elif compound > 0.0:
            num_positive += 1
        else:
            num_negative += 1
            
        scored_comments.append({
            'username': item['username'],
            'text': comment_text,
            'compound': compound
        })

    # Sort comments by compound score
    # Most positive first
    sorted_pos = sorted([c for c in scored_comments if c['compound'] > 0], key=lambda x: x['compound'], reverse=True)
    # Most negative first (lowest score)
    sorted_neg = sorted([c for c in scored_comments if c['compound'] < 0], key=lambda x: x['compound'])
    
    # Neutral comments
    neutrals = [c for c in scored_comments if c['compound'] == 0]

    # Return the results as a dictionary
    results = {
        'num_neutral': num_neutral, 
        'num_positive': num_positive, 
        'num_negative': num_negative,
        'top_positive': sorted_pos[:10],
        'top_negative': sorted_neg[:10],
        'top_neutral': neutrals[:10]
    }
    return results


    

    
    
    

    
    
    
def print_sentiment(csv_file: str) -> None:
    # Call analyze_sentiment function to get the results
    results: Dict[str, int] = analyze_sentiment(csv_file)

    # Get the counts for each sentiment category
    num_neutral = results['num_neutral']
    num_positive = results['num_positive']
    num_negative = results['num_negative']

  
    # Determine the overall sentiment
    if num_positive > num_negative:
        overall_sentiment = 'POSITIVE'
        color = Fore.GREEN
    elif num_negative > num_positive:
        overall_sentiment = 'NEGATIVE'
        color = Fore.RED
    else:
        overall_sentiment = 'NEUTRAL'
        color = Fore.YELLOW

    # Print the overall sentiment in color
    print('\n'+ Style.BRIGHT+ color + overall_sentiment.upper().center(50, ' ') + Style.RESET_ALL)



