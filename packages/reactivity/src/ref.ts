import { isArray } from './../../shared/src/index'
import { hasChange, isObject } from '@vue/shared/src'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOrTypes } from './operators'
import { reactive } from './reactive'

export function ref(value) {
  return createRef(value)
}

export function shallowRef(value) {
  return createRef(value, true)
}

function createRef(rawValue, shallow = false) {
  // 函数返回的是一个类
  return new RefImpl(rawValue, shallow)
}
const convert = (val) => (isObject(val) ? reactive(val) : val)

class RefImpl {
  private _value
  public __v_isRef = true
  constructor(public rawValue, public shallow) {
    this._value = shallow ? rawValue : convert(rawValue)
  }
  // 类的属性访问器转换成ES5就是Object.defineProperty, 即ref是这个方法实现响应式的,
  // 对ref包裹的值转换成对象(即new一个类,把值放在这个实例对象的value上, 使用了属性访问器)
  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  set value(newValue) {
    // 如果重新设置的值与原始值不一样了
    if (hasChange(this.rawValue, newValue)) {
      console.log('this.rawValue, newValue', this.rawValue, newValue)
      // 保存为下一次的上一次的原始值
      this.rawValue = newValue
      this._value = this.shallow ? newValue : convert(newValue)
      trigger(this, TriggerOrTypes.SET, 'value', newValue)
    }
  }
}
class ObjectRefImpl {
  public __v_isRef = true
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key]
  }
  set value(newValue) {
    this.target[this.key] = newValue
  }
}

export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {}
  for (let key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}
