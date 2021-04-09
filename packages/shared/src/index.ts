export const isObject = (value) => typeof value === 'object' && value !== null
export const extend = Object.assign

export const isArray = Array.isArray
export const isFunction = (value) => typeof value === 'function'
export const isNumber = (value) => typeof value === 'number'
export const isString = (value) => typeof value === 'string'
export const isIntegerKey = (value) => parseInt(value) + '' === value

// 对象是否有某个属性
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export const hasChange = (oldValue, newValue) => oldValue !== newValue
