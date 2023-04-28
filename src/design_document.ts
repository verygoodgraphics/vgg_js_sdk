import { getVggSdk } from './basic_sdk';


async function getDesignDocument() {
  const sdk = await getVggSdk();
  console.log(sdk);

  return {}
}


export { getDesignDocument };