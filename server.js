const express = require('express');
const crypto = require('crypto');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Health check endpoint ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Webhook listener is running',
    timestamp: new Date().toISOString()
  });
});

// ─── Main webhook endpoint ───────────────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const timestamp = new Date().toISOString();
  const headers = req.headers;
  const payload = req.body;

  console.log(`\n[${timestamp}] Webhook received`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Payload:', JSON.stringify(payload, null, 2));

  // ─── Optional: Verify webhook signature ──────────────────────────────────
  // Uncomment and set WEBHOOK_SECRET env var if your provider sends signatures
  //
  // const secret = process.env.WEBHOOK_SECRET;
  // const signature = headers['x-hub-signature-256'] || headers['x-signature'];
  // if (secret && signature) {
  //   const hash = 'sha256=' + crypto
  //     .createHmac('sha256', secret)
  //     .update(JSON.stringify(payload))
  //     .digest('hex');
  //   if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash))) {
  //     console.error('Invalid signature!');
  //     return res.status(401).json({ error: 'Invalid signature' });
  //   }
  // }

  // ─── Process webhook payload ─────────────────────────────────────────────
  // Add your business logic here
  // Example: route by event type
  const eventType = headers['x-event-type'] || payload.type || 'unknown';
  console.log(`Event type: ${eventType}`);

  // Respond immediately with 200 to acknowledge receipt
  res.status(200).json({
    status: 'received',
    event: eventType,
    timestamp: timestamp
  });
});

// ─── Catch-all for other webhook paths ───────────────────────────────────────
app.post('/webhook/:channel', (req, res) => {
  const { channel } = req.params;
  console.log(`\n[${new Date().toISOString()}] Webhook received on channel: ${channel}`);
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  res.status(200).json({ status: 'received', channel });
});

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Webhook listener running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/`);
  console.log(`   Webhook URL:  http://localhost:${PORT}/webhook`);
});
