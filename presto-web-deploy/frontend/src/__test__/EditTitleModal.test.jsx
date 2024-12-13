import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditTitleModal } from '../features/presentations/EditTitleModal';

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

  it('should update input value when typing', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Title' } });
    expect(input).toHaveValue('New Title');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<EditTitleModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});