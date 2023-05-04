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

  const designDoc = makeDeepProxy(jsonDoc, undefined);
  designDoc.sdk = sdk;
  return designDoc;
}

function isProxy(doc: VggDesignDocumentType): boolean {
  // @ts-ignore
  return doc[_isProxyKey] ?? false;
}


// internal
class ProxyHandler {
  rootDesignDocProxy: VggDesignDocumentType | undefined;

  constructor() {
  }

  set(obj: VggDesignDocumentType, prop: string, value: any) {
    // @ts-ignore
    let path = getPathToNode(obj[_proxyKey], this.rootDesignDocProxy!);

    try {
      this.rootDesignDocProxy?.sdk?.addAt(`${path}${prop}`, value);
    } catch (error) {
      throw error;
    }

    let proxyObj = makeDeepProxy(value, this.rootDesignDocProxy!);
    obj[prop] = proxyObj;
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

  defineProperty(target: VggDesignDocumentType, prop: string, descriptor: object) {
    // @ts-ignore
    let targetProxy = target[_proxyKey]
    if (targetProxy) {
      let path = getPathToNode(targetProxy, this.rootDesignDocProxy!);
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
        return `/${key}${subPath}`;
      }
    }
  }

  return null;
}

function makeDeepProxy(object: VggDesignDocumentType, rootObject: VggDesignDocumentType | undefined) {
  if (!object || typeof object != "object") {
    return object;
  }

  // @ts-ignore
  if (object[_isProxyKey] == true) {
    return object;
  }

  let handler = new ProxyHandler();
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
      let child = makeDeepProxy(value, handler.rootDesignDocProxy);
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