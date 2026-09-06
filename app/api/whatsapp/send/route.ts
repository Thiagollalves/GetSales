import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, token, phoneId } = body;

    // Security Check: If falling back to server-stored credentials, require API_SECRET authentication
    // This prevents unauthenticated users from using our backend as an open relay for WhatsApp messages.
    if (!token || !phoneId) {
      const authHeader = request.headers.get('authorization');
      const apiSecret = process.env.API_SECRET;

      if (!apiSecret) {
        return NextResponse.json(
          { error: 'Server misconfiguration: API_SECRET is not set' },
          { status: 500 }
        );
      }

      if (!authHeader || authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized access to server credentials' },
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
