import { getVggSdk } from './basic_sdk';

const _isProxyKey = Symbol();
const _proxyKey = Symbol();

interface VggDesignDocumentType {
  // https://github.com/Microsoft/TypeScript/issues/24587
  [index: string]: any,
  // @ts-ignore
  [index: symbol]: any,
  _isProxyKey: boolean | null,
  _proxyKey: VggDesignDocumentType | null
}

async function getDesignDocument(): Promise<VggDesignDocumentType> {
  const sdk = await getVggSdk();
  const docString = sdk.getDesignDocument();
  const jsonDoc = JSON.parse(docString);

  const designDoc = makeDeepProxy(jsonDoc);
  return designDoc;
}

function isProxy(doc: VggDesignDocumentType): boolean {
  return doc[_isProxyKey] ?? false;
}


// internal
class ProxyHandler {
  designDoc: VggDesignDocumentType;

  constructor(designDoc: VggDesignDocumentType) {
    this.designDoc = designDoc;
  }

  set(obj: VggDesignDocumentType, prop: string, value: any) {
    let path = getPathToNode(obj[_proxyKey], this.designDoc);
    console.log(`proxy setter called: obj = ${obj}, prop = ${prop}, value = ${value}, path = ${path}`);

    let proxyObj = makeDeepProxy(value);
    obj[prop] = proxyObj;
    return true;
  }
  deleteProperty(target: VggDesignDocumentType, prop: string) {
    if (prop in target) {
      let path = getPathToNode(target[_proxyKey], this.designDoc);
      console.log(`proxy delete called: prop = ${prop}, path = ${path + prop}`);

      delete target[prop]._parent;
      return delete target[prop];
    }
    return false;
  }
  defineProperty(target: VggDesignDocumentType, prop: string, descriptor: object) {
    let targetProxy = target[_proxyKey]
    if (targetProxy) {
      let path = getPathToNode(targetProxy, this.designDoc);
      console.log('#handler, defineProperty: ', path);
      console.log(`define property called: target = ${target}, path = ${path + prop}`);
    }
    // todo? make the property deep proxy
    return Reflect.defineProperty(target, prop, descriptor);
  }
}

function getPathToNode(child: VggDesignDocumentType, node: VggDesignDocumentType): string | null {
  if (child === node) {
    return '/';
  } else {
    for (const [key, value] of Object.entries(node)) {
      if (child === node) {
        return `/${key}`;
      }
      const subPath = getPathToNode(child, value);
      if (subPath) {
        return `/${key}/${subPath}`;
      }
    }
  }

  return null;
}

function makeDeepProxy(object: VggDesignDocumentType) {
  if (!object || typeof object != "object") {
    return object;
  }

  if (object[_isProxyKey] == true) {
    return object;
  }

  let selfProxy = new Proxy(object, new ProxyHandler(object));
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
      let child = makeDeepProxy(value);
      // @ts-ignore
      object[name] = child;
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

// todo, observe native update

export { getDesignDocument, isProxy };