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

    // Security validation to prevent SSRF and injection attacks
    const phoneIdStr = String(resolvedPhoneId);
    if (!/^\d+$/.test(phoneIdStr)) {
      return NextResponse.json({ error: 'Invalid phoneId format' }, { status: 400 });
    }

    const tokenStr = String(resolvedToken);
    if (/[\r\n]/.test(tokenStr)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const apiVersionStr = String(apiVersion);
    if (!/^v\d+\.\d+$/.test(apiVersionStr)) {
      return NextResponse.json({ error: 'Invalid API version format' }, { status: 400 });
    }

    const phoneStr = String(phone).replace(/[\s-]/g, '');
    if (!/^\+?\d{8,15}$/.test(phoneStr)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    const url = `https://graph.facebook.com/${apiVersionStr}/${phoneIdStr}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneStr,
      text: { body: message },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenStr}`,
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
