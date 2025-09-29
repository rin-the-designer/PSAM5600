#!/usr/bin/env python3
"""
Script to clean lyrics by removing text blocks inside square brackets []
from all_lyrics.json and save to lyrics-cleaned.json
"""

import json
import re
import os

def clean_lyrics_text(text):
    """
    Remove all text blocks inside square brackets from the lyrics text.
    
    Args:
        text (str): The original lyrics text
        
    Returns:
        str: Cleaned lyrics text with bracketed content removed
    """
    # Remove all text inside square brackets, including the brackets themselves
    # This regex pattern matches [ followed by any characters (non-greedy) followed by ]
    cleaned_text = re.sub(r'\[.*?\]', '', text)
    
    # Clean up extra whitespace that might be left after removing brackets
    # Replace multiple spaces with single space and strip leading/trailing whitespace
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    return cleaned_text

def main():
    # Define file paths
    input_file = 'all_lyrics.json'
    output_file = 'lyrics_cleaned.json'
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return
    
    try:
        # Load the original JSON data
        print(f"Loading {input_file}...")
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"Found {len(data)} songs to process...")
        
        # Process each song entry
        cleaned_data = []
        for i, song in enumerate(data):
            # Create a copy of the song data
            cleaned_song = song.copy()
            
            # Clean the lyrics text
            if 'lyrics' in song and song['lyrics']:
                original_lyrics = song['lyrics']
                cleaned_lyrics = clean_lyrics_text(original_lyrics)
                cleaned_song['lyrics'] = cleaned_lyrics
                
                # Show progress for first few songs
                if i < 3:
                    print(f"\nSong {i+1}: {song.get('song_title', 'Unknown')}")
                    print(f"Original length: {len(original_lyrics)} characters")
                    print(f"Cleaned length: {len(cleaned_lyrics)} characters")
                    print(f"Removed: {len(original_lyrics) - len(cleaned_lyrics)} characters")
            
            cleaned_data.append(cleaned_song)
        
        # Save the cleaned data to new file
        print(f"\nSaving cleaned data to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully created {output_file} with {len(cleaned_data)} cleaned songs!")
        
        # Show summary statistics
        total_original_chars = sum(len(song.get('lyrics', '')) for song in data)
        total_cleaned_chars = sum(len(song.get('lyrics', '')) for song in cleaned_data)
        total_removed_chars = total_original_chars - total_cleaned_chars
        
        print(f"\nSummary:")
        print(f"Total original characters: {total_original_chars:,}")
        print(f"Total cleaned characters: {total_cleaned_chars:,}")
        print(f"Total characters removed: {total_removed_chars:,}")
        print(f"Reduction: {(total_removed_chars/total_original_chars)*100:.1f}%")
        
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
