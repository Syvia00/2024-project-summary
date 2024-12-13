import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteConfirmModal } from '../features/presentations/DeleteConfirmModal';
import App from "../App";

describe('DeleteConfirmModal Component', () => {
  it('should not render when isOpen is false', () => {
    render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    
    // Modal should not be in the document
    expect(screen.queryByText('Delete Presentation')).not.toBeInTheDocument();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('should render correct content when open', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    
    // Check for modal content
    expect(screen.getByText('Delete Presentation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should call onClose when clicking No button', () => {
    const onClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
      />
    );
    
    fireEvent.click(screen.getByText('No'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm when clicking Yes button', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
      />
    );
    
    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling for buttons', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );
    
    const noButton = screen.getByText('No');
    const yesButton = screen.getByText('Yes');
    
    // Check button styling classes
    expect(noButton).toHaveClass('bg-gray-100');
    expect(yesButton).toHaveClass('bg-red-600');
  });
});