import { getVggSdk } from './basic_sdk';


async function getDesignDocument() {
  const sdk = await getVggSdk();
  const docString = sdk.getDesignDocument();
  const doc = JSON.parse(docString);

  console.log(doc);

  return doc;
}


export { getDesignDocument };