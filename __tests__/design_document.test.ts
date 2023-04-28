import { beforeEach, afterAll, describe, expect, jest, test } from '@jest/globals';

import * as DesignDocument from '../src/design_document'
import * as VggSdk from '../src/basic_sdk'

describe('basic', () => {
  const mockFn = jest.spyOn(VggSdk, 'getVggSdk');
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
        getDesignDocument: () => { return mockDocumentString; }
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
});