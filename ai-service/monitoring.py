"""
Monitoring and logging utilities for AI service
"""

import time
import json
import logging
import psutil
import os
from functools import wraps
from flask import request, g
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s' if os.getenv('LOG_FORMAT') == 'json' else '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def log_json(level, message_type, data):
    """Log structured JSON messages"""
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'type': message_type,
        **data
    }
    
    if os.getenv('LOG_FORMAT') == 'json':
        logger.log(level, json.dumps(log_entry))
    else:
        logger.log(level, f"{message_type}: {json.dumps(data)}")

def monitor_performance(f):
    """Decorator to monitor function performance"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
        
        try:
            result = f(*args, **kwargs)
            
            end_time = time.time()
            end_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            duration = (end_time - start_time) * 1000  # milliseconds
            memory_delta = end_memory - start_memory
            
            # Log performance metrics
            log_json(logging.INFO, 'performance', {
                'function': f.__name__,
                'duration_ms': round(duration, 2),
                'memory_start_mb': round(start_memory, 2),
                'memory_end_mb': round(end_memory, 2),
                'memory_delta_mb': round(memory_delta, 2),
                'success': True
            })
            
            # Log slow operations
            if duration > 5000:  # 5 seconds
                log_json(logging.WARNING, 'slow_operation', {
                    'function': f.__name__,
                    'duration_ms': round(duration, 2),
                    'threshold_ms': 5000
                })
            
            return result
            
        except Exception as e:
            end_time = time.time()
            duration = (end_time - start_time) * 1000
            
            log_json(logging.ERROR, 'function_error', {
                'function': f.__name__,
                'duration_ms': round(duration, 2),
                'error': str(e),
                'error_type': type(e).__name__
            })
            
            raise
    
    return decorated_function

def log_request():
    """Log incoming requests"""
    g.start_time = time.time()
    
    log_json(logging.INFO, 'request', {
        'method': request.method,
        'url': request.url,
        'remote_addr': request.remote_addr,
        'user_agent': request.headers.get('User-Agent', ''),
        'content_length': request.content_length or 0
    })

def log_response(response):
    """Log outgoing responses"""
    if hasattr(g, 'start_time'):
        duration = (time.time() - g.start_time) * 1000
        
        log_json(logging.INFO, 'response', {
            'method': request.method,
            'url': request.url,
            'status_code': response.status_code,
            'duration_ms': round(duration, 2),
            'content_length': response.content_length or 0
        })
        
        # Log slow requests
        if duration > 10000:  # 10 seconds
            log_json(logging.WARNING, 'slow_request', {
                'method': request.method,
                'url': request.url,
                'duration_ms': round(duration, 2),
                'threshold_ms': 10000
            })
    
    return response

def get_health_status():
    """Get system health status"""
    try:
        process = psutil.Process()
        memory_info = process.memory_info()
        cpu_percent = process.cpu_percent()
        
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': time.time() - psutil.boot_time(),
            'memory': {
                'rss_mb': round(memory_info.rss / 1024 / 1024, 2),
                'vms_mb': round(memory_info.vms / 1024 / 1024, 2),
                'percent': round(psutil.virtual_memory().percent, 2)
            },
            'cpu': {
                'percent': round(cpu_percent, 2),
                'count': psutil.cpu_count()
            },
            'disk': {
                'percent': round(psutil.disk_usage('/').percent, 2)
            },
            'environment': os.getenv('FLASK_ENV', 'development'),
            'model_loaded': hasattr(g, 'model') and g.model is not None
        }
    except Exception as e:
        log_json(logging.ERROR, 'health_check_error', {
            'error': str(e),
            'error_type': type(e).__name__
        })
        
        return {
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }

def get_metrics():
    """Get detailed system metrics"""
    try:
        process = psutil.Process()
        memory_info = process.memory_info()
        cpu_times = process.cpu_times()
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'process': {
                'pid': process.pid,
                'name': process.name(),
                'status': process.status(),
                'create_time': process.create_time(),
                'num_threads': process.num_threads()
            },
            'memory': {
                'rss_bytes': memory_info.rss,
                'vms_bytes': memory_info.vms,
                'rss_mb': round(memory_info.rss / 1024 / 1024, 2),
                'vms_mb': round(memory_info.vms / 1024 / 1024, 2),
                'percent': round(psutil.virtual_memory().percent, 2),
                'available_mb': round(psutil.virtual_memory().available / 1024 / 1024, 2)
            },
            'cpu': {
                'percent': round(process.cpu_percent(), 2),
                'user_time': cpu_times.user,
                'system_time': cpu_times.system,
                'count': psutil.cpu_count(),
                'freq_mhz': psutil.cpu_freq().current if psutil.cpu_freq() else None
            },
            'disk': {
                'usage_percent': round(psutil.disk_usage('/').percent, 2),
                'free_gb': round(psutil.disk_usage('/').free / 1024 / 1024 / 1024, 2),
                'total_gb': round(psutil.disk_usage('/').total / 1024 / 1024 / 1024, 2)
            },
            'network': {
                'bytes_sent': psutil.net_io_counters().bytes_sent,
                'bytes_recv': psutil.net_io_counters().bytes_recv,
                'packets_sent': psutil.net_io_counters().packets_sent,
                'packets_recv': psutil.net_io_counters().packets_recv
            },
            'environment': {
                'flask_env': os.getenv('FLASK_ENV', 'development'),
                'python_version': os.sys.version,
                'platform': os.sys.platform
            }
        }
    except Exception as e:
        log_json(logging.ERROR, 'metrics_error', {
            'error': str(e),
            'error_type': type(e).__name__
        })
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }