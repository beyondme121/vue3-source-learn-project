import { isArray, isIntegerKey } from './../../shared/src/index'
import { TriggerOrTypes } from './operators'
// 让effect变成响应式的
export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    // 默认情况下要执行一次effect, 可以知道effect是个函数, createReactiveEffect就是高阶函数
    effect()
  }
  return effect
}

let uid = 0
let activeEffect
let effectStack = [] // 栈的设计考虑到错乱写法的情况
function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    // 保证不要将重复的effect存入到栈中
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++
  effect._isEffect = true
  effect.raw = fn
  effect.options = options
  return effect
}

// 建立对象中的某个属性和effect的关系, 这样就是指明了对象为键, 值是键值, 应该是map, map中key是对象中的属性key，值是set集合
let targetMap = new WeakMap()

export function track(target, type, key) {
  // 希望在track函数中,将target,key与effect函数建立关联, 但是effect在createReactiveEffect函数中, 全局变量
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map())) // 设置weakMap, 同时初始化Map
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

// 找属性对应的effect 让这些effect执行
export function trigger(target, type, key?, newValue?, oldValue?) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  // 我要将所有的 要执行的effect 全部存到一个新的集合中，最终一起执行
  const effects = new Set()

  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => effects.add(effect))
    }
  }

  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key > newValue) {
        add(dep)
      }
    })
  } else {
    // 对象
    if (key !== undefined) {
      add(depsMap.get(key))
    }
    switch (type) {
      case TriggerOrTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }
  effects.forEach((effect: any) => effect())
}

//
