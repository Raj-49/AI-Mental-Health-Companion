// -----------------------------
// GEMINI AI SERVICE
// -----------------------------
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model - use models that work with current SDK
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ 
  model: modelName
});

// Log the model being used
console.log(`✓ Gemini AI initialized with model: ${modelName}`);

/**
 * Generate AI chat response
 * @param {string} message - User's message
 * @param {string} context - Additional context (user preferences, mood, etc.)
 * @param {Array} history - Previous chat messages for context
 * @returns {Promise<string>} AI response
 */
export const generateChatResponse = async (message, context = "", history = []) => {
  try {
    // Build the full prompt with context and history
    let prompt = "";
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    if (history.length > 0) {
      prompt += "Previous conversation:\n";
      history.slice(-5).forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.message}\n`;
      });
      prompt += "\n";
    }
    
    prompt += `User: ${message}\n\nAI:`;
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Gemini AI Error:", error);

    const err = new Error("AI service unavailable. Please try again later.");
    err.statusCode = 503;

    if (
      typeof error?.message === 'string' &&
      error.message.toLowerCase().includes('user location is not supported')
    ) {
      err.message = "AI service is not available in this region.";
    }

    throw err;
  }
};

/**
 * Generate chat title from first message
 * @param {string} message - User's first message
 * @returns {Promise<string>} Generated title
 */
export const generateChatTitle = async (message) => {
  try {
    const prompt = `Generate a short, concise title (max 5-6 words) for a chat conversation that starts with this message: "${message}". Only respond with the title, nothing else.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim().replace(/^["']|["']$/g, '');
    
    return title;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "New Conversation";
  }
};

/**
 * Generate weekly AI summary for user
 * @param {Object} userData - User's data including journals, mood logs, therapy plans
 * @param {boolean} includeTherapyPlan - Whether to include therapy plan in summary
 * @returns {Promise<Object>} Generated summary with insights and recommendations
 */
export const generateWeeklySummary = async (userData, includeTherapyPlan = false) => {
  try {
    const { user, journals, moodLogs, therapyPlans, aiTone } = userData;
    
    // Build comprehensive prompt
    let prompt = `You are an AI mental health companion with a ${aiTone || 'empathetic'} tone. Generate a weekly summary for ${user.fullName || 'the user'}.\n\n`;
    
    // Add mood data
    if (moodLogs && moodLogs.length > 0) {
      prompt += `Mood Logs (past week):\n`;
      moodLogs.forEach(log => {
        prompt += `- ${log.mood} (Energy: ${log.energyLevel}/10, Stress: ${log.stressLevel}/10) - ${log.note || 'No note'}\n`;
      });
      prompt += "\n";
    }
    
    // Add journal entries
    if (journals && journals.length > 0) {
      prompt += `Journal Entries (past week):\n`;
      journals.forEach(journal => {
        prompt += `- ${journal.title || 'Untitled'}: ${journal.content?.substring(0, 150)}...\n`;
      });
      prompt += "\n";
    }
    
    // Add therapy plan if requested
    if (includeTherapyPlan && therapyPlans && therapyPlans.length > 0) {
      prompt += `Active Therapy Plans:\n`;
      therapyPlans.forEach(plan => {
        prompt += `- ${plan.goalTitle} (${plan.progress}% complete): ${plan.goalDescription}\n`;
      });
      prompt += "\n";
    }
    
    prompt += `Based on this data, provide:\n`;
    prompt += `1. A brief overview of their emotional patterns this week\n`;
    prompt += `2. Key insights about their mental health journey\n`;
    prompt += `3. 2-3 personalized recommendations for the coming week\n`;
    prompt += `4. Words of encouragement\n\n`;
    prompt += `Format the response in a warm, supportive tone as HTML for email.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return {
      summary,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to generate weekly summary");
  }
};

/**
 * Generate personalized insight based on user data
 * @param {Object} userData - User's recent data
 * @returns {Promise<Object>} Generated insights
 */
export const generateInsight = async (userData) => {
  try {
    const { journals, moodLogs, aiTone } = userData;
    
    let prompt = `You are an AI mental health companion with a ${aiTone || 'empathetic'} tone. Analyze the following data and provide insights:\n\n`;
    
    if (moodLogs && moodLogs.length > 0) {
      prompt += `Recent Mood Patterns:\n`;
      moodLogs.forEach(log => {
        prompt += `- ${log.mood} (Energy: ${log.energyLevel}, Stress: ${log.stressLevel})\n`;
      });
      prompt += "\n";
    }
    
    if (journals && journals.length > 0) {
      prompt += `Recent Journal Themes:\n`;
      journals.forEach(journal => {
        prompt += `- ${journal.content?.substring(0, 100)}...\n`;
      });
      prompt += "\n";
    }
    
    prompt += `Provide a concise insight summary (2-3 paragraphs) about their mental health patterns and suggestions.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insight = response.text();
    
    return insight;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to generate insight");
  }
};

export default {
  generateChatResponse,
  generateChatTitle,
  generateWeeklySummary,
  generateInsight,
  model
};
