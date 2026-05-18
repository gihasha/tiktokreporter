"""
TikTok Profile Fetcher - Backend Server
Run: python backend.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import json
import re

app = Flask(__name__)
CORS(app)  # Allow frontend to access this backend

# Headers to mimic a real browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}


def extract_number(text):
    """Extract number from text like '1.5M', '100K', '500'"""
    if not text:
        return 0
    
    text = str(text).strip().upper().replace(',', '')
    
    multiplier = 1
    if 'B' in text:
        multiplier = 1000000000
        text = text.replace('B', '')
    elif 'M' in text:
        multiplier = 1000000
        text = text.replace('M', '')
    elif 'K' in text:
        multiplier = 1000
        text = text.replace('K', '')
    
    try:
        return int(float(text) * multiplier)
    except:
        return 0


def fetch_tiktok_profile(username):
    """Fetch TikTok profile data by scraping the public profile page"""
    url = f'https://www.tiktok.com/@{username}'
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        
        if response.status_code == 404:
            return {'success': False, 'error': f'Profile "@{username}" not found on TikTok'}
        
        if response.status_code != 200:
            return {'success': False, 'error': f'TikTok returned status code {response.status_code}'}
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Method 1: Try to find JSON data in script tags
        scripts = soup.find_all('script', {'type': 'application/json'})
        
        for script in scripts:
            try:
                data = json.loads(script.text)
                
                # Check for user info in the JSON
                if '__DEFAULT_SCOPE__' in data:
                    default_scope = data['__DEFAULT_SCOPE__']
                    
                    # Webapp.user-detail path
                    if 'webapp.user-detail' in default_scope:
                        user_detail = default_scope['webapp.user-detail']
                        user_info = user_detail.get('userInfo', {})
                        stats = user_info.get('stats', {})
                        
                        return {
                            'success': True,
                            'username': user_info.get('uniqueId', username),
                            'displayName': user_info.get('nickname', username),
                            'userId': user_info.get('id', '---'),
                            'avatar': user_info.get('avatarLarger', user_info.get('avatarMedium', '')),
                            'followers': stats.get('followerCount', 0),
                            'following': stats.get('followingCount', 0),
                            'likes': stats.get('heartCount', 0),
                            'videos': stats.get('videoCount', 0),
                            'bio': user_info.get('signature', 'No bio'),
                            'verified': user_info.get('verified', False),
                        }
                    
                    # Alternative path: webapp.app-context
                    if 'webapp.app-context' in default_scope:
                        app_context = default_scope['webapp.app-context']
                        user_info = app_context.get('user', {})
                        if user_info:
                            stats = user_info.get('stats', {})
                            return {
                                'success': True,
                                'username': user_info.get('uniqueId', username),
                                'displayName': user_info.get('nickname', username),
                                'userId': user_info.get('id', '---'),
                                'avatar': user_info.get('avatarLarger', user_info.get('avatarMedium', '')),
                                'followers': stats.get('followerCount', 0),
                                'following': stats.get('followingCount', 0),
                                'likes': stats.get('heartCount', 0),
                                'videos': stats.get('videoCount', 0),
                                'bio': user_info.get('signature', 'No bio'),
                                'verified': user_info.get('verified', False),
                            }
            except (json.JSONDecodeError, KeyError, TypeError):
                continue
        
        # Method 2: Try to find SIGI_STATE in script tags (older TikTok pages)
        sigi_scripts = soup.find_all('script', {'id': 'SIGI_STATE'})
        for script in sigi_scripts:
            try:
                data = json.loads(script.text)
                # Navigate through SIGI_STATE structure
                if 'UserModule' in data:
                    user_info = data['UserModule'].get('users', {}).get(username, {})
                    if user_info:
                        stats = data['UserModule'].get('stats', {}).get(username, {})
                        return {
                            'success': True,
                            'username': username,
                            'displayName': user_info.get('nickname', username),
                            'userId': user_info.get('id', '---'),
                            'avatar': user_info.get('avatarLarger', user_info.get('avatarMedium', '')),
                            'followers': stats.get('followerCount', 0),
                            'following': stats.get('followingCount', 0),
                            'likes': stats.get('heartCount', 0),
                            'videos': stats.get('videoCount', 0),
                            'bio': user_info.get('signature', 'No bio'),
                            'verified': user_info.get('verified', False),
                        }
            except (json.JSONDecodeError, KeyError, TypeError):
                continue
        
        # Method 3: Try to extract from seo meta tags
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.text
            if 'not found' in title.lower() or 'page not found' in title.lower():
                return {'success': False, 'error': f'Profile "@{username}" not found on TikTok'}
        
        # If we got here, we couldn't parse the data
        return {
            'success': False, 
            'error': f'Could not fetch profile data for @{username}. TikTok may have changed their page structure.'
        }
        
    except requests.RequestException as e:
        return {'success': False, 'error': f'Network error: {str(e)}'}
    except Exception as e:
        return {'success': False, 'error': f'Unexpected error: {str(e)}'}


@app.route('/api/tiktok-profile')
def get_tiktok_profile():
    """API endpoint to get TikTok profile data"""
    username = request.args.get('username', '').replace('@', '').strip()
    
    if not username:
        return jsonify({'success': False, 'error': 'Username parameter is required'})
    
    # Validate username format (TikTok usernames: letters, numbers, underscore, period)
    if not re.match(r'^[a-zA-Z0-9._]+$', username):
        return jsonify({'success': False, 'error': 'Invalid username format'})
    
    # Rate limiting protection (basic)
    if len(username) > 30:
        return jsonify({'success': False, 'error': 'Username too long'})
    
    # Fetch profile data
    result = fetch_tiktok_profile(username)
    return jsonify(result)


@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'TikTok Profile Fetcher API',
        'version': '2.0',
        'endpoints': {
            '/api/tiktok-profile?username=USERNAME': 'Get TikTok profile data'
        }
    })


if __name__ == '__main__':
    print("=" * 50)
    print("🔧 TikTok Profile Fetcher Backend")
    print("=" * 50)
    print(f"📡 Server starting at: http://localhost:5000")
    print(f"🔗 API endpoint: http://localhost:5000/api/tiktok-profile?username=example")
    print(f"💡 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
