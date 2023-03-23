type VggEnvType = String;
type VggKeyType = String;
type VggValueType = any;

let vggEnv: VggEnvType = '__vggDefaultEnv';

const vggContainer = new Map();

function vggGetEnvContainer(): Map<VggKeyType, VggValueType> {
  if (!vggContainer.has(vggEnv)) {
    vggContainer.set(vggEnv, new Map());
  }
  return vggContainer.get(vggEnv);
}

function vggSetEnv(value: VggValueType) {
  vggEnv = value;
}

function vggGetEnv(): VggValueType {
  return vggEnv;
}

function vggSetObject(key: VggKeyType, value: VggValueType) {
  vggGetEnvContainer().set(key, value);
}

function vggGetObject(key: VggKeyType): VggValueType {
  return vggGetEnvContainer().get(key);
}

export { vggGetEnv, vggSetEnv, vggSetObject, vggGetObject };
