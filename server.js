const express = require('express');
const crypto = require('crypto');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Configuration ───────────────────────────────────────────────────────────
// Set these in Render's Environment Variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'my_secret_token';
const APP_SECRET = process.env.APP_SECRET || '';  // Your Meta App Secret

// ─── Health check endpoint ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Webhook listener is running',
    timestamp: new Date().toISOString()
  });
});

// ─── META WEBHOOK VERIFICATION (GET) ────────────────────────────────────────
// Meta sends a GET request to verify your endpoint when you first subscribe.
// It sends hub.mode, hub.verify_token, and hub.challenge as query params.
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Verification] mode=${mode}, token=${token}, challenge=${challenge}`);

  // Check that mode and token are correct
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    // Respond with the challenge to complete verification
    return res.status(200).send(challenge);
  }

  console.error('❌ Webhook verification failed. Token mismatch.');
  return res.status(403).send('Forbidden');
});

// ─── META WEBHOOK EVENTS (POST) ─────────────────────────────────────────────
// After verification, Meta sends event notifications here as POST requests.
app.post('/webhook', (req, res) => {
  const timestamp = new Date().toISOString();
  const payload = req.body;

  console.log(`\n[${timestamp}] Webhook event received`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  // ─── Optional: Verify request signature from Meta ────────────────────────
  // Uncomment to validate that requests actually come from Meta
  //
  // if (APP_SECRET) {
  //   const signature = req.headers['x-hub-signature-256'];
  //   const expectedSig = 'sha256=' + crypto
  //     .createHmac('sha256', APP_SECRET)
  //     .update(JSON.stringify(req.body))
  //     .digest('hex');
  //   if (signature !== expectedSig) {
  //     console.error('❌ Invalid signature!');
  //     return res.status(401).send('Invalid signature');
  //   }
  // }

  // ─── Process webhook by object type ──────────────────────────────────────
  if (payload.object) {
    // Meta sends: { object: "page"|"instagram"|"whatsapp_business_account", entry: [...] }
    console.log(`Object: ${payload.object}`);

    if (payload.entry) {
      payload.entry.forEach((entry, i) => {
        console.log(`Entry ${i}:`, JSON.stringify(entry, null, 2));

        // Handle messaging events (WhatsApp, Messenger)
        if (entry.changes) {
          entry.changes.forEach((change) => {
            console.log(`  Change field: ${change.field}`);
            console.log(`  Change value:`, JSON.stringify(change.value, null, 2));
          });
        }

        // Handle Messenger-specific events
        if (entry.messaging) {
          entry.messaging.forEach((event) => {
            console.log(`  Messaging event:`, JSON.stringify(event, null, 2));
          });
        }
      });
    }

    // IMPORTANT: Always respond with 200 quickly, or Meta will retry
    return res.status(200).send('EVENT_RECEIVED');
  }

  // Not a recognized Meta webhook payload
  res.status(404).send('Not Found');
});

// ─── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Webhook listener running on port ${PORT}`);
  console.log(`   Health check:  http://localhost:${PORT}/`);
  console.log(`   Webhook URL:   http://localhost:${PORT}/webhook`);
  console.log(`   Verify Token:  ${VERIFY_TOKEN}`);
});
