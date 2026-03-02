const { GoogleGenerativeAI } = require('@google/generative-ai');

class LLMService {
  static async generateHint(question, userQuery, assignmentDetails) {
    const provider = process.env.LLM_PROVIDER || 'gemini';
    if (provider === 'gemini') {
      return await this.getGeminiHint(question, userQuery, assignmentDetails);
    }
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  static async getGeminiHint(question, userQuery, assignmentDetails) {
    const allowFallback = process.env.ALLOW_HINT_FALLBACK !== 'false';
    if (!process.env.GEMINI_API_KEY) {
      const msg = 'GEMINI_API_KEY is missing. Hint generation requires Gemini.';
      if (!allowFallback) {
        throw new Error(msg);
      }
      console.warn(`${msg} Falling back to local hints due to ALLOW_HINT_FALLBACK=true`);
      return this.getFallbackHint(userQuery);
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = this.buildHintPrompt(question, userQuery, assignmentDetails);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const hint = response.text().trim();

      if (!hint || hint.length === 0) {
        if (!allowFallback) {
          throw new Error('Gemini returned an empty hint response.');
        }
        console.warn('Empty response from Gemini, using fallback');
        return this.getFallbackHint(userQuery);
      }

      if (this.looksLikeFullSolution(hint)) {
        if (!allowFallback) {
          throw new Error('Hint rejected because model output looked like a full SQL solution.');
        }
        return this.getFallbackHint(userQuery);
      }

      return hint;
    } catch (err) {
      console.error('Gemini API error:', err.message);
      const isLeakedKeyError = /reported as leaked/i.test(err.message || '');
      if (isLeakedKeyError) {
        if (allowFallback) {
          return `⚠️ Gemini API key is blocked (reported leaked). Using safe local hint:\n\n${this.getFallbackHint(userQuery)}`;
        }
        throw new Error('Gemini API key is blocked (reported leaked). Please generate a new API key in Google AI Studio and update backend/.env.');
      }
      if (allowFallback) {
        return this.getFallbackHint(userQuery);
      }
      throw new Error(`Gemini hint generation failed: ${err.message}`);
    }
  }

  static looksLikeFullSolution(text) {
    if (!text) return false;
    const normalized = text.toLowerCase();
    const hasSqlBlock = /```\s*sql[\s\S]*?```/i.test(text);
    const hasFullSelectPattern = /\bselect\b[\s\S]*\bfrom\b/i.test(normalized);
    const manySqlKeywords = (normalized.match(/\b(select|from|where|group by|order by|join|having|limit)\b/g) || []).length >= 3;
    return hasSqlBlock || (hasFullSelectPattern && manySqlKeywords);
  }

  static getFallbackHint(userQuery) {
    if (userQuery && userQuery.trim().length > 0) {
      return `💡 Helpful Hint:\n\nLooking at your query: "${userQuery.substring(0, 50)}..."\n\n1. Check that all table names match the schema\n2. Verify column names are spelled correctly\n3. Make sure your column names are in the correct case\n4. Use WHERE clauses to filter data\n5. Test simple queries first (SELECT * FROM table_name)`;
    }

    return `💡 To get started:\n\n1. Use SELECT * FROM table_name to see all data\n2. Add a WHERE clause to filter rows\n3. Use aggregate functions like COUNT(), SUM(), AVG()\n4. JOIN multiple tables if needed\n5. Check the Schema tab to see available columns`;
  }

  static buildHintPrompt(question, userQuery, assignmentDetails) {
    const tableInfo = (assignmentDetails.tables || [])
      .map(t => {
        const cols = (t.columns || []).map(c => `  - ${c.columnName} (${c.dataType})`).join('\n');
        return `Table: ${t.name}\nColumns:\n${cols}`;
      })
      .join('\n\n');

    const studentQuerySection = userQuery
      ? `STUDENT'S CURRENT QUERY:\n\`\`\`sql\n${userQuery}\n\`\`\``
      : 'The student has not written any query yet.';

    return `You are an expert SQL tutor for CipherSQLStudio. Your ONLY job is to give HINTS, never complete solutions.

ASSIGNMENT:
Title: ${assignmentDetails.title}
Difficulty: ${assignmentDetails.difficulty}
Topic: ${assignmentDetails.topic || 'SQL'}

QUESTION:
${question}

AVAILABLE SCHEMA:
${tableInfo}

${studentQuerySection}

RULES (STRICTLY FOLLOW):
1. NEVER provide the complete SQL query solution
2. Give max 3 concise, helpful hints
3. If student has a query, identify what's wrong conceptually (not syntactically fix it)
4. Mention which SQL clause or function they should think about
5. Be encouraging and positive
6. Format response as bullet points
7. Keep total response under 100 words
8. Do not output executable SQL statements

Provide hints now:`;
  }
}

module.exports = LLMService;
