import json
import os
import requests
import time
from playwright.sync_api import sync_playwright


def extract_text_content(element):
    # Remove the lyrics header container if it exists
    lyrics_header = element.query_selector(".LyricsHeader__Container-sc-5e4b7146-1")
    if lyrics_header:
        lyrics_header.evaluate("el => el.remove()")
    
    # Replace br tags with spaces in the entire element
    element.evaluate("el => { el.innerHTML = el.innerHTML.replace(/<br\\s*\\/?>/gi, ' '); }")
    
    # Get all text content from the element
    text_content = element.text_content()
    return text_content.strip() + " " if text_content else ""

def scrape_lyrics():
    # Load albums data
    with open("albums.json", "r") as f:
        albums = json.load(f)
    
    all_lyrics = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        for album in albums:
            print(f"Scraping album: {album['title']}")
            
            # Navigate to album page
            album_url = f"https://genius.com/albums/{album['artist']}/{album['title']}"
            print(f"  Navigating to: {album_url}")
            
            try:
                page.goto(album_url, timeout=60000)
                time.sleep(3)
            except Exception as e:
                print(f"  Error navigating to album page: {e}")
                continue
            
            # Get album title from the page
            album_title = get_album_title(page, album)
            
            # Download album cover image
            album_cover_path = download_album_cover(page, album)
            
            # Process all songs on the album
            album_lyrics = process_album_songs(page, album, album_title, album_cover_path)
            all_lyrics.extend(album_lyrics)
        
        browser.close()
    
    # Save results to JSON file
    save_lyrics_to_file(all_lyrics)
    print(f"Scraping complete! Found lyrics for {len(all_lyrics)} songs.")
    return all_lyrics


def get_album_title(page, album):
    album_title_element = page.query_selector("h1.header_with_cover_art-primary_info-title")
    return album_title_element.text_content().strip() if album_title_element else album["title"]


def process_album_songs(page, album, album_title, album_cover_path):
    # Find all songs on the album page
    chart_rows = page.query_selector_all(".chart_row-content")
    print(f"  Found {len(chart_rows)} songs")
    
    album_lyrics = []
    
    # Process each song
    for i in range(len(chart_rows)):
        try:
            print(f"  Processing song {i+1}/{len(chart_rows)}")
            
            # Re-find chart rows to avoid stale element references
            chart_rows = page.query_selector_all(".chart_row-content")
            if i >= len(chart_rows):
                print(f"    No chart row found for song {i+1}")
                continue
            
            chart_row = chart_rows[i]
            
            # Get song title (excluding subtitle)
            song_title = get_song_title(chart_row, i)
            
            # Navigate to song page and extract lyrics
            lyrics = extract_song_lyrics(page, chart_row)
            
            if lyrics:
                album_lyrics.append({
                    "artist": album["artist"],
                    "album": album_title,
                    "album_cover": album_cover_path,
                    "song_title": song_title,
                    "lyrics": lyrics
                })
                print(f"    ✓ Found lyrics for: {song_title}")
            else:
                print(f"    ✗ No lyrics found for: {song_title}")
            
        except Exception as e:
            print(f"    Error processing song {i+1}: {e}")
            # Try to recover and continue
            try:
                page.go_back()
                time.sleep(2)
            except:
                album_url = f"https://genius.com/albums/{album['artist']}/{album['title']}"
                page.goto(album_url)
                time.sleep(2)
            continue
    
    return album_lyrics


def extract_song_lyrics(page, chart_row):
    # Navigate to song page
    chart_row.click()
    time.sleep(2)
    
    # Extract lyrics
    lyrics = extract_lyrics_from_page(page)
    
    # Return to album page
    page.go_back()
    time.sleep(2)
    
    return lyrics


def get_song_title(chart_row, index):
    title_element = chart_row.query_selector(".chart_row-content-title")
    if title_element:
        # Remove subtitle element if it exists
        subtitle = title_element.query_selector(".chart_row-content-title-subtitle")
        if subtitle:
            subtitle.evaluate("el => el.remove()")
        return title_element.text_content().strip()
    else:
        return f"Song {index+1}"


def extract_lyrics_from_page(page):
    lyrics_divs = page.query_selector_all(".fBKwZw")
    
    if not lyrics_divs:
        return None
    
    # Extract text content from all lyrics divs
    all_lyrics_text = []
    for lyrics_div in lyrics_divs:
        lyrics_text = extract_text_content(lyrics_div)
        if lyrics_text.strip():
            all_lyrics_text.append(lyrics_text)
    
    # Combine all lyrics and clean up line breaks
    combined_lyrics = " ".join(all_lyrics_text).replace("\n", " ")
    return combined_lyrics


def download_album_cover(page, album):
    try:
        # Find the cover image element
        cover_img = page.query_selector(".cover_art-image")
        if not cover_img:
            print(f"    No cover image found for {album['title']}")
            return None
        
        # Get the image URL
        img_url = cover_img.get_attribute("src")
        if not img_url:
            print(f"    No image URL found for {album['title']}")
            return None
        
        # Get file extension from URL
        if '.' in img_url:
            ext = '.' + img_url.split('.')[-1].split('?')[0]  # Remove query parameters
        else:
            ext = '.jpg'  # default
        
        # Create filename: artist-title.extension
        filename = f"{album['artist']}_{album['title']}{ext}"
        filepath = os.path.join("cover", filename)
        
        # Download the image
        response = requests.get(img_url)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"    ✓ Downloaded cover: {filename}")
            return f"/cover/{filename}"
        else:
            print(f"    ✗ Failed to download cover for {album['title']}")
            return None
            
    except Exception as e:
        print(f"    Error downloading cover for {album['title']}: {e}")
        return None


def save_lyrics_to_file(lyrics_data):
    with open("all_lyrics.json", "w", encoding="utf-8") as outfile:
        json.dump(lyrics_data, outfile, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    scrape_lyrics()
