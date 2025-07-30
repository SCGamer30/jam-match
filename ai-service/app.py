from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model caching
model = None
tokenizer = None
ai_pipeline = None

def load_ai_model():
    """Load the AI model for compatibility analysis"""
    global model, tokenizer, ai_pipeline
    
    try:
        model_name = "mistralai/Mistral-7B-Instruct-v0.1"  # Using available Mistral model
        logger.info(f"Loading AI model: {model_name}")
        
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            low_cpu_mem_usage=True
        )
        
        # Create pipeline
        ai_pipeline = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_length=512,
            temperature=0.7,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        logger.info("AI model loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load AI model: {str(e)}")
        logger.info("Falling back to algorithmic scoring")
        return False

# Initialize model on startup
model_loaded = load_ai_model()

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
        try:
            data = request.get_json()
        except Exception as json_error:
            return jsonify({'error': 'Invalid JSON data or missing Content-Type header'}), 400
        
        if data is None:
            return jsonify({'error': 'Invalid JSON data or missing Content-Type header'}), 400
        
        if 'user1' not in data or 'user2' not in data:
            return jsonify({'error': 'Missing user profile data'}), 400
        
        user1 = data['user1']
        user2 = data['user2']
        
        # Basic validation
        required_fields = ['name', 'genres', 'instruments', 'experience']
        for user in [user1, user2]:
            for field in required_fields:
                if field not in user:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Try AI analysis first, fall back to algorithmic if needed
        if model_loaded and ai_pipeline:
            try:
                ai_result = calculate_ai_compatibility(user1, user2)
                return jsonify({
                    'compatibility_score': ai_result['score'],
                    'reasoning': ai_result['reasoning'],
                    'model_used': 'mistral_ai',
                    'fallback_used': False,
                    'timestamp': str(os.popen('date').read().strip())
                })
            except Exception as ai_error:
                logger.warning(f"AI analysis failed, falling back to algorithmic: {str(ai_error)}")
        
        # Fallback to algorithmic scoring
        score = calculate_basic_compatibility(user1, user2)
        reasoning = generate_basic_reasoning(user1, user2, score)
        
        return jsonify({
            'compatibility_score': score,
            'reasoning': reasoning,
            'model_used': 'algorithmic_fallback',
            'fallback_used': True,
            'timestamp': str(os.popen('date').read().strip())
        })
        
    except Exception as e:
        logger.error(f"Error calculating compatibility: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def calculate_ai_compatibility(user1, user2):
    """Calculate compatibility using AI model analysis"""
    global ai_pipeline
    
    # Create a detailed prompt for the AI model
    prompt = f"""Analyze the musical compatibility between these two musicians and provide a compatibility score from 1-100.

Musician 1:
- Name: {user1['name']}
- Genres: {', '.join(user1['genres'])}
- Instruments: {', '.join(user1['instruments'])}
- Experience: {user1['experience']}
- Location: {user1.get('location', 'Not specified')}
- Bio: {user1.get('bio', 'Not provided')}

Musician 2:
- Name: {user2['name']}
- Genres: {', '.join(user2['genres'])}
- Instruments: {', '.join(user2['instruments'])}
- Experience: {user2['experience']}
- Location: {user2.get('location', 'Not specified')}
- Bio: {user2.get('bio', 'Not provided')}

Consider factors like:
1. Musical genre compatibility and overlap
2. Instrument complementarity for band formation
3. Experience level compatibility
4. Geographic proximity for collaboration
5. Musical style and personality fit based on available information

Provide your analysis in this exact format:
SCORE: [number from 1-100]
REASONING: [detailed explanation of the compatibility analysis]"""

    try:
        # Generate response using the AI model
        response = ai_pipeline(prompt, max_new_tokens=300, temperature=0.7)
        generated_text = response[0]['generated_text']
        
        # Extract the response part (after the prompt)
        ai_response = generated_text[len(prompt):].strip()
        
        # Parse the score and reasoning
        score, reasoning = parse_ai_response(ai_response)
        
        return {
            'score': score,
            'reasoning': reasoning
        }
        
    except Exception as e:
        logger.error(f"AI model inference failed: {str(e)}")
        raise e

def parse_ai_response(response):
    """Parse the AI model response to extract score and reasoning"""
    try:
        lines = response.split('\n')
        score = 50  # Default fallback score
        reasoning = "AI analysis completed with fallback parsing."
        
        for line in lines:
            line = line.strip()
            if line.startswith('SCORE:'):
                score_text = line.replace('SCORE:', '').strip()
                # Extract number from the score text (including negative numbers)
                import re
                score_match = re.search(r'-?\d+', score_text)
                if score_match:
                    score = min(max(int(score_match.group()), 1), 100)
            elif line.startswith('REASONING:'):
                reasoning = line.replace('REASONING:', '').strip()
                # Get the rest of the reasoning if it spans multiple lines
                remaining_lines = lines[lines.index(line) + 1:]
                if remaining_lines:
                    reasoning += ' ' + ' '.join(remaining_lines).strip()
                break
        
        return score, reasoning
        
    except Exception as e:
        logger.warning(f"Failed to parse AI response: {str(e)}")
        return 50, "AI analysis completed with fallback parsing."

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