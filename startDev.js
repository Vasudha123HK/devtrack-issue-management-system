const { spawn } = require('child_process');
const path = require('path');

const nodeExec = process.execPath;
const npmExec = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🚀 Starting DevTrack MERN Stack (Backend + Frontend)...');

// 1. Start Express Backend
const serverProcess = spawn(nodeExec, ['server/src/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' },
});

// 2. Start Vite Frontend
const clientProcess = spawn(npmExec, ['--prefix', 'client', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env },
  shell: true,
});

process.on('SIGINT', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});
