import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NewPresentationModal } from '../features/presentations/NewPresentationModal';

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

  it('should call onClose when cancel button is clicked', () => {
    render(<NewPresentationModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});