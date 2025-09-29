import json
import re
from bs4 import BeautifulSoup


def extract_member_lyrics(html_file):
    # Member color mappings based on the HTML
    member_colors = {
        '#8c00d1': 'Jisoo',  # Purple
        '#4b89dc': 'Jennie', # Blue  
        '#fdc3c3': 'Rosé',   # Pink
        '#ffd400': 'Lisa',   # Yellow
        '#cd4744': 'Selena Gomez',  # Red (featured artist)
        '#c7b446': 'Cardi B'  # Green (featured artist)
    }
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Extract artist from the new structure
    artist_div = soup.find('div', class_='artist')
    artist = ""
    
    if artist_div:
        for text_node in artist_div.find_all(string=True, recursive=False):
            if text_node.strip():
                artist = text_node.strip()
                break
    
    # Find all album sections
    albums = []
    album_divs = soup.find_all('div', class_='album')
    
    for album_div in album_divs:
        # Extract album name from the div text (first text node)
        album_name = "Unknown Album"
        for text_node in album_div.find_all(string=True, recursive=False):
            if text_node.strip() and not text_node.strip().startswith('<'):
                album_name = text_node.strip()
                break
        
        # Extract year
        year_span = album_div.find('span', class_='year')
        year = year_span.get_text(strip=True) if year_span else "Unknown"
        
        # Extract cover image URL
        cover_span = album_div.find('span', class_='album-cover')
        cover_url = cover_span.get_text(strip=True) if cover_span else None
        
        # Find all songs within this album
        songs = []
        song_divs = album_div.find_all('div', class_='song')
        
        for song_div in song_divs:
            # Extract song title from the div text (first text node)
            song_title = "Unknown Song"
            for text_node in song_div.find_all(string=True, recursive=False):
                if text_node.strip() and not text_node.strip().startswith('<'):
                    song_title = text_node.strip()
                    break
            
            # Find the lyrics section within this song div
            section = song_div.find('dd', class_='_3JdoNYgT TpLT4sql uT-nd7sE')
            if not section:
                continue
            
            # Extract lyrics with member tags
            lyrics_with_members = []
            
            # Find all spans first
            spans = section.find_all('span')
            
            for span in spans:
                # Check if this span has a color style
                style_match = re.search(r'color:\s*(#[0-9a-fA-F]+)', span.get('style', ''))
                if style_match:
                    color = style_match.group(1)
                    member = member_colors.get(color, 'ALL')
                else:
                    # No color style means ALL members
                    member = ['Jisoo', 'Jennie', 'Rosé', 'Lisa']
                
                # Get all text content from this span, replacing <br> with spaces
                text = span.get_text(separator=' ', strip=True)
                # Clean up extra whitespace
                text = re.sub(r'\s+', ' ', text)
                if text and text not in ['지수', '제니', '로제', '리사', 'ALL', '셀레나 고메즈', 'Cardi B']:
                    lyrics_with_members.append({
                        'member': member,
                        'text': text
                    })
            
            # Find text that's not in any span (between spans or after spans)
            for text_node in section.find_all(string=True):
                # Check if this text node is inside a span
                if text_node.parent and text_node.parent.name == 'span':
                    continue  # Skip text that's inside spans
                
                text = text_node.strip()
                # Clean up extra whitespace
                text = re.sub(r'\s+', ' ', text)
                if text and text not in ['지수', '제니', '로제', '리사', 'ALL', '셀레나 고메즈', 'Cardi B']:
                    # Text outside spans is ALL members
                    lyrics_with_members.append({
                        'member': ['Jisoo', 'Jennie', 'Rosé', 'Lisa'],
                        'text': text
                    })
            
            songs.append({
                'song_title': song_title,
                'lyrics': lyrics_with_members
            })
        
        # Add this album to the albums list
        albums.append({
            'album_name': album_name,
            'year': year,
            'cover_image': cover_url,
            'songs': songs
        })
    
    return albums, artist

def main():
    input_file = 'lyrics_member.html'
    output_file = 'lyrics_member.json'
    
    try:
        print(f"Extracting lyrics from {input_file}...")
        albums, artist = extract_member_lyrics(input_file)
        
        # Create the final JSON structure
        result = {
            'artist': artist,
            'albums': albums
        }
        
        # Save to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        total_songs = sum(len(album['songs']) for album in albums)
        print(f"Successfully created {output_file} with {len(albums)} albums and {total_songs} songs!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()