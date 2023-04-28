import { describe, expect, test } from '@jest/globals';


import * as VggSdk from '../src/index'


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