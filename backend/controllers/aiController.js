/**
 * AI Controller for Samadhan Setu
 * Reviews citizen-provided reports and suggests a category, severity, and concise title.
 * It deliberately does not invent report facts or submit challenges.
 * Supports external LLM (Gemini/OpenAI) when API keys are configured, with a smart offline NLP fallback engine.
 */

const CATEGORIES = [
  'Water & Sanitation',
  'Infrastructure',
  'Education',
  'Health',
  'Environment',
  'Governance',
  'Other',
];

const KEYWORD_CATEGORY_MAP = [
  {
    category: 'Infrastructure',
    keywords: ['wire', 'spark', 'transformer', 'pole', 'electricity', 'power', 'street light', 'voltage', 'blackout', 'electric', 'short circuit', 'road', 'pothole', 'bridge', 'traffic', 'street', 'asphalt', 'highway', 'lane', 'bus stop', 'tar', 'footpath', 'divider', 'building'],
  },
  {
    category: 'Water & Sanitation',
    keywords: ['garbage', 'waste', 'sewage', 'drain', 'manhole', 'trash', 'sanitation', 'dump', 'odor', 'smell', 'toilet', 'filth', 'gutters', 'water', 'pipe', 'pipeline', 'drinking', 'leakage', 'borewell', 'handpump', 'contamination', 'dirty water', 'tap', 'tank'],
  },
  {
    category: 'Health',
    keywords: ['hospital', 'clinic', 'medical', 'doctor', 'disease', 'outbreak', 'dengue', 'malaria', 'ambulance', 'health', 'medicine', 'phc'],
  },
  {
    category: 'Education',
    keywords: ['school', 'college', 'classroom', 'bench', 'roof', 'building', 'teacher', 'student', 'blackboard', 'education', 'desk'],
  },
  {
    category: 'Environment',
    keywords: ['flood', 'crop', 'drought', 'canal', 'forest', 'tree', 'pollution', 'river', 'farm', 'irrigation', 'soil', 'pesticide', 'air quality'],
  },
  {
    category: 'Governance',
    keywords: ['bribe', 'delay', 'office', 'ration', 'pension', 'scheme', 'official', 'certificate', 'governance', 'portal'],
  },
];

const CRITICAL_KEYWORDS = ['live wire', 'emergency', 'death', 'die', 'fatal', 'accident', 'electric shock', 'collapse', 'poison', 'toxic', 'fire', 'children in danger', 'school gate', 'drowning', 'landslide'];
const HIGH_KEYWORDS = ['hazard', 'severe', 'heavy leakage', 'outbreak', 'no water', 'contaminate', 'broken bridge', 'blocked drain', 'major', 'disease', 'urgent', 'school', 'hospital'];
const MEDIUM_KEYWORDS = ['flickering', 'damaged', 'overflow', 'uncollected', 'slow', 'inconvenience', 'pothole', 'smell', 'leak'];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const buildQualityChecks = ({ title, location, description }) => {
  const checks = [];
  if (!description.trim() || description.trim().length < 20) {
    checks.push('Add one sentence explaining what happened and how it affects people.');
  }
  if (!location.trim() || location.split(',').filter(Boolean).length < 3) {
    checks.push('Include village/ward, district, and state in the location.');
  }
  if (!title.trim()) {
    checks.push('Review the suggested title before submitting.');
  }
  return checks;
};

const toReportReview = (result, input) => ({
  category: CATEGORIES.includes(result.category) ? result.category : 'Other',
  severity: SEVERITIES.includes(result.severity) ? result.severity : 'Medium',
  reasoning: result.reasoning || result.urgencyReason || 'Review this suggested severity before submitting.',
  suggestedTitle: String(result.suggestedTitle || result.suggestedSummary || input.title || input.description)
    .trim()
    .slice(0, 120),
  qualityChecks: buildQualityChecks(input),
  source: result.source || 'Smart report review',
});

// Rule-based NLP analysis fallback engine
const analyzeWithRuleEngine = (title, location, userDescription) => {
  const combinedText = `${title} ${location} ${userDescription}`;
  const lowerText = combinedText.toLowerCase();

  // 1. Determine Category
  let matchedCategory = 'Other';
  let maxMatches = 0;

  for (const item of KEYWORD_CATEGORY_MAP) {
    let count = 0;
    for (const kw of item.keywords) {
      if (lowerText.includes(kw)) {
        count++;
      }
    }
    if (count > maxMatches) {
      maxMatches = count;
      matchedCategory = item.category;
    }
  }

  // 2. Determine Severity / Urgency
  let severity = 'Medium';
  let urgencyReason = 'Standard community issue requiring municipal/institutional intervention.';

  if (CRITICAL_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    severity = 'Critical';
    urgencyReason = 'Detected high-risk emergency keyword indicating immediate safety or life hazard.';
  } else if (HIGH_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    severity = 'High';
    urgencyReason = 'Substantial impact on community health, safety, or essential public infrastructure.';
  } else if (MEDIUM_KEYWORDS.some((kw) => lowerText.includes(kw))) {
    severity = 'Medium';
    urgencyReason = 'Moderate local disruption; suitable for standard institutional proposal evaluation.';
  } else {
    severity = 'Low';
    urgencyReason = 'Low immediate safety risk; can be scheduled for routine maintenance.';
  }

  // 3. Auto-generate full description if user description is sparse
  let generatedDescription = userDescription.trim();
  if (generatedDescription.length < 20) {
    generatedDescription = `Persistent public ${matchedCategory.toLowerCase()} issue reported at ${location || 'the local community'}: "${title}". This problem is causing daily hardship to nearby residents, school children, and local commuters, requiring immediate institutional technical proposals and municipal execution.`;
  }

  // 4. Generate Executive Summary
  const summary = title.length > 10 ? title : `${matchedCategory} issue reported at ${location || 'community'}`;

  // 5. Parse location tokens into state, district, locality
  const locParts = (location || '').split(',').map((p) => p.trim()).filter(Boolean);
  const locality = locParts[0] || location || 'Local Ward';
  const district = locParts[1] || locParts[0] || 'Local District';
  const state = locParts[2] || locParts[1] || 'State';

  return {
    category: matchedCategory,
    severity,
    urgencyReason,
    suggestedTitle: title.trim() || userDescription.trim().split(/[.!?]/)[0].trim(),
    suggestedSummary: summary,
    description: generatedDescription,
    affectedWho: `Local residents, students, and neighboring households in ${locality}`,
    localContext: `Public infrastructure breakdown at ${location || 'local site'}. Needs tailored ground restoration.`,
    baselineMetric: `1 unaddressed public defect impacting local daily activities`,
    state,
    district,
    locality,
    source: 'Smart AI Engine',
  };
};

/**
 * @desc    AI report-quality review endpoint
 * @route   POST /api/challenges/ai-analyze
 * @access  Private (Citizen / Any logged in user)
 */
const analyzeChallengeAI = async (req, res) => {
  try {
    const { title = '', location = '', description = '' } = req.body;

    if (!location.trim() || !description.trim()) {
      return res.status(400).json({ message: 'Provide a location and a short description to check the report.' });
    }

    // If Gemini API Key is present in environment, request suggestions only.
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are an AI assistant for Samadhan Setu, a societal challenge crowdsourcing platform in India.
Review this citizen report. Do not invent people affected, dates, counts, address fields, or facts not present in the input.
Title: "${title}"
Location: "${location}"
User Description: "${description}"

Categories available: ${CATEGORIES.join(', ')}.
Severities available: Low, Medium, High, Critical.

Return ONLY a JSON object with exact keys:
{
  "category": "<one of available categories>",
  "severity": "<one of available severities>",
  "reasoning": "<one short sentence explaining the suggested severity>",
  "suggestedTitle": "<concise title based only on the supplied information>"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return res.json(toReportReview({ ...parsed, source: 'Google Gemini 1.5' }, { title, location, description }));
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to rule engine:', geminiErr.message);
      }
    }

    // Fallback to fast smart rule engine
    const result = analyzeWithRuleEngine(title, location, description);
    return res.json(toReportReview(result, { title, location, description }));
  } catch (error) {
    console.error('Error in analyzeChallengeAI:', error);
    return res.status(500).json({ message: 'AI Analysis failed. Please select options manually.' });
  }
};

module.exports = { analyzeChallengeAI };
