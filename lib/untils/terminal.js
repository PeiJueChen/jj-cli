/**
 * 执行终端命令相关的代码
 */
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

module.exports = {
  commandSpawn,
  commandExec
}
