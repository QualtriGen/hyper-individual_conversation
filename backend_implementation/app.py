import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
from functools import wraps

app = Flask(__name__)

# Configure CORS more permissively
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment variable
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
if not OPENROUTER_API_KEY:
    logger.error("OPENROUTER_API_KEY environment variable not set")

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

def log_request(f):
    """Decorator to log all API requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Log request details
        logger.info(f"Request to {request.endpoint}: {request.remote_addr}")
        logger.info(f"Request data: {request.get_json()}")
        
        # Get response
        response = f(*args, **kwargs)
        
        # Log response status
        logger.info(f"Response status: {response[1] if isinstance(response, tuple) else 200}")
        
        return response
    return decorated_function

# Add this to handle preflight requests globally
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = '*'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response

# Also add explicit headers to all responses
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Add root route for debugging
@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Personalized Communication API',
        'status': 'running',
        'endpoints': {
            '/health': 'GET - Health check',
            '/api/communicate': 'POST - Send message to AI'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'api_key_configured': bool(OPENROUTER_API_KEY)
    })

# Handle OPTIONS for CORS preflight
@app.route('/api/communicate', methods=['OPTIONS'])
def communicate_options():
    """Handle preflight OPTIONS requests"""
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response, 200

# Handle GET with helpful error
@app.route('/api/communicate', methods=['GET'])
def communicate_get():
    """Handle GET requests with usage information"""
    return jsonify({
        'error': 'Method not allowed. This endpoint requires POST.',
        'usage': {
            'method': 'POST',
            'headers': {'Content-Type': 'application/json'},
            'body': {
                'participant_id': 'string',
                'participant_data': {
                    'name': 'string',
                    'age': 'number',
                    'location': 'string',
                    '...': 'other fields'
                },
                'messages': 'array of message objects',
                'user_message': 'string'
            }
        }
    }), 405

@app.route('/api/communicate', methods=['POST'])
@log_request
def communicate():
    """Handle communication requests from Qualtrics"""
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        participant_id = data.get('participant_id', 'unknown')
        participant_data = data.get('participant_data', {})
        messages = data.get('messages', [])
        user_message = data.get('user_message', '')
        
        if not user_message:
            return jsonify({'error': 'No user message provided'}), 400
        
        # Log the communication request
        logger.info(f"Communication request from participant: {participant_id}")
        
        # Create system prompt based on participant data
        system_prompt = create_system_prompt(participant_data)
        
        # Prepare messages for OpenRouter
        api_messages = [{"role": "system", "content": system_prompt}]
        api_messages.extend(messages)
        api_messages.append({"role": "user", "content": user_message})
        
        # Call OpenRouter API
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': request.headers.get('Origin', 'https://qualtrics.com'),
            'X-Title': 'Future Self Sustainability Chat'
        }
        
        api_payload = {
            'model': 'google/gemini-2.5-flash',
            'messages': api_messages,
            'temperature': 0.8,
            'max_tokens': 300
        }
        
        # Make API request
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=api_payload,
            timeout=30
        )
        
        # Check response
        if response.status_code == 200:
            api_response = response.json()
            
            if 'choices' in api_response and len(api_response['choices']) > 0:
                assistant_message = api_response['choices'][0]['message']['content']
                
                # Log successful response
                logger.info(f"Successful API response for participant: {participant_id}")
                
                return jsonify({
                    'success': True,
                    'message': assistant_message,
                    'timestamp': datetime.utcnow().isoformat()
                })
            else:
                logger.error(f"Invalid API response format: {api_response}")
                return jsonify({'error': 'Invalid API response format'}), 500
        
        else:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            
            # Try alternative models if primary fails
            alternative_response = try_alternative_models(api_messages, headers)
            if alternative_response:
                return jsonify({
                    'success': True,
                    'message': alternative_response,
                    'timestamp': datetime.utcnow().isoformat(),
                    'fallback': True
                })
            
            return jsonify({
                'error': 'API request failed',
                'status_code': response.status_code,
                'details': response.text
            }), 500
            
    except requests.exceptions.Timeout:
        logger.error("OpenRouter API timeout")
        return jsonify({'error': 'API request timeout'}), 504
        
    except Exception as e:
        logger.error(f"Error in communicate endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

def create_system_prompt(participant_data):
    """Create personalized system prompt based on participant data"""
    future_age = participant_data.get('age', 25) + 20
    
    return f"""You are {participant_data.get('name', 'Friend')}'s future self, speaking from 20 years in the future (you are now {future_age} years old). You live in {participant_data.get('location', 'your city')} and have experienced two decades of life since your younger self's current moment.

CONVERSATION STYLE:
- Speak naturally and conversationally, like catching up with an old friend
- Be reflective and thoughtful, not overly enthusiastic or preachy
- Use first person ("I remember...", "When I was your age...", "Looking back...")
- Share specific memories and experiences that relate to their questions
- Be honest about both successes and challenges
- Keep responses concise and conversational (under 150 words)

PERSONAL CONTEXT TO INTEGRATE:
- The people who matter most: {participant_data.get('importantPeople', 'your loved ones')}
- Current habits and behaviors: {participant_data.get('currentBehaviors', 'some eco-friendly habits')}
- Main concerns: {participant_data.get('environmentalConcern', 'climate change')}
- Current challenges: {participant_data.get('sustainabilityBarrier', 'convenience')}
- Core values: {participant_data.get('environmentalValues', 'protecting nature')}
- Hopes for the future: {participant_data.get('desiredLegacy', 'a better world')}
- Daily life details: {participant_data.get('transportationMode', 'car')} for transport, living in {participant_data.get('housingType', 'apartment')}
- Potential changes considered: {participant_data.get('achievableChanges', 'small daily changes')}

HOW TO USE THIS INFORMATION:
- Reference these details naturally when relevant to the conversation
- Connect their current situation to your future experiences
- Show how their values and relationships evolved over time
- Acknowledge their current challenges with understanding
- Share how decisions affected {participant_data.get('importantPeople', 'your loved ones')} and aligned with {participant_data.get('environmentalValues', 'protecting nature')}

IMPORTANT REMINDERS:
- You're not an AI or advisor - you're literally {participant_data.get('name', 'Friend')} from 2045
- Draw on their specific context to make the conversation personal and meaningful
- If they ask about something not in your context, relate it back to what you do know about their life
- Be warm but not overwhelming, wise but not condescending"""

def try_alternative_models(messages, headers):
    """Try alternative models if primary fails"""
    models = [
        "google/gemini-flash-1.5",
        "google/gemini-pro",
        "openai/gpt-3.5-turbo",
        "anthropic/claude-3-haiku",
        "meta-llama/llama-3.2-3b-instruct"
    ]
    
    for model in models:
        try:
            logger.info(f"Trying alternative model: {model}")
            
            api_payload = {
                'model': model,
                'messages': messages,
                'temperature': 0.8,
                'max_tokens': 300
            }
            
            response = requests.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=api_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                api_response = response.json()
                if 'choices' in api_response and len(api_response['choices']) > 0:
                    logger.info(f"Success with alternative model: {model}")
                    return api_response['choices'][0]['message']['content']
                    
        except Exception as e:
            logger.error(f"Error with model {model}: {str(e)}")
            continue
    
    return None

# Add this right after creating the Flask app (after line 10)
@app.before_request
def log_request_info():
    """Log all incoming requests for debugging"""
    logger.info(f"=== Incoming Request ===")
    logger.info(f"URL: {request.url}")
    logger.info(f"Method: {request.method}")
    logger.info(f"Path: {request.path}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"======================")

# Also, let's add a catch-all route to see what's happening
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    """Catch all undefined routes for debugging"""
    logger.warning(f"Undefined route accessed: {path} with method {request.method}")
    return jsonify({
        'error': 'Route not found',
        'path': path,
        'method': request.method,
        'available_routes': [str(rule) for rule in app.url_map.iter_rules()]
    }), 404

# This will list all registered routes
@app.route('/routes')
def list_routes():
    """List all registered routes for debugging"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify(routes)

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
