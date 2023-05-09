import * as localVggContainer from './vgg-di-container'

const dicUrl = 'https://s3.vgg.cool/test/js/vgg-di-container.esm.js'
// const dicUrl = 'https://s3.vgg.cool/test/js/debug/vgg-di-container.esm.js';

interface VggSdkType {
  // addObserver(observer: VggSdkObserver): void;

  getDesignDocument(): string;

  addAt(path: string, value: string): void;
  deleteAt(path: string): void;
  updateAt(path: string, value: string): void;
}
interface VggContrainerType {
  vggSetObject(key: string, value: any): void;
  vggGetObject(key: string): any;
}

type VggWasmInstanceType = any;

let vggSdk: VggSdkType | null;
let vggContainer: VggContrainerType | null;

const vggWasmKey = 'vggWasmKey';

async function getVggSdk(): Promise<VggSdkType> {
  if (!vggSdk) {
    const wasm = await getVgg();
    vggSdk = new wasm.VggSdk();
  }

  return vggSdk!;
}

async function mockVggSdk(sdk: VggSdkType) {
  vggSdk = sdk;
}

async function setVgg(value: VggWasmInstanceType) {
  let container = await getContainer();
  container.vggSetObject(vggWasmKey, value);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getVgg(): Promise<VggWasmInstanceType> {
  const container = await getContainer();

  let vgg: VggWasmInstanceType;
  for (let i = 0; i < 1000; i++) {  // retry; wait for setVgg
    vgg = container.vggGetObject(vggWasmKey);
    if (vgg) {
      break;
    }
    await sleep(1);
  }

  return vgg;
}


async function getContainer(): Promise<VggContrainerType> {
  if (!vggContainer) {
    vggContainer = await getRemoteContainer();
  }
  return Promise.resolve(vggContainer!);
}

async function getRemoteContainer(): Promise<VggContrainerType> {
  // @ts-ignore Import module from url
  return await import(/* webpackIgnore: true */dicUrl);
}

function mockVggContainer() {
  vggContainer = localVggContainer;
}


export { getVggSdk, setVgg, getVgg, VggSdkType, mockVggSdk, VggContrainerType, mockVggContainer };