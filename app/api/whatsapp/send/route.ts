import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, token, phoneId } = body;

    if (!phone || !message || !token || !phoneId) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, message, token, phoneId' },
        { status: 400 }
      );
    }

    const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      text: { body: message },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
