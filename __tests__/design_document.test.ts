import { beforeEach, afterAll, describe, expect, jest, test } from '@jest/globals';

import * as DesignDocument from '../src/design_document'
import * as VggSdk from '../src/basic_sdk'

describe('basic', () => {
  const mockFn = jest.spyOn(VggSdk, 'getVggSdk');
  const mockAddAtFn = jest.fn((_path: string, _value: string) => { });
  const mockDeleteAtFn = jest.fn((_path: string) => { });
  const mockUpdateAtFn = jest.fn((_path: string, _value: string) => { });
  // Setup
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
  // Teardown
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

  test('design document: add field', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = {}

    // When
    sut.a.b.c.d.k1 = obj1;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k1', obj1);

    // When
    sut.a.b.c.d.k1.k2 = obj1;
    // Then
    expect(mockAddAtFn).toHaveBeenCalledWith('/a/b/c/d/k1/k2', obj1);
  })

  test('design document: delete field', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();

    // When
    delete sut.a.b.c.d;

    // Then
    expect(mockDeleteAtFn).toHaveBeenCalledWith('/a/b/c/d');
  })

  test('design document: update field', async () => {
    // Given
    const sut = await DesignDocument.getDesignDocument();
    const obj1 = {};

    // When
    sut.a.b.c.d = obj1;

    // Then
    expect(mockUpdateAtFn).toHaveBeenCalledWith('/a/b/c/d', obj1);
  })
});