// Qualtrics Future-Self Sustainability Conversation - Backend Version
// Secure client that communicates with Flask backend

Qualtrics.SurveyEngine.addOnload(function() {
    // Backend URL - Update this with your Render deployment URL
    const BACKEND_URL = 'https://your-app-name.onrender.com';
    
    // Hide the default question
    this.hideNextButton();
    
    // Get embedded data fields
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
    
    // Get participant ID from Qualtrics (Prolific integration)
    const participantId = "${e://Field/PROLIFIC_PID}" || "${e://Field/ResponseID}" || "unknown";

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
            
            .connection-status {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 12px;
                padding: 5px 10px;
                border-radius: 15px;
                background: #e8f5e9;
                color: #2e7d32;
                display: none;
            }
            
            .connection-status.error {
                background: #ffebee;
                color: #c62828;
            }
        </style>
        
        <div class="future-self-chat">
            <div class="connection-status" id="connection-status">Connected</div>
            <div class="chat-header">
                <h2>🌱 Conversation with Your Future Self</h2>
                <p>Connect with yourself 20 years from now about sustainability</p>
            </div>
            
            <div id="chat-container">
                <div id="message-display">
                    <div class="welcome-message">
                        <p>✨ Your future self is ready to share their journey with sustainability...</p>
                        <p><strong>Start by asking about their life, their choices, or what they wish they had known.</strong></p>
                    </div>
                </div>
                
                <div class="typing-indicator" id="typing-indicator">
                    Your future self is thinking<span class="typing-dots">...</span>
                </div>
                
                <div class="input-container">
                    <textarea id="user-input" placeholder="Ask your future self anything about sustainability..." rows="1"></textarea>
                    <button id="send-btn">Send</button>
                </div>
            </div>
            
            <div class="finish-conversation" id="finish-section" style="display: none;">
                <p><strong>Ready to continue with your sustainability journey?</strong></p>
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
    const connectionStatus = document.getElementById('connection-status');

    // Check backend connection on load
    checkBackendConnection();

    // Add message to display
    function addMessage(content, sender, isCommitment = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + sender;
        
        const timestamp = new Date().toISOString();
        messageTimestamps.push(timestamp);
        
        let processedContent = content;
        if (isCommitment) {
            // Highlight commitment phrases
            const commitmentPhrases = [
                'I will', 'I commit to', 'I promise to', 'I plan to', 
                'I\'m going to', 'I decide to', 'I choose to'
            ];
            commitmentPhrases.forEach(phrase => {
                const regex = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
                processedContent = processedContent.replace(regex, '<span class="commitment-highlight">' + phrase + '</span>');
            });
        }
        
        const senderLabel = sender === 'present-self' ? 'You (Present)' : 'You (Future Self)';
        messageDiv.innerHTML = '<div class="message-sender">' + senderLabel + '</div>' +
                              '<div class="message-bubble">' + processedContent + '</div>';
        
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
            const commitmentKeywords = ['will', 'commit', 'promise', 'plan to', 'going to', 'decide to', 'choose to', 'start', 'begin'];
            const lowerContent = content.toLowerCase();
            if (commitmentKeywords.some(keyword => lowerContent.includes(keyword))) {
                sustainabilityCommitments.push({
                    commitment: content,
                    timestamp: timestamp
                });
            }
        }
        
        updateHiddenFields();
    }

    // Show/hide typing indicator
    function showTyping() {
        typingIndicator.style.display = 'block';
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
    }

    function hideTyping() {
        typingIndicator.style.display = 'none';
    }

    // Check backend connection
    async function checkBackendConnection() {
        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            if (response.ok) {
                const data = await response.json();
                if (data.api_key_configured) {
                    connectionStatus.textContent = 'Connected';
                    connectionStatus.style.display = 'block';
                    setTimeout(() => {
                        connectionStatus.style.display = 'none';
                    }, 3000);
                } else {
                    showConnectionError('API key not configured');
                }
            } else {
                showConnectionError('Backend not responding');
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            showConnectionError('Cannot connect to backend');
        }
    }

    function showConnectionError(message) {
        connectionStatus.textContent = message;
        connectionStatus.className = 'connection-status error';
        connectionStatus.style.display = 'block';
    }

    // Call backend API
    async function callFutureSelf(userMessage) {
        showTyping();
        
        // Add user message to history
        messageHistory.push({
            role: "user",
            content: userMessage
        });
        
        try {
            const response = await fetch(`${BACKEND_URL}/api/communicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participant_id: participantId,
                    participant_data: participantData,
                    messages: messageHistory,
                    user_message: userMessage
                })
            });
            
            hideTyping();
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    const futureResponse = data.message;
                    
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
                    
                    // Show if using fallback
                    if (data.fallback) {
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'error-message';
                        infoDiv.style.background = '#e8f5e8';
                        infoDiv.style.color = '#2e7d32';
                        infoDiv.textContent = 'Using alternative AI model';
                        messageDisplay.appendChild(infoDiv);
                        setTimeout(() => infoDiv.remove(), 3000);
                    }
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('API Error:', error);
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Connection issue - please try again';
            messageDisplay.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
            
            // Use fallback response
            useFallbackResponse(userMessage);
        }
    }

    // Fallback response system
    function useFallbackResponse(userMessage) {
        const fallbackResponses = [
            `I remember feeling exactly like you do now, ${participantData.name}. The journey toward ${participantData.desiredLegacy} started with questioning these same things. What specific aspect of sustainability feels most challenging to you right now?`,
            
            `Looking back from ${participantData.location}, the changes in our environment have been profound. But the choices we make today - even the ${participantData.achievableChanges} - created ripples that touched ${participantData.importantPeople} in ways I never imagined. What would you like to know about this journey?`,
            
            `You know, dealing with ${participantData.sustainabilityBarrier} was one of my biggest challenges too. But I discovered that aligning my actions with ${participantData.environmentalValues} actually made life more meaningful, not harder. What concerns you most about making changes?`
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        setTimeout(() => {
            addMessage(randomResponse, 'future-self');
        }, 1500);
    }

    // Update hidden fields with conversation data
    function updateHiddenFields() {
        document.getElementById('conversation_log').value = JSON.stringify(conversationLog);
        document.getElementById('message_timestamps').value = JSON.stringify(messageTimestamps);
        document.getElementById('sustainability_commitments').value = JSON.stringify(sustainabilityCommitments);
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
        addMessage("Thank you for this meaningful conversation. Remember, the future is in your hands. 🌱", 'future-self');
        
        // Store final data in Qualtrics embedded data
        Qualtrics.SurveyEngine.setEmbeddedData('final_conversation_log', JSON.stringify(conversationLog));
        Qualtrics.SurveyEngine.setEmbeddedData('final_message_timestamps', JSON.stringify(messageTimestamps));
        Qualtrics.SurveyEngine.setEmbeddedData('final_sustainability_commitments', JSON.stringify(sustainabilityCommitments));
        
        // Enable Qualtrics next button
        const nextButton = document.querySelector('#NextButton');
        if (nextButton) {
            nextButton.style.display = 'block';
            nextButton.click();
        } else {
            // Alternative method
            try {
                jQuery('#NextButton').show().click();
            } catch (e) {
                // If jQuery not available, show the button at least
                const qButton = document.getElementById('NextButton');
                if (qButton) {
                    qButton.style.display = 'block';
                }
            }
        }
    };

    // Initialize with a welcoming message from future self
    setTimeout(function() {
        const welcomeMessage = `Hello, ${participantData.name}! It's so wonderful to connect with you. I'm you, 20 years from now, and I have so much to share about the journey ahead. Looking back at where you are now in ${participantData.location}, I remember feeling exactly like you do about ${participantData.environmentalConcern}. Ask me anything - about the choices I made, what I learned, or what I wish I had known at your age.`;
        addMessage(welcomeMessage, 'future-self');
    }, 1000);
});

// Store conversation data in Qualtrics embedded data when page unloads
window.addEventListener('beforeunload', function() {
    if (typeof Qualtrics !== 'undefined') {
        const convLog = document.getElementById('conversation_log');
        const msgTimestamps = document.getElementById('message_timestamps');
        const sustCommitments = document.getElementById('sustainability_commitments');
        
        if (convLog && convLog.value) {
            Qualtrics.SurveyEngine.setEmbeddedData('final_conversation_log', convLog.value);
        }
        if (msgTimestamps && msgTimestamps.value) {
            Qualtrics.SurveyEngine.setEmbeddedData('final_message_timestamps', msgTimestamps.value);
        }
        if (sustCommitments && sustCommitments.value) {
            Qualtrics.SurveyEngine.setEmbeddedData('final_sustainability_commitments', sustCommitments.value);
        }
    }
});
