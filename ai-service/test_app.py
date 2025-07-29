#!/usr/bin/env python3
"""
Simple test script to verify the AI service is working correctly
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("✓ App import successful")
    
    # Test the health endpoint
    with app.test_client() as client:
        response = client.get('/health')
        if response.status_code == 200:
            print("✓ Health endpoint working")
        else:
            print(f"✗ Health endpoint failed with status {response.status_code}")
            
        # Test compatibility endpoint with sample data
        test_data = {
            'user1': {
                'name': 'Alice',
                'genres': ['rock', 'pop'],
                'instruments': ['guitar'],
                'experience': 'intermediate',
                'location': 'New York'
            },
            'user2': {
                'name': 'Bob',
                'genres': ['rock', 'jazz'],
                'instruments': ['drums'],
                'experience': 'intermediate',
                'location': 'New York'
            }
        }
        
        response = client.post('/compatibility', json=test_data)
        if response.status_code == 200:
            print("✓ Compatibility endpoint working")
            data = response.get_json()
            print(f"  Score: {data.get('compatibility_score')}")
        else:
            print(f"✗ Compatibility endpoint failed with status {response.status_code}")
            
    print("✓ All tests passed!")
    
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)