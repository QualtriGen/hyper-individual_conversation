# Hyper-Personalized Future Self Conversation for Qualtrics

This repository offers a JavaScript tool for creating a hyper-personalized GenAI experience in Qualtrics, where participants converse with an AI-simulated version of their future self to promote sustainable behavior.

## Repository Structure

This repository contains two implementation approaches:

### 📁 `direct_frontend_integration/`
Contains the JavaScript code that connects Qualtrics directly to AI services via OpenRouter. This approach:
- **Deep personalization**: Incorporates 12+ participant attributes into conversation
- **Temporal intervention**: Future self speaks from 20 years ahead
- **Commitment tracking**: Automatically detects and logs behavior change intentions
- **Contextual fallbacks**: Maintains personalized responses even if API fails
- **API key exposure**: The key is visible in browser code
- **Best for**: Behavior change pilots, temporal self-continuity research
- **Security**: Requires prepaid API credits with spending limits

### 📁 `backend_implementation/`
Contains both the backend server code (Python/Flask) and modified JavaScript for Qualtrics. This approach:
- **Maximum security**: Personal data and API keys protected on server
- **Privacy compliance**: Better for sensitive participant information
- **Professional deployment**: Recommended for intervention studies
- **Additional setup**: Requires deploying a server (e.g., on Render.com)
- **Best for**: Large-scale interventions, vulnerable populations, longitudinal studies
- **Data protection**: Enhanced control over personal information transmission

## Key Features

- **12+ Personalization Points**: Name, age, location, values, barriers, relationships, and more
- **Dynamic Future Self**: AI adapts responses based on participant's specific context
- **Emotional Resonance**: Shares successes, regrets, and wisdom from the future
- **Visual Commitment Highlighting**: Automatically emphasizes behavior change statements
- **Multi-Model Support**: Automatic fallback across different AI models
- **Comprehensive Data Capture**: Full transcripts with timestamps and commitment tracking

## Choosing Your Implementation

- **Use Direct Frontend** if you're piloting the intervention or working with non-sensitive data
- **Use Backend** if you're handling detailed personal information or conducting clinical interventions

Both implementations provide the same personalized conversation experience. The backend approach is strongly recommended when collecting and transmitting detailed personal profiles due to privacy considerations.

## Getting Started

See the README files in each folder for detailed setup instructions specific to that implementation approach.

## License

MIT License - See LICENSE file for details.
