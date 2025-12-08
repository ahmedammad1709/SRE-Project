import pool from "./db.js";

async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJSON(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function callChatGPTForSummary(conversationHistory) {
  const apiKey = process.env.VITE_CHATGPT_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) {
    throw new Error("ChatGPT API key is not configured");
  }

  const systemPrompt = `You are tasked with summarizing the following chat into a structured project summary.
Extract key information from the chat and organize it under these headings:
1. Functional Requirements
2. Non-Functional Requirements
3. Stakeholders
4. Risks & Challenges
5. User Stories
6. Timeline
7. Cost Estimate
8. Constraints

Rules:
- For any missing data in the chat (e.g., Timeline or Cost Estimate), you MUST provide intelligent approximate values based on:
  * Number of functional requirements (estimate development time accordingly)
  * Project complexity and scope
  * Typical development rates and timelines
  Examples: For a small project (3-5 features) → "$50,000 - $80,000" and "3-4 months"
            For a medium project (6-10 features) → "$120,000 - $150,000" and "6-8 months"
            For a large project (11+ features) → "$200,000+" and "9-12 months"
- Always include Timeline and Cost Estimate fields, even if approximate.
- Include all headings regardless of whether data is available.
- Return the summary in JSON format only.
- Keep each section concise but meaningful.

JSON Format Example:
{
  "Functional Requirements": [
    "User registration and authentication system",
    "Product catalog with search and filtering",
    "Shopping cart and checkout process",
    "Payment gateway integration",
    "Order tracking and management"
  ],
  "Non-Functional Requirements": [
    "System should handle 10,000 concurrent users",
    "99.9% uptime availability",
    "Response time under 2 seconds",
    "GDPR and PCI-DSS compliance",
    "Mobile-responsive design"
  ],
  "Stakeholders": [
    { "name": "John Smith", "role": "Product Owner" },
    { "name": "Sarah Johnson", "role": "Tech Lead" }
  ],
  "Risks & Challenges": [
    "Third-party payment gateway downtime",
    "Data migration from legacy system",
    "Peak season traffic scaling"
  ],
  "User Stories": [
    "As a customer, I want to browse products by category so that I can find items easily"
  ],
  "Timeline": "6 months (Q1 2024 - Q2 2024)",
  "Cost Estimate": "$120,000 - $150,000",
  "Constraints": [
    "Budget limit: $150,000",
    "Timeline: 6 months",
    "Must integrate with existing ERP system"
  ]
}

Return only the JSON. Do not add explanations.

Input Chat:
${JSON.stringify(conversationHistory, null, 2)}`;

  // Convert Gemini format to OpenAI format
  const conversationText = conversationHistory
    .map((msg) => {
      const role = msg.role === "model" ? "Assistant" : "User";
      const content = msg.parts?.[0]?.text || msg.parts?.map((p) => p.text).join("\n") || "";
      return `${role}: ${content}`;
    })
    .join("\n\n");

  const userMessage = `${systemPrompt}\n\nConversation:\n${conversationText}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that returns only valid JSON responses. Do not include any explanations or markdown formatting, only the raw JSON object.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `ChatGPT API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "{}";

  try {
    const raw = JSON.parse(text);

    const stakeholdersArray = Array.isArray(raw["Stakeholders"]) ? raw["Stakeholders"] : [];
    const normalizedStakeholders = stakeholdersArray.map((s) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object") {
        const name = typeof s.name === "string" ? s.name : "";
        const role = typeof s.role === "string" ? s.role : "";
        if (name && role) return `${name} (${role})`;
        if (name) return name;
        if (role) return role;
        return JSON.stringify(s);
      }
      return String(s);
    });

    return {
      overview: "",
      functional: Array.isArray(raw["Functional Requirements"]) ? raw["Functional Requirements"] : [],
      nonFunctional: Array.isArray(raw["Non-Functional Requirements"]) ? raw["Non-Functional Requirements"] : [],
      stakeholders: normalizedStakeholders,
      userStories: Array.isArray(raw["User Stories"]) ? raw["User Stories"] : [],
      constraints: Array.isArray(raw["Constraints"]) ? raw["Constraints"] : [],
      risks: Array.isArray(raw["Risks & Challenges"]) ? raw["Risks & Challenges"] : [],
      timeline: typeof raw["Timeline"] === "string" ? raw["Timeline"] : "",
      costEstimate: typeof raw["Cost Estimate"] === "string" ? raw["Cost Estimate"] : "",
      summary: "",
    };
  } catch (e) {
    console.error("Failed to parse or map ChatGPT JSON response:", e);
    return {
      overview: "",
      functional: [],
      nonFunctional: [],
      stakeholders: [],
      userStories: [],
      constraints: [],
      risks: [],
      timeline: "",
      costEstimate: "",
      summary: "",
    };
  }
}

async function callGeminiForSummary(conversationHistory) {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const systemPrompt = `You are tasked with summarizing the following chat into a structured project summary.
Extract key information from the chat and organize it under these headings:
1. Functional Requirements
2. Non-Functional Requirements
3. Stakeholders
4. Risks & Challenges
5. User Stories
6. Timeline
7. Cost Estimate
8. Constraints

Rules:
- For any missing data in the chat (e.g., Timeline or Cost Estimate), you MUST provide intelligent approximate values based on:
  * Number of functional requirements (estimate development time accordingly)
  * Project complexity and scope
  * Typical development rates and timelines
  Examples: For a small project (3-5 features) → "$50,000 - $80,000" and "3-4 months"
            For a medium project (6-10 features) → "$120,000 - $150,000" and "6-8 months"
            For a large project (11+ features) → "$200,000+" and "9-12 months"
- Always include Timeline and Cost Estimate fields, even if approximate.
- Include all headings regardless of whether data is available.
- Return the summary in JSON format only.
- Keep each section concise but meaningful.

JSON Format Example:
{
  "Functional Requirements": [
    "User registration and authentication system",
    "Product catalog with search and filtering",
    "Shopping cart and checkout process",
    "Payment gateway integration",
    "Order tracking and management"
  ],
  "Non-Functional Requirements": [
    "System should handle 10,000 concurrent users",
    "99.9% uptime availability",
    "Response time under 2 seconds",
    "GDPR and PCI-DSS compliance",
    "Mobile-responsive design"
  ],
  "Stakeholders": [
    { "name": "John Smith", "role": "Product Owner" },
    { "name": "Sarah Johnson", "role": "Tech Lead" }
  ],
  "Risks & Challenges": [
    "Third-party payment gateway downtime",
    "Data migration from legacy system",
    "Peak season traffic scaling"
  ],
  "User Stories": [
    "As a customer, I want to browse products by category so that I can find items easily"
  ],
  "Timeline": "6 months (Q1 2024 - Q2 2024)",
  "Cost Estimate": "$120,000 - $150,000",
  "Constraints": [
    "Budget limit: $150,000",
    "Timeline: 6 months",
    "Must integrate with existing ERP system"
  ]
}

Return only the JSON. Do not add explanations.

Input Chat:
${JSON.stringify(conversationHistory, null, 2)}`;

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
  ];

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  try {
    const raw = JSON.parse(text);

    const stakeholdersArray = Array.isArray(raw["Stakeholders"]) ? raw["Stakeholders"] : [];
    const normalizedStakeholders = stakeholdersArray.map((s) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object") {
        const name = typeof s.name === "string" ? s.name : "";
        const role = typeof s.role === "string" ? s.role : "";
        if (name && role) return `${name} (${role})`;
        if (name) return name;
        if (role) return role;
        return JSON.stringify(s);
      }
      return String(s);
    });

    return {
      overview: "",
      functional: Array.isArray(raw["Functional Requirements"]) ? raw["Functional Requirements"] : [],
      nonFunctional: Array.isArray(raw["Non-Functional Requirements"]) ? raw["Non-Functional Requirements"] : [],
      stakeholders: normalizedStakeholders,
      userStories: Array.isArray(raw["User Stories"]) ? raw["User Stories"] : [],
      constraints: Array.isArray(raw["Constraints"]) ? raw["Constraints"] : [],
      risks: Array.isArray(raw["Risks & Challenges"]) ? raw["Risks & Challenges"] : [],
      timeline: typeof raw["Timeline"] === "string" ? raw["Timeline"] : "",
      costEstimate: typeof raw["Cost Estimate"] === "string" ? raw["Cost Estimate"] : "",
      summary: "",
    };
  } catch (e) {
    console.error("Failed to parse or map Gemini JSON response:", e);
    return {
      overview: "",
      functional: [],
      nonFunctional: [],
      stakeholders: [],
      userStories: [],
      constraints: [],
      risks: [],
      timeline: "",
      costEstimate: "",
      summary: "",
    };
  }
}

async function callAIForSummaryWithFallback(conversationHistory) {
  try {
    // Try Gemini first
    return await callGeminiForSummary(conversationHistory);
  } catch (geminiError) {
    console.warn("Gemini API failed, falling back to ChatGPT:", geminiError.message);
    try {
      // Fallback to ChatGPT
      return await callChatGPTForSummary(conversationHistory);
    } catch (chatgptError) {
      throw new Error(`Both Gemini and ChatGPT APIs failed. Gemini: ${geminiError.message}, ChatGPT: ${chatgptError.message}`);
    }
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return sendJSON(res, 405, { success: false, error: "Method Not Allowed" });
    }

    const body = await parseJSON(req);
    const { projectId, conversationHistory } = body;

    if (!projectId) {
      return sendJSON(res, 400, { success: false, error: "projectId is required" });
    }

    // If conversationHistory is provided, use it; otherwise fetch from database
    let messages = conversationHistory;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      // Fetch conversation from database
      const { rows } = await pool.query(
        "SELECT id, project_id, role, content, created_at FROM chat_messages WHERE project_id = $1 ORDER BY created_at ASC",
        [projectId]
      );
      
      if (rows.length === 0) {
        return sendJSON(res, 400, { success: false, error: "No conversation history found for this project" });
      }

      // Convert database messages to conversation format
      messages = rows.map((msg) => ({
        role: msg.role === "bot" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));
    }

    try {
      const extractedData = await callAIForSummaryWithFallback(messages);

      // Persist summary JSON and clear chat history in a single transaction
      await pool.query("BEGIN");
      await pool.query(
        "UPDATE projects SET summary = $2 WHERE id = $1",
        [projectId, JSON.stringify(extractedData)]
      );
      await pool.query("DELETE FROM chat_messages WHERE project_id = $1", [projectId]);
      await pool.query("COMMIT");

      return sendJSON(res, 200, {
        success: true,
        data: extractedData,
      });
    } catch (error) {
      try { await pool.query("ROLLBACK"); } catch {}
      console.error("AI summary extraction error:", error);
      return sendJSON(res, 500, {
        success: false,
        error: error.message || "Failed to generate summary",
      });
    }
  } catch (error) {
    return sendJSON(res, 500, { success: false, error: error.message });
  }
}
