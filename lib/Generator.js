// lib/Generator.js
const path = require('path');
const { getRepoList, getTagList } = require('./http');
const ora = require('ora');
const inquirer = require('inquirer');
const util = require('util');
const downloadGitRepo = require('download-git-repo'); // 不支持 Promise
const chalk = require('chalk');
const figlet = require('figlet');
const options = require('../config');

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora(message);
    spinner.prefixText = '🚀';
    spinner.color = 'red';
    spinner.spinner = 'aesthetic';

    // 开始加载动画
    spinner.start();

    try {
        // 执行传入方法 fn
        const result = await fn(...args);
        // 状态为修改为成功
        spinner.succeed();
        return result;
    } catch (error) {
        // 状态为修改为失败
        spinner.fail(`🧯 也许你会先自行排查下错误原因`)
        console.log(`\r\n  当然，也可以直接联系我 👇`)
        console.log(`\r\n  前往 ${chalk.red(`https://github.com/${options.username}/muggle-cli/issues`)} 提问`)
    }
}

class Generator {
    constructor(name, targetDir) {
        this.name = name; // 目录名称
        this.targetDir = targetDir; // 创建位置
        this.downloadGitRepo = util.promisify(downloadGitRepo); // 优化，可支持promise
    }

    /**
     * 获取指定模板仓库并给予用户选择
     * @returns repoName:string
     */
    async getRepo() {
        const repoList = await wrapLoading(getRepoList, '拉取模板中…');
        if (!repoList) return;

        // 仓库有点多，约定只吐出包含 template 的项目
        const repos = repoList.filter(({ name }) => name.indexOf('template') > -1).map(el => el.name);

        const { repo } = await inquirer.prompt({
            name: 'repo',
            type: 'list',
            choices: repos,
            message: '请选择项目模版！'
        })

        return repo;
    }

    /**
     * 根据用户所选模板，获取全量tag提供给用户选择，并抛出最终选择结果
     * @param {string} repo 仓库名
     * @returns tagName: string
     */
    async getTag(repo) {
        const tags = await wrapLoading(getTagList, '获取版本中…', repo);
        if (!tags) return;

        const tagsList = tags.map(item => item.name);

        if (tagsList && tagsList.length > 0) {
            const { tag } = await inquirer.prompt({
                name: 'tag',
                type: 'list',
                choices: tagsList,
                message: '请选择版本'
            })
            return tag
        }

        return null;
    }

    /**
     * 下载模板
     */
    async download(repo, tag) {
        const requestUrl = `${options.username}/${repo}${tag ? '#' + tag : ''}`;

        // 2）调用下载方法
        await wrapLoading(
            this.downloadGitRepo, // 远程下载方法
            '下载模板中…', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
    }

    /**
     * 根据用户选择的模板名称，下载到模版目录
     */
    async create() {
        // 1. 选择模板
        const repo = await this.getRepo();
        // 2. 选择版本
        const tag = await this.getTag(repo);
        // 3. 下载模板
        await this.download(repo, tag);
        // 4. Success
        console.log(`\r\n 🎉🎉 ${chalk.cyan(this.name)} 🎉🎉 创建成功！`)
        console.log(`\r\n cd ${chalk.cyan(this.name)}`)

        console.log(`\r\n  ${figlet.textSync('coding', options.figlet)}  \r\n\r\n`);
    }
}

module.exports = Generator;
