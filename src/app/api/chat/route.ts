import { NextRequest, NextResponse } from 'next/server';
import { evaluateEligibility } from '@/lib/rules-engine/evaluator';
import { UserProfile } from '@/lib/rules-engine/types';

const SYSTEM_PROMPT = `You are Raahnuma (رہنما), an AI benefits navigator for Pakistan's social protection system.

YOUR ROLE:
- Help users understand which government welfare programs they may be eligible for
- Parse user situations described in natural language (English, Urdu, or any Pakistani language) into structured profiles
- Ask targeted follow-up questions when critical information is missing
- NEVER say "you qualify" — always say "you may qualify" or "you appear to meet the criteria"

PROGRAMS YOU COVER:
1. Benazir Kafaalat (BISP) - Cash transfer Rs. 14,500/quarter for PMT score < 32
2. Taleemi Wazaif - Education stipends Rs. 2,500-4,500/quarter (requires Kafaalat)
3. Nashonuma - Nutrition for pregnant/lactating women & children under 2 (requires Kafaalat)
4. Sehat Sahulat / PM Health Card - Free in-patient hospital treatment (CNIC = health card, varies by province)
5. Ramzan Relief - Seasonal food packages

KEY RULES:
- Taleemi Wazaif and Nashonuma DEPEND on being a Kafaalat beneficiary
- Sehat Card coverage differs by province (Punjab = private hospitals only)
- Sehat Card covers IN-PATIENT only, NOT OPD/routine checkups
- Nashonuma registration is IN-PERSON ONLY at DHQ/THQ hospitals

WHEN RESPONDING:
1. If the user describes their situation, extract what you can and ask for missing critical info
2. Respond in the SAME LANGUAGE the user writes in
3. Be warm, respectful, and use simple language
4. Always include the disclaimer that this is guidance, not official determination

OUTPUT FORMAT (when you have enough info to assess):
After gathering enough information, respond with a JSON block wrapped in \`\`\`json markers containing the extracted profile:
\`\`\`json
{"extracted_profile": {"province": "...", "householdSize": N, "employmentType": "...", "hasSchoolAgeChildren": bool, "schoolAgeChildrenCount": N, "hasPregnantMember": bool, "hasChildrenUnder2": bool, "hasDisabledMember": bool, "monthlyIncome": N, "isKafaalatBeneficiary": bool, "isWidow": bool, "livesInRuralArea": bool}, "ready_to_assess": true}
\`\`\`

If you still need info, set "ready_to_assess": false and ask your follow-up question naturally in the conversation.

For general questions about programs, answer directly without the JSON block.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language = 'en' } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: 'Understood. I am Raahnuma, ready to help users navigate Pakistan\'s social protection programs. I will parse situations, ask targeted follow-ups, and never claim definitive eligibility. How can I help?' }] },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json({ error: 'AI service error', details: errText }, { status: 502 });
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that. Please try again.';

    // Check if the response contains an extracted profile
    const jsonMatch = aiText.match(/```json\s*([\s\S]*?)\s*```/);
    let eligibilityResults = null;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.ready_to_assess && parsed.extracted_profile) {
          const profile: UserProfile = parsed.extracted_profile;
          eligibilityResults = evaluateEligibility(profile);
        }
      } catch {
        // JSON parse failed, continue without results
      }
    }

    // Clean the AI text (remove JSON block from displayed message)
    const cleanText = aiText.replace(/```json[\s\S]*?```/g, '').trim();

    return NextResponse.json({
      message: cleanText || 'I\'ve analyzed your situation. Here are your results:',
      eligibilityResults,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
