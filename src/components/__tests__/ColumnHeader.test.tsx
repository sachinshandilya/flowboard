import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils/test-utils';
import { ColumnHeader } from '../ColumnHeader';
import { ColumnType } from '../../types';

describe('ColumnHeader Component', () => {
  it('should render "To Do" for TODO column', () => {
    render(<ColumnHeader columnType={ColumnType.TODO} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('should render "In Progress" for IN_PROGRESS column', () => {
    render(<ColumnHeader columnType={ColumnType.IN_PROGRESS} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render "Done" for DONE column', () => {
    render(<ColumnHeader columnType={ColumnType.DONE} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should have correct ID for ARIA reference', () => {
    render(<ColumnHeader columnType={ColumnType.TODO} />);
    const header = screen.getByText('To Do');
    expect(header).toHaveAttribute('id', 'column-header-todo');
  });
});
