import { getVggSdk } from './basic_sdk';

const _isProxyKey = Symbol();
const _proxyKey = Symbol();
const _parentKey = Symbol();

interface VggDesignDocumentType {
  // https://github.com/Microsoft/TypeScript/issues/24587
  [index: string]: any;
  [index: symbol]: any;
}

async function getDesignDocument(): Promise<VggDesignDocumentType | undefined> {
  const sdk = await getVggSdk();
  if (!sdk) {
    return undefined;
  }
  const docString = sdk.getDesignDocument();
  const jsonDoc = JSON.parse(docString);

  const designDoc = makeDeepProxy(jsonDoc, undefined);
  designDoc.sdk = sdk;
  return designDoc;
}

function isProxy(doc: VggDesignDocumentType): boolean {
  return doc[_isProxyKey] ?? false;
}

// internal
class VggProxyHandler {
  rootDesignDocProxy: VggDesignDocumentType | undefined;

  #processAddOrUpdateProperty(
    target: VggDesignDocumentType,
    prop: string,
    value: any
  ): any {
    const path = getPathToNode(target[_proxyKey]);
    let copiedValue = value;
    const isSdk = path === '/' && prop === 'sdk';
    if (!isSdk) {
      copiedValue = JSON.parse(JSON.stringify(value));
    }

    if (target[prop]) {
      // skip, array.length
      if (!Array.isArray(target) || prop !== 'length') {
        this.rootDesignDocProxy?.sdk?.updateAt(
          `${path}${prop}`,
          JSON.stringify(copiedValue)
        );
      }
    } else {
      this.rootDesignDocProxy?.sdk?.addAt(
        `${path}${prop}`,
        JSON.stringify(copiedValue)
      );
    }

    if (typeof copiedValue == 'object' && !isSdk) {
      const childProxy = makeDeepProxy(copiedValue, this.rootDesignDocProxy);
      defineParent(childProxy, target[_proxyKey]);
      return childProxy;
    } else {
      return copiedValue;
    }
  }

  set(target: VggDesignDocumentType, prop: string, value: any) {
    const v = this.#processAddOrUpdateProperty(target, prop, value);
    target[prop] = v;
    return true;
  }

  deleteProperty(target: VggDesignDocumentType, prop: string) {
    if (prop in target) {
      const path = getPathToNode(target[_proxyKey]);
      this.rootDesignDocProxy?.sdk?.deleteAt(`${path}${prop}`);

      return delete target[prop];
    }
    return false;
  }

  defineProperty(
    target: VggDesignDocumentType,
    prop: PropertyKey,
    descriptor: PropertyDescriptor
  ) {
    if (typeof prop == 'string') {
      const v = this.#processAddOrUpdateProperty(
        target,
        prop,
        descriptor.value
      );
      descriptor.value = v;
    }
    return Reflect.defineProperty(target, prop, descriptor);
  }
}

/*
parent.childName = child
parent.children[0] = child
*/
function getPathToNode(nodeProxy: VggDesignDocumentType) {
  let path = '';

  if (!nodeProxy) {
    return path;
  }

  let childProxy = nodeProxy;
  while (childProxy[_parentKey]) {
    const parentProxy = childProxy[_parentKey];

    for (const [childName, childEntry] of Object.entries(parentProxy)) {
      if (childEntry === childProxy) {
        path = `${childName}/${path}`;
        break;
      }
    }

    childProxy = parentProxy;
  }

  path = `/${path}`;

  return path;
}

function makeDeepProxy(
  object: VggDesignDocumentType,
  rootObject: VggDesignDocumentType | undefined
) {
  if (!object || typeof object != 'object') {
    return object;
  }

  if (isProxy(object)) {
    return object;
  }

  const handler = new VggProxyHandler();
  const selfProxy = new Proxy(object, handler);
  handler.rootDesignDocProxy = rootObject || selfProxy;
  Object.defineProperty(selfProxy, _isProxyKey, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  const propNames = Reflect.ownKeys(object);
  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === 'object') {
      const childProxy = makeDeepProxy(value, handler.rootDesignDocProxy);
      defineParent(childProxy, selfProxy);
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

function defineParent(
  childProxy: VggDesignDocumentType,
  parentProxy: VggDesignDocumentType
) {
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
