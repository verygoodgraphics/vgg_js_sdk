import { describe, expect, jest, test } from '@jest/globals';

import * as DesignDocument from '../src/design_document'
import * as VggSdk from '../src/basic_sdk'

describe('smoke', () => {
  test('call getDesignDocument', async () => {
    // Setup
    const mockFn = jest.spyOn(VggSdk, 'getVggSdk');
    mockFn.mockImplementation(() => { return Promise.resolve({}) });

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