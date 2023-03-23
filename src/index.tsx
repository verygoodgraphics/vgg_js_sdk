type VggSdkType = Object;
type VggWasmInstanceType = any;

let vggSdk: VggSdkType | null;

const vggWasmKey = 'vggWasmKey';

async function getVggSdk(): Promise<VggSdkType> {
  if (!vggSdk) {
    const wasm = await getVgg();
    vggSdk = new wasm.VggSdk();
  }

  return vggSdk!;
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


async function getContainer(): Promise<any> {
  // @ts-ignore Import module from url
  return await import(/* webpackIgnore: true */ 'http://s3.vgg.cool/test/js/vgg-di-container.esm.js');
}


export { getVggSdk, setVgg, getVgg };