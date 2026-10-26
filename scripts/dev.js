const { spawn } = require('child_process');
const path = require('path');

console.log('Starting MicroPay AI Full-Stack Environment (Backend + Frontend)...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Start backend
const backend = spawn(npmCmd, ['run', 'start'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nShutting down MicroPay AI processes...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
