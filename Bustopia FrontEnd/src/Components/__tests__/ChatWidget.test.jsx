import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest';
import ChatWidget from '../ChatWidget/ChatWidget';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onmessage = null;
  }
  send() {}
  close() {}
}

global.WebSocket = MockWebSocket;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('ChatWidget Component', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ username: 'Test User' }));
  });

  test('renders chat widget button', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /chat/i });
    expect(button).toBeInTheDocument();
  });

  test('opens chat window on button click', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(button);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  test('allows message input', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /chat/i });
    fireEvent.click(button);
    
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input.value).toBe('Hello');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    expect(input.value).toBe('');
  });
}); 