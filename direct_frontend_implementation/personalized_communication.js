// Qualtrics Future-Self Sustainability Conversation
// Complete HTML, CSS, and JavaScript integration

Qualtrics.SurveyEngine.addOnload(function() {
    // Hide the default question
    this.hideNextButton();
    
    // Get embedded data fields - ENHANCED WITH DEBUGGING
    const participantData = {
        name: "${e://Field/participant_name}" || "Friend",
        age: parseInt("${e://Field/age}") || 25,
        location: "${e://Field/location}" || "your city",
        importantPeople: "${e://Field/important_people}" || "your loved ones",
        currentBehaviors: "${e://Field/current_sustainable_behaviors}" || "some eco-friendly habits",
        environmentalConcern: "${e://Field/biggest_environmental_concern}" || "climate change",
        sustainabilityBarrier: "${e://Field/main_sustainability_barrier}" || "convenience",
        environmentalValues: "${e://Field/environmental_values}" || "protecting nature",
        desiredLegacy: "${e://Field/desired_legacy}" || "a better world",
        transportationMode: "${e://Field/transportation_mode}" || "car",
        housingType: "${e://Field/housing_type}" || "apartment",
        achievableChanges: "${e://Field/achievable_changes}" || "small daily changes"
    };

    // Debug: Log the actual values to see if embedded data is working
    console.log('Participant Data:', participantData);
    console.log('Raw embedded data check:');
    console.log('Name field raw:', "${e://Field/participant_name}");
    console.log('Age field raw:', "${e://Field/age}");

    // Check if embedded data is properly populated
    var dataStatus = [];
    for (var key in participantData) {
        var value = participantData[key];
        var isDefault = false;
        
        // Check if we're getting default values (meaning embedded data isn't populated)
        switch(key) {
            case 'name': isDefault = value === 'Friend'; break;
            case 'age': isDefault = value === 25; break;
            case 'location': isDefault = value === 'your city'; break;
            case 'importantPeople': isDefault = value === 'your loved ones'; break;
            case 'currentBehaviors': isDefault = value === 'some eco-friendly habits'; break;
            case 'environmentalConcern': isDefault = value === 'climate change'; break;
            case 'sustainabilityBarrier': isDefault = value === 'convenience'; break;
            case 'environmentalValues': isDefault = value === 'protecting nature'; break;
            case 'desiredLegacy': isDefault = value === 'a better world'; break;
            case 'transportationMode': isDefault = value === 'car'; break;
            case 'housingType': isDefault = value === 'apartment'; break;
            case 'achievableChanges': isDefault = value === 'small daily changes'; break;
        }
        
        dataStatus.push({
            field: key,
            value: value,
            isDefault: isDefault
        });
    }

    console.log('Embedded Data Status:', dataStatus);

    // OpenRouter API configuration - CORRECTED
    const API_KEY = "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";
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";
    
    // Conversation storage
    let conversationLog = [];
    let messageTimestamps = [];
    let sustainabilityCommitments = [];
    let messageHistory = [];

    // Create the HTML structure
    const htmlContent = `
        <style>
            .future-self-chat {
                max-width: 800px;
                margin: 0 auto;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            
            .chat-header {
                text-align: center;
                color: white;
                margin-bottom: 20px;
            }
            
            .chat-header h2 {
                margin: 0;
                font-size: 24px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            .chat-header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
                font-size: 14px;
            }
            
            #chat-container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            #message-display {
                height: 400px;
                overflow-y: auto;
                padding: 20px;
                background: linear-gradient(to bottom, #f8f9ff, #ffffff);
            }
            
            .message {
                margin-bottom: 15px;
                animation: fadeIn 0.5s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .message.present-self {
                text-align: right;
            }
            
            .message.future-self {
                text-align: left;
            }
            
            .message-bubble {
                display: inline-block;
                max-width: 70%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
                position: relative;
            }
            
            .present-self .message-bubble {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .future-self .message-bubble {
                background: linear-gradient(135deg, #2196F3, #1976D2);
                color: white;
                border-bottom-left-radius: 4px;
            }
            
            .message-sender {
                font-size: 11px;
                margin: 5px 10px;
                opacity: 0.7;
                font-weight: 500;
            }
            
            .present-self .message-sender {
                text-align: right;
                color: #4CAF50;
            }
            
            .future-self .message-sender {
                text-align: left;
                color: #2196F3;
            }
            
            .input-container {
                padding: 20px;
                background: #f5f5f5;
                border-top: 1px solid #e0e0e0;
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }
            
            #user-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e0e0e0;
                border-radius: 20px;
                font-size: 14px;
                resize: none;
                font-family: inherit;
                transition: border-color 0.3s;
                min-height: 20px;
                max-height: 100px;
            }
            
            #user-input:focus {
                outline: none;
                border-color: #4CAF50;
            }
            
            #send-btn {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
                font-size: 14px;
            }
            
            #send-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
            }
            
            #send-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .typing-indicator {
                display: none;
                padding: 10px;
                font-style: italic;
                color: #666;
                font-size: 13px;
            }
            
            .typing-dots {
                display: inline-block;
                animation: typing 1.5s infinite;
            }
            
            @keyframes typing {
                0%, 20% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            .commitment-highlight {
                background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
                color: #2c3e50;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            .error-message {
                background: #ffebee;
                color: #c62828;
                padding: 10px;
                border-radius: 8px;
                margin: 10px;
                text-align: center;
                font-size: 13px;
            }
            
            .welcome-message {
                text-align: center;
                padding: 30px 20px;
                color: #666;
                font-style: italic;
            }
            
            .finish-conversation {
                text-align: center;
                padding: 20px;
                background: #f8f9ff;
                margin-top: 20px;
                border-radius: 10px;
            }
            
            .finish-btn {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s;
            }
            
            .finish-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
        </style>
        
        <div class="future-self-chat">
            <div class="chat-header">
                <h2>💭 Conversation with Your Future Self</h2>
                <p>Connect with yourself 20 years from now</p>
            </div>
            
            <div id="chat-container">
                <div id="message-display">
                    <div class="welcome-message">
                        <p>✨ Your future self is ready to share their experiences...</p>
                        <p><strong>Start by asking about their life, their journey, or what they wish they had known.</strong></p>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typing-indicator">
                    Your future self is thinking<span class="typing-dots">...</span>
                </div>
                
                <div class="input-container">
                    <textarea id="user-input" placeholder="Ask your future self anything..." rows="1"></textarea>
                    <button id="send-btn">Send</button>
                </div>
            </div>
            
            <div class="finish-conversation" id="finish-section" style="display: none;">
                <p><strong>Ready to continue with your journey?</strong></p>
                <button class="finish-btn" onclick="finishConversation()">Complete Conversation</button>
            </div>
        </div>
        
        <!-- Hidden fields for data storage -->
        <input type="hidden" id="conversation_log" name="conversation_log" />
        <input type="hidden" id="message_timestamps" name="message_timestamps" />
        <input type="hidden" id="sustainability_commitments" name="sustainability_commitments" />
    `;

    // Insert HTML into the question container
    const questionContainer = document.querySelector('#' + this.questionId);
    questionContainer.innerHTML = htmlContent;

    // Get DOM elements
    const messageDisplay = document.getElementById('message-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const finishSection = document.getElementById('finish-section');

    // Enhanced system prompt creation with fallback
    function createSystemPrompt() {
        var futureAge = participantData.age + 20;
        
        // Check if we have real participant data or just defaults
        var hasRealData = participantData.name !== 'Friend' || 
                         participantData.location !== 'your city' ||
                         participantData.environmentalConcern !== 'climate change';
        
        if (!hasRealData) {
            console.warn('Using default data - embedded data fields may not be set up properly');
        }
        
        return "You are " + participantData.name + "'s future self, speaking from 20 years in the future (you are now " + futureAge + " years old). You live in " + participantData.location + " and have experienced two decades of life since your younger self's current moment.\n\n" +
        
        "CONVERSATION STYLE:\n" +
        "- Speak naturally and conversationally, like catching up with an old friend\n" +
        "- Be reflective and thoughtful, not overly enthusiastic or preachy\n" +
        "- Use first person (\"I remember...\", \"When I was your age...\", \"Looking back...\")\n" +
        "- Share specific memories and experiences that relate to their questions\n" +
        "- Be honest about both successes and challenges\n" +
        "- Keep responses concise and conversational (under 150 words)\n\n" +
        
        "PERSONAL CONTEXT TO INTEGRATE:\n" +
        "- The people who matter most: " + participantData.importantPeople + "\n" +
        "- Current habits and behaviors: " + participantData.currentBehaviors + "\n" +
        "- Main concerns: " + participantData.environmentalConcern + "\n" +
        "- Current challenges: " + participantData.sustainabilityBarrier + "\n" +
        "- Core values: " + participantData.environmentalValues + "\n" +
        "- Hopes for the future: " + participantData.desiredLegacy + "\n" +
        "- Daily life details: " + participantData.transportationMode + " for transport, living in " + participantData.housingType + "\n" +
        "- Potential changes considered: " + participantData.achievableChanges + "\n\n" +
        
        "HOW TO USE THIS INFORMATION:\n" +
        "- Reference these details naturally when relevant to the conversation\n" +
        "- Connect their current situation to your future experiences\n" +
        "- Show how their values and relationships evolved over time\n" +
        "- Acknowledge their current challenges with understanding\n" +
        "- Share how decisions affected " + participantData.importantPeople + " and aligned with " + participantData.environmentalValues + "\n\n" +
        
        "IMPORTANT REMINDERS:\n" +
        "- You're not an AI or advisor - you're literally " + participantData.name + " from 2045\n" +
        "- Draw on their specific context to make the conversation personal and meaningful\n" +
        "- If they ask about something not in your context, relate it back to what you do know about their life\n" +
        "- Be warm but not overwhelming, wise but not condescending";
    }

    // Add message to display - FIXED FOR COMPATIBILITY
    function addMessage(content, sender, isCommitment) {
        if (typeof isCommitment === 'undefined') {
            isCommitment = false;
        }
        
        console.log('Adding message:', content, 'from:', sender); // Debug log
        
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + sender;
        
        var timestamp = new Date().toISOString();
        messageTimestamps.push(timestamp);
        
        var processedContent = content;
        if (isCommitment) {
            // Highlight commitment phrases
            var commitmentPhrases = [
                'I will', 'I commit to', 'I promise to', 'I plan to', 
                'I\'m going to', 'I decide to', 'I choose to'
            ];
            for (var i = 0; i < commitmentPhrases.length; i++) {
                var phrase = commitmentPhrases[i];
                var regex = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
                processedContent = processedContent.replace(regex, '<span class="commitment-highlight">' + phrase + '</span>');
            }
        }
        
        var senderLabel = sender === 'present-self' ? 'You (Present)' : 'You (Future Self)';
        messageDiv.innerHTML = '<div class="message-sender">' + senderLabel + '</div>' +
                              '<div class="message-bubble">' + processedContent + '</div>';
        
        // Check if messageDisplay exists
        var messageDisplay = document.getElementById('message-display');
        if (!messageDisplay) {
            console.error('message-display element not found!');
            return;
        }
        
        messageDisplay.appendChild(messageDiv);
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
        
        // Store in conversation log
        conversationLog.push({
            sender: sender,
            content: content,
            timestamp: timestamp
        });
        
        // Detect and store sustainability commitments
        if (sender === 'present-self') {
            var commitmentKeywords = [
                'will', 'commit', 'promise', 'plan to', 'going to', 
                'decide to', 'choose to', 'start', 'begin'
            ];
            var lowerContent = content.toLowerCase();
            for (var j = 0; j < commitmentKeywords.length; j++) {
                if (lowerContent.indexOf(commitmentKeywords[j]) !== -1) {
                    sustainabilityCommitments.push({
                        commitment: content,
                        timestamp: timestamp
                    });
                    break;
                }
            }
        }
        
        updateHiddenFields();
        console.log('Message added successfully'); // Debug log
    }

    // Show typing indicator - FIXED
    function showTyping() {
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            var messageDisplay = document.getElementById('message-display');
            if (messageDisplay) {
                messageDisplay.scrollTop = messageDisplay.scrollHeight;
            }
        }
    }

    // Hide typing indicator - FIXED
    function hideTyping() {
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    // Call OpenRouter API - MAXIMUM COMPATIBILITY VERSION
    function callFutureSelf(userMessage) {
        showTyping();
        
        // Add user message to history
        messageHistory.push({
            role: "user",
            content: userMessage
        });
        
        // Prepare request
        var requestBody = {
            model: "google/gemini-2.5-flash",
            messages: [
                {
                    role: "system",
                    content: createSystemPrompt()
                }
            ].concat(messageHistory),
            temperature: 0.8,
            max_tokens: 300
        };
        
        // Use XMLHttpRequest for maximum compatibility
        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('HTTP-Referer', window.location.origin || 'https://qualtrics.com');
        xhr.setRequestHeader('X-Title', 'Future Self Sustainability Chat');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                hideTyping();
                
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        console.log('API Response:', data);
                        
                        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                            var futureResponse = data.choices[0].message.content;
                            
                            // Add AI response to history
                            messageHistory.push({
                                role: "assistant",
                                content: futureResponse
                            });
                            
                            addMessage(futureResponse, 'future-self');
                            
                            // Show finish option after several exchanges
                            if (conversationLog.length >= 8) {
                                finishSection.style.display = 'block';
                            }
                        } else {
                            throw new Error("Invalid API response format");
                        }
                    } catch (parseError) {
                        console.error('Parse Error:', parseError);
                        useFallbackResponse(userMessage);
                    }
                } else {
                    console.error('API Error Status:', xhr.status);
                    console.error('API Error Response:', xhr.responseText);
                    
                    if (xhr.status === 401) {
                        showApiKeyError();
                    } else {
                        useFallbackResponse(userMessage);
                    }
                    
                    // Show error message
                    var errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = 'Connection issue - using backup response';
                    messageDisplay.appendChild(errorDiv);
                    
                    setTimeout(function() {
                        errorDiv.remove();
                    }, 5000);
                }
            }
        };
        
        xhr.onerror = function() {
            hideTyping();
            console.error('Network Error');
            useFallbackResponse(userMessage);
        };
        
        xhr.send(JSON.stringify(requestBody));
    }

    // Try alternative models with correct IDs - NEW
    async function tryAlternativeModels(userMessage) {
        // List of alternative models to try (based on OpenRouter catalog)
        const models = [
            "google/gemini-flash-1.5",
            "google/gemini-pro", 
            "openai/gpt-3.5-turbo",
            "anthropic/claude-3-haiku",
            "meta-llama/llama-3.2-3b-instruct"
        ];
        
        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'HTTP-Referer': window.location.origin || 'https://qualtrics.com',
                        'X-Title': 'Future Self Sustainability Chat',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: createSystemPrompt()
                            },
                            ...messageHistory
                        ],
                        temperature: 0.8,
                        max_tokens: 300
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        const futureResponse = data.choices[0].message.content;
                        
                        messageHistory.push({
                            role: "assistant",
                            content: futureResponse
                        });
                        
                        addMessage(futureResponse, 'future-self');
                        console.log(`Success with model: ${model}`);
                        
                        // Show success message about model switch
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'error-message';
                        infoDiv.style.background = '#e8f5e8';
                        infoDiv.style.color = '#2e7d32';
                        infoDiv.textContent = `Connected using ${model}`;
                        messageDisplay.appendChild(infoDiv);
                        
                        setTimeout(() => infoDiv.remove(), 3000);
                        return; // Success!
                    }
                }
            } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError);
                continue;
            }
        }
        
        // If all models fail, use fallback
        console.log('All models failed, using fallback responses');
        useFallbackResponse(userMessage);
    }

    // Show API key configuration error - NEW
    function showApiKeyError() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <strong>API Key Issue</strong><br>
            Please check your OpenRouter API key configuration.<br>
            <small>Visit <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a> to get your API key</small>
        `;
        messageDisplay.appendChild(errorDiv);
        
        // Use fallback for now
        useFallbackResponse(messageHistory[messageHistory.length - 1].content);
    }

    // Enhanced fallback response system - UPDATED
    function useFallbackResponse(userMessage) {
        const contextualResponses = generateContextualResponse(userMessage);
        const randomResponse = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
        
        setTimeout(() => {
            addMessage(randomResponse, 'future-self');
        }, 1500);
    }

    // Generate contextual responses based on user input - NEW
    function generateContextualResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Response categories based on user input
        if (lowerMessage.includes('transport') || lowerMessage.includes('car') || lowerMessage.includes('travel')) {
            return [
                `I remember struggling with ${participantData.transportationMode} too. The breakthrough came when I realized that changing my transportation wasn't just about the environment - it connected me more with ${participantData.importantPeople} and saved money for things that mattered to ${participantData.environmentalValues}.`,
                `You know, ${participantData.name}, that ${participantData.sustainabilityBarrier} you feel about transportation? I found creative solutions that actually made my life better. The ${participantData.achievableChanges} you're considering are exactly where I started.`
            ];
        }
        
        if (lowerMessage.includes('home') || lowerMessage.includes('house') || lowerMessage.includes('energy')) {
            return [
                `Living in ${participantData.housingType} like you do, I discovered that small energy changes created the ${participantData.desiredLegacy} I wanted. ${participantData.importantPeople} were amazed at how these choices improved our quality of life while addressing ${participantData.environmentalConcern}.`,
                `The changes I made to my ${participantData.housingType} weren't just about sustainability - they created a healthier, more comfortable space for ${participantData.importantPeople}. Your values around ${participantData.environmentalValues} will guide you to the right solutions.`
            ];
        }
        
        if (lowerMessage.includes('regret') || lowerMessage.includes('wish') || lowerMessage.includes('mistake')) {
            return [
                `My biggest regret? Waiting too long to start because of ${participantData.sustainabilityBarrier}. I wish I had known that ${participantData.achievableChanges} would be so much easier than I thought and would bring ${participantData.importantPeople} closer together.`,
                `I regret not trusting my values around ${participantData.environmentalValues} sooner. The time I spent worrying about ${participantData.environmentalConcern} could have been time spent creating solutions. You're already ahead of where I was.`
            ];
        }
        
        // Default responses
        return [
            `I remember when I was your age in ${participantData.location}, ${participantData.name}. The ${participantData.environmentalConcern} you're concerned about became the driving force behind the most meaningful changes in my life. Those ${participantData.currentBehaviors} you're already doing? They were my foundation.`,
            
            `Looking back, I'm amazed at how the ${participantData.sustainabilityBarrier} that seemed so big became manageable through ${participantData.achievableChanges}. ${participantData.importantPeople} were my biggest supporters, and your commitment to ${participantData.environmentalValues} will create the ${participantData.desiredLegacy} you dream of.`,
            
            `The transformation started with my ${participantData.transportationMode} and ${participantData.housingType}, just like you're thinking about. What seemed like small steps created ripple effects that touched every aspect of my life and helped ${participantData.importantPeople} see new possibilities too.`
        ];
    }

    // Update hidden fields with conversation data - FIXED
    function updateHiddenFields() {
        var convLogField = document.getElementById('conversation_log');
        var timestampsField = document.getElementById('message_timestamps');
        var commitmentsField = document.getElementById('sustainability_commitments');
        
        if (convLogField) {
            convLogField.value = JSON.stringify(conversationLog);
        }
        if (timestampsField) {
            timestampsField.value = JSON.stringify(messageTimestamps);
        }
        if (commitmentsField) {
            commitmentsField.value = JSON.stringify(sustainabilityCommitments);
        }
    }

    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        addMessage(message, 'present-self', true);
        userInput.value = '';
        sendBtn.disabled = true;
        
        setTimeout(() => {
            callFutureSelf(message);
            sendBtn.disabled = false;
        }, 500);
    }

    // Auto-resize textarea
    function autoResize() {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    userInput.addEventListener('input', autoResize);

    // Global function for finishing conversation
    window.finishConversation = function() {
        // Final update of hidden fields
        updateHiddenFields();
        
        // Show completion message
        addMessage("Thank you for this meaningful conversation. Remember, the future is in your hands. ✨", 'future-self');
        
        // Enable Qualtrics next button
        const nextButton = document.querySelector('#NextButton');
        if (nextButton) {
            nextButton.style.display = 'block';
            nextButton.click();
        } else {
            // Alternative method for Qualtrics
            try {
                jQuery('#NextButton').show().click();
            } catch (e) {
                // Manual navigation if jQuery not available
                window.location.href = window.location.href + '&Q_NextButton=1';
            }
        }
    };

    // Initialize with a welcoming message from future self - FIXED
    setTimeout(function() {
        var welcomeMessage = "Hello, " + participantData.name + "! It's so wonderful to connect with you. I'm you, 20 years from now, and I have so much to share about the journey ahead. Looking back at where you are now in " + participantData.location + ", I remember feeling exactly like you do. Ask me anything - about the choices I made, what I learned, or what I wish I had known at your age.";
        addMessage(welcomeMessage, 'future-self');
    }, 1000);
});

// Store conversation data in Qualtrics embedded data when page unloads
window.addEventListener('beforeunload', function() {
    if (typeof Qualtrics !== 'undefined') {
        Qualtrics.SurveyEngine.setEmbeddedData('final_conversation_log', JSON.stringify(conversationLog));
        Qualtrics.SurveyEngine.setEmbeddedData('final_message_timestamps', JSON.stringify(messageTimestamps));
        Qualtrics.SurveyEngine.setEmbeddedData('final_sustainability_commitments', JSON.stringify(sustainabilityCommitments));
    }
});
