#!/usr/bin/env python3
"""
Unit tests for the AI service compatibility analysis
"""

import unittest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add the current directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, calculate_basic_compatibility, generate_basic_reasoning, parse_ai_response

class TestAIService(unittest.TestCase):
    
    def setUp(self):
        """Set up test client"""
        self.app = app.test_client()
        self.app.testing = True
        
        # Sample user data for testing
        self.user1 = {
            'name': 'Alice',
            'genres': ['Rock', 'Pop'],
            'instruments': ['Guitar', 'Vocals'],
            'experience': 'intermediate',
            'location': 'New York',
            'bio': 'Love playing rock music'
        }
        
        self.user2 = {
            'name': 'Bob',
            'genres': ['Rock', 'Jazz'],
            'instruments': ['Drums'],
            'experience': 'intermediate',
            'location': 'New York',
            'bio': 'Experienced drummer'
        }
        
        self.user3 = {
            'name': 'Charlie',
            'genres': ['Classical', 'Folk'],
            'instruments': ['Piano'],
            'experience': 'professional',
            'location': 'Los Angeles',
            'bio': 'Classical pianist'
        }

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'OK')
        self.assertEqual(data['service'], 'JamMatch AI Service')
        self.assertIn('timestamp', data)

    def test_compatibility_endpoint_success(self):
        """Test successful compatibility calculation"""
        test_data = {
            'user1': self.user1,
            'user2': self.user2
        }
        
        response = self.app.post('/compatibility', 
                                json=test_data,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('compatibility_score', data)
        self.assertIn('reasoning', data)
        self.assertIn('model_used', data)
        self.assertIn('timestamp', data)
        
        # Score should be between 1 and 100
        score = data['compatibility_score']
        self.assertGreaterEqual(score, 1)
        self.assertLessEqual(score, 100)

    def test_compatibility_endpoint_missing_data(self):
        """Test compatibility endpoint with missing data"""
        test_data = {
            'user1': self.user1
            # Missing user2
        }
        
        response = self.app.post('/compatibility',
                                json=test_data,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_compatibility_endpoint_missing_fields(self):
        """Test compatibility endpoint with missing required fields"""
        incomplete_user = {
            'name': 'Test User',
            'genres': ['Rock']
            # Missing instruments, experience
        }
        
        test_data = {
            'user1': incomplete_user,
            'user2': self.user2
        }
        
        response = self.app.post('/compatibility',
                                json=test_data,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('Missing required field', data['error'])

    def test_calculate_basic_compatibility_high_score(self):
        """Test basic compatibility calculation with high compatibility"""
        score = calculate_basic_compatibility(self.user1, self.user2)
        
        # Both users share Rock genre, same experience, same location
        # Should get high score: 10 (genre) + 20 (experience) + 50 (location) = 80
        self.assertEqual(score, 80)

    def test_calculate_basic_compatibility_low_score(self):
        """Test basic compatibility calculation with low compatibility"""
        score = calculate_basic_compatibility(self.user1, self.user3)
        
        # No shared genres, different experience levels, different locations
        # Should get low score: 0 (genre) + 5 (experience) + 10 (location) = 15
        self.assertEqual(score, 15)

    def test_calculate_basic_compatibility_same_users(self):
        """Test basic compatibility calculation with identical users"""
        score = calculate_basic_compatibility(self.user1, self.user1)
        
        # Same user should get maximum score: 20 (genre) + 20 (experience) + 50 (location) = 90
        self.assertEqual(score, 90)

    def test_generate_basic_reasoning(self):
        """Test basic reasoning generation"""
        score = 80
        reasoning = generate_basic_reasoning(self.user1, self.user2, score)
        
        self.assertIn(self.user1['name'], reasoning)
        self.assertIn(self.user2['name'], reasoning)
        self.assertIn('Rock', reasoning)  # Shared genre
        self.assertIn('intermediate', reasoning)  # Experience levels
        self.assertIn('Same city', reasoning)  # Location compatibility
        self.assertIn('80/100', reasoning)  # Score

    def test_generate_basic_reasoning_no_shared_genres(self):
        """Test reasoning generation with no shared genres"""
        score = 15
        reasoning = generate_basic_reasoning(self.user1, self.user3, score)
        
        self.assertIn('None', reasoning)  # No shared genres
        self.assertIn('Different locations', reasoning)

    def test_parse_ai_response_valid_format(self):
        """Test parsing valid AI response"""
        ai_response = """SCORE: 85
REASONING: These musicians have excellent compatibility due to shared rock genre and complementary instruments. Both have intermediate experience levels which suggests good collaboration potential."""
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 85)
        self.assertIn('excellent compatibility', reasoning)
        self.assertIn('shared rock genre', reasoning)

    def test_parse_ai_response_score_only(self):
        """Test parsing AI response with score only"""
        ai_response = "SCORE: 72"
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 72)
        self.assertIn('AI analysis completed', reasoning)

    def test_parse_ai_response_invalid_score(self):
        """Test parsing AI response with invalid score"""
        ai_response = "SCORE: 150\nREASONING: Invalid high score"
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 100)  # Should be capped at 100
        self.assertIn('Invalid high score', reasoning)

    def test_parse_ai_response_negative_score(self):
        """Test parsing AI response with negative score"""
        ai_response = "SCORE: -10\nREASONING: Invalid negative score"
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 1)  # Should be minimum 1
        self.assertIn('Invalid negative score', reasoning)

    def test_parse_ai_response_malformed(self):
        """Test parsing malformed AI response"""
        ai_response = "This is not a properly formatted response"
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 50)  # Default fallback
        self.assertIn('fallback parsing', reasoning)

    def test_parse_ai_response_multiline_reasoning(self):
        """Test parsing AI response with multiline reasoning"""
        ai_response = """SCORE: 78
REASONING: These musicians show good compatibility.
They share musical interests and have complementary skills.
The geographic proximity is also beneficial for collaboration."""
        
        score, reasoning = parse_ai_response(ai_response)
        
        self.assertEqual(score, 78)
        self.assertIn('good compatibility', reasoning)
        self.assertIn('complementary skills', reasoning)
        self.assertIn('geographic proximity', reasoning)

    @patch('app.ai_pipeline')
    @patch('app.model_loaded', True)
    def test_ai_compatibility_success(self, mock_pipeline):
        """Test AI compatibility calculation with mocked model"""
        # Mock the AI pipeline response
        mock_response = [{
            'generated_text': 'PROMPT_TEXT_HERE\nSCORE: 88\nREASONING: Excellent musical compatibility with shared genres and complementary instruments.'
        }]
        mock_pipeline.return_value = mock_response
        
        test_data = {
            'user1': self.user1,
            'user2': self.user2
        }
        
        response = self.app.post('/compatibility',
                                json=test_data,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['model_used'], 'mistral_ai')
        self.assertEqual(data['fallback_used'], False)

    @patch('app.model_loaded', False)
    def test_ai_compatibility_fallback(self):
        """Test fallback to algorithmic scoring when AI model unavailable"""
        test_data = {
            'user1': self.user1,
            'user2': self.user2
        }
        
        response = self.app.post('/compatibility',
                                json=test_data,
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['model_used'], 'algorithmic_fallback')
        self.assertEqual(data['fallback_used'], True)

    def test_compatibility_endpoint_empty_json(self):
        """Test compatibility endpoint with empty JSON"""
        response = self.app.post('/compatibility',
                                json={},
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_compatibility_endpoint_no_json(self):
        """Test compatibility endpoint with no JSON data"""
        response = self.app.post('/compatibility')
        
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main(verbosity=2)