import * as VggSdk from '../src/index'

import { describe, expect, test } from '@jest/globals';


describe('smoke', () => {
  test('check getVggSdk function', async () => {
    // Given
    const sut = VggSdk;

    // When
    const fn = sut.getVggSdk;

    // Then
    expect(fn).toBeInstanceOf(Function)
  })

});