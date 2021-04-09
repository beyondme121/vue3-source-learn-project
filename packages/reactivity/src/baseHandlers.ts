import {
  hasChange,
  hasOwn,
  isArray,
  isIntegerKey,
} from './../../shared/src/index'
import { extend, isObject } from '@vue/shared/src'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOrTypes } from './operators'
import { reactive, readonly } from './reactive'
// 每个handlers都有get和set,但是我们不希望写重复的代码, 仿照reactive中的createReactiveObject的方式, 创建createGetter和createSet函数, 函数返回get,set函数
// 然后根据传入的不同的参数进行处理
const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
const set = createSetter()
const shallowSet = createSetter(true)

// 只读的,浅的  根据这个生成函数, 传入不同的参数, 生成不同的函数
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
      // 收集依赖, 对于某个对象target的某个属性key, 收集依赖的effect
      // 取值的时候进行依赖收集
      track(target, TrackOpTypes.GET, key)
    }
    if (shallow) {
      return res
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

// 拦截设置功能, 设置值时触发effect重新执行 trigger
function createSetter(shallow = true) {
  return function set(target, key, value, receiver) {
    // 1. 比较老值和新值是否一致
    const oldValue = target[key]
    // 2. 区分设置值是新增还是修改 (数组还是对象)
    // 判断是否有这个属性 (数组就是判断length是否小于设置的索引key)
    let hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)

    const result = Reflect.set(target, key, value, receiver)
    // trigger在effect中定义
    if (!hadKey) {
      // 新增(对响应式对象新增属性), 触发更新
      trigger(target, TriggerOrTypes.ADD, key, value)
    } else if (hasChange(oldValue, value)) {
      // 修改
      trigger(target, TriggerOrTypes.SET, key, value, oldValue) // 把老值也传递过去
    }

    return result
  }
}

export const mutableHandlers = {
  get,
  set,
}
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
}

let readonlyObj = {
  set: (target, key) => {
    console.warn(`set on key ${key} failed`)
  },
}
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  {
    set: (target, key) => {
      console.log(`set on key ${key} failed`)
    },
  }
)
export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet,
  },
  readonlyObj
)
