const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./src/app');
const http = require('http');

let mongoServer;
let server;
let baseUrl;

// Helper function for HTTP requests using native fetch
const request = async (endpoint, options = {}) => {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  return {
    status: response.status,
    ok: response.ok,
    data,
  };
};

const runTests = async () => {
  console.log('🚀 Starting DevTrack Comprehensive End-to-End Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Setup in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('📦 Connected to in-memory MongoDB instance');

    // 2. Start HTTP Server on dynamic port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`🌐 Test server listening on ${baseUrl}\n`);

    // ==========================================
    // SECTION 1: Health & API Discovery
    // ==========================================
    console.log('--- 1. Health & Server Info ---');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200 && healthRes.data?.status === 'success', 'Health Check Endpoint (/api/health)');

    // ==========================================
    // SECTION 2: Authentication & Validation
    // ==========================================
    console.log('\n--- 2. Authentication & Authorization ---');
    
    // Register Admin
    const adminReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Sarah Connor',
        email: 'admin@devtrack.io',
        password: 'Password123!',
        role: 'Admin',
      },
    });
    assert(adminReg.status === 201 && adminReg.data?.token && adminReg.data?.user?.role === 'Admin', 'Admin Registration & JWT generation');
    assert(!adminReg.data?.user?.password, 'Password hash excluded from user response');
    const adminToken = adminReg.data?.token;
    const adminUser = adminReg.data?.user;

    // Register Developer 1 (Alex)
    const dev1Reg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Alex Rivera',
        email: 'alex@devtrack.io',
        password: 'Password123!',
        role: 'Developer',
      },
    });
    assert(dev1Reg.status === 201 && dev1Reg.data?.user?.role === 'Developer', 'Developer 1 Registration');
    const dev1Token = dev1Reg.data?.token;
    const dev1User = dev1Reg.data?.user;

    // Register Developer 2 (Elena)
    const dev2Reg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Elena Rostova',
        email: 'elena@devtrack.io',
        password: 'Password123!',
        role: 'Developer',
      },
    });
    assert(dev2Reg.status === 201, 'Developer 2 Registration');
    const dev2Token = dev2Reg.data?.token;
    const dev2User = dev2Reg.data?.user;

    // Validation: Duplicate Email Rejection
    const dupReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate',
        email: 'admin@devtrack.io',
        password: 'Password123!',
      },
    });
    assert(dupReg.status === 400, 'Duplicate email registration rejected');

    // Validation: Weak Password Rejection
    const weakPassReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Short Pass',
        email: 'short@devtrack.io',
        password: '123',
      },
    });
    assert(weakPassReg.status === 400, 'Short password (<6 chars) rejected');

    // Login: Valid credentials
    const loginSuccess = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alex@devtrack.io',
        password: 'Password123!',
      },
    });
    assert(loginSuccess.status === 200 && loginSuccess.data?.token, 'Valid login returns JWT and user payload');

    // Login: Invalid password
    const loginFail = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alex@devtrack.io',
        password: 'WrongPassword!',
      },
    });
    assert(loginFail.status === 401, 'Invalid password correctly rejected with 401');

    // Get Me (/api/auth/me) with token
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(meRes.status === 200 && meRes.data?.user?.email === 'alex@devtrack.io', 'GET /api/auth/me with valid Bearer token');

    // Get Me without token
    const meNoToken = await request('/api/auth/me');
    assert(meNoToken.status === 401, 'GET /api/auth/me without token rejected with 401');

    // ==========================================
    // SECTION 3: Issue Management CRUD
    // ==========================================
    console.log('\n--- 3. Issue Management (CRUD) ---');

    // Create Issue 1 (High Priority, assigned to Alex)
    const issue1Res = await request('/api/issues', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Safari iOS WebKit Authorization Header Drop',
        description: 'Safari drops Bearer tokens on 302 redirects. Need custom cookie fallback.',
        priority: 'High',
        status: 'Open',
        assignedTo: dev1User._id,
      },
    });
    assert(issue1Res.status === 201 && issue1Res.data?.data?.title.includes('Safari'), 'Admin creates High-Priority Issue');
    const issue1 = issue1Res.data?.data;

    // Create Issue 2 (Medium Priority, assigned to Elena)
    const issue2Res = await request('/api/issues', {
      method: 'POST',
      headers: { Authorization: `Bearer ${dev1Token}` },
      body: {
        title: 'Search input debouncing optimization',
        description: 'Add 300ms debounce to prevent request spam on every keystroke.',
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: dev2User._id,
      },
    });
    assert(issue2Res.status === 201, 'Developer creates In-Progress Issue');
    const issue2 = issue2Res.data?.data;

    // Create Issue 3 (Low Priority, Unassigned, Resolved)
    const issue3Res = await request('/api/issues', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Update copyright footer year to 2026',
        description: 'Static text update in App footer.',
        priority: 'Low',
        status: 'Resolved',
      },
    });
    assert(issue3Res.status === 201, 'Create Low-Priority Resolved Issue');
    const issue3 = issue3Res.data?.data;

    // Get All Issues
    const allIssuesRes = await request('/api/issues', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(allIssuesRes.status === 200 && allIssuesRes.data?.count === 3, 'GET /api/issues returns all 3 issues');

    // Get Single Issue by ID
    const singleIssueRes = await request(`/api/issues/${issue1._id}`, {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(singleIssueRes.status === 200 && singleIssueRes.data?.data?._id === issue1._id, 'GET /api/issues/:id returns full issue details');

    // Update Issue (Status & Priority)
    const updateRes = await request(`/api/issues/${issue1._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${dev1Token}` },
      body: {
        status: 'In Progress',
        priority: 'High',
      },
    });
    assert(updateRes.status === 200 && updateRes.data?.data?.status === 'In Progress', 'Assigned developer updates issue status to In Progress');

    // ==========================================
    // SECTION 4: Search and Filtering
    // ==========================================
    console.log('\n--- 4. Search and Filters ---');

    // Search by title keyword 'Safari'
    const searchRes = await request('/api/issues?search=Safari', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(searchRes.status === 200 && searchRes.data?.count === 1 && searchRes.data?.data[0]?._id === issue1._id, 'Search filter matches title keyword');

    // Filter by status 'Resolved'
    const statusFilterRes = await request('/api/issues?status=Resolved', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(statusFilterRes.status === 200 && statusFilterRes.data?.count === 1 && statusFilterRes.data?.data[0]?.status === 'Resolved', 'Status filter matches Resolved status');

    // Filter by priority 'High'
    const priorityFilterRes = await request('/api/issues?priority=High', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(priorityFilterRes.status === 200 && priorityFilterRes.data?.count === 1 && priorityFilterRes.data?.data[0]?.priority === 'High', 'Priority filter matches High priority');

    // Filter by assignedTo Developer ID
    const assignedFilterRes = await request(`/api/issues?assignedTo=${dev1User._id}`, {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(assignedFilterRes.status === 200 && assignedFilterRes.data?.count === 1, 'Filter by assigned developer ID');

    // ==========================================
    // SECTION 5: Comments Workflow & Permissions
    // ==========================================
    console.log('\n--- 5. Comments & Thread Permissions ---');

    // Add Comment 1 by Alex
    const comment1Res = await request(`/api/issues/${issue1._id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${dev1Token}` },
      body: { content: 'Investigating WebKit fetch credentials.' },
    });
    assert(comment1Res.status === 201 && comment1Res.data?.data?.content.includes('WebKit'), 'Developer adds comment to issue');
    const comment1 = comment1Res.data?.data;

    // Add Comment 2 by Admin
    const comment2Res = await request(`/api/issues/${issue1._id}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { content: 'Keep me updated on staging results.' },
    });
    assert(comment2Res.status === 201, 'Admin adds comment to issue');

    // Get Comments for Issue
    const commentsListRes = await request(`/api/issues/${issue1._id}/comments`, {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(commentsListRes.status === 200 && commentsListRes.data?.count === 2, 'GET /api/issues/:id/comments lists all comments with populated authors');

    // Elena tries to delete Alex's comment -> Should be Forbidden (403)
    const unauthorizedDelComment = await request(`/api/comments/${comment1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${dev2Token}` },
    });
    assert(unauthorizedDelComment.status === 403, 'Unauthorized comment deletion rejected with 403 Forbidden');

    // Alex deletes own comment -> Should Succeed (200)
    const authorizedDelComment = await request(`/api/comments/${comment1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(authorizedDelComment.status === 200, 'Author deletes own comment successfully (200 OK)');

    // ==========================================
    // SECTION 6: Dashboard Dynamic MongoDB Analytics
    // ==========================================
    console.log('\n--- 6. Dashboard Statistics (MongoDB Dynamic Aggregation) ---');

    const statsRes = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${dev1Token}` },
    });
    assert(statsRes.status === 200 && statsRes.data?.data?.summary?.totalIssues === 3, 'Total issues count matches MongoDB count (3)');
    assert(statsRes.data?.data?.summary?.resolvedIssues === 1, 'Resolved issues count matches (1)');
    assert(statsRes.data?.data?.summary?.highPriorityIssues === 1, 'High priority count matches (1)');
    assert(statsRes.data?.data?.userStats?.myAssignedTotal === 1, 'Personal developer workload calculated dynamically');

    // ==========================================
    // SECTION 7: User Management & Admin Role Checks
    // ==========================================
    console.log('\n--- 7. User Management & Admin Role Guards ---');

    // GET /api/users
    const usersRes = await request('/api/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(usersRes.status === 200 && usersRes.data?.count === 3, 'GET /api/users returns team directory with workload counts');

    // Developer tries to modify user role -> Should be 403
    const devRoleChange = await request(`/api/users/${dev2User._id}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${dev1Token}` },
      body: { role: 'Admin' },
    });
    assert(devRoleChange.status === 403, 'Developer role update rejected with 403 Forbidden');

    // Admin updates user role -> Should be 200
    const adminRoleChange = await request(`/api/users/${dev2User._id}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: 'Admin' },
    });
    assert(adminRoleChange.status === 200 && adminRoleChange.data?.data?.role === 'Admin', 'Admin promotes user to Admin successfully');

    // ==========================================
    // SECTION 8: Delete Issue & Cascading Cleanup
    // ==========================================
    console.log('\n--- 8. Issue Deletion ---');

    const deleteRes = await request(`/api/issues/${issue3._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 200, 'Admin deletes issue successfully');

    // Verify issue count is now 2
    const verifyCountRes = await request('/api/issues', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(verifyCountRes.data?.count === 2, 'Issues count decremented after deletion');

    console.log('\n=============================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('=============================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test suite runner encountered unexpected error:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }
};

runTests();
