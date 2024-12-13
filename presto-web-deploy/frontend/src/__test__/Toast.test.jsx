import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toast } from '../components/Toast';

describe('Toast Component', () => {
  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    
    render(<Toast message="Test message" type="error" onClose={onClose} />);
    
    // Find and click close button
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    // Verify onClose was called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles empty message gracefully', () => {
    const onClose = vi.fn();
    
    render(<Toast message="" type="error" onClose={onClose} />);
    
    // Toast should still render with empty content
    const toastElement = screen.getByRole('button').closest('div');
    expect(toastElement).toBeInTheDocument();
  });
});