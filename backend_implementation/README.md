# Personalized Communication Tool for Qualtrics
A secure AI-powered personalized communication interface for Qualtrics surveys using OpenRouter API with Flask backend for future-self sustainability conversations.

## Overview
This tool provides a personalized AI conversation interface in Qualtrics surveys where participants can communicate with their "future self" about sustainability. It consists of:

- **Flask Backend (app.py)** - Securely handles OpenRouter API requests with participant data
- **Qualtrics Frontend (personalized_communication_client.js)** - JavaScript interface for immersive conversations
- **Secure API Integration** - OpenRouter API key stored server-side for security

## Quick Start

### 1. Deploy the Backend to Render

1. Fork/clone this repository to your GitHub account

2. Go to [Render Dashboard](https://dashboard.render.com)

3. Click "New +" → "Web Service" and connect your GitHub repo

4. Configure:
   - **Name**: `personalized-communication` (or your preferred name)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

5. Add environment variables:
   - **Required**:
     - Key: `OPENROUTER_API_KEY`
     - Value: Your OpenRouter API key

6. Click "Create Web Service" and wait for deployment

7. Note your service URL: `https://[your-service-name].onrender.com`

### 2. Set Up Qualtrics

1. Edit `personalized_communication_client.js`:
   ```javascript
   const BACKEND_URL = 'https://[your-service-name].onrender.com';
   ```

2. In Qualtrics Survey Flow, set embedded data fields:
   - `participant_name`
   - `age`
   - `location`
   - `important_people`
   - `current_sustainable_behaviors`
   - `biggest_environmental_concern`
   - `main_sustainability_barrier`
   - `environmental_values`
   - `desired_legacy`
   - `transportation_mode`
   - `housing_type`
   - `achievable_changes`
   - `PROLIFIC_PID` (if using Prolific)

3. Create a new question:
   - Type: Text/Graphic
   - Click the question → "JavaScript"
   - Paste the entire `personalized_communication_client.js` content
   - Save

4. Preview your survey to test!

## Files Description

- **`app.py`** - Flask backend server with CORS configured for Qualtrics
- **`personalized_communication_client.js`** - Secure client-side interface for Qualtrics
- **`requirements.txt`** - Python dependencies
- **`.gitignore`** - Git ignore file for Python projects

## API Endpoints

- **POST `/api/communicate`** - Main communication endpoint for AI conversations
- **GET `/health`** - Health check endpoint

## Features

### Personalized Conversations
- **Future Self Dialogue** - Participants talk with their future self 20 years from now
- **Contextual Responses** - AI incorporates participant's personal data naturally
- **Sustainability Focus** - Conversations guide toward environmental commitments
- **Emotional Resonance** - Warm, wise responses that feel authentic

### Data Collection
- **Participant Tracking** - Integrates with Prolific IDs via Qualtrics
- **Conversation Logging** - Complete conversation history with timestamps
- **Commitment Detection** - Automatically identifies sustainability commitments
- **Qualtrics Integration** - Stores all data in embedded data fields

## Security Features

- **API key stored as environment variable** (never exposed to client)
- **CORS configured** for Qualtrics domains with wildcard support
- **Request validation** and sanitization
- **Error handling** without exposing sensitive information
- **HTTPS enforced** in production
- **Participant ID tracking** for research integrity

## Troubleshooting

### Backend not responding:
- Check if Render service is running
- For free tier: wait 30-50 seconds if service was sleeping
- Verify URL has no trailing slash
- Check health endpoint: `https://[your-service].onrender.com/health`

### CORS errors:
- Ensure you're testing from actual Qualtrics preview
- Backend uses wildcard CORS for maximum compatibility
- Check browser console for specific CORS error messages

### No API response:
- Verify `OPENROUTER_API_KEY` is set in Render environment variables
- Check OpenRouter dashboard for API key validity and credits
- Ensure you have credits available in your OpenRouter account

### Conversation not personalizing:
- Verify embedded data fields are set in Qualtrics Survey Flow
- Check that participant data is captured before the conversation question
- Look for default values in responses (indicates missing data)

### Data not saving:
- Ensure embedded data fields for outputs are created:
  - `final_conversation_log`
  - `final_message_timestamps`
  - `final_sustainability_commitments`
- Check browser console for JavaScript errors

## Getting API Keys

### OpenRouter API Key
1. Go to [OpenRouter](https://openrouter.ai)
2. Create an account and add credits
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key starting with `sk-or-v1-`

## Monitoring

- **Logs**: Render Dashboard → Your Service → "Logs"
- **Health Check**: `https://[your-service].onrender.com/health`
- **Request Tracking**: All requests logged with participant IDs and timestamps
- **API Usage**: Monitor credits at [OpenRouter Dashboard](https://openrouter.ai/dashboard)

## Research Use

This tool is designed for research studies and includes:
- Participant ID tracking (Prolific integration)
- Complete conversation logging with timestamps
- Sustainability commitment detection and tracking
- Personalized prompting based on participant responses
- Fallback responses for API failures
- Comprehensive error handling and logging

## Customization

### Modifying the System Prompt
Edit the `create_system_prompt()` function in `app.py` to change:
- The future time horizon (currently 20 years)
- Conversation style and tone
- Focus topics and goals
- Response length limits

### Adding Participant Data Fields
1. Add fields to embedded data in Qualtrics
2. Update `participantData` object in client JavaScript
3. Modify `create_system_prompt()` to incorporate new fields

### Changing AI Models
Edit the model in `app.py`:
```python
'model': 'google/gemini-2.5-flash',  # Change to any OpenRouter model
```

## Free Tier Considerations

### Render Free Tier
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds
- Consider upgrading for production studies

### OpenRouter Credits
- Monitor usage at dashboard
- Set spending limits if needed
- Consider model costs when choosing AI model

## License

MIT License - see LICENSE file for details

