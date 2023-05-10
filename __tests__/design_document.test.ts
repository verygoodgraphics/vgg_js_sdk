import { beforeEach, afterAll, describe, expect, jest, test, afterEach } from '@jest/globals';

import * as DesignDocument from '../src/design_document';
import * as VggSdk from '../src/basic_sdk';
import { Color } from '../src/design_document_types';

describe('basic', () => {
  const mockFn = jest.spyOn(VggSdk, 'getVggSdk');
  const mockAddAtFn = jest.fn((_path: string, _value: string) => { console.log(`fakeSdk, addAt: ${_path}, ${_value}`); });
  const mockDeleteAtFn = jest.fn((_path: string) => { console.log(`fakeSdk, deleteAt: ${_path}`); });
  const mockUpdateAtFn = jest.fn((_path: string, _value: string) => { console.log(`fakeSdk, updateAt: ${_path}, ${_value}`); });

  beforeEach(() => {
    const mockDocument = {
      level: 0,
      a: {
        level: 1,
        b: {
          level: 2,
          c: {
            level: 3,
            d: {
              level: 4
            }
          }
        }
      },
      array1: [1, 2, 3],
    };
    const mockDocumentString = JSON.stringify(mockDocument);
    mockFn.mockImplementation(() => {
      let fakeSdk: VggSdk.VggSdkType = {
        getDesignDocument: () => { return mockDocumentString; },
        addAt: mockAddAtFn,
        deleteAt: mockDeleteAtFn,
        updateAt: mockUpdateAtFn,
      };
      return Promise.resolve(fakeSdk);
    });

  });

  afterEach(() => {
    mockAddAtFn.mockClear();
    mockDeleteAtFn.mockClear();
    mockUpdateAtFn.mockClear();
  });

  afterAll(() => {
    mockFn.mockRestore();
  });

  test('design document is object', async () => {
    // Given
    const sut = DesignDocument;

    // When
    const doc = sut.getDesignDocument();

    // Then
    expect(doc).toBeInstanceOf(Object);
  })

  test('design document is proxy object', async () => {
    // Given
    const sut = DesignDocument;

    // When
    const doc = await sut.getDesignDocument();

    // Then
    expect(sut.isProxy(doc)).toBeTruthy;
  })

  test('design document: add property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({});

    // When
    sut.a.b.c.d.k1 = obj1;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k1', JSON.stringify(obj1));

    // When
    sut.a.b.c.d.k1.k2 = obj1;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k1/k2', JSON.stringify(obj1));
  })

  test('design document: add color property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const aColor: Color = { class: 'color', alpha: 1.0, red: 0.9, blue: 1.0, green: 0 };

    // When
    sut.a.b.c.d.color = aColor;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/color', JSON.stringify(aColor));
  })

  test('design document: add item to array property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({});

    // When
    sut.array1.push(obj1);

    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/array1/3', JSON.stringify(obj1));
    expect(mockUpdateAtFn).toBeCalledTimes(0); // NOT toHaveBeenCalledWith('/array1/length', 4);
  })

  test('design document: add property using []', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({});

    // When
    sut.a.b.c.d['k2'] = obj1;

    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k2', JSON.stringify(obj1));
  })

  test('design document: add property using Object.assign', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({});
    const src1 = Object.freeze({ 'k3': obj1 });

    // When
    Object.assign(sut.a.b.c.d, src1);

    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k3', JSON.stringify(obj1));
  })

  test('design document: add property using Object.defineProperty', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({ 'k5': 'v1' });
    const descriptor1: PropertyDescriptor = {
      configurable: true, // must be true, or will throw error: ProxyDefinePropertyIncompatible
      enumerable: true,
      value: obj1,
    };

    // When
    try {
      Object.defineProperty(sut.a.b.c.d, 'k4', descriptor1);
    } catch (error) {
      console.log(error);
    }

    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k4', JSON.stringify(obj1));

    // When
    sut.a.b.c.d.k4.k6 = obj1;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k4/k6', JSON.stringify(obj1));
  })

  test('design document: delete property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();

    // When
    delete sut.a.b.c.d;

    // Then
    expect(mockDeleteAtFn).toHaveBeenCalledWith('/a/b/c/d');
  })

  test('design document: delete item in array property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();

    // When
    sut.array1.pop();

    // Then
    expect(mockDeleteAtFn).toHaveBeenCalledWith('/array1/2');
    expect(mockUpdateAtFn).toBeCalledTimes(0); // NOT toHaveBeenCalledWith('/array1/length', 2);
  })

  test('design document: update property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = Object.freeze({});

    // When
    sut.a.b.c.d = obj1;

    // Then
    expect(mockUpdateAtFn).toHaveBeenCalledWith('/a/b/c/d', JSON.stringify(obj1));
  })

  test('design document: update item in array property', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const value = 'item 0'

    // When
    sut.array1[0] = value;

    // Then
    expect(mockUpdateAtFn).toHaveBeenCalledWith('/array1/0', JSON.stringify(value));
  })
});