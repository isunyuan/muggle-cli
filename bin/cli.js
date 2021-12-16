#! /usr/bin/env node

var program = require('commander')
var figlet = require('figlet');
var chalk = require('chalk');
const options = require('../config');

// 定义命令和参数
program
    .command('create <app-name>')
    .description('create a new project')
    .option('-f, --force', '如果目录存在，执行覆盖操作')
    .action((name, options) => {
        // 在 create.js 中执行创建任务
        require('../lib/create.js')(name, options)
    })

program
    // 配置版本号信息
    .version(`v${require('../package.json').version}`)
    .usage('<command> [option]')

program
    .on('--help', () => {
        console.log('\r\n' + figlet.textSync('muggle', options.figlet));
        // 新增说明信息
        console.log(`\r\nRun ${chalk.cyan(`muggle -h`)} or ${chalk.cyan(`muggle --help`)} show details\r\n`)
    })

// 解析用户执行命令传入参数
program.parse(process.argv);
