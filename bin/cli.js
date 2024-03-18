#! /usr/bin/env node

// const { Command } = require('commander');
// const program = new Command();
const { program } = require('commander');
const inquirer = require('inquirer');
const package = require('../package.json');
const path = require("path")
const downloadGitRepo = require('download-git-repo')
const templates = require('./templates.js')
const ora = require('ora') // 引入ora
const fs = require('fs-extra') // 引入fs-extra

// 定义当前版本
program.version(`v${package.version}`)
program.on('--help', () => { }) // 添加--help

program
  .command('create  [projectName]')
  .description('创建模板')
  .option('-t, --template <template>', '模版名称')
  .action(async (projectName, options) => {

    // 1. 从模版列表中找到对应的模版
    let project = templates.find(template => template.name === options.template)
    // 2. 如果匹配到模版就赋值，没有匹配到就是undefined
    let projectTemplate = project ? project.value : undefined
    console.log('命令行参数：', projectName, projectTemplate)

    if (!projectName) {
      const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: '请输入项目名称：'
      })
      projectName = name // 赋值输入的项目名称
    }
    console.log("项目名称：", projectName)

    // 获取目标文件夹
    const dest = path.join(process.cwd(), projectName)
    // 判断文件夹是否存在
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '目录已存在，是否覆盖？',
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1)
    }

    if (!projectTemplate) {
      // 新增选择模版代码
      const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模版：',
        choices: templates // 模版列表
      })
      projectTemplate = template // 赋值选择的项目名称
    }

    console.log('模版：', projectTemplate)

    // 定义loading
    const loading = ora('正在下载模版...')
    // 开始loading
    loading.start()
    downloadGitRepo(projectTemplate, dest, (err) => {
      if (err) {
        loading.fail('创建模版失败：' + err.message) // 失败loading
      } else {
        loading.succeed('创建模版成功!') // 成功loading
      }
    })
  })

program.parse(process.argv);

