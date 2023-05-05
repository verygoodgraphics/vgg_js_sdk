import * as localVggContainer from './vgg-di-container'

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

function setVgg(value: VggWasmInstanceType) {
  getContainer().then((container) => {
    container.vggSetObject(vggWasmKey, value);
  });
}

async function getVgg(): Promise<VggWasmInstanceType> {
  const container = await getContainer();
  return container.vggGetObject(vggWasmKey);
}


async function getContainer(): Promise<VggContrainerType> {
  if (!vggContainer) {
    vggContainer = await getRemoteContainer();
  }
  return Promise.resolve(vggContainer!);
}

async function getRemoteContainer(): Promise<VggContrainerType> {
  // @ts-ignore Import module from url
  return await import(/* webpackIgnore: true */ 'https://s3.vgg.cool/test/js/vgg-di-container.esm.js');
}

function mockVggContainer() {
  vggContainer = localVggContainer;
}


export { getVggSdk, setVgg, getVgg, VggSdkType, mockVggSdk, VggContrainerType, mockVggContainer };