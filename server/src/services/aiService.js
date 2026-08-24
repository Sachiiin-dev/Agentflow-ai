const config = require('../config/env');

class AIService {
  /**
   * Generates a complete visual workflow graph from a natural language prompt
   */
  async generateWorkflowFromPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Prompt is required to generate a workflow.');
    }

    const cleanPrompt = prompt.trim();

    // 1. Try OpenRouter if API key configured
    if (config.ai.openRouterApiKey) {
      try {
        const result = await this._generateWithOpenRouter(cleanPrompt);
        if (result) return result;
      } catch (err) {
        console.warn(`[AI Generator] OpenRouter generation failed (${err.message}). Falling back.`);
      }
    }

    // 2. Try Gemini if API key configured
    if (config.ai.geminiApiKey) {
      try {
        const result = await this._generateWithGemini(cleanPrompt);
        if (result) return result;
      } catch (err) {
        console.warn(`[AI Generator] Gemini generation failed (${err.message}). Falling back to Rule-Based Builder.`);
      }
    }

    // 3. Fallback to smart deterministic rule-based generator
    return this._generateDeterministicWorkflow(cleanPrompt);
  }

  async _generateWithOpenRouter(prompt) {
    const systemPrompt = `You are an expert AI Operations Architect. 
Convert the user's natural language request into an executable workflow graph with nodes, edges, triggerConfig, and metadata.
Return ONLY valid JSON matching this schema:
{
  "name": "string (clear title)",
  "description": "string (explanation)",
  "tags": ["string"],
  "triggerConfig": { "type": "manual" | "webhook" | "schedule" | "event", "cron": null, "eventProvider": null },
  "nodes": [
    {
      "id": "string (node_1, node_2...)",
      "type": "trigger" | "ai_action" | "integration_action" | "condition" | "transformer",
      "position": { "x": number, "y": number },
      "data": {
        "label": "string",
        "category": "trigger" | "ai" | "integration" | "logic" | "transform",
        "provider": "gmail" | "slack" | "discord" | "google-sheets" | "gemini" | "openrouter" | "system",
        "action": "string",
        "params": { ... }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node_1", "target": "node_2", "animated": true }
  ]
}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.ai.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agentflow.ai',
        'X-Title': 'Agentflow AI',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a workflow for: "${prompt}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  async _generateWithGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`;
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Convert this automation instruction into an Agentflow graph JSON with nodes, edges, triggerConfig, name, description, tags. Return ONLY JSON without markdown fences:\nInstruction: "${prompt}"`,
            },
          ],
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Gemini returned status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  /**
   * Deterministic Rule Engine Fallback
   * Generates robust, runnable workflow graphs for email, invoice routing, Slack/Discord notification, Sheet appends
   */
  _generateDeterministicWorkflow(prompt) {
    const lower = prompt.toLowerCase();

    // 1. Invoice Processing & Routing Workflow
    if (lower.includes('invoice') || lower.includes('bill') || lower.includes('receipt')) {
      return {
        name: 'AI Invoice Extraction & Slack Routing',
        description: 'Monitors incoming invoice emails, uses AI to extract line items and totals, logs data to Google Sheets, and sends approval alerts to Slack.',
        tags: ['finance', 'invoice', 'ai-extraction', 'slack'],
        triggerConfig: {
          type: 'event',
          eventProvider: 'gmail',
          event: 'new_email_with_attachment',
        },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 100, y: 150 },
            data: {
              label: 'New Invoice Email Trigger',
              category: 'trigger',
              provider: 'gmail',
              action: 'read_emails',
              params: { query: 'has:attachment subject:invoice' },
            },
          },
          {
            id: 'node_2',
            type: 'ai_action',
            position: { x: 420, y: 150 },
            data: {
              label: 'Extract Invoice Details (LLM)',
              category: 'ai',
              provider: 'gemini',
              action: 'extract_entities',
              params: {
                prompt: 'Extract vendor_name, invoice_number, total_amount, due_date, and currency from {{node_1.body}}',
                temperature: 0.1,
              },
            },
          },
          {
            id: 'node_3',
            type: 'integration_action',
            position: { x: 740, y: 80 },
            data: {
              label: 'Append to Finance Sheet',
              category: 'integration',
              provider: 'google-sheets',
              action: 'append_row',
              params: {
                spreadsheetId: 'finance_ledger_2026',
                sheetName: 'Invoices',
                values: ['{{node_2.vendor_name}}', '{{node_2.invoice_number}}', '{{node_2.total_amount}}', '{{node_2.due_date}}'],
              },
            },
          },
          {
            id: 'node_4',
            type: 'integration_action',
            position: { x: 740, y: 240 },
            data: {
              label: 'Post Approval Alert to Slack',
              category: 'integration',
              provider: 'slack',
              action: 'post_message',
              params: {
                channel: '#finance-approvals',
                text: '📄 *New Invoice Processed*\n*Vendor*: {{node_2.vendor_name}}\n*Amount*: {{node_2.total_amount}}\n*Due Date*: {{node_2.due_date}}',
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
        ],
      };
    }

    // 2. Discord Notification / Community Alerts Workflow
    if (lower.includes('discord') || lower.includes('community')) {
      return {
        name: 'AI Community Monitor & Discord Dispatcher',
        description: 'Listens for system events, analyzes sentiment/urgency with AI, and dispatches rich embed notifications to Discord channels.',
        tags: ['discord', 'monitoring', 'sentiment-analysis'],
        triggerConfig: { type: 'manual' },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 100, y: 180 },
            data: {
              label: 'Incoming Event Webhook',
              category: 'trigger',
              provider: 'system',
              action: 'webhook_received',
              params: { path: '/events/discord-alert' },
            },
          },
          {
            id: 'node_2',
            type: 'ai_action',
            position: { x: 420, y: 180 },
            data: {
              label: 'AI Tone & Priority Filter',
              category: 'ai',
              provider: 'openrouter',
              action: 'classify_intent',
              params: { prompt: 'Classify severity into LOW, MEDIUM, CRITICAL and summarize key actionable points' },
            },
          },
          {
            id: 'node_3',
            type: 'integration_action',
            position: { x: 740, y: 180 },
            data: {
              label: 'Dispatch Discord Embed',
              category: 'integration',
              provider: 'discord',
              action: 'send_embed',
              params: {
                channelId: 'ops-broadcast',
                title: '🚨 Operational Incident Notice',
                description: '{{node_2.summary}}',
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
        ],
      };
    }

    // 3. Email & Lead Outreach Pipeline
    if (lower.includes('email') || lower.includes('gmail') || lower.includes('lead') || lower.includes('outreach')) {
      return {
        name: 'AI Personalized Email & Lead Routing',
        description: 'Analyzes inbound customer requests, drafts context-aware responses with AI, sends verified replies via Gmail, and records interactions in Google Sheets.',
        tags: ['email', 'gmail', 'crm', 'google-sheets'],
        triggerConfig: { type: 'manual' },
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            position: { x: 100, y: 160 },
            data: {
              label: 'Customer Request Ingest',
              category: 'trigger',
              provider: 'gmail',
              action: 'read_emails',
              params: { query: 'label:inquiries' },
            },
          },
          {
            id: 'node_2',
            type: 'ai_action',
            position: { x: 420, y: 160 },
            data: {
              label: 'Generate Personalized Response',
              category: 'ai',
              provider: 'gemini',
              action: 'generate_text',
              params: {
                prompt: 'Draft an empathetic, professional response answering the customer query in {{node_1.body}}',
                maxTokens: 500,
              },
            },
          },
          {
            id: 'node_3',
            type: 'integration_action',
            position: { x: 740, y: 80 },
            data: {
              label: 'Send Email via Gmail',
              category: 'integration',
              provider: 'gmail',
              action: 'send_email',
              params: {
                to: '{{node_1.from}}',
                subject: 'Re: {{node_1.subject}}',
                body: '{{node_2.text}}',
              },
            },
          },
          {
            id: 'node_4',
            type: 'integration_action',
            position: { x: 740, y: 240 },
            data: {
              label: 'Log CRM Record to Sheets',
              category: 'integration',
              provider: 'google-sheets',
              action: 'append_row',
              params: {
                spreadsheetId: 'crm_leads_2026',
                sheetName: 'Interactions',
                values: ['{{node_1.from}}', '{{node_1.subject}}', 'Responded', '{{node_2.sentiment}}'],
              },
            },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
        ],
      };
    }

    // 4. Default Multi-Step Operations Pipeline
    return {
      name: 'Agentic Operations & Alert Pipeline',
      description: `Automated agent pipeline generated for: "${prompt}"`,
      tags: ['agentic-automation', 'multi-agent', 'ops'],
      triggerConfig: { type: 'manual' },
      nodes: [
        {
          id: 'node_1',
          type: 'trigger',
          position: { x: 100, y: 160 },
          data: {
            label: 'Scheduled Ops Trigger',
            category: 'trigger',
            provider: 'system',
            action: 'cron_schedule',
            params: { cron: '0 * * * *' },
          },
        },
        {
          id: 'node_2',
          type: 'ai_action',
          position: { x: 420, y: 160 },
          data: {
            label: 'AI Reasoning & Data Synthesis',
            category: 'ai',
            provider: 'gemini',
            action: 'analyze_metrics',
            params: {
              prompt: `Synthesize operational parameters based on request: ${prompt}`,
            },
          },
        },
        {
          id: 'node_3',
          type: 'integration_action',
          position: { x: 740, y: 80 },
          data: {
            label: 'Broadcast to Slack Team',
            category: 'integration',
            provider: 'slack',
            action: 'post_message',
            params: {
              channel: '#operations',
              text: '🚀 *Automated Task Completed*: {{node_2.summary}}',
            },
          },
        },
        {
          id: 'node_4',
          type: 'integration_action',
          position: { x: 740, y: 240 },
          data: {
            label: 'Persist Audit to Google Sheets',
            category: 'integration',
            provider: 'google-sheets',
            action: 'append_row',
            params: {
              spreadsheetId: 'ops_audit_log',
              sheetName: 'Executions',
              values: ['{{node_1.timestamp}}', 'Success', '{{node_2.summary}}'],
            },
          },
        },
      ],
      edges: [
        { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
        { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
        { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
      ],
    };
  }
}

module.exports = new AIService();
