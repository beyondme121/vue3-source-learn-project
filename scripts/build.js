// 把package 目录下的所有包都进行打包

const fs = require('fs')
const execa = require('execa') // 开启子进程打包, 最终还是使用rollup打包

// 1. 获取所有需要打包的目录, 必须是package下的目录,如果是文件是不行的, 比如README.md等文件不参与rollup打包
const targets = fs.readdirSync('packages').filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }
  return true
})

// 2. 对所有需要打包的目录targets, 应用同一个打包函数buildFn
function runParallel(targets, buildFn) {
  const promiseRes = []
  for (const item of targets) {
    const p = buildFn(item)
    promiseRes.push(p)
  }
  return Promise.all(promiseRes)
}

// 3. 对每个文件进行打包(rollup打包, 过程是异步的rollup打包是异步的)
async function build(target) {
  return await execa('rollup', ['-c', '--environment', `TARGET:${target}`], {
    stdio: 'inherit',
  }) // 当子进程打包的信息共享给父进程
}

const res = runParallel(targets, build)
