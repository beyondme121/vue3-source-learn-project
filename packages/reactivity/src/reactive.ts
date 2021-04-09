import { isObject } from '@vue/shared/src'
// get, set
import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}
export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}
export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
// 根据不同的handlers, 生成不能的proxy对象
export function createReactiveObject(target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    return target
  }
  // 如果对象已经被代理过了,就从缓存中取
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existProxy = proxyMap.get(target)
  // 如果已经被代理过了, 直接返回这个proxy代理
  if (existProxy) {
    return existProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}
