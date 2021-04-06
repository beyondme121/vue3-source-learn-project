const fs = require('fs')

const execa = require('execa')
const { readBuilderProgram } = require('typescript')

const target = 'reactivity'

build(target)

async function build(target) {
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
    stdio: 'inherit', // 当子进程打包的信息共享给父进程
  })
}
