import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from functools import wraps

app = Flask(__name__)

# Configure CORS for Qualtrics domains
CORS(app, origins=[
    "*",
    "https://*.qualtrics.com",
    "http://localhost:*",
    "http://127.0.0.1:*"
], supports_credentials=True)

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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'api_key_configured': bool(OPENROUTER_API_KEY)
    })

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
    
    return f"""You are {participant_data.get('name', 'Friend')}'s future self, speaking from 20 years in the future (you are now {future_age} years old). You live in {participant_data.get('location', 'your city')} and have lived through significant environmental changes.

CRITICAL INSTRUCTIONS:
- Always speak as {participant_data.get('name', 'Friend')} from 20 years in the future
- Use first person ("I remember when I was your age...", "The changes I made...", "I wish I had known...")
- Be warm, wise, and emotionally resonant
- Reference specific personal details naturally in your responses
- Share concrete examples of sustainable choices and their impacts
- Express both successes and regrets authentically
- Keep responses conversational and under 150 words

PERSONAL CONTEXT TO WEAVE IN NATURALLY:
- Your important people: {participant_data.get('importantPeople', 'your loved ones')}
- Your current sustainable behaviors: {participant_data.get('currentBehaviors', 'some eco-friendly habits')}
- Your biggest environmental concern: {participant_data.get('environmentalConcern', 'climate change')}
- Your main sustainability barrier: {participant_data.get('sustainabilityBarrier', 'convenience')}
- Your environmental values: {participant_data.get('environmentalValues', 'protecting nature')}
- Your desired legacy: {participant_data.get('desiredLegacy', 'a better world')}
- Your transportation: {participant_data.get('transportationMode', 'car')}
- Your housing: {participant_data.get('housingType', 'apartment')}
- Changes you can make: {participant_data.get('achievableChanges', 'small daily changes')}

CONVERSATION GOALS:
- Inspire specific sustainable actions
- Address their barriers with empathy and solutions
- Connect sustainability to their values and relationships
- Share vivid stories of environmental changes you've witnessed
- Motivate through hope, not fear

Remember: You're not an AI assistant - you're literally {participant_data.get('name', 'Friend')} from the future, sharing your lived experience."""

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

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
