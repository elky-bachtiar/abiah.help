import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  name: string;
  email: string;
  subject?: string;
  company: string;
  role: string;
  message: string;
  investmentInterest: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, company, subject,role, message, investmentInterest }: EmailRequest = await req.json()

    // Validate required fields
    if (!name || !email || !company || !role || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create MIME message for Gmail API
    const timestamp = new Date().toLocaleString()
    const mimeMessage = `From: noreply@abiah.help
To: hello@abiah.help
Subject: New Investor Inquiry - ${name} from ${company}
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #2A2F6D, #7D5BA6); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #2A2F6D; }
        .value { margin-left: 10px; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 New Investor Inquiry - Abiah AI</h1>
        <p>Received: ${timestamp}</p>
    </div>
    
    <div class="content">
        <div class="field">
            <span class="label">Name:</span>
            <span class="value">${name}</span>
        </div>
        
        <div class="field">
            <span class="label">Email:</span>
            <span class="value">${email}</span>
        </div>
        
        <div class="field">
            <span class="label">Company:</span>
            <span class="value">${company}</span>
        </div>
        
        <div class="field">
            <span class="label">Role:</span>
            <span class="value">${role}</span>
        </div>
        
        <div class="field">
            <span class="label">Investment Interest:</span>
            <span class="value">${investmentInterest}</span>
        </div>
        
        <div class="field">
            <span class="label">Message:</span>
            <div class="value" style="margin-top: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                ${message.replace(/\n/g, '<br>')}
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>This inquiry was submitted through the Abiah AI pitch deck presentation.</p>
        <p>Please respond within 24 hours for optimal investor relations.</p>
    </div>
</body>
</html>`

    // Encode to base64url - with Unicode character support
    // First encode the string as UTF-8, then convert to base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(mimeMessage);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
    
    // Convert base64 to base64url format
    const encodedMessage = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    // Get environment variables
    const picaSecret = Deno.env.get('PICA_SECRET_KEY')
    const picaConnectionKey = Deno.env.get('PICA_GMAIL_CONNECTION_KEY')

    if (!picaSecret || !picaConnectionKey) {
      console.error('Missing Pica environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send via Pica Passthrough API
    const response = await fetch('https://api.picaos.com/v1/passthrough/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': picaSecret,
        'x-pica-connection-key': picaConnectionKey,
        'x-pica-action-id': 'conn_mod_def::F_JeJ_A_TKg::cc2kvVQQTiiIiLEDauy6zQ'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pica API error:', errorText)
      throw new Error(`Pica API error: ${response.status}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})