import 'reflect-metadata';

const INSPECTABLE_KEY = Symbol('inspectable');
const HIDE_KEY = Symbol('hideInInspector');
const SERIALIZE_KEY = Symbol('serializeField');

/**
 * Mark the field as serializable/visible in the inspector, even if it is private.
 */
export function SerializeField(target: any, propertyKey: string) {
  const existing: Set<string> = Reflect.getMetadata(SERIALIZE_KEY, target) || new Set();
  existing.add(propertyKey);
  Reflect.defineMetadata(SERIALIZE_KEY, existing, target);
}

/**
 * Hides the field in the inspector, even if it is public.
 */
export function HideInInspector(target: any, propertyKey: string) {
  const existing: Set<string> = Reflect.getMetadata(HIDE_KEY, target) || new Set();
  existing.add(propertyKey);
  Reflect.defineMetadata(HIDE_KEY, existing, target);
}

/**
 * Function that gets the "visible" fields based on visibility and decorators.
 */
export function getInspectableProperties(obj: any): string[] {
  const prototype = Object.getPrototypeOf(obj);
  const allKeys = Object.getOwnPropertyNames(obj);

  const hidden = Reflect.getMetadata(HIDE_KEY, prototype) || new Set<string>();
  const serialized = Reflect.getMetadata(SERIALIZE_KEY, prototype) || new Set<string>();

  const result: string[] = [];

  for (const key of allKeys) {
    const isHidden = hidden.has(key);
    const isSerialized = serialized.has(key);

    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const isFunction = typeof obj[key] === "function";
    if (isFunction) continue;

    const isPrivate = key.startsWith("_");

    if (isHidden) continue;
    if (!isPrivate) result.push(key);
    else if (isSerialized) result.push(key);
  }

  return result;
}
