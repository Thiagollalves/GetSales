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

    // Security: Validate inputs before interpolating into the URL or payload to prevent SSRF and Injection
    const phoneRegex = /^\d{1,15}$/;
    const phoneIdRegex = /^\d{1,25}$/;
    const apiVersionRegex = /^v\d{1,2}\.\d$/;

    if (!phoneRegex.test(phone) || !phoneIdRegex.test(resolvedPhoneId) || !apiVersionRegex.test(apiVersion)) {
      return NextResponse.json(
        { error: 'Invalid input format' },
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
