import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NewPresentationModal } from '../features/presentations/NewPresentationModal';
import App from "../App";

describe('NewPresentationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <NewPresentationModal
        {...defaultProps}
        isOpen={false}
      />
    );
    
    expect(screen.queryByText('Create New Presentation')).not.toBeInTheDocument();
  });

  it('should render create new presentation form', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    expect(screen.getByText('Create New Presentation')).toBeInTheDocument();
    expect(screen.getByLabelText('Presentation Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Presentation Name');
    fireEvent.change(input, { target: { value: 'My New Presentation' } });
    
    expect(input).toHaveValue('My New Presentation');
  });

  it('should call onSubmit with presentation name when form is submitted', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Presentation Name');
    fireEvent.change(input, { target: { value: 'My New Presentation' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('My New Presentation');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should clear input after successful submission', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Presentation Name');
    fireEvent.change(input, { target: { value: 'My New Presentation' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(input).toHaveValue('');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should prevent submission with empty name', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should focus input field when modal opens', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Presentation Name');
    expect(input).toHaveFocus();
  });

  it('should handle enter key press for submission', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Presentation Name');
    fireEvent.change(input, { target: { value: 'My New Presentation' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 13, charCode: 13 });
    
    expect(defaultProps.onSubmit).toHaveBeenCalledWith('My New Presentation');
  });
});