#!/usr/bin/env python3
"""
Performance tests for AI service
"""

import time
import concurrent.futures
import statistics
import sys
import os
import json
from typing import List, Dict, Any

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("✓ App import successful")
except Exception as e:
    print(f"✗ Failed to import app: {e}")
    sys.exit(1)

def create_test_profile(user_id: str, name: str, genres: List[str], instruments: List[str], 
                       experience: str, location: str) -> Dict[str, Any]:
    """Create a test user profile"""
    return {
        'id': user_id,
        'name': name,
        'genres': genres,
        'instruments': instruments,
        'experience': experience,
        'location': location,
        'bio': f'Test bio for {name}'
    }

def test_single_compatibility_request():
    """Test single compatibility analysis performance"""
    print("\n=== Single Compatibility Request Test ===")
    
    user1 = create_test_profile(
        'user1', 'Alice', ['rock', 'jazz'], ['guitar'], 'intermediate', 'New York'
    )
    user2 = create_test_profile(
        'user2', 'Bob', ['rock', 'blues'], ['drums'], 'intermediate', 'New York'
    )
    
    test_data = {'user1': user1, 'user2': user2}
    
    with app.test_client() as client:
        # Warm up
        client.post('/compatibility', json=test_data)
        
        # Measure performance
        start_time = time.time()
        response = client.post('/compatibility', json=test_data)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✓ Single request completed in {execution_time:.2f}ms")
            print(f"  Score: {data.get('compatibility_score')}")
            print(f"  Reasoning length: {len(data.get('reasoning', ''))}")
            
            # Performance assertion
            assert execution_time < 5000, f"Single request took too long: {execution_time}ms"
            return execution_time
        else:
            print(f"✗ Request failed with status {response.status_code}")
            return None

def test_concurrent_requests(num_requests: int = 10):
    """Test concurrent compatibility analysis performance"""
    print(f"\n=== Concurrent Requests Test ({num_requests} requests) ===")
    
    # Create test data for multiple requests
    test_cases = []
    for i in range(num_requests):
        user1 = create_test_profile(
            f'user{i*2+1}', f'User{i*2+1}', ['rock', 'jazz'], ['guitar'], 'intermediate', 'New York'
        )
        user2 = create_test_profile(
            f'user{i*2+2}', f'User{i*2+2}', ['rock', 'blues'], ['drums'], 'intermediate', 'New York'
        )
        test_cases.append({'user1': user1, 'user2': user2})
    
    def make_request(test_data):
        with app.test_client() as client:
            start_time = time.time()
            response = client.post('/compatibility', json=test_data)
            end_time = time.time()
            
            execution_time = (end_time - start_time) * 1000
            
            if response.status_code == 200:
                return execution_time
            else:
                return None
    
    # Execute concurrent requests
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request, test_data) for test_data in test_cases]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    end_time = time.time()
    total_time = (end_time - start_time) * 1000
    
    # Filter out failed requests
    successful_results = [r for r in results if r is not None]
    
    if successful_results:
        avg_time = statistics.mean(successful_results)
        min_time = min(successful_results)
        max_time = max(successful_results)
        
        print(f"✓ {len(successful_results)}/{num_requests} requests successful")
        print(f"  Total time: {total_time:.2f}ms")
        print(f"  Average request time: {avg_time:.2f}ms")
        print(f"  Min request time: {min_time:.2f}ms")
        print(f"  Max request time: {max_time:.2f}ms")
        print(f"  Requests per second: {len(successful_results) / (total_time / 1000):.2f}")
        
        # Performance assertions
        assert len(successful_results) >= num_requests * 0.9, "Too many failed requests"
        assert avg_time < 10000, f"Average request time too high: {avg_time}ms"
        assert total_time < 30000, f"Total time too high: {total_time}ms"
        
        return successful_results
    else:
        print("✗ All requests failed")
        return []

def test_load_performance(num_requests: int = 50):
    """Test load performance with many requests"""
    print(f"\n=== Load Performance Test ({num_requests} requests) ===")
    
    # Create diverse test data
    genres_list = [
        ['rock', 'jazz'], ['blues', 'country'], ['pop', 'electronic'],
        ['classical', 'folk'], ['metal', 'punk'], ['reggae', 'funk']
    ]
    instruments_list = [
        ['guitar'], ['drums'], ['bass'], ['piano'], ['vocals'], ['violin']
    ]
    experiences = ['beginner', 'intermediate', 'advanced', 'professional']
    locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']
    
    test_cases = []
    for i in range(num_requests):
        user1 = create_test_profile(
            f'load_user{i*2+1}', f'LoadUser{i*2+1}',
            genres_list[i % len(genres_list)],
            instruments_list[i % len(instruments_list)],
            experiences[i % len(experiences)],
            locations[i % len(locations)]
        )
        user2 = create_test_profile(
            f'load_user{i*2+2}', f'LoadUser{i*2+2}',
            genres_list[(i+1) % len(genres_list)],
            instruments_list[(i+1) % len(instruments_list)],
            experiences[(i+1) % len(experiences)],
            locations[(i+1) % len(locations)]
        )
        test_cases.append({'user1': user1, 'user2': user2})
    
    def make_request(test_data):
        with app.test_client() as client:
            start_time = time.time()
            response = client.post('/compatibility', json=test_data)
            end_time = time.time()
            
            execution_time = (end_time - start_time) * 1000
            
            return {
                'success': response.status_code == 200,
                'time': execution_time,
                'status_code': response.status_code
            }
    
    # Execute load test
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request, test_data) for test_data in test_cases]
        results = [future.result() for future in concurrent.futures.as_completed(futures)]
    
    end_time = time.time()
    total_time = (end_time - start_time) * 1000
    
    # Analyze results
    successful_results = [r for r in results if r['success']]
    failed_results = [r for r in results if not r['success']]
    
    if successful_results:
        times = [r['time'] for r in successful_results]
        avg_time = statistics.mean(times)
        median_time = statistics.median(times)
        p95_time = sorted(times)[int(len(times) * 0.95)]
        
        print(f"✓ {len(successful_results)}/{num_requests} requests successful")
        print(f"  Total time: {total_time:.2f}ms")
        print(f"  Average request time: {avg_time:.2f}ms")
        print(f"  Median request time: {median_time:.2f}ms")
        print(f"  95th percentile: {p95_time:.2f}ms")
        print(f"  Throughput: {len(successful_results) / (total_time / 1000):.2f} req/sec")
        
        if failed_results:
            print(f"  Failed requests: {len(failed_results)}")
            status_codes = {}
            for r in failed_results:
                status_codes[r['status_code']] = status_codes.get(r['status_code'], 0) + 1
            print(f"  Failure status codes: {status_codes}")
        
        # Performance assertions
        success_rate = len(successful_results) / num_requests
        assert success_rate >= 0.95, f"Success rate too low: {success_rate:.2%}"
        assert avg_time < 15000, f"Average request time too high: {avg_time}ms"
        assert p95_time < 25000, f"95th percentile too high: {p95_time}ms"
        
        return times
    else:
        print("✗ All requests failed")
        return []

def test_memory_usage():
    """Test memory usage patterns"""
    print("\n=== Memory Usage Test ===")
    
    try:
        import psutil
        process = psutil.Process()
        
        # Get initial memory usage
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        print(f"Initial memory usage: {initial_memory:.2f}MB")
        
        # Run multiple requests to test memory growth
        user1 = create_test_profile(
            'mem_user1', 'MemUser1', ['rock', 'jazz'], ['guitar'], 'intermediate', 'New York'
        )
        user2 = create_test_profile(
            'mem_user2', 'MemUser2', ['rock', 'blues'], ['drums'], 'intermediate', 'New York'
        )
        test_data = {'user1': user1, 'user2': user2}
        
        with app.test_client() as client:
            # Make 100 requests
            for i in range(100):
                response = client.post('/compatibility', json=test_data)
                if response.status_code != 200:
                    print(f"Request {i} failed")
        
        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"Final memory usage: {final_memory:.2f}MB")
        print(f"Memory increase: {memory_increase:.2f}MB")
        
        # Memory increase should be reasonable
        assert memory_increase < 100, f"Memory increase too high: {memory_increase}MB"
        
        print("✓ Memory usage within acceptable limits")
        
    except ImportError:
        print("psutil not available, skipping memory test")

def test_error_handling_performance():
    """Test performance with various error conditions"""
    print("\n=== Error Handling Performance Test ===")
    
    error_cases = [
        # Missing user data
        {'user1': {'name': 'Alice'}},  # Missing required fields
        
        # Invalid data types
        {'user1': 'invalid', 'user2': 'invalid'},
        
        # Empty data
        {},
        
        # Malformed JSON (will be handled by Flask)
        {'user1': {'name': 'Alice', 'genres': 'not-a-list'}, 'user2': {'name': 'Bob'}},
    ]
    
    with app.test_client() as client:
        for i, test_data in enumerate(error_cases):
            start_time = time.time()
            response = client.post('/compatibility', json=test_data)
            end_time = time.time()
            
            execution_time = (end_time - start_time) * 1000
            
            print(f"Error case {i+1}: {response.status_code} in {execution_time:.2f}ms")
            
            # Error responses should be fast
            assert execution_time < 1000, f"Error response too slow: {execution_time}ms"
    
    print("✓ Error handling performance acceptable")

def run_all_performance_tests():
    """Run all performance tests"""
    print("Starting AI Service Performance Tests")
    print("=" * 50)
    
    try:
        # Single request test
        single_time = test_single_compatibility_request()
        
        # Concurrent requests test
        concurrent_times = test_concurrent_requests(10)
        
        # Load performance test
        load_times = test_load_performance(50)
        
        # Memory usage test
        test_memory_usage()
        
        # Error handling performance
        test_error_handling_performance()
        
        print("\n" + "=" * 50)
        print("Performance Test Summary:")
        
        if single_time:
            print(f"Single request: {single_time:.2f}ms")
        
        if concurrent_times:
            print(f"Concurrent avg: {statistics.mean(concurrent_times):.2f}ms")
        
        if load_times:
            print(f"Load test avg: {statistics.mean(load_times):.2f}ms")
            print(f"Load test p95: {sorted(load_times)[int(len(load_times) * 0.95)]:.2f}ms")
        
        print("✓ All performance tests passed!")
        
    except AssertionError as e:
        print(f"✗ Performance test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_all_performance_tests()