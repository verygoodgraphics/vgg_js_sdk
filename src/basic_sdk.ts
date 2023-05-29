const dicUrl = 'https://s3.vgg.cool/test/js/vgg-di-container.esm.js';
// const dicUrl = 'https://s3.vgg.cool/test/js/debug/vgg-di-container.esm.js';

type EventType =
  | 'keydown'
  | 'keyup'
  | 'auxclick'
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'touchcancel'
  | 'touchend'
  | 'touchmove'
  | 'touchstart';
type EventListenerItem = {
  type: EventType;
  listener: string;
};
interface EventListners {
  EventType?: Array<EventListenerItem>;
}

interface EventListenerNode {
  addEventListener(type: EventType, code: string): void;
  removeEventListener(type: EventType, code: string): void;
  getEventListeners(): EventListners;
}

interface VggSdkType {
  // addObserver(observer: VggSdkObserver): void;

  getDesignDocument(): string;

  addAt(path: string, value: string): void;
  deleteAt(path: string): void;
  updateAt(path: string, value: string): void;

  addEventListener(path: string, type: string, code: string): void;
  removeEventListener(path: string, type: string, code: string): void;
  getEventListeners(path: string): EventListners;
}

interface VggContrainerType {
  vggSetObject(key: string, value: object): void;
  vggGetObject(key: string): object | undefined;
}

declare class VggWasmInstanceType {
  VggSdk: {
    new (): VggSdkType;
  };
}

let vggSdk: VggSdkType | undefined;
let vggContainer: VggContrainerType | undefined;

const vggWasmKey = 'vggWasmKey';

async function getVggSdk(): Promise<VggSdkType | undefined> {
  if (!vggSdk) {
    const wasm = await getVgg();
    if (wasm) {
      vggSdk = new wasm.VggSdk();
    }
  }

  return vggSdk;
}

async function mockVggSdk(sdk: VggSdkType) {
  vggSdk = sdk;
}

async function setVgg(value: VggWasmInstanceType) {
  const container = await getContainer();
  if (container) {
    container.vggSetObject(vggWasmKey, value);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getVgg(): Promise<VggWasmInstanceType | undefined> {
  const container = await getContainer();
  if (!container) {
    return undefined;
  }

  let vgg: VggWasmInstanceType | undefined;
  for (let i = 0; i < 1000; i++) {
    // retry; wait for setVgg
    vgg = container.vggGetObject(vggWasmKey) as VggWasmInstanceType | undefined;
    if (vgg) {
      break;
    }
    await sleep(1);
  }

  return vgg;
}

async function getContainer(): Promise<VggContrainerType | undefined> {
  if (!vggContainer) {
    vggContainer = await getRemoteContainer();
  }
  return Promise.resolve(vggContainer);
}

async function getRemoteContainer(): Promise<VggContrainerType> {
  return await import(/* webpackIgnore: true */ dicUrl);
}

export {
  getVggSdk,
  setVgg,
  getVgg,
  EventType,
  EventListners,
  EventListenerNode,
  VggSdkType,
  mockVggSdk,
  VggContrainerType,
};
