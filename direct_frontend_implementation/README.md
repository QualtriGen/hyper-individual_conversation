# Hyper-Personalized Future Self Conversation for Qualtrics

An AI-powered conversation tool that creates personalized interactions between participants and their future selves, designed to promote sustainable behavior change through temporal self-continuity.

## ⚠️ Security Notice

**This implementation exposes your API key in the browser's client-side code.** While the risk of malicious use by research participants is generally low, the API key could potentially be discovered and misused.

**Required Security Measures:**
- **Always use prepaid credits** on OpenRouter or set strict spending limits
- Monitor API usage during data collection
- Consider implementing a backend architecture for studies with sensitive populations
- For large-scale studies, backend implementation is strongly recommended

For enhanced security, see the backend implementation guide in the original research paper.

## Overview

This tool creates a powerful psychological intervention where participants converse with an AI simulation of their future self, 20 years from now. The future self incorporates all participant-specific information to create deeply personalized, emotionally resonant conversations about sustainability choices and their long-term impacts.

## Key Features

### Core Functionality
- **Hyper-Personalization**: Incorporates 12+ participant attributes into conversation
- **Temporal Framing**: Future self speaks from 20 years ahead with lived experience
- **Dynamic Conversation**: Natural dialogue flow with context awareness
- **Commitment Detection**: Automatically identifies and tracks sustainability commitments
- **Fallback System**: Contextual responses even if API connection fails

### Personalization Elements
- Participant name and demographics
- Current sustainable behaviors
- Environmental concerns and values
- Personal barriers to sustainability
- Important relationships
- Housing and transportation context
- Desired environmental legacy
- Achievable changes identified by participant

### Technical Features
- **Multi-Model Support**: Automatic fallback to alternative models if primary fails
- **Visual Feedback**: Typing indicators and message animations
- **Comprehensive Logging**: Full conversation transcripts with timestamps
- **Commitment Highlighting**: Visual emphasis on commitment statements
- **Error Recovery**: Graceful handling with contextual fallback responses

## Prerequisites

- Qualtrics account with JavaScript editing permissions
- OpenRouter API key (supports multiple AI models)
- Survey questions to collect participant information
- Basic familiarity with Qualtrics survey flow

## Installation

### Step 1: Obtain OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Create account or sign in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Generate new API key
5. **Important**: Add credits and set spending limits

### Step 2: Create Participant Information Questions

Create survey questions to collect the following information (exact field names in parentheses):

1. **Name** (`participant_name`): "What is your first name?"
2. **Age** (`age`): "What is your age?"
3. **Location** (`location`): "What city do you live in?"
4. **Important People** (`important_people`): "Who are the most important people in your life?"
5. **Current Behaviors** (`current_sustainable_behaviors`): "What sustainable behaviors do you currently practice?"
6. **Environmental Concern** (`biggest_environmental_concern`): "What is your biggest environmental concern?"
7. **Main Barrier** (`main_sustainability_barrier`): "What is your main barrier to being more sustainable?"
8. **Environmental Values** (`environmental_values`): "What environmental values are important to you?"
9. **Desired Legacy** (`desired_legacy`): "What environmental legacy do you want to leave?"
10. **Transportation** (`transportation_mode`): "What is your primary mode of transportation?"
11. **Housing** (`housing_type`): "What type of housing do you live in?"
12. **Achievable Changes** (`achievable_changes`): "What sustainable changes feel achievable for you?"

### Step 3: Configure Qualtrics Survey Flow

1. Go to **Survey Flow**
2. Add **Embedded Data** element at the beginning
3. Create fields for each participant attribute:
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
4. Set each field value to the corresponding question using piped text:
   - Example: `participant_name` = `${q://QID1/ChoiceTextEntryValue}`
5. Add output fields (leave empty):
   - `conversation_log`
   - `message_timestamps`
   - `sustainability_commitments`
   - `final_conversation_log`
   - `final_message_timestamps`
   - `final_sustainability_commitments`

### Step 4: Add the Conversation Interface

1. Create new **Text/Graphic** question after participant information questions
2. Click gear icon and select **Add JavaScript**
3. Copy entire contents of `personalized_communication.js`
4. Replace API key: `REPLACE YOUR OPENROUTER API KEY HERE` with your OpenRouter API key
5. Save the question

### Step 5: Test Your Implementation

1. Complete all participant information questions first
2. Use anonymous survey link (not preview mode)
3. Verify personalization is working (check browser console for data)
4. Test conversation flow and commitment detection
5. Check data is saved to embedded fields

## File Structure

```
├── personalized_communication.js  # Main JavaScript implementation
├── README.md                      # This file
└── docs/                         # Additional documentation
    └── implementation_guide.pdf   # Detailed implementation guide
```

## How It Works

### Personalization Flow

1. **Data Collection**: Participant completes profile questions
2. **Data Integration**: Embedded data populates conversation context
3. **System Prompt Creation**: Future self persona constructed with all personal details
4. **Dynamic Conversation**: Each response incorporates relevant personal information
5. **Commitment Tracking**: Statements with action words automatically logged

### Conversation Design

The future self:
- Speaks in first person from 20 years in the future
- References specific personal details naturally
- Shares concrete examples of sustainable choices
- Expresses both successes and regrets
- Connects sustainability to participant's values and relationships
- Provides hope and motivation rather than fear

### Fallback System

If API connection fails, contextual responses are generated based on:
- Keywords in user's message
- Participant's profile information
- Common sustainability topics
- Ensures conversation continues meaningfully

## Data Collection

### Conversation Data
- **conversation_log**: Complete transcript with sender labels
- **message_timestamps**: ISO timestamps for each message
- **sustainability_commitments**: Detected commitment statements

### Analysis Opportunities
- Commitment frequency and specificity
- Conversation depth and engagement
- Personalization effectiveness
- Temporal self-continuity markers
- Behavior change intentions

## Customization Options

### Modify Future Timeline

Change the temporal distance:
```javascript
const futureAge = participantData.age + 20; // Change 20 to desired years
```

### Adjust Conversation Focus

Edit the system prompt to emphasize different topics:
```javascript
// Add to system prompt
"Focus particularly on [YOUR TOPIC]: energy use, diet, transportation, etc."
```

### Customize Commitment Detection

Add keywords for commitment identification:
```javascript
const commitmentKeywords = [
    'will', 'commit', 'promise', 'plan to', 
    // Add your keywords here
];
```

### Style Customization

Modify the CSS to match your brand or create different moods.

## Troubleshooting

### Common Issues

1. **Personalization Not Working**
   - Check embedded data field names match exactly
   - Verify piped text references are correct
   - Look for default values in browser console
   - Ensure questions appear before conversation

2. **API Connection Failing**
   - Verify OpenRouter API key is valid
   - Check credits available in OpenRouter account
   - Test with different models (automatic fallback)
   - Review browser console for specific errors

3. **Conversation Not Natural**
   - Ensure all participant fields have meaningful data
   - Check system prompt is complete
   - Verify temperature setting (0.8 recommended)

4. **Data Not Saving**
   - Confirm embedded data fields exist in Survey Flow
   - Check field names match exactly (case-sensitive)
   - Verify no JavaScript errors in console

### Debugging Tips

- Browser console shows:
  - Participant data values
  - API responses
  - Fallback activation
  - Data storage confirmations
- Test with simple responses first
- Monitor `conversation_log` field for complete transcripts

## Best Practices

### For Maximum Impact

1. **Rich Profiles**: Encourage detailed participant responses in profile questions
2. **Clear Instructions**: Explain they'll talk with their future self
3. **Adequate Time**: Allow 10-15 minutes for meaningful conversation
4. **Follow-up Questions**: Include post-conversation reflection items

### For Data Quality

1. **Pilot Testing**: Run small pilots to refine prompts
2. **Profile Validation**: Check for meaningful profile responses
3. **Engagement Metrics**: Track message count and length
4. **Commitment Analysis**: Review detected commitments for accuracy

## Cost Considerations

- OpenRouter charges per token across different models
- Gemini 2.5 Flash is cost-effective default
- Automatic fallback to cheaper models if needed
- Set appropriate spending limits in OpenRouter
- Monitor usage during pilots to estimate costs

## Research Applications

This tool enables study of:

- Temporal self-continuity interventions
- Personalization effectiveness in behavior change
- Future self-visualization impacts
- Commitment formation in AI conversations
- Narrative persuasion through personal storytelling
- Values-based messaging effectiveness

## Experimental Variations

Researchers can compare:
- Different temporal distances (10, 20, 50 years)
- Future self personas (optimistic vs realistic)
- Topic focus (sustainability, health, finance)
- Personalization levels (generic vs hyper-personalized)
- Conversation length and depth
- With/without commitment prompting

## Citation

Based on methodology from:
```
Pataranutaporn, P., et al. (2024). "Future You: A Conversation with an 
AI-Generated Future Self Reduces Anxiety, Negative Emotions, and Increases 
Future Self-Continuity."
```

## Support

For questions or issues:
- Review troubleshooting section above
- Check OpenRouter documentation for API issues
- Consult original research paper for methodology
- Verify Qualtrics embedded data configuration

## License

This project is released under the MIT License. See LICENSE file for details.

## Acknowledgments

This implementation demonstrates hyper-personalized AI conversations for behavior change research, part of the initiative to democratize GenAI tools for marketing studies.

---

**Important Notes**: 
- This tool transmits participant information to OpenRouter/AI models
- Ensure IRB approval addresses personalized data transmission
- Consider privacy implications of detailed personal profiles
- For vulnerable populations, implement backend architecture
- Always use API spending limits to control costs
