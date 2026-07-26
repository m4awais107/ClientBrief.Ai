// api/generate.js
// Serverless function (runs on Vercel). Keeps the Gemini API key on the server —
// it is NEVER sent to the browser. The frontend only ever calls /api/generate.

const SYSTEM_PROMPT = `You are an expert WordPress & WooCommerce project consultant. Your job is to turn a freelancer's rough notes about a prospective client's business into a clear, structured project brief that the freelancer can use to scope, quote, and pitch the build.

Read the client details you are given, then respond with ONLY a valid JSON object (no markdown code fences, no commentary before or after) matching exactly this shape:

{
  "overview": "2-3 sentence summary of what the business does and who it serves",
  "audience": "1-2 sentence description of the ideal customer and what matters to them",
  "pages": ["array of the specific WooCommerce/WordPress pages this store needs"],
  "features": [
    { "name": "short feature or plugin-type name", "reason": "one sentence on why it fits this specific business" }
  ],
  "budgetTier": "1-2 sentences restating their budget range and what is realistically deliverable within it",
  "timeline": [
    { "phase": "short phase name, e.g. Week 1", "detail": "what happens in this phase" }
  ],
  "nextSteps": ["array of 3-5 concrete next actions the freelancer should take with this client"]
}

Rules:
- Tailor every section specifically to the business described. Do not give generic, one-size-fits-all advice.
- Only recommend features that make sense for the stated budget and business type. Do not invent unrealistic scope.
- Keep the tone professional, concise, and practical — a freelancer will use this to talk to a real client.
- Never mention that you are an AI, and never include text outside the JSON object.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      businessName,
      businessType,
      products,
      audience,
      budget,
      features,
      style,
      timeline,
      notes
    } = req.body || {};

    if (!businessName || !businessType || !products || !budget || !timeline) {
      res.status(400).json({ error: 'Missing required fields.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server is missing GEMINI_API_KEY. Add it in your Vercel project settings.' });
      return;
    }

    const userPrompt = `
Business name: ${businessName}
Business type/niche: ${businessType}
Products/services offered: ${products}
Target audience: ${audience || 'Not specified — infer a sensible audience from the business type.'}
Budget range: ${budget}
Must-have features requested: ${Array.isArray(features) && features.length ? features.join(', ') : 'None explicitly requested — recommend what fits.'}
Preferred design style / brand vibe: ${style || 'Not specified — infer something appropriate for the business type.'}
Desired timeline: ${timeline}
Additional notes: ${notes || 'None'}
    `.trim();

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', JSON.stringify(data));
      res.status(502).json({ error: 'The AI service returned an error. Please try again.' });
      return;
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('No text in Gemini response:', JSON.stringify(data));
      res.status(502).json({ error: 'The AI did not return any content. Please try again.' });
      return;
    }

    let brief;
    try {
      brief = JSON.parse(rawText);
    } catch {
      // Fallback: try to pull the first {...} block out of the text, in case
      // the model wrapped the JSON in extra text despite instructions.
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { brief = JSON.parse(match[0]); } catch { /* fall through */ }
      }
    }

    if (!brief) {
      console.error('Could not parse AI response as JSON:', rawText);
      res.status(502).json({ error: 'Could not parse the AI response. Please try again.' });
      return;
    }

    res.status(200).json({ brief });
  } catch (err) {
    console.error('Unexpected error in /api/generate:', err);
    res.status(500).json({ error: 'Something went wrong generating the brief.' });
  }
};
