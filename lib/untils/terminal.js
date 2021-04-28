/**
 * 执行终端命令相关的代码
 */
const child_process_1 = require("child_process");
const { spawn } = require('child_process');
const exec = require('child_process').exec;
// npm install 
/*
use: 
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await commandSpawn(command, ['install'], { cwd: `./${project}` })
  cwd: 表示在哪個路徑執行
*/
const commandSpawn = (...args) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(...args);
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", () => {
      resolve();
    })
  })
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    child_process_1.exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      }
      else {
        resolve(stdout);
      }
    });
  });
}


// bash push.sh message master
const commandExec = (command) => {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command);
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", () => {
      resolve();
    })
  })
}


// cd .... && ...
function runPlatformHook(command) {
  return new Promise((resolve, reject) => {
    const cmd = child_process_1.spawn(command, {
      stdio: 'inherit',
      shell: true
    });
    cmd.on('close', (code) => {
      resolve('');
    });
    cmd.on('error', (err) => {
      reject(err);
    });
  });
}
module.exports = {
  commandSpawn,
  commandExec,
  runPlatformHook,
  runCommand
}
