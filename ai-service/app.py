from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'JamMatch AI Service',
        'timestamp': str(os.popen('date').read().strip())
    })

@app.route('/compatibility', methods=['POST'])
def calculate_compatibility():
    """Calculate compatibility between two user profiles"""
    try:
        data = request.get_json()
        
        if not data or 'user1' not in data or 'user2' not in data:
            return jsonify({'error': 'Missing user profile data'}), 400
        
        user1 = data['user1']
        user2 = data['user2']
        
        # Basic validation
        required_fields = ['name', 'genres', 'instruments', 'experience', 'location']
        for user in [user1, user2]:
            for field in required_fields:
                if field not in user:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Placeholder compatibility calculation
        # This will be replaced with actual AI model integration
        score = calculate_basic_compatibility(user1, user2)
        reasoning = generate_basic_reasoning(user1, user2, score)
        
        return jsonify({
            'compatibility_score': score,
            'reasoning': reasoning,
            'model_used': 'basic_algorithm',
            'timestamp': str(os.popen('date').read().strip())
        })
        
    except Exception as e:
        logger.error(f"Error calculating compatibility: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def calculate_basic_compatibility(user1, user2):
    """Basic compatibility calculation algorithm"""
    score = 0
    
    # Genre overlap (max 30 points)
    common_genres = set(user1['genres']) & set(user2['genres'])
    genre_score = min(len(common_genres) * 10, 30)
    score += genre_score
    
    # Experience compatibility (max 20 points)
    experience_levels = ['beginner', 'intermediate', 'advanced', 'professional']
    user1_exp = experience_levels.index(user1['experience'])
    user2_exp = experience_levels.index(user2['experience'])
    exp_diff = abs(user1_exp - user2_exp)
    
    if exp_diff == 0:
        exp_score = 20
    elif exp_diff == 1:
        exp_score = 10
    else:
        exp_score = 5
    
    score += exp_score
    
    # Location proximity (simplified - max 50 points)
    if user1['location'].lower() == user2['location'].lower():
        location_score = 50
    else:
        location_score = 10  # Assume different cities but within range
    
    score += location_score
    
    return min(score, 100)

def generate_basic_reasoning(user1, user2, score):
    """Generate basic reasoning for compatibility score"""
    common_genres = set(user1['genres']) & set(user2['genres'])
    
    reasoning = f"Compatibility analysis for {user1['name']} and {user2['name']}:\n"
    reasoning += f"- Shared musical genres: {', '.join(common_genres) if common_genres else 'None'}\n"
    reasoning += f"- Experience levels: {user1['experience']} and {user2['experience']}\n"
    reasoning += f"- Location compatibility: {'Same city' if user1['location'].lower() == user2['location'].lower() else 'Different locations'}\n"
    reasoning += f"- Overall compatibility score: {score}/100"
    
    return reasoning

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')