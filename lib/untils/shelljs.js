// REF: https://mp.weixin.qq.com/s/ngEGLm8lFpQ4Bw3ZsPpFRw
// https://www.npmjs.com/package/shelljs
// const shell = require('shelljs');

 
// # 删除文件命令
// shell.rm('-rf', 'out/Release');
// 拷贝文件命令
// shell.cp('-R', 'stuff/', 'out/Release');
 
// # 切换到lib目录，并且列出目录下到.js结尾到文件，并替换文件内容（sed -i 是替换文字命令）
// shell.cd('lib');
// shell.ls('*.js').forEach(function (file) {
//   shell.sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
//   shell.sed('-i', /^.*REMOVE_THIS_LINE.*$/, '', file);
//   shell.sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, shell.cat('macro.js'), file);
// });
// shell.cd('..');
 
// # 除非另有说明，否则同步执行给定的命令。 在同步模式下，这将返回一个 ShellString
// #（与 ShellJS v0.6.x 兼容，它返回一个形式为 { code:..., stdout:..., stderr:... } 的对象）。
// # 否则，这将返回子进程对象，并且回调接收参数（代码、标准输出、标准错误）。
// if (shell.exec('git commit -am "Auto-commit"').code !== 0) {
//   shell.echo('Error: Git commit failed');
//   shell.exit(1);
// }



// const log = shell.exec("pwd").stdout;
// console.log(log);