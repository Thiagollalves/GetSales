import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, token, phoneId } = body;
    const resolvedToken = token ?? process.env.META_WHATSAPP_TOKEN;
    const resolvedPhoneId = phoneId ?? process.env.META_PHONE_NUMBER_ID;
    const apiVersion = process.env.META_GRAPH_API_VERSION ?? "v20.0";

    if (!phone || !message || !resolvedToken || !resolvedPhoneId) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, message, token, phoneId' },
        { status: 400 }
      );
    }

    // 🛡️ Sentinel: Prevent Open Relay
    // If relying on server-side credentials, enforce API_SECRET check
    if (!token || !phoneId) {
      if (!process.env.API_SECRET) {
        console.error('CRITICAL: API_SECRET is not configured for WhatsApp proxy fallback.');
        return NextResponse.json(
          { error: 'Internal Server Error: Missing required configuration' },
          { status: 500 }
        );
      }
      const authHeader = request.headers.get('authorization');
      const expectedAuth = `Bearer ${process.env.API_SECRET}`;
      if (!authHeader || authHeader !== expectedAuth) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid API_SECRET for proxy request' },
          { status: 401 }
        );
      }
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
