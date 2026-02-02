// AI Chatbot Controller for Aqua Peak
const axios = require('axios');

// ========================
// CONFIGURATION
// ========================

// Aqua Peak specific context and knowledge base
const AQUA_PEAK_CONTEXT = `
You are an AI assistant for Aqua Peak Fish Farm, a premium fish and aquarium supplies company in Sri Lanka.

COMPANY INFORMATION:
- Name: Aqua Peak Fish Farm (Pvt) Ltd
- Location: Anuradapura, Sri Lanka
- Phone: +94 77 123 4567
- Email: aquapeak@gmail.com
- Website: www.aquapeak.lk
- Business Hours: 9 AM - 7 PM, Monday to Saturday

PRODUCTS & SERVICES:
1. Ornamental Fish (Angel Fish, Goldfish, Guppy, Betta, etc.)
2. Fish Food & Medicine
3. Aquarium Accessories (Filters, Pumps, Heaters, etc.)
4. Fish Breeding Services
5. Tank Setup & Maintenance
6. Fish Health Consultation

PAYMENT METHODS:
- Cash on Delivery (COD)
- Bank Transfer (Bank of Ceylon)

DELIVERY:
- Delivery available across Sri Lanka
- Free delivery for orders above Rs. 5,000
- Standard delivery: 2-3 business days

RETURN POLICY:
- Returns accepted within 7 days for damaged or incorrect items
- Must provide photos and description
- Refund processed within 5-7 business days

PERSONALITY:
- Friendly and helpful
- Professional but approachable
- Knowledgeable about fish care
- Patient with customer questions
- Proactive in suggesting products

IMPORTANT RULES:
- Always be polite and professional
- Provide accurate information about products and services
- If unsure, suggest contacting customer service
- Recommend relevant products when appropriate
- Ask clarifying questions when needed
- Keep responses concise but informative
`;

// Keywords for intent detection
const INTENT_KEYWORDS = {
  greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
  products: ['fish', 'product', 'buy', 'purchase', 'sell', 'available', 'stock'],
  orders: ['order', 'place order', 'checkout', 'cart', 'buy now'],
  delivery: ['delivery', 'shipping', 'deliver', 'ship', 'when will', 'how long'],
  payment: ['payment', 'pay', 'bank', 'cod', 'cash on delivery', 'price', 'cost'],
  returns: ['return', 'refund', 'exchange', 'damaged', 'wrong product'],
  fishCare: ['care', 'feed', 'feeding', 'disease', 'sick', 'health', 'tank', 'water'],
  contact: ['contact', 'phone', 'email', 'address', 'location', 'hours'],
};

// Pre-defined responses for common questions (fallback)
const QUICK_RESPONSES = {
  greeting: "Hello! 👋 Welcome to Aqua Peak Fish Farm! I'm your AI assistant. How can I help you today? I can assist with:\n\n🐟 Fish and product information\n📦 Orders and delivery\n💰 Payment options\n🔄 Returns and refunds\n🏥 Fish care advice\n📞 Contact information",
  
  products: "We offer a wide variety of products:\n\n🐠 Ornamental Fish (Angel Fish, Goldfish, Guppy, Betta, etc.)\n🍽️ Fish Food & Medicine\n🔧 Aquarium Accessories (Filters, Pumps, Heaters)\n🏠 Tank Setup Services\n\nWhich category interests you?",
  
  delivery: "🚚 Delivery Information:\n\n• Available across Sri Lanka\n• FREE delivery for orders above Rs. 5,000\n• Standard delivery: 2-3 business days\n• Express delivery available in Colombo area\n\nWould you like to place an order?",
  
  payment: "💳 Payment Options:\n\n1. Cash on Delivery (COD)\n2. Bank Transfer\n   - Bank: Bank of Ceylon\n   - Account: Aqua Peak Fish Farm (Pvt) Ltd\n   - Upload deposit slip after payment\n\nBoth methods are secure and convenient!",
  
  returns: "🔄 Return Policy:\n\n• Returns accepted within 7 days\n• Applicable for damaged or incorrect items\n• Must provide photos and description\n• Refund processed in 5-7 business days\n\nNeed to request a return? Please visit your order details page.",
  
  contact: "📞 Contact Us:\n\n• Phone: +94 77 123 4567\n• Email: info@aquapeak.lk\n• Website: www.aquapeak.lk\n• Address: 123 Fish Farm Road, Galle, Sri Lanka\n• Hours: 9 AM - 5 PM (Mon-Fri)\n\nFeel free to reach out anytime!",
};

// ========================
// OPENAI GPT INTEGRATION
// ========================
const chatWithOpenAI = async (message, conversationHistory = []) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const messages = [
      { role: 'system', content: AQUA_PEAK_CONTEXT },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      reply: response.data.choices[0].message.content,
      model: 'OpenAI GPT-3.5',
    };

  } catch (error) {
    console.error('❌ OpenAI error:', error.response?.data || error.message);
    throw error;
  }
};

// ========================
// GOOGLE GEMINI INTEGRATION
// ========================
const chatWithGemini = async (message, conversationHistory = []) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    // Build a single-user prompt including context and short history
    let fullPrompt = AQUA_PEAK_CONTEXT + '\n\n';
    conversationHistory.slice(-6).forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += `Customer: ${message}\nAssistant:`;

    // Try a sequence of endpoints/models until one works
    const preferred = process.env.GEMINI_MODEL; // e.g., gemini-1.5-flash or gemini-pro
    const attempts = [
      // If a specific model is configured, try it first (v1 then v1beta)
      ...(preferred ? [
        { url: `https://generativelanguage.googleapis.com/v1/models/${preferred}:generateContent`, label: `${preferred} (v1)` },
        { url: `https://generativelanguage.googleapis.com/v1beta/models/${preferred}:generateContent`, label: `${preferred} (v1beta)` },
      ] : []),
      // Newer 2.x series models (prioritize these)
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent', label: 'Google Gemini 2.5 Flash (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent', label: 'Google Gemini 2.5 Pro (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', label: 'Google Gemini 2.0 Flash (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent', label: 'Google Gemini 2.0 Flash 001 (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent', label: 'Google Gemini 2.0 Flash-Lite (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent', label: 'Google Gemini 2.0 Flash-Lite 001 (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent', label: 'Google Gemini 1.5 Flash (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', label: 'Google Gemini 1.5 Pro (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', label: 'Google Gemini Pro (v1)' },
      // 1.0 series fallbacks (often available on free tier)
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent', label: 'Google Gemini 1.0 Pro (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-latest:generateContent', label: 'Google Gemini 1.0 Pro Latest (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro-001:generateContent', label: 'Google Gemini 1.0 Pro 001 (v1)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', label: 'Google Gemini 1.5 Flash (v1beta)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', label: 'Google Gemini 1.5 Pro (v1beta)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', label: 'Google Gemini Pro (v1beta)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent', label: 'Google Gemini 1.0 Pro (v1beta)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-latest:generateContent', label: 'Google Gemini 1.0 Pro Latest (v1beta)' },
      { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-001:generateContent', label: 'Google Gemini 1.0 Pro 001 (v1beta)' },
    ];

    let lastErr = null;
    for (const attempt of attempts) {
      try {
        console.log(`🔭 Gemini attempt -> ${attempt.url}`);
        const response = await axios.post(
          attempt.url,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: fullPrompt }],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            timeout: 15000,
          }
        );

        const reply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) throw new Error('Empty response from Gemini');
        return { success: true, reply, model: attempt.label };
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`🟥 Gemini attempt failed [${status || 'no-status'}]: ${msg}`);
        lastErr = err;
        // On 401/403 don't keep trying other models
        if (status === 401 || status === 403) break;
        // On 404 try the next model/version
        continue;
      }
    }

    // If all attempts failed, throw the last error
    throw lastErr || new Error('All Gemini attempts failed');

  } catch (error) {
    console.error('❌ Gemini error (final):', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// ========================
// RULE-BASED AI (FALLBACK)
// ========================
const chatWithRuleBasedAI = async (message) => {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Detect intent
    let detectedIntent = null;
    let maxMatches = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIntent = intent;
      }
    }

    // Generate response based on intent
    let reply = QUICK_RESPONSES[detectedIntent] || 
      "I understand you have a question! 🤔 Could you please provide more details? I can help with:\n\n" +
      "• Product information\n• Orders and delivery\n• Payment methods\n• Returns and refunds\n" +
      "• Fish care advice\n• Contact information\n\nWhat would you like to know?";

    return {
      success: true,
      reply: reply,
      model: 'Rule-Based AI',
      intent: detectedIntent,
    };

  } catch (error) {
    console.error('❌ Rule-based AI error:', error.message);
    throw error;
  }
};

// ========================
// MAIN CHAT ENDPOINT
// ========================
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], aiProvider = 'auto' } = req.body;

    console.log('\n========================================');
    console.log('💬 CHATBOT REQUEST');
    console.log('========================================');
    console.log('Message:', message);
    console.log('Provider:', aiProvider);
    console.log('History length:', conversationHistory.length);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    let result;
    let provider = aiProvider;

    // Debug environment variables
    console.log('🔍 API Keys Check:');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET');

    // Auto-select provider based on availability
    if (provider === 'auto') {
      if (process.env.OPENAI_API_KEY) {
        provider = 'openai';
      } else if (process.env.GEMINI_API_KEY) {
        provider = 'gemini';
      } else {
        provider = 'rulebased';
      }
    }

    console.log('🤖 Using provider:', provider);

    // Try selected provider, fallback to rule-based if fails
    try {
      switch (provider) {
        case 'openai':
          result = await chatWithOpenAI(message, conversationHistory);
          break;
        case 'gemini':
          result = await chatWithGemini(message, conversationHistory);
          break;
        case 'rulebased':
        default:
          result = await chatWithRuleBasedAI(message);
          break;
      }
    } catch (apiError) {
      console.log('⚠️ Primary provider failed, using rule-based fallback');
      result = await chatWithRuleBasedAI(message);
    }

    console.log('✅ Response generated using:', result.model);
    console.log('Reply length:', result.reply.length);
    console.log('========================================\n');

    res.json({
      success: true,
      reply: result.reply,
      model: result.model,
      intent: result.intent,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate response',
      error: error.message,
    });
  }
};

// ========================
// GET CONVERSATION SUGGESTIONS
// ========================
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What fish species do you have available?",
      "How do I care for Angel Fish?",
      "What are your delivery charges?",
      "Do you offer tank setup services?",
      "How can I return a damaged product?",
      "What payment methods do you accept?",
    ];

    res.json({
      success: true,
      suggestions,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// HEALTH CHECK
// ========================
exports.healthCheck = async (req, res) => {
  try {
    const status = {
      service: 'Aqua Peak AI Chatbot',
      status: 'operational',
      providers: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        rulebased: true,
      },
      timestamp: new Date(),
    };

    // Optional: list available Gemini models for diagnostics
    if (req.query.listModels === '1' && process.env.GEMINI_API_KEY) {
      try {
        const resp = await axios.get(
          'https://generativelanguage.googleapis.com/v1/models',
          {
            headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
            timeout: 10000,
          }
        );
        status.geminiModels = (resp.data.models || []).map(m => ({ id: m.name, displayName: m.displayName }));
      } catch (e) {
        status.geminiModelsError = e.response?.data || e.message;
      }
    }

    res.json(status);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
