/**
 * 执行终端命令相关的代码
 */
const { spawn } = require('child_process');
const exec = require('child_process').exec;
// npm install 
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
// const execCommand = (command) => {
//   exec(command, (error, stdout, stderr) => {
//     if (error) { console.log(error) }
//     if (stdout) { console.log(stdout) }
//     if (stderr) { console.log(stderr) }
//   })
// }

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
