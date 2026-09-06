import assert from 'assert';
import app from '../src/index.js';

// Simple lightweight HTTP test runner using native fetch / http server
let server;
const PORT = 8089;
const BASE_URL = `http://localhost:${PORT}`;

async function runSecurityTests() {
  process.env.NODE_ENV = 'test';
  server = app.listen(PORT);
  console.log(`\n=================================================`);
  console.log(`  RUNNING CROSS-USER SECURITY ISOLATION TEST SUITE`);
  console.log(`=================================================\n`);

  try {
    const tokenUserA = 'MOCK_TOKEN_user_alpha_123';
    const tokenUserB = 'MOCK_TOKEN_user_beta_456';

    // TEST 1: Unauthenticated request must fail with 401
    console.log('Test 1: Verification of Unauthenticated Request Rejection...');
    const unauthRes = await fetch(`${BASE_URL}/api/sessions`);
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request must return 401 Unauthorized');
    const unauthData = await unauthRes.json();
    assert.strictEqual(unauthData.code, 'AUTH_HEADER_MISSING');
    console.log('  PASSED: Unauthenticated access rejected with 401.');

    // TEST 2: User A creates a journal session
    console.log('\nTest 2: User A completes & saves a journal session...');
    const createRes = await fetch(`${BASE_URL}/api/sessions/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenUserA}`
      },
      body: JSON.stringify({
        title: 'User A Secret Strategy Journal',
        messages: [
          { role: 'user', content: 'Thinking about changing my career to AI Engineering.' },
          { role: 'model', content: 'That sounds exciting! What skills are you planning to focus on?' }
        ]
      })
    });
    assert.strictEqual(createRes.status, 201, 'User A session creation should return 201');
    const createData = await createRes.json();
    const sessionUserAId = createData.session.id;
    assert.ok(sessionUserAId, 'Session ID must be generated');
    console.log(`  PASSED: User A session created with ID: ${sessionUserAId}`);

    // TEST 3: User B attempts to read User A's session -> Must be Forbidden/Not Found (404)
    console.log('\nTest 3: Security Check - User B attempts to access User A session...');
    const crossReadRes = await fetch(`${BASE_URL}/api/sessions/${sessionUserAId}`, {
      headers: { 'Authorization': `Bearer ${tokenUserB}` }
    });
    assert.strictEqual(crossReadRes.status, 404, 'User B must NOT be able to view User A session');
    console.log('  PASSED: User B access to User A data rejected with 404 Not Found.');

    // TEST 4: User B attempts to delete User A's session -> Must be Forbidden/Not Found (404)
    console.log('\nTest 4: Security Check - User B attempts to delete User A session...');
    const crossDeleteRes = await fetch(`${BASE_URL}/api/sessions/${sessionUserAId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenUserB}` }
    });
    assert.strictEqual(crossDeleteRes.status, 404, 'User B must NOT be able to delete User A session');
    console.log('  PASSED: User B attempt to delete User A data blocked.');

    // TEST 5: Verify User B session list is isolated and empty
    console.log('\nTest 5: User B lists sessions (Strict per-user UID isolation)...');
    const userBSessionsRes = await fetch(`${BASE_URL}/api/sessions`, {
      headers: { 'Authorization': `Bearer ${tokenUserB}` }
    });
    assert.strictEqual(userBSessionsRes.status, 200);
    const userBData = await userBSessionsRes.json();
    assert.strictEqual(userBData.count, 0, 'User B must see 0 sessions belonging to User A');
    console.log('  PASSED: User B sessions list confirmed strictly isolated (Count: 0).');

    // TEST 6: User A reads User A session -> Must succeed
    console.log('\nTest 6: User A retrieves own session...');
    const userARreadRes = await fetch(`${BASE_URL}/api/sessions/${sessionUserAId}`, {
      headers: { 'Authorization': `Bearer ${tokenUserA}` }
    });
    assert.strictEqual(userARreadRes.status, 200);
    const userAData = await userARreadRes.json();
    assert.strictEqual(userAData.session.title, 'User A Secret Strategy Journal');
    console.log('  PASSED: User A successfully accessed own session data.');

    console.log(`\n=================================================`);
    console.log(`  ALL CROSS-USER SECURITY TESTS PASSED PERFECTLY!`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error('\nSECURITY TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runSecurityTests();
