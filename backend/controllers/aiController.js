/**
 * AI Controller for Samadhan Setu
 * Analyzes reported challenges to suggest Category, Urgency/Severity, Rationale, and Executive Summary.
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

// Rule-based NLP analysis fallback engine
const analyzeWithRuleEngine = (text) => {
  const lowerText = text.toLowerCase();

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

  // 3. Generate Executive Summary
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  const summary = firstSentence.length > 15 ? firstSentence : text.slice(0, 100).trim();

  return {
    category: matchedCategory,
    severity,
    urgencyReason,
    suggestedSummary: summary,
    source: 'AI NLP Engine',
  };
};

/**
 * @desc    AI Auto-Categorization & Urgency Analysis Endpoint
 * @route   POST /api/challenges/ai-analyze
 * @access  Private (Citizen / Any logged in user)
 */
const analyzeChallengeAI = async (req, res) => {
  try {
    const { title = '', description = '' } = req.body;

    if (!title.trim() && !description.trim()) {
      return res.status(400).json({ message: 'Please provide a title or description for AI analysis.' });
    }

    const combinedText = `${title} ${description}`;

    // If Gemini API Key is present in environment, call Google Gemini REST API
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are an AI assistant for Samadhan Setu, a societal challenge crowdsourcing platform in India.
Analyze the following citizen problem report:
Title: "${title}"
Description: "${description}"

Categories available: ${CATEGORIES.join(', ')}.
Severities available: Low, Medium, High, Critical.

Return ONLY a JSON object with exact keys:
{
  "category": "<one of available categories>",
  "severity": "<one of available severities>",
  "urgencyReason": "<1 sentence explaining why this severity was assigned>",
  "suggestedSummary": "<1 sentence clean executive summary>"
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
            return res.json({ ...parsed, source: 'Google Gemini 1.5' });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to rule engine:', geminiErr.message);
      }
    }

    // Fallback to fast smart rule engine
    const result = analyzeWithRuleEngine(combinedText);
    return res.json(result);
  } catch (error) {
    console.error('Error in analyzeChallengeAI:', error);
    return res.status(500).json({ message: 'AI Analysis failed. Please select options manually.' });
  }
};

module.exports = { analyzeChallengeAI };
