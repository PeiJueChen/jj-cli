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
const commandSpawn = async (...args) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(...args);
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", () => {
      resolve();
    })
  })
}

// runCommand('git remote -v'),可以返回执行后的结果, 而不是打印
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
    var stdout_ = "";
    var error_;
    const childProcess = exec(command, (error, stdout, stderr) =>{
      stdout_ = stdout;
      error_ = error;
    });
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
    childProcess.on("close", () => {
      resolve(error_ || stdout_);
    })
    childProcess.on('error', e => {
      reject(e);
    })
  })
}


// https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback
// cd .... && ...
function runSpawnCommand(command) {
  return new Promise((resolve, reject) => {
    const cmd = child_process_1.spawn(command, {
      // as : cmd.stdout.pipe(process.stdout);/cmd.stderr.pipe(process.stderr);
      stdio: 'inherit',
      shell: true,
      windowsHide: true  // 隐藏通常在Windows系统上创建的子进程控制台窗口。默认值： false。
    });
    // cmd.stdout.pipe(process.stdout);
    // cmd.stderr.pipe(process.stderr);
    cmd.on('close', (code) => {
      resolve(cmd.stdout);
    });
    cmd.on('error', (err) => {
      reject(err);
    });
  });
}
module.exports = {
  commandSpawn,
  commandExec,
  runSpawnCommand,
  runCommand
}
