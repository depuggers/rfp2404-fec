/* eslint-env jest */
import '@testing-library/jest-dom';
import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import axios from 'axios';

import App from '../components/App';
import StyleSelector from '../components/StyleSelector';

import AppContext from '../context/AppContext';

import OTestData from './OTestData';
import RPTestData from './RPTestData';
import RTestData from './RTestData';

beforeEach(() => {
  axios.get.mockReset();
  for (const response of OTestData) {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: response }));
  }
  for (const response of RPTestData) {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: response }));
  }
  for (const response of RTestData) {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: response }));
  }
});

jest.mock('axios');

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

Element.prototype.scrollTo = () => {};

describe('Overview', () => {
  test('Style selector should have one child per style', async () => {
    render(<App />);
    const styleSelector = await screen.findByTestId('style-selector');
    expect(styleSelector.children.length).toBe(6);
    fireEvent.click(styleSelector.children[0]);
  });

  test('Add to cart button should be disabled', async () => {
    render(<App />);
    expect(await screen.findByText(/cart/i)).toBeDisabled();
  });

  test('Clicking a style should update the selected style in state', async () => {
    const mockFn = jest.fn();
    const store = {
      selectedStyle: 0,
      styles: OTestData[1].results,
    };
    store.styles[0].photos[0].thumbnail_url = null;
    render(
      <AppContext.Provider value={{
        store,
        dispatch: mockFn,
      }}
      >
        <StyleSelector />
      </AppContext.Provider>,
    );
    const styleSelector = await screen.findByTestId('style-selector');
    const secondStyle = styleSelector.children[1];
    expect(secondStyle).toBeInTheDocument();
    fireEvent.click(secondStyle);
    expect(mockFn.mock.calls).toHaveLength(1);
  });

  test('Selecting a size should enable add to cart button and qty selector', async () => {
    render(<App />);
    await screen.findByText(/1905/i);
    const cartButton = await screen.findByText(/cart/i);
    expect(cartButton).toBeDisabled();
    const sizeSelect = await screen.findByTestId('size-selector');
    expect(sizeSelect).toBeInTheDocument();
    const qtySelect = await screen.findByTestId('qty-selector');
    expect(qtySelect).toBeDisabled();
    const options = await screen.findAllByTestId('size-option');
    fireEvent.change(sizeSelect, { target: { value: '1394771' } });
    expect(options[3].selected).toBeTruthy();
    expect(cartButton).not.toBeDisabled();
    expect(qtySelect).not.toBeDisabled();
    fireEvent.change(qtySelect, { target: { value: '1' } });
  });

  test('Pressing ADD TO CART after selecting a size should ADD TO CART', async () => {
    render(<App />);
    await screen.findByText(/1905/i);
    const cartButton = await screen.findByText(/cart/i);
    expect(cartButton).toBeDisabled();
    const sizeSelect = await screen.findByTestId('size-selector');
    expect(sizeSelect).toBeInTheDocument();
    const options = await screen.findAllByTestId('size-option');
    fireEvent.change(sizeSelect, { target: { value: '1394771' } });
    expect(options[3].selected).toBeTruthy();
    expect(cartButton).not.toBeDisabled();
    fireEvent.click(cartButton);
  });
});
