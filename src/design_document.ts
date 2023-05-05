import { getVggSdk } from './basic_sdk';

const _isProxyKey = Symbol();
const _proxyKey = Symbol();
const _parentKey = Symbol();

interface VggDesignDocumentType {
  // https://github.com/Microsoft/TypeScript/issues/24587
  [index: string]: any,
  // @ts-ignore
  [index: symbol]: any,
}

async function getDesignDocument(): Promise<VggDesignDocumentType> {
  const sdk = await getVggSdk();
  const docString = sdk.getDesignDocument();
  const jsonDoc = JSON.parse(docString);

  const designDoc = makeDeepProxy(jsonDoc, undefined);
  designDoc.sdk = sdk;
  return designDoc;
}

function isProxy(doc: VggDesignDocumentType): boolean {
  // @ts-ignore
  return doc[_isProxyKey] ?? false;
}


// internal
class VggProxyHandler {
  rootDesignDocProxy: VggDesignDocumentType | undefined;

  constructor() {
  }

  set(target: VggDesignDocumentType, prop: string, value: any) {
    // @ts-ignore
    let path = getPathToNode(target[_proxyKey], this.rootDesignDocProxy!);
    let copiedValue = value;
    const isSdk = (path === '/' && prop === 'sdk');
    if (!isSdk) {
      copiedValue = JSON.parse(JSON.stringify(value));
    }

    try {
      if (target[prop]) {
        // skip, array.length
        if (!Array.isArray(target) || prop !== 'length') {
          this.rootDesignDocProxy?.sdk?.updateAt(`${path}${prop}`, JSON.stringify(copiedValue));
        }
      } else {
        this.rootDesignDocProxy?.sdk?.addAt(`${path}${prop}`, JSON.stringify(copiedValue));
      }
    } catch (error) {
      throw error;
    }

    if (typeof copiedValue == 'object' && !isSdk) {
      let childProxy = makeDeepProxy(copiedValue, this.rootDesignDocProxy!);
      // @ts-ignore
      defineParent(childProxy, target[_proxyKey]);
      target[prop] = childProxy;
    } else {
      target[prop] = copiedValue;
    }
    return true;
  }

  deleteProperty(target: VggDesignDocumentType, prop: string) {
    if (prop in target) {
      // @ts-ignore
      let path = getPathToNode(target[_proxyKey], this.rootDesignDocProxy!);
      try {
        this.rootDesignDocProxy?.sdk?.deleteAt(`${path}${prop}`);
      } catch (error) {
        throw error;
      }

      return delete target[prop];
    }
    return false;
  }

  defineProperty(target: VggDesignDocumentType, prop: PropertyKey, descriptor: PropertyDescriptor) {
    if (typeof prop == 'string') {
      // @ts-ignore
      let path = getPathToNode(target[_proxyKey], this.rootDesignDocProxy!);
      try {
        if (descriptor.value) {
          let value = descriptor.value;
          if (typeof value == 'object') {
            let proxyObj = makeDeepProxy(value, this.rootDesignDocProxy!);
            descriptor.value = proxyObj;

            if (target[prop]) {
              this.rootDesignDocProxy?.sdk?.updateAt(`${path}${prop}`, value);
            } else {
              this.rootDesignDocProxy?.sdk?.addAt(`${path}${prop}`, value);
            }
          }

        }
      } catch (error) {
        throw error;
      }
    }
    return Reflect.defineProperty(target, prop, descriptor);
  }
}

function getPathToNode(childProxy: VggDesignDocumentType, _nodeProxy: VggDesignDocumentType): string | null {
  return calculatNodePath(childProxy);
}

/*
parent.childName = child
parent.children[0] = child
*/
function calculatNodePath(nodeProxy: VggDesignDocumentType) {
  let path = ""

  if (!nodeProxy) {
    return path
  }

  let childProxy = nodeProxy
  // @ts-ignore
  while (childProxy[_parentKey]) {
    // @ts-ignore
    let parentProxy = childProxy[_parentKey];

    for (const [childName, childEntry] of Object.entries(parentProxy)) {
      if (childEntry === childProxy) {
        path = `${childName}/${path}`;
        break;
      }
    }

    childProxy = parentProxy
  }

  path = `/${path}`;

  return path
}

function makeDeepProxy(object: VggDesignDocumentType, rootObject: VggDesignDocumentType | undefined) {
  if (!object || typeof object != "object") {
    return object;
  }

  // @ts-ignore
  if (object[_isProxyKey] == true) {
    return object;
  }

  let handler = new VggProxyHandler();
  let selfProxy = new Proxy(object, handler);
  handler.rootDesignDocProxy = rootObject || selfProxy;
  Object.defineProperty(selfProxy, _isProxyKey, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  const propNames = Reflect.ownKeys(object);
  for (const name of propNames) {
    // @ts-ignore
    const value = object[name];

    if (value && typeof value === "object") {
      let childProxy = makeDeepProxy(value, handler.rootDesignDocProxy);
      defineParent(childProxy, selfProxy);
      // @ts-ignore
      object[name] = childProxy;
    }
  }

  // must after Reflect.ownKeys
  Object.defineProperty(object, _proxyKey, {
    value: selfProxy,
    enumerable: false,
    configurable: false,
  });

  return selfProxy;
}

function defineParent(childProxy: VggDesignDocumentType, parentProxy: VggDesignDocumentType) {
  if (parentProxy) {
    Object.defineProperty(childProxy, _parentKey, {
      value: parentProxy,
      enumerable: false,
      configurable: false,
    });
  }
}

// todo, observe native update

export { getDesignDocument, isProxy };