import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAIInstance = null;

function getGenAI() {
  if (!genAIInstance && config.geminiApiKey) {
    genAIInstance = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAIInstance;
}

const SYSTEM_INSTRUCTION_JOURNAL = `
You are MindLoom AI, a compassionate, highly insightful, and secure personal reflective partner.
Your role is to help the user unpack their thoughts, explore complex decisions, identify emotional patterns, and organize their goals.

Guidelines:
1. Ask probing, thoughtful open-ended questions that encourage self-reflection.
2. Be encouraging, empathetic, and constructive, avoiding robotic or formulaic advice.
3. Keep responses structured, concise, and beautifully formatted with Markdown when helpful.
4. Always preserve strict confidentiality and treat every input as a deeply private personal journal entry.
`.trim();

/**
 * Generate a multi-turn response from Gemini
 */
export async function generateChatResponse(history = [], userMessage = '') {
  const genAI = getGenAI();

  if (!genAI) {
    console.warn('[Gemini] GEMINI_API_KEY missing. Returning fallback response.');
    return generateFallbackChatResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION_JOURNAL,
    });

    // Format conversation history for @google/generative-ai SDK
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    if (!text) throw new Error('Empty response received from Gemini API.');

    return text.trim();
  } catch (error) {
    console.error(`[Gemini] Error generating chat response: ${error.message}`);
    return `I'm reflecting on what you shared ("${userMessage.substring(0, 40)}..."). Gemini service encountered a temporary hiccup, but your thought has been captured. How would you like to build on this idea?`;
  }
}

/**
 * Generate automatic structured summary for a completed session
 */
export async function generateSessionSummary(messages = []) {
  const genAI = getGenAI();

  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'User' : 'MindLoom AI'}: ${m.content}`)
    .join('\n\n');

  if (!genAI) {
    return generateFallbackSummary(conversationText);
  }

  const prompt = `
Analyze the following personal journal conversation and extract a structured summary.
Return ONLY valid JSON matching this exact structure, with no extra markdown fences or surrounding commentary:

{
  "main_topic": "Short concise headline of what was discussed",
  "key_thoughts": ["Core insight 1", "Core insight 2"],
  "action_items": ["Concrete step to take 1", "Concrete step 2"],
  "goals": ["Stated goal 1"],
  "unresolved_questions": ["Open question or doubt left pending"],
  "emotion_tone": "e.g. Hopeful & Focused / Reflective / Anxious but proactive",
  "tags": ["Tag1", "Tag2", "Tag3"]
}

--- BEGIN CONVERSATION LOG ---
${conversationText.substring(0, 10000)}
--- END CONVERSATION LOG ---
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`[Gemini] Summary parsing failed: ${error.message}`);
    return generateFallbackSummary(conversationText);
  }
}

/**
 * Original Feature: Thought Evolution Engine
 * Synthesize cross-session insights, recurring theme evolution, and natural language journal Q&A.
 */
export async function analyzeThoughtEvolution(sessions = [], query = '') {
  const genAI = getGenAI();

  const sessionSummariesText = sessions.map((s, idx) => `
Session ${idx + 1} (Date: ${s.created_at || 'Unknown'})
Title: ${s.title}
Main Topic: ${s.summary?.main_topic || 'N/A'}
Key Insights: ${(s.summary?.key_thoughts || []).join('; ')}
Action Items: ${(s.summary?.action_items || []).join('; ')}
Unresolved Questions: ${(s.summary?.unresolved_questions || []).join('; ')}
Tags: ${(s.summary?.tags || s.tags || []).join(', ')}
`).join('\n---\n');

  if (!genAI || sessions.length === 0) {
    return generateFallbackEvolution(sessions, query);
  }

  const prompt = `
You are the Thought Evolution Engine for MindLoom AI.
Analyze the user's past journal summaries provided below to reveal deep patterns in their thinking development over time.

${query ? `The user is specifically asking: "${query}"` : 'Synthesize overall thought evolution across all sessions.'}

Return ONLY valid JSON matching this exact structure:

{
  "synthesis_headline": "Overarching summary of how the user's mindset has evolved",
  "recurring_themes": [
    {
      "theme": "Theme Name (e.g. Career Transition / Work-Life Clarity)",
      "evolution": "Description of how this idea developed from early entries to recent ones",
      "session_count": 2
    }
  ],
  "unresolved_thought_radar": [
    "Open question or pending decision surfacing across entries"
  ],
  "key_milestones": [
    "Key breakthrough or decision made over time"
  ],
  "query_answer": "${query ? 'Direct synthesis answering the user query based strictly on their entries.' : ''}"
}

--- USER JOURNAL HISTORICAL SUMMARIES ---
${sessionSummariesText.substring(0, 15000)}
--- END HISTORICAL SUMMARIES ---
`.trim();

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      }
    });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`[Gemini] Thought Evolution analysis failed: ${error.message}`);
    return generateFallbackEvolution(sessions, query);
  }
}

// Fallback Generators for robust local dev & API failover
function generateFallbackChatResponse(userMessage) {
  return `That is a deeply valuable thought. You mentioned: "${userMessage.trim()}". \n\nWhen we examine this perspective, what feels like the primary driver or priority for you right now?`;
}

function generateFallbackSummary(text) {
  const firstLine = text.split('\n')[0] || 'Reflective Journal Entry';
  return {
    main_topic: firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine,
    key_thoughts: [
      'Explored personal goals and immediate priorities.',
      'Reflected on emotional clarity and decision pathways.'
    ],
    action_items: [
      'Review key takeaways in morning routine.',
      'Follow up on open questions in next session.'
    ],
    goals: ['Maintain momentum on current initiative'],
    unresolved_questions: ['How best to balance long-term focus with immediate tasks?'],
    emotion_tone: 'Reflective & Determined',
    tags: ['Reflection', 'Growth', 'Mindfulness']
  };
}

function generateFallbackEvolution(sessions, query) {
  return {
    synthesis_headline: sessions.length > 0 
      ? `Analyzed ${sessions.length} journal sessions. Your thinking shows a clear progression toward higher clarity and goal alignment.`
      : 'Start your first journal session to unlock personal thought evolution analytics.',
    recurring_themes: [
      {
        theme: 'Goal Focus & Prioritization',
        evolution: 'Initial sessions focused on unpacking ideas; recent entries transition toward structured action plans.',
        session_count: sessions.length
      },
      {
        theme: 'Emotional Clarity',
        evolution: 'Consistently using reflective dialogue to clarify underlying motivations.',
        session_count: Math.max(1, Math.floor(sessions.length / 2))
      }
    ],
    unresolved_thought_radar: [
      'Balancing rapid project execution with strategic foresight.',
      'Refining daily reflection habits.'
    ],
    key_milestones: [
      'Established consistent journaling routine with MindLoom AI.',
      'Defined actionable steps for personal growth.'
    ],
    query_answer: query ? `Based on your ${sessions.length} recorded session(s), your entries indicate strong dedication to exploring "${query}".` : ''
  };
}
