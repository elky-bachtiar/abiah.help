import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Environment configuration
const TAVUS_API_KEY = Deno.env.get('TAVUS_API_KEY') || '4324be49f7bf45f0ac28606101276f78'
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const TAVUS_API_URL = 'https://tavusapi.com'
const CUSTOM_LLM_URL = Deno.env.get('CUSTOM_LLM_URL') || 'https://your-project.supabase.co/functions/v1/custom-llm'

console.log("[DEBUG] Tavus API LLM Function loaded. TAVUS_API_KEY present:", !!TAVUS_API_KEY);
console.log("[DEBUG] OpenAI API Key present:", !!OPENAI_API_KEY);
console.log("[DEBUG] Anthropic API Key present:", !!ANTHROPIC_API_KEY);
console.log("[DEBUG] Custom LLM URL:", CUSTOM_LLM_URL);

// LLM Tool definitions
const LLM_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_pitch_deck",
      description: "Generate a comprehensive startup pitch deck for investors",
      parameters: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Company or startup name" },
          business_idea: { type: "string", description: "Core business concept" },
          target_market: { type: "string", description: "Target market description" },
          funding_amount: { type: "string", description: "Funding amount sought" },
          industry: { type: "string", description: "Industry category" },
          stage: { type: "string", enum: ["idea", "prototype", "mvp", "growth"] }
        },
        required: ["company_name", "business_idea", "target_market", "funding_amount", "industry"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "create_business_plan",
      description: "Create a detailed business plan document",
      parameters: {
        type: "object",
        properties: {
          business_name: { type: "string" },
          business_model: { type: "string" },
          target_customers: { type: "string" },
          competitive_advantage: { type: "string" },
          plan_type: { type: "string", enum: ["executive_summary", "standard", "comprehensive"] }
        },
        required: ["business_name", "business_model", "target_customers"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_market_research", 
      description: "Provide market analysis and competitive intelligence",
      parameters: {
        type: "object",
        properties: {
          industry: { type: "string" },
          geographic_focus: { type: "string" },
          research_depth: { type: "string", enum: ["overview", "detailed", "comprehensive"] }
        },
        required: ["industry"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_consultation_summary",
      description: "Create a summary document of the consultation session",
      parameters: {
        type: "object", 
        properties: {
          session_type: { type: "string" },
          key_topics: { type: "array", items: { type: "string" } },
          action_items: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } }
        },
        required: ["session_type", "key_topics"]
      }
    }
  }
];

interface TavusRequest {
  method: 'GET' | 'POST';
  endpoint: string;
  payload?: any;
  headers?: Record<string, string>;
}

interface CustomLLMConfig {
  use_custom_llm: boolean;
  persona_id?: string;
  model?: string;
  endpoint_url?: string;
  persona_type?: 'general' | 'fintech' | 'healthtech' | 'b2b-saas' | 'enterprise';
}

interface ToolCallRequest {
  consultationId?: string;
  conversationId?: string;
  toolName: string;
  parameters: Record<string, any>;
  userId?: string;
}

interface ConversationPayload {
  persona_id: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    apply_greenscreen?: boolean;
  };
  custom_llm_url?: string;
  callback_url?: string;
}

// Track active tool executions
const activeToolExecutions = new Map<string, {
  startTime: number;
  toolName: string;
  parameters: Record<string, any>;
  consultationId?: string;
  userId?: string;
}>();

// CORS headers with COOP and COEP support
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-custom-llm-config',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Access-Control-Allow-Credentials': 'true'
}

/**
 * Create a standardized error response
 */
function createErrorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create a standardized success response
 */
function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({ data }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Get API key from request headers or fallback to environment variable
 */
function getApiKey(req: Request): string | null {
  const apiKey = req.headers.get('x-api-key') || TAVUS_API_KEY;
  return apiKey || null;
}

/**
 * Get user ID from request headers
 */
function getUserId(req: Request): string | undefined {
  return req.headers.get('x-user-id') || undefined;
}

/**
 * Parse custom LLM configuration from request headers
 */
function getCustomLLMConfig(req: Request): CustomLLMConfig | null {
  const configHeader = req.headers.get('x-custom-llm-config');
  if (!configHeader) return null;
  
  try {
    return JSON.parse(configHeader);
  } catch (error) {
    console.error('[ERROR] Failed to parse custom LLM config:', error);
    return null;
  }
}

/**
 * Prepare headers for Tavus API request
 */
function prepareTavusHeaders(req: Request): Record<string, string> {
  const apiKey = getApiKey(req);
  
  if (!apiKey) {
    throw new Error('Missing API key');
  }
  
  const tavusHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };
  
  // Forward any additional headers from the request
  for (const [key, value] of req.headers.entries()) {
    if (key.toLowerCase().startsWith('tavus-') || key.toLowerCase() === 'authorization') {
      tavusHeaders[key] = value;
    }
  }
  
  return tavusHeaders;
}

/**
 * Enhance conversation payload with custom LLM configuration
 */
function enhanceConversationPayload(
  originalPayload: ConversationPayload, 
  customLLMConfig: CustomLLMConfig | null,
  userId?: string
): ConversationPayload {
  if (!customLLMConfig || !customLLMConfig.use_custom_llm) {
    return originalPayload;
  }

  console.log('[DEBUG] Enhancing conversation with custom LLM config:', customLLMConfig);

  // Build custom LLM URL with parameters
  const customLLMUrl = new URL(customLLMConfig.endpoint_url || CUSTOM_LLM_URL);
  customLLMUrl.searchParams.set('persona', customLLMConfig.persona_type || 'general');
  if (userId) {
    customLLMUrl.searchParams.set('user_id', userId);
  }
  if (customLLMConfig.model) {
    customLLMUrl.searchParams.set('model', customLLMConfig.model);
  }

  return {
    ...originalPayload,
    custom_llm_url: customLLMUrl.toString()
  };
}

/**
 * Execute LLM tool and save results to database
 */
async function executeLLMTool(
  req: Request,
  toolRequest: ToolCallRequest
): Promise<any> {
  const startTime = Date.now();
  const executionId = crypto.randomUUID();
  
  // Add to active executions map
  activeToolExecutions.set(executionId, {
    startTime,
    toolName: toolRequest.toolName,
    parameters: toolRequest.parameters,
    consultationId: toolRequest.consultationId,
    userId: getUserId(req)
  });
  
  try {
    console.log(`[DEBUG] Executing LLM tool: ${toolRequest.toolName}`, toolRequest.parameters);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    // Log tool execution start
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from('llm_tool_executions')
      .insert({
        consultation_id: toolRequest.consultationId,
        tool_name: toolRequest.toolName,
        input_parameters: toolRequest.parameters,
        success: false, // Will update on completion
        execution_time_ms: 0 // Will update on completion
      })
      .select()
      .single();
    
    if (logError) {
      console.error('[ERROR] Failed to log tool execution:', logError);
    }
    
    // Execute the appropriate tool
    let result;
    switch (toolRequest.toolName) {
      case 'generate_pitch_deck':
        result = await generatePitchDeck(toolRequest.parameters, toolRequest.consultationId);
        break;
      case 'create_business_plan':
        result = await createBusinessPlan(toolRequest.parameters, toolRequest.consultationId);
        break;
      case 'analyze_market_research':
        result = await analyzeMarketResearch(toolRequest.parameters, toolRequest.consultationId);
        break;
      case 'generate_consultation_summary':
        result = await generateConsultationSummary(toolRequest.parameters, toolRequest.consultationId);
        break;
      default:
        throw new Error(`Unknown tool: ${toolRequest.toolName}`);
    }
    
    // Calculate execution time
    const executionTime = Date.now() - startTime;
    
    // Update tool execution log
    if (logEntry) {
      await supabaseAdmin
        .from('llm_tool_executions')
        .update({
          execution_result: result,
          success: true,
          execution_time_ms: executionTime
        })
        .eq('id', logEntry.id);
    }
    
    // Remove from active executions
    activeToolExecutions.delete(executionId);
    
    return {
      success: true,
      result,
      executionTime
    };
  } catch (error) {
    console.error(`[ERROR] Tool execution failed: ${error.message}`);
    
    // Log error to database if we have Supabase connection
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
        
        // Update existing log entry if we have one
        const { data: logEntry } = await supabaseAdmin
          .from('llm_tool_executions')
          .select('id')
          .eq('tool_name', toolRequest.toolName)
          .eq('consultation_id', toolRequest.consultationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (logEntry) {
          await supabaseAdmin
            .from('llm_tool_executions')
            .update({
              success: false,
              execution_time_ms: Date.now() - startTime,
              error_message: error.message
            })
            .eq('id', logEntry.id);
        }
      }
    } catch (logError) {
      console.error('[ERROR] Failed to log tool execution error:', logError);
    }
    
    // Remove from active executions
    activeToolExecutions.delete(executionId);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a pitch deck using OpenAI or Anthropic
 */
async function generatePitchDeck(
  parameters: Record<string, any>,
  consultationId?: string
): Promise<any> {
  // Validate required parameters
  const requiredParams = ['company_name', 'business_idea', 'target_market', 'funding_amount', 'industry'];
  for (const param of requiredParams) {
    if (!parameters[param]) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }
  
  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Create document generation request
  const { data: request, error: requestError } = await supabaseAdmin
    .from('document_generation_requests')
    .insert({
      consultation_id: consultationId,
      requested_document_type: 'pitch_deck',
      status: 'processing',
      parameters
    })
    .select()
    .single();
  
  if (requestError) {
    console.error('[ERROR] Failed to create document generation request:', requestError);
    throw new Error('Failed to create document generation request');
  }
  
  // Generate pitch deck content using OpenAI or Anthropic
  let content;
  if (OPENAI_API_KEY) {
    content = await generatePitchDeckWithOpenAI(parameters);
  } else if (ANTHROPIC_API_KEY) {
    content = await generatePitchDeckWithAnthropic(parameters);
  } else {
    throw new Error('No LLM API keys configured');
  }
  
  // Create the generated document
  const { data: document, error: documentError } = await supabaseAdmin
    .from('generated_documents')
    .insert({
      consultation_id: consultationId,
      document_type: 'pitch_deck',
      title: `${parameters.company_name} Pitch Deck`,
      content,
      metadata: {
        generation_parameters: parameters,
        generated_at: new Date().toISOString(),
        model: OPENAI_API_KEY ? 'gpt-4' : 'claude-3-sonnet'
      }
    })
    .select()
    .single();
  
  if (documentError) {
    console.error('[ERROR] Failed to create generated document:', documentError);
    
    // Update request status to failed
    await supabaseAdmin
      .from('document_generation_requests')
      .update({
        status: 'failed'
      })
      .eq('id', request.id);
    
    throw new Error('Failed to create generated document');
  }
  
  // Update request with document ID and status
  await supabaseAdmin
    .from('document_generation_requests')
    .update({
      status: 'completed',
      result_document_id: document.id
    })
    .eq('id', request.id);
  
  return {
    documentId: document.id,
    title: document.title,
    type: 'pitch_deck',
    slideCount: content.slides.length
  };
}

/**
 * Generate a pitch deck using OpenAI
 */
async function generatePitchDeckWithOpenAI(parameters: Record<string, any>): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert pitch deck creator for startups. Create a comprehensive, investor-ready pitch deck for the startup described. 
          Return a JSON object with an array of slides, where each slide has a title, content, and type.
          Include these essential slides: Title, Problem, Solution, Market Size, Business Model, Traction, Team, Competition, Financials, and Ask.
          Format the response as valid JSON with this structure:
          {
            "slides": [
              {
                "id": "slide-1",
                "title": "Title Slide",
                "type": "title",
                "content": "Content goes here"
              },
              ...more slides
            ],
            "metadata": {
              "company_name": "Company Name",
              "industry": "Industry",
              "slide_count": 10
            }
          }`
        },
        {
          role: 'user',
          content: `Create a pitch deck for my startup with these details:
          
          Company Name: ${parameters.company_name}
          Business Idea: ${parameters.business_idea}
          Target Market: ${parameters.target_market}
          Funding Amount: ${parameters.funding_amount}
          Industry: ${parameters.industry}
          Stage: ${parameters.stage || 'early stage'}
          
          Please create a complete, professional pitch deck that would impress investors.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const result = await response.json();
  const content = JSON.parse(result.choices[0].message.content);
  
  return content;
}

/**
 * Generate a pitch deck using Anthropic Claude
 */
async function generatePitchDeckWithAnthropic(parameters: Record<string, any>): Promise<any> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      system: `You are an expert pitch deck creator for startups. Create a comprehensive, investor-ready pitch deck for the startup described. 
      Return a JSON object with an array of slides, where each slide has a title, content, and type.
      Include these essential slides: Title, Problem, Solution, Market Size, Business Model, Traction, Team, Competition, Financials, and Ask.
      Format the response as valid JSON with this structure:
      {
        "slides": [
          {
            "id": "slide-1",
            "title": "Title Slide",
            "type": "title",
            "content": "Content goes here"
          },
          ...more slides
        ],
        "metadata": {
          "company_name": "Company Name",
          "industry": "Industry",
          "slide_count": 10
        }
      }`,
      messages: [
        {
          role: 'user',
          content: `Create a pitch deck for my startup with these details:
          
          Company Name: ${parameters.company_name}
          Business Idea: ${parameters.business_idea}
          Target Market: ${parameters.target_market}
          Funding Amount: ${parameters.funding_amount}
          Industry: ${parameters.industry}
          Stage: ${parameters.stage || 'early stage'}
          
          Please create a complete, professional pitch deck that would impress investors.`
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const result = await response.json();
  
  // Parse the JSON from the response text
  try {
    const content = JSON.parse(result.content[0].text);
    return content;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse Claude response');
  }
}

/**
 * Create a business plan using LLM
 */
async function createBusinessPlan(
  parameters: Record<string, any>,
  consultationId?: string
): Promise<any> {
  // Implementation similar to generatePitchDeck but for business plans
  // For brevity, this is a simplified version
  
  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Create document generation request
  const { data: request, error: requestError } = await supabaseAdmin
    .from('document_generation_requests')
    .insert({
      consultation_id: consultationId,
      requested_document_type: 'business_plan',
      status: 'processing',
      parameters
    })
    .select()
    .single();
  
  if (requestError) {
    console.error('[ERROR] Failed to create document generation request:', requestError);
    throw new Error('Failed to create document generation request');
  }
  
  // Mock business plan content for now
  const content = {
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        content: `${parameters.business_name} is a ${parameters.business_model} targeting ${parameters.target_customers}.`,
        order: 1
      },
      {
        id: 'business-description',
        title: 'Business Description',
        content: `Detailed description of ${parameters.business_name}.`,
        order: 2
      },
      {
        id: 'market-analysis',
        title: 'Market Analysis',
        content: 'Market analysis content would go here.',
        order: 3
      },
      {
        id: 'competitive-analysis',
        title: 'Competitive Analysis',
        content: `${parameters.competitive_advantage}`,
        order: 4
      },
      {
        id: 'financial-projections',
        title: 'Financial Projections',
        content: 'Financial projections would go here.',
        order: 5
      }
    ],
    metadata: {
      business_name: parameters.business_name,
      plan_type: parameters.plan_type || 'standard',
      section_count: 5
    }
  };
  
  // Create the generated document
  const { data: document, error: documentError } = await supabaseAdmin
    .from('generated_documents')
    .insert({
      consultation_id: consultationId,
      document_type: 'business_plan',
      title: `${parameters.business_name} Business Plan`,
      content,
      metadata: {
        generation_parameters: parameters,
        generated_at: new Date().toISOString(),
        model: 'mock' // Replace with actual model in production
      }
    })
    .select()
    .single();
  
  if (documentError) {
    console.error('[ERROR] Failed to create generated document:', documentError);
    
    // Update request status to failed
    await supabaseAdmin
      .from('document_generation_requests')
      .update({
        status: 'failed'
      })
      .eq('id', request.id);
    
    throw new Error('Failed to create generated document');
  }
  
  // Update request with document ID and status
  await supabaseAdmin
    .from('document_generation_requests')
    .update({
      status: 'completed',
      result_document_id: document.id
    })
    .eq('id', request.id);
  
  return {
    documentId: document.id,
    title: document.title,
    type: 'business_plan',
    sectionCount: content.sections.length
  };
}

/**
 * Analyze market research using LLM
 */
async function analyzeMarketResearch(
  parameters: Record<string, any>,
  consultationId?: string
): Promise<any> {
  // Implementation similar to other document generation functions
  // For brevity, this is a simplified version
  
  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Create document generation request
  const { data: request, error: requestError } = await supabaseAdmin
    .from('document_generation_requests')
    .insert({
      consultation_id: consultationId,
      requested_document_type: 'market_analysis',
      status: 'processing',
      parameters
    })
    .select()
    .single();
  
  if (requestError) {
    console.error('[ERROR] Failed to create document generation request:', requestError);
    throw new Error('Failed to create document generation request');
  }
  
  // Mock market analysis content for now
  const content = {
    sections: [
      {
        id: 'market-overview',
        title: 'Market Overview',
        content: `Overview of the ${parameters.industry} industry.`,
        order: 1
      },
      {
        id: 'market-size',
        title: 'Market Size and Growth',
        content: 'Market size and growth projections would go here.',
        order: 2
      },
      {
        id: 'target-market',
        title: 'Target Market Analysis',
        content: 'Target market analysis would go here.',
        order: 3
      },
      {
        id: 'competitive-landscape',
        title: 'Competitive Landscape',
        content: 'Competitive landscape analysis would go here.',
        order: 4
      },
      {
        id: 'market-trends',
        title: 'Market Trends',
        content: 'Market trends analysis would go here.',
        order: 5
      }
    ],
    metadata: {
      industry: parameters.industry,
      geographic_focus: parameters.geographic_focus || 'Global',
      research_depth: parameters.research_depth || 'detailed',
      section_count: 5
    }
  };
  
  // Create the generated document
  const { data: document, error: documentError } = await supabaseAdmin
    .from('generated_documents')
    .insert({
      consultation_id: consultationId,
      document_type: 'market_analysis',
      title: `${parameters.industry} Market Analysis`,
      content,
      metadata: {
        generation_parameters: parameters,
        generated_at: new Date().toISOString(),
        model: 'mock' // Replace with actual model in production
      }
    })
    .select()
    .single();
  
  if (documentError) {
    console.error('[ERROR] Failed to create generated document:', documentError);
    
    // Update request status to failed
    await supabaseAdmin
      .from('document_generation_requests')
      .update({
        status: 'failed'
      })
      .eq('id', request.id);
    
    throw new Error('Failed to create generated document');
  }
  
  // Update request with document ID and status
  await supabaseAdmin
    .from('document_generation_requests')
    .update({
      status: 'completed',
      result_document_id: document.id
    })
    .eq('id', request.id);
  
  return {
    documentId: document.id,
    title: document.title,
    type: 'market_analysis',
    sectionCount: content.sections.length
  };
}

/**
 * Generate consultation summary using LLM
 */
async function generateConsultationSummary(
  parameters: Record<string, any>,
  consultationId?: string
): Promise<any> {
  // Implementation similar to other document generation functions
  // For brevity, this is a simplified version
  
  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
  
  // Create document generation request
  const { data: request, error: requestError } = await supabaseAdmin
    .from('document_generation_requests')
    .insert({
      consultation_id: consultationId,
      requested_document_type: 'consultation_summary',
      status: 'processing',
      parameters
    })
    .select()
    .single();
  
  if (requestError) {
    console.error('[ERROR] Failed to create document generation request:', requestError);
    throw new Error('Failed to create document generation request');
  }
  
  // Mock consultation summary content for now
  const content = {
    sections: [
      {
        id: 'summary',
        title: 'Consultation Summary',
        content: `Summary of the ${parameters.session_type} session.`,
        order: 1
      },
      {
        id: 'key-topics',
        title: 'Key Topics Discussed',
        content: parameters.key_topics.join(', '),
        order: 2
      },
      {
        id: 'action-items',
        title: 'Action Items',
        content: parameters.action_items ? parameters.action_items.join(', ') : 'No action items specified.',
        order: 3
      },
      {
        id: 'next-steps',
        title: 'Next Steps',
        content: parameters.next_steps ? parameters.next_steps.join(', ') : 'No next steps specified.',
        order: 4
      }
    ],
    metadata: {
      session_type: parameters.session_type,
      key_topics: parameters.key_topics,
      section_count: 4
    }
  };
  
  // Create the generated document
  const { data: document, error: documentError } = await supabaseAdmin
    .from('generated_documents')
    .insert({
      consultation_id: consultationId,
      document_type: 'consultation_summary',
      title: `${parameters.session_type} Consultation Summary`,
      content,
      metadata: {
        generation_parameters: parameters,
        generated_at: new Date().toISOString(),
        model: 'mock' // Replace with actual model in production
      }
    })
    .select()
    .single();
  
  if (documentError) {
    console.error('[ERROR] Failed to create generated document:', documentError);
    
    // Update request status to failed
    await supabaseAdmin
      .from('document_generation_requests')
      .update({
        status: 'failed'
      })
      .eq('id', request.id);
    
    throw new Error('Failed to create generated document');
  }
  
  // Update request with document ID and status
  await supabaseAdmin
    .from('document_generation_requests')
    .update({
      status: 'completed',
      result_document_id: document.id
    })
    .eq('id', request.id);
  
  return {
    documentId: document.id,
    title: document.title,
    type: 'consultation_summary',
    sectionCount: content.sections.length
  };
}

/**
 * Handle tool call requests
 */
async function handleToolCall(req: Request): Promise<Response> {
  try {
    const toolRequest: ToolCallRequest = await req.json();
    
    if (!toolRequest.toolName) {
      return createErrorResponse('Missing tool name');
    }
    
    if (!toolRequest.parameters) {
      return createErrorResponse('Missing tool parameters');
    }
    
    // Execute the tool
    const result = await executeLLMTool(req, toolRequest);
    
    return createSuccessResponse(result);
  } catch (error) {
    console.error('[ERROR] Tool call error:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Parse response from Tavus API
 */
async function parseTavusResponse(response: Response): Promise<any> {
  const responseText = await response.text();
  console.log('[DEBUG] Tavus API response text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
  
  try {
    return responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    // For non-JSON responses, return the text directly
    return responseText;
  }
}

/**
 * Create Supabase client
 */
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns || '*'}&${column}=eq.${value}&limit=1`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json().then(data => ({ data: data[0] || null, error: null }))),
          limit: (limit: number) => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns || '*'}&${column}=eq.${value}&limit=${limit}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json().then(data => ({ data, error: null })))
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (limit: number) => fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns || '*'}&order=${column}.${ascending ? 'asc' : 'desc'}&limit=${limit}`, {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json().then(data => ({ data, error: null })))
        })
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: () => fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(data)
          }).then(res => res.json().then(data => ({ data: data[0] || null, error: null })))
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(res => res.status === 204 ? { error: null } : res.json().then(error => ({ error })))
      })
    }),
    channel: (channel: string) => ({
      send: (message: any) => Promise.resolve({ error: null })
    })
  };
}

/**
 * Handle GET requests to Tavus API
 */
async function handleGetRequest(req: Request): Promise<Response> {
  try {
    // Extract the endpoint path from the URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/tavus-api-llm/');
    
    if (pathParts.length < 2) {
      return createErrorResponse('Invalid endpoint path');
    }
    
    // Get the endpoint path after '/tavus-api-llm/'
    const endpointPath = pathParts[1];
    
    // Extract query parameters
    const queryParams = url.searchParams.toString();
    const tavusEndpoint = endpointPath + (queryParams ? `?${queryParams}` : '');
    
    console.log(`[DEBUG] Routing GET request to Tavus API: ${tavusEndpoint}`);
    
    // Get API headers
    let tavusHeaders;
    try {
      tavusHeaders = prepareTavusHeaders(req);
    } catch (error) {
      return createErrorResponse(error.message, 401);
    }
    
    // Call the Tavus API
    const response = await fetch(`${TAVUS_API_URL}/${tavusEndpoint}`, {
      method: 'GET',
      headers: tavusHeaders
    });
    
    console.log('[DEBUG] Tavus API response status:', response.status);
    
    // Parse and return the response
    const responseData = await parseTavusResponse(response);
    
    if (typeof responseData === 'string') {
      // Raw text response
      return new Response(responseData, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    } else {
      // JSON response
      return createSuccessResponse(responseData, response.ok ? 200 : response.status);
    }
  } catch (error) {
    console.error('[DEBUG] Error handling GET request:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Handle POST requests to Tavus API with custom LLM support
 */
async function handlePostRequest(req: Request): Promise<Response> {
  try {
    // Parse the JSON request body
    let requestBody: TavusRequest;
    try {
      requestBody = await req.json();
      console.log('[DEBUG] Request body parsed:', requestBody);
    } catch (error) {
      console.error('[DEBUG] Error parsing JSON request:', error);
      return createErrorResponse('Invalid JSON request');
    }

    // Basic validation
    if (!requestBody || !requestBody.endpoint) {
      return createErrorResponse('Missing endpoint in request');
    }

    // Check if this is a tool call request
    if (requestBody.endpoint === '/tools/execute') {
      return await handleToolCall(req);
    }

    // Get custom LLM configuration
    const customLLMConfig = getCustomLLMConfig(req);
    const userId = req.headers.get('x-user-id');

    // Enhance payload for conversation creation if custom LLM is configured
    if (requestBody.endpoint === '/v2/conversations' && requestBody.payload) {
      requestBody.payload = enhanceConversationPayload(
        requestBody.payload,
        customLLMConfig,
        userId
      );
      console.log('[DEBUG] Enhanced conversation payload:', requestBody.payload);
    }

    // Add webhook URL to conversation creation if not already present
    if (requestBody.endpoint === '/v2/conversations' && requestBody.payload) {
      const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tavus-webhook`;
      if (!requestBody.payload.callback_url && webhookUrl) {
        requestBody.payload.callback_url = webhookUrl;
        console.log('[DEBUG] Added webhook URL to conversation payload:', webhookUrl);
      }
    }

    // Get API headers
    let tavusHeaders;
    try {
      tavusHeaders = prepareTavusHeaders(req);
    } catch (error) {
      return createErrorResponse(error.message, 401);
    }

    // Add any custom headers from the request
    if (requestBody.headers) {
      Object.assign(tavusHeaders, requestBody.headers);
    }

    console.log('[DEBUG] Calling Tavus API:', {
      url: TAVUS_API_URL + requestBody.endpoint,
      method: requestBody.method,
      customLLM: !!customLLMConfig?.use_custom_llm
    });

    // Call the Tavus API
    const response = await fetch(TAVUS_API_URL + requestBody.endpoint, {
      method: requestBody.method,
      headers: {
        ...tavusHeaders,
        // Add tools configuration if this is a conversation creation
        ...(requestBody.endpoint === '/v2/conversations' && {
          'x-tavus-tools-config': JSON.stringify({
            tools: LLM_TOOLS,
            tool_choice: 'auto'
          })
        })
      },
      body: requestBody.payload ? JSON.stringify(requestBody.payload) : undefined
    });

    console.log('[DEBUG] Tavus API response status:', response.status);
    
    // Parse and return the response
    const responseData = await parseTavusResponse(response);
    
    if (typeof responseData === 'string') {
      // Raw text response
      return new Response(responseData, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    } else {
      // JSON response
      return createSuccessResponse(responseData, 200);
    }
  } catch (error) {
    console.error('[DEBUG] Edge Function error:', error);
    return createErrorResponse(error.message, 500);
  }
}

serve(async (req) => {
  console.log('[DEBUG] Tavus API LLM Function received request:', {
    method: req.method,
    url: req.url
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  } 
  // All API requests come in as POST with a JSON body specifying the actual method
  else if (req.method === 'POST') {
    try {
      console.log('[DEBUG] Processing POST request');
      
      // Parse the request body
      let requestBody: TavusRequest;
      try {
        requestBody = await req.json();
        console.log('[DEBUG] Request body parsed:', requestBody);
      } catch (error) {
        console.error('[DEBUG] Error parsing JSON request:', error);
        
        // Attempt to get the raw body as a fallback
        const rawText = await req.text();
        console.log('[DEBUG] Raw request body:', rawText);
        
        return createErrorResponse('Invalid JSON request: ' + error.message);
      }
      
      // Now process based on the method specified in the request body
      if (!requestBody || !requestBody.method) {
        return createErrorResponse('Missing method in request body');
      }
      
      // Route based on the method in the request body
      if (requestBody.method === 'GET') {
        console.log('[DEBUG] Proxying GET request to Tavus API');
        
        // Get API headers
        let tavusHeaders;
        try {
          tavusHeaders = prepareTavusHeaders(req);
        } catch (error) {
          return createErrorResponse(error.message, 401);
        }
        
        if (!requestBody.endpoint) {
          return createErrorResponse('Missing endpoint in request');
        }
        
        // Determine if the endpoint is a full URL or just a path
        let apiUrl;
        if (requestBody.endpoint.startsWith('http')) {
          // If it's a full URL, use it as is
          apiUrl = requestBody.endpoint;
        } else {
          // Otherwise, prepend the base URL
          apiUrl = `${TAVUS_API_URL}${requestBody.endpoint}`;
        }
        
        console.log(`[DEBUG] Calling API: ${apiUrl}`);
        
        // Set up headers for Tavus API
        const headers = new Headers({
          'x-api-key': TAVUS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        });
        
        // Log the headers we're sending
        console.log('[DEBUG] Request headers:', JSON.stringify(Object.fromEntries(headers), null, 2));
        
        try {
          const response = await fetch(apiUrl, {
            method: requestBody.method,
            headers: headers,
            // Only include body for non-GET requests
            ...(requestBody.method !== 'GET' && requestBody.payload && { 
              body: JSON.stringify(requestBody.payload) 
            })
          });

          console.log(`[DEBUG] Response status: ${response.status}`);
          
          // Get response headers for debugging
          const responseHeaders = Object.fromEntries(response.headers.entries());
          console.log('[DEBUG] Response headers:', JSON.stringify(responseHeaders, null, 2));

          // Get response text first to log it
          const responseText = await response.text();
          console.log('[DEBUG] Raw response:', responseText.slice(0, 500)); // Log first 500 chars

          // Try to parse as JSON, fall back to text if it fails
          let responseData;
          try {
            responseData = responseText ? JSON.parse(responseText) : null;
          } catch (e) {
            console.error('[ERROR] Failed to parse response as JSON:', e);
            responseData = responseText;
          }
          
          // If the response is not OK, include the status in the response
          if (!response.ok) {
            console.error(`[ERROR] Tavus API error: ${response.status} ${response.statusText}`, responseData);
            return new Response(JSON.stringify({
              error: 'Tavus API error',
              status: response.status,
              statusText: response.statusText,
              data: responseData
            }), {
              status: response.status,
              headers: { 
                ...corsHeaders, 
                'Content-Type': 'application/json'
              }
            });
          }
          
          // Successful response
          return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            }
          });
          
        } catch (error) {
          console.error('[ERROR] Error calling Tavus API:', error);
          return createErrorResponse(`Failed to call Tavus API: ${error.message}`, 500);
        }
      } 
      else if (requestBody.method === 'POST') {
        // Enhanced POST logic with custom LLM support
        return await handlePostRequest(req);
      }
      else {
        return createErrorResponse(`Method ${requestBody.method} not supported in request body`);
      }
    } catch (error) {
      console.error('[DEBUG] Error processing request:', error);
      return createErrorResponse(error.message, 500);
    }
  } 
  // Direct GET requests (these should be rare)
  else if (req.method === 'GET') {
    return await handleGetRequest(req);
  }
  // Handle unsupported methods
  else {
    return createErrorResponse(
      `Method ${req.method} not supported. Supported methods are GET, POST and OPTIONS.`,
      405
    );
  }
});