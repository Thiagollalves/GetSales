import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, token, phoneId } = body;

    // SECURITY: If relying on server-stored credentials, we MUST authenticate the client
    // using an API_SECRET to prevent an open relay / SSRF vulnerability.
    const isUsingServerCredentials = !token || !phoneId;
    if (isUsingServerCredentials) {
      const apiSecret = process.env.API_SECRET;

      // Fail securely if API_SECRET is not configured
      if (!apiSecret) {
        console.error('CRITICAL: API_SECRET is not configured for WhatsApp send endpoint fallback.');
        return NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 }
        );
      }

      // Check if the request provided the correct API_SECRET
      const authHeader = request.headers.get('Authorization');
      if (authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const resolvedToken = token ?? process.env.META_WHATSAPP_TOKEN;
    const resolvedPhoneId = phoneId ?? process.env.META_PHONE_NUMBER_ID;
    const apiVersion = process.env.META_GRAPH_API_VERSION ?? "v20.0";

    if (!phone || !message || !resolvedToken || !resolvedPhoneId) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, message, token, phoneId' },
        { status: 400 }
      );
    }

    const url = `https://graph.facebook.com/${apiVersion}/${resolvedPhoneId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      text: { body: message },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resolvedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to send message' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
