import assert from 'assert';
import app from '../src/index.js';

let server;
const PORT = 8090;
const BASE_URL = `http://localhost:${PORT}`;

async function runGeminiTests() {
  process.env.NODE_ENV = 'test';
  server = app.listen(PORT);
  console.log(`\n=================================================`);
  console.log(`  RUNNING GEMINI & EVOLUTION API TEST SUITE`);
  console.log(`=================================================\n`);

  try {
    const token = 'MOCK_TOKEN_test_user_gemini';

    // TEST 1: Health check endpoint
    console.log('Test 1: Health Check Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'HEALTHY');
    console.log('  PASSED: Health check operational.');

    // TEST 2: Multi-turn Chat endpoint
    console.log('\nTest 2: Multi-Turn Gemini Chat Endpoint...');
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        history: [
          { role: 'user', content: 'Hello! I want to reflect on my goals for this quarter.' }
        ],
        message: 'I want to focus on learning Cloud Run and Gemini API.'
      })
    });
    assert.strictEqual(chatRes.status, 200);
    const chatData = await chatRes.json();
    assert.ok(chatData.response, 'Response string should be present');
    console.log(`  PASSED: Multi-turn response received (${chatData.response.substring(0, 60)}...)`);

    // TEST 3: Auto-Summarization & Completion
    console.log('\nTest 3: Auto-Summarization & Session Completion...');
    const completeRes = await fetch(`${BASE_URL}/api/sessions/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Q3 Goals Reflection',
        messages: [
          { role: 'user', content: 'I am planning to transition to cloud engineering.' },
          { role: 'model', content: 'That is a powerful career move. What is your first step?' },
          { role: 'user', content: 'Building a production submission for Google Cloud Ideathon.' }
        ]
      })
    });
    assert.strictEqual(completeRes.status, 201);
    const completeData = await completeRes.json();
    assert.ok(completeData.session.summary.main_topic, 'Summary topic must exist');
    assert.ok(Array.isArray(completeData.session.summary.key_thoughts), 'Key thoughts must be array');
    console.log(`  PASSED: Session completed with Topic: "${completeData.session.summary.main_topic}"`);

    // TEST 4: Original Feature - Thought Evolution Analysis
    console.log('\nTest 4: Thought Evolution Engine API...');
    const evolutionRes = await fetch(`${BASE_URL}/api/evolution/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: 'What were my key goals?'
      })
    });
    assert.strictEqual(evolutionRes.status, 200);
    const evolutionData = await evolutionRes.json();
    assert.ok(evolutionData.report.synthesis_headline, 'Synthesis headline must exist');
    assert.ok(Array.isArray(evolutionData.report.recurring_themes), 'Recurring themes must be array');
    console.log(`  PASSED: Evolution analysis succeeded. Headline: "${evolutionData.report.synthesis_headline}"`);

    console.log(`\n=================================================`);
    console.log(`  ALL GEMINI API INTEGRATION TESTS PASSED!`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error('\nGEMINI TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runGeminiTests();
