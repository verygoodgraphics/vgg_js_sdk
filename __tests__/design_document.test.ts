import { describe, expect, jest, test } from '@jest/globals';

import * as DesignDocument from '../src/design_document'
import * as VggSdk from '../src/basic_sdk'

describe('smoke', () => {
  test('call getDesignDocument', async () => {
    // Setup
    const mockFn = jest.spyOn(VggSdk, 'getVggSdk');
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

    // Given
    const sut = DesignDocument;

    // When
    const doc = sut.getDesignDocument();

    // Then
    expect(doc).toBeInstanceOf(Object);

    // Teardown
    mockFn.mockRestore();
  })
});