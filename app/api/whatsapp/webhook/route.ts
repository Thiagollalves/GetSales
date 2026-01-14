import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify token should match what you set in the Meta dashboard
    // For the demo, we'll accept 'conecta-crm-demo' or any user provided token if we store it
    // Ideally this should be an environment variable.
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'conecta-crm-demo';

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }

    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received webhook:', JSON.stringify(body, null, 2));

        // Here you would process the message (extract text, sender, etc.)
        // and store it in your database or push to the frontend via connection.

        // For demo purposes, we just acknowledge receipt.
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
