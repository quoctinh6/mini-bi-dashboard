/**
 * services/aiService.js
 * AI Chat Service — Native Fetch REST integration with DB query + chart config generation.
 * Security: RLS filter, SELECT-only queries, max iterations.
 */

const { buildRlsFilter } = require('./rlsService');
const prisma = require('../config/prisma');

const GEMINI_MODEL = 'gemini-2.5-flash'; // ← Change model here
const MAX_QUERY_ITERATIONS = 5;
const MAX_ROWS_FOR_AI = 50; // Limit rows sent back to Gemini to avoid token overflow

// ── Native Fetch Client ──────────────────────────────────
function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }
  return apiKey;
}

async function generateContent(payload) {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'X-goog-api-key': apiKey // Alternatively we could pass it here instead of URL query string
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// ── System Prompt ──────────────────────────────────────
function buildSystemPrompt(rlsInfo, mode) {
  const basePrompt = `Bạn là AI Assistant cho hệ thống BI Dashboard doanh nghiệp. Database MySQL có các bảng:

BẢNG CHÍNH:
- kernel404_transactions: id, order_date (DATE), revenue (DECIMAL 15,2), cost (DECIMAL 15,2), quantity (INT), region_id, province_id, category_id, department_id

BẢNG MASTER DATA:
- regions: id, code (NORTH/CENTRAL/SOUTH), name (Miền Bắc/Miền Trung/Miền Nam)
- provinces: id, code, name, region_id  
- categories: id, code (SW/HW/SVC), name (Phần mềm/Thiết bị/Dịch vụ)
- departments: id, code, name
- targets: id, year, month, region_id (nullable), revenue (DECIMAL)

QUAN HỆ:
- kernel404_transactions.region_id → regions.id
- kernel404_transactions.province_id → provinces.id
- kernel404_transactions.category_id → categories.id
- kernel404_transactions.department_id → departments.id
- provinces.region_id → regions.id

RLS (Row Level Security): ${rlsInfo}

QUAN TRỌNG:
- Chỉ sử dụng SELECT queries
- Luôn JOIN với bảng master data để lấy tên hiển thị
- Format số tiền hiển thị đẹp (ví dụ: 12.5 tỷ, 500 triệu, 1.2K đơn)
- CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT
- VÀO THẲNG VẤN ĐỀ, CHỈ IN CÂU TRẢ LỜI/PHÂN TÍCH. KHÔNG DÙNG CÂU DẪN dài dòng.
- Khi truy vấn ngày tháng, dùng DATE_FORMAT
- Khi tính lợi nhuận: profit = revenue - cost`;

  if (mode === 'chart') {
    return basePrompt + `

CHẾ ĐỘ TẠO BIỂU ĐỒ:
Khi người dùng yêu cầu tạo biểu đồ, hãy:
1. Truy vấn dữ liệu cần thiết bằng query_database
2. Sau đó gọi create_chart_config với dữ liệu thực

Các loại biểu đồ có sẵn:
- KPICard: Thẻ KPI đơn giản. Props: { title: string, value: number, unit: string, trend: number, trendDirection: 'up'|'down'|'neutral' }. Size: 2x1
- MixedChart: Bar + Line chart. Props: { data: [{month: string, actual: number, target: number}], title: string, totalValue: number, unit: string, trend: number }. Size: 4-6 x 3
- DonutChart: Donut/Pie chart. Props: { data: [{label: string, value: number}], title: string, totalValue: number, unit: string, size: 130, top: 3 }. Size: 2-3 x 3
- GaugeChart: Gauge bán nguyệt. Props: { data: [{label: string, value: number, color: string}], title: string, totalValue: number, unit: string }. Colors: #d946ef, #3b82f6, #0ea5e9, #10b981, #f59e0b. Size: 3-4 x 3
- GeoChart: Bản đồ Việt Nam. Props: { data: [{label: string, value: number}], title: string }. Label phải là tên tỉnh thành. Size: 4 x 3

Chọn loại biểu đồ phù hợp nhất với yêu cầu người dùng. Luôn query dữ liệu thực trước khi tạo chart config.`;
  }

  return basePrompt + `

CHẾ ĐỘ CHAT:
Trả lời câu hỏi phân tích dữ liệu. Khi cần dữ liệu, gọi query_database.
Chỉ in ra câu trả lời trực tiếp bằng Tiếng Việt dựa trên dữ liệu. KHÔNG in những từ ngữ thừa thãi dẫn chuyện.
Nếu có dữ liệu dạng bảng, format đẹp với markdown table.`;
}

// ── Function Declarations for Gemini ───────────────────
const functionDeclarations = [
  {
    name: 'query_database',
    description: 'Execute a READ-ONLY SQL SELECT query on the MySQL database to get business data. Only SELECT statements are allowed.',
    parameters: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'A valid MySQL SELECT query. Must start with SELECT. Use proper JOINs with master data tables for readable labels.'
        }
      },
      required: ['sql']
    }
  },
  {
    name: 'create_chart_config',
    description: 'Create a chart widget configuration for the dashboard. Call this after querying data.',
    parameters: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          enum: ['KPICard', 'MixedChart', 'DonutChart', 'GaugeChart', 'GeoChart'],
          description: 'The chart component type'
        },
        title: {
          type: 'string',
          description: 'Title displayed on the chart'
        },
        props: {
          type: 'object',
          description: 'Component-specific props including data arrays'
        },
        defaultW: {
          type: 'number',
          description: 'Grid width (1-8)'
        },
        defaultH: {
          type: 'number',
          description: 'Grid height (1-4)'
        }
      },
      required: ['component', 'title', 'props', 'defaultW', 'defaultH']
    }
  }
];

// ── Safe SQL execution ─────────────────────────────────
async function executeSafeQuery(sql, rlsWhere) {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  const dangerous = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'];
  for (const kw of dangerous) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(sql)) {
      throw new Error(`Forbidden SQL keyword detected: ${kw}`);
    }
  }

  let finalSql = sql;
  if (rlsWhere.regionId && rlsWhere.regionId.in) {
    const regionIds = rlsWhere.regionId.in;
    if (regionIds.length === 0) {
      return []; 
    }
    if (!finalSql.toLowerCase().includes('region_id')) {
      throw new Error(
        `RLS Violation: You MUST filter by region_id IN (${regionIds.join(',')}) in your query. Add a WHERE condition on region_id.`
      );
    }
  }

  try {
    const results = await prisma.$queryRawUnsafe(finalSql);
    return JSON.parse(JSON.stringify(results, (_, v) =>
      typeof v === 'bigint' ? Number(v) : v
    ));
  } catch (err) {
    throw new Error(`SQL Error: ${err.message}`);
  }
}

// ── Main Chat Function ─────────────────────────────────
/**
 * chatWithAI
 */
async function chatWithAI(jwtUser, message, mode = 'chat', history = []) {
  const rlsWhere = await buildRlsFilter(jwtUser, prisma);
  
  let rlsInfo = 'User có quyền xem TẤT CẢ dữ liệu.';
  if (rlsWhere.regionId && rlsWhere.regionId.in) {
    rlsInfo = `BẮT BUỘC: Bạn CHỈ được phép query dữ liệu có region_id nằm trong danh sách (${rlsWhere.regionId.in.join(', ')}). BẮT BUỘC phải thêm điều kiện WHERE region_id IN (${rlsWhere.regionId.in.join(', ')}) vào MỌI câu query. Nếu thiếu điều kiện này, hệ thống sẽ từ chối thực thi.`;
  }

  const systemPrompt = buildSystemPrompt(rlsInfo, mode);

  // Parse history specifically for the REST API
  const formattedHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  // Initial contents payload
  const contents = [
    ...formattedHistory,
    { role: 'user', parts: [{ text: message }] }
  ];

  let createdWidget = null;
  let queryResults = [];
  let iterations = 0;
  let isDone = false;
  let finalResponseText = '';

  while (iterations < MAX_QUERY_ITERATIONS && !isDone) {
    iterations++;

    // Construct the payload to send to Gemini API
    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      tools: [{ functionDeclarations }],
      contents,
    };

    const data = await generateContent(payload);

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API. The response may have been blocked or no generation occurred.');
    }

    const candidate = data.candidates[0];
    const parts = candidate.content?.parts || [];
    
    // Add the model's exact response back into the context so it knows what it did
    contents.push(candidate.content);
    
    // Extract any function calls the model wishes to execute
    const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall);

    if (functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        let fnResult;
        try {
          if (call.name === 'query_database') {
            const sqlResult = await executeSafeQuery(call.args.sql, rlsWhere);
            queryResults.push({ sql: call.args.sql, data: sqlResult, rowCount: sqlResult.length });

            const safeDataForAI = sqlResult.slice(0, MAX_ROWS_FOR_AI);
            fnResult = {
              success: true,
              data: safeDataForAI,
              rowCount: sqlResult.length,
              note: sqlResult.length > MAX_ROWS_FOR_AI
                ? `Data truncated to ${MAX_ROWS_FOR_AI} rows for token limits. Total rows: ${sqlResult.length}.`
                : '',
            };
          } else if (call.name === 'create_chart_config') {
            const { component, title, props, defaultW, defaultH } = call.args;
            
            const validComponents = ['KPICard', 'MixedChart', 'DonutChart', 'GaugeChart', 'GeoChart'];
            if (!validComponents.includes(component)) {
              throw new Error(`Invalid component: ${component}`);
            }

            createdWidget = {
              i: `ai-${component.toLowerCase()}-${Date.now()}`,
              x: 0,
              y: Infinity,
              w: Math.min(Math.max(defaultW || 4, 1), 8),
              h: Math.min(Math.max(defaultH || 3, 1), 4),
              component,
              props: { ...props, title },
            };

            fnResult = { success: true, widget: createdWidget };
          } else {
            fnResult = { success: false, error: `Unknown function: ${call.name}` };
          }
        } catch (err) {
          fnResult = { success: false, error: err.message };
        }

        // Add the response logic to our payload
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: fnResult,
          }
        });
      }
      
      // Feed the function result(s) back into the conversation for the next iteration
      contents.push({
        role: 'function',
        parts: functionResponses
      });
      
    } else {
      // It didn't call any functions, so it must be responding with regular text
      isDone = true;
      const textParts = parts.filter(p => p.text).map(p => p.text);
      finalResponseText = textParts.join('\n');
    }
  }

  // If we exit the loop and it's still not done, we ran out of iterations
  if (!isDone) {
    throw new Error('Model exceeded maximum query iterations without returning a direct response.');
  }

  return {
    type: createdWidget ? 'chart' : 'text',
    content: finalResponseText,
    widget: createdWidget,
    data: queryResults.length > 0 ? queryResults[queryResults.length - 1].data : null,
  };
}

module.exports = { chatWithAI };
