type VggEnvType = string;
type VggKeyType = string;
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
  const value = vggGetEnvContainer().get(key);
  return value;
}

export { vggGetEnv, vggSetEnv, vggSetObject, vggGetObject };
