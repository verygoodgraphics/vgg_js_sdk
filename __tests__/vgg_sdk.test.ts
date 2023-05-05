import { describe, expect, test } from '@jest/globals';


import * as VggSdk from '../src/index'
import * as localVggContainer from '../src/vgg-di-container'
import { mockContainer } from '../src/basic_sdk';


describe('smoke', () => {
  test('check getVggSdk function', async () => {
    // Given
    const sut = VggSdk;

    // When
    const fn = sut.getVggSdk;

    // Then
    expect(fn).toBeInstanceOf(Function)
  })

  test('getVggSdk', async () => {
    // Given
    const sut = VggSdk;
    mockContainer(localVggContainer);

    // When
    const vgg = await sut.getVgg();

    // Then
    expect(vgg).toBeUndefined();
  })
});