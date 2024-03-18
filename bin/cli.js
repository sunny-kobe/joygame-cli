#! /usr/bin/env node

// const { Command } = require('commander');
// const program = new Command();
const { program } = require('commander');
const inquirer = require('inquirer');
const package = require('../package.json');

const path = require("path")
const downloadGitRepo = require('download-git-repo')

const templates = require('./templates.js')

program.version(`v${package.version}`)

program.command('create').description('创建模板').action(async () => {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: '请输入项目名称：'
    })

    // 新增选择模版代码
    const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模版：',
        choices: templates // 模版列表
    })
    console.log('模版：', template)

    // 获取目标文件夹
    const dest = path.join(process.cwd(), name)
    downloadGitRepo(template, dest, (err) => {
        if (err) {
            console.log('创建模版失败', err)
        } else {
            console.log('创建模版成功')
        }
    })
})

program.parse(process.argv);

