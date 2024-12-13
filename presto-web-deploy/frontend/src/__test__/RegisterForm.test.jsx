import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from '../features/auth/RegisterForm';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = vi.fn();

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <RegisterForm />
    </BrowserRouter>
  );
};

describe('RegisterForm Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('renders registration form with all required fields', () => {
    renderRegisterForm();
    
    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('handles registration error', async () => {
    const errorMessage = 'Email already registered';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    renderRegisterForm();
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('validates required fields before submission', async () => {
    renderRegisterForm();
    
    // Try to submit empty form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check for required field validation
    expect(screen.getByLabelText(/name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/^password$/i)).toBeRequired();
    expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
  });
});