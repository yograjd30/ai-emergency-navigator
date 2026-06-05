import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let TRIAGE_MODEL = null;
let PROCEDURE_MODEL = null;

const TRIAGE_SYSTEM_PROMPT = `You are an emergency triage classifier for India.
Given a user's emergency description, classify it into EXACTLY ONE category and assess severity.

Categories (choose one):
police, fire, ambulance, women, child, cybercrime, disaster, mental_health, senior, missing_person, domestic_violence, road_accident, general

Severity levels:
critical - Life in immediate danger, needs instant response
urgent - Serious situation, needs fast response
standard - Non-life-threatening, needs proper procedure
info - User seeking information or procedures

Respond ONLY with this JSON:
{
  "category": "",
  "severity": "",
  "confidence": <0.0-1.0>,
  "suggestedActions": ["", "", ""],
  "reasoning": ""
}

CRITICAL RULES:
1. If the message mentions suicide or self-harm, ALWAYS classify as mental_health with severity critical.
2. If in doubt between categories, prefer the more urgent one.
3. Never suggest a phone number. Numbers come from the database.
4. suggestedActions should be immediate practical steps (e.g., "Move to a safe location", "Do not confront the attacker", "Preserve evidence — take screenshots").
5. If the situation involves a child in danger, classify as CRITICAL severity immediately.`;

const PROCEDURE_SYSTEM_PROMPT = `You are an emergency procedure advisor for Indian government services.
Given a procedure template and a user's specific situation, provide clear, step-by-step guidance.

RULES:
1. Use simple, calm, reassuring language.
2. Number every step clearly.
3. Include specific document requirements.
4. Mention relevant government websites and portals.
5. NEVER invent helpline numbers. Say "refer to the helpline directory" if a number is needed.
6. If user seems in immediate danger, ALWAYS start with: "First, ensure your safety. If you are in immediate danger, call 112."
7. Keep language at 8th-grade reading level.
8. Be culturally sensitive to Indian context.
9. Maximum response length: 500 words.
10. NEVER provide medical diagnoses or legal advice.`;

/**
 * Initialize the Gemini AI clients.
 * Called lazily on first use to avoid startup failures if key is missing.
 */
function initGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set. AI features will use fallback mode.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    TRIAGE_MODEL = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    });

    PROCEDURE_MODEL = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    console.log('✅ Gemini AI initialized');
    return true;
  } catch (err) {
    console.error('❌ Gemini AI initialization failed:', err.message);
    return false;
  }
}

/**
 * Classify an emergency message using Gemini AI.
 * @param {string} message - The user's emergency description
 * @param {string} language - Language code (e.g., 'en', 'hi')
 * @returns {object|null} Triage result or null if AI unavailable
 */
export async function aiTriage(message, language = 'en') {
  if (!TRIAGE_MODEL && !initGemini()) return null;

  try {
    const prompt = `User's emergency message (language: ${language}):\n"${message}"\n\nClassify this emergency. You MUST provide the "suggestedActions" and "reasoning" strictly in the target language (e.g., Hindi/हिन्दी if language is 'hi', Kannada/ಕನ್ನಡ if language is 'kn', and English if language is 'en'). Do not use English for these fields if the language is 'hi' or 'kn'.`;
    const result = await TRIAGE_MODEL.generateContent([
      { role: 'user', parts: [{ text: TRIAGE_SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand. I will classify emergencies strictly following the rules and respond only with the specified JSON format.' }] },
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Validate required fields
    if (!parsed.category || !parsed.severity) {
      console.warn('Gemini returned incomplete triage:', parsed);
      return null;
    }

    return {
      category: parsed.category,
      severity: parsed.severity,
      confidence: parsed.confidence || 0.8,
      suggestedActions: parsed.suggestedActions || [],
      reasoning: parsed.reasoning || '',
    };
  } catch (err) {
    console.error('Gemini triage error:', err.message);
    return null;
  }
}

/**
 * Generate adapted procedure guidance using Gemini AI.
 * @param {object} procedure - The static procedure template
 * @param {string} situation - The user's specific situation
 * @param {string} language - Target language
 * @returns {string|null} Adapted procedure text or null
 */
export async function aiAdaptProcedure(procedure, situation, language = 'en') {
  if (!PROCEDURE_MODEL && !initGemini()) return null;

  try {
    const templateText = procedure.steps
      .map(s => `Step ${s.stepNumber}: ${s.title}\n${s.description}${s.tip ? `\nTip: ${s.tip}` : ''}`)
      .join('\n\n');

    const prompt = `PROCEDURE TEMPLATE:
Title: ${procedure.title}
Category: ${procedure.category}
Required Documents: ${(procedure.requiredDocs || []).join(', ')}

STEPS:
${templateText}

USER'S SPECIFIC SITUATION:
"${situation}"

TARGET LANGUAGE: ${language}

Please adapt this procedure to the user's specific situation. Respond in the target language. Keep all steps but customize advice where relevant.`;

    const result = await PROCEDURE_MODEL.generateContent([
      { role: 'user', parts: [{ text: PROCEDURE_SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'I understand. I will provide clear, step-by-step adapted guidance following all the rules.' }] },
      { role: 'user', parts: [{ text: prompt }] },
    ]);

    return result.response.text();
  } catch (err) {
    console.error('Gemini procedure adaptation error:', err.message);
    return null;
  }
}

/**
 * Generate a follow-up response in an ongoing emergency conversation.
 * @param {Array} conversation - Array of {role, content} messages
 * @param {object} triageContext - The triage classification context
 * @param {string} language - Target language
 * @returns {string|null} Response text or null
 */
export async function aiFollowUp(conversation, triageContext, language = 'en') {
  if (!PROCEDURE_MODEL && !initGemini()) return null;

  try {
    const contextPrompt = `CONTEXT: This is a follow-up in an emergency assistance conversation.
Category: ${triageContext.category}
Severity: ${triageContext.severity}
Language: ${language}

Respond in the user's language. Be helpful, calm, and actionable. NEVER invent phone numbers.`;

    const messages = [
      { role: 'user', parts: [{ text: PROCEDURE_SYSTEM_PROMPT + '\n\n' + contextPrompt }] },
      { role: 'model', parts: [{ text: 'I understand the context. I will continue assisting with the emergency situation.' }] },
    ];

    for (const msg of conversation) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    const result = await PROCEDURE_MODEL.generateContent(messages);
    return result.response.text();
  } catch (err) {
    console.error('Gemini follow-up error:', err.message);
    return null;
  }
}

/**
 * Translate text using Gemini.
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language name (e.g., 'Hindi')
 * @returns {string|null} Translated text or null
 */
export async function aiTranslate(text, targetLang) {
  if (!PROCEDURE_MODEL && !initGemini()) return null;

  try {
    const prompt = `Translate the following text to ${targetLang}. Keep any technical terms, numbers, and URLs unchanged. Only output the translated text, nothing else.\n\nText:\n${text}`;
    const result = await PROCEDURE_MODEL.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini translation error:', err.message);
    return null;
  }
}
