import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditTitleModal } from '../features/presentations/EditTitleModal';
import App from "../App";

describe('EditTitleModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentTitle: 'Current Title',
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditTitleModal
        {...defaultProps}
        isOpen={false}
      />
    );
    
    expect(screen.queryByText('Edit Presentation Title')).not.toBeInTheDocument();
  });

  it('should render with current title in input', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Current Title');
  });

  it('should update input value when typing', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Title' } });
    expect(input).toHaveValue('New Title');
  });

  it('should call onSubmit with new title when form is submitted', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Title' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Title');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should prevent empty title submission', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should update input when currentTitle prop changes', () => {
    const { rerender } = render(<EditTitleModal {...defaultProps} />);
    
    // Update props with new title
    rerender(<EditTitleModal {...defaultProps} currentTitle="Updated Title" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Updated Title');
  });
});