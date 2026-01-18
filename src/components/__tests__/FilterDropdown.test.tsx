import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from '../FilterDropdown';
import { ColumnType } from '../../types';

describe('FilterDropdown Component - Filtering Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render filter dropdown with current filter', () => {
    render(<FilterDropdown currentFilter="all" onFilterChange={() => {}} />);
    
    expect(screen.getByText('All Columns')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown currentFilter="all" onFilterChange={() => {}} />);

    const button = screen.getByTestId('filter-dropdown-button');
    await user.click(button);

    expect(screen.getByTestId('filter-option-all')).toBeInTheDocument();
    expect(screen.getByTestId(`filter-option-${ColumnType.TODO}`)).toBeInTheDocument();
    expect(screen.getByTestId(`filter-option-${ColumnType.IN_PROGRESS}`)).toBeInTheDocument();
    expect(screen.getByTestId(`filter-option-${ColumnType.DONE}`)).toBeInTheDocument();
  });

  it('should call onFilterChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleFilterChange = vi.fn();
    render(<FilterDropdown currentFilter="all" onFilterChange={handleFilterChange} />);

    const button = screen.getByTestId('filter-dropdown-button');
    await user.click(button);

    const todoOption = screen.getByTestId(`filter-option-${ColumnType.TODO}`);
    await user.click(todoOption);

    expect(handleFilterChange).toHaveBeenCalledWith(ColumnType.TODO);
  });

  it('should close dropdown after selection', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown currentFilter="all" onFilterChange={() => {}} />);

    const button = screen.getByTestId('filter-dropdown-button');
    await user.click(button);

    const todoOption = screen.getByTestId(`filter-option-${ColumnType.TODO}`);
    await user.click(todoOption);

    // Dropdown should be closed
    expect(screen.queryByTestId('filter-option-all')).not.toBeInTheDocument();
  });

  it('should highlight selected filter option', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown currentFilter={ColumnType.IN_PROGRESS} onFilterChange={() => {}} />);

    const button = screen.getByTestId('filter-dropdown-button');
    await user.click(button);

    const inProgressOption = screen.getByTestId(`filter-option-${ColumnType.IN_PROGRESS}`);
    expect(inProgressOption).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should close dropdown on Escape key', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown currentFilter="all" onFilterChange={() => {}} />);

    const button = screen.getByTestId('filter-dropdown-button');
    await user.click(button);

    expect(screen.getByTestId('filter-option-all')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('filter-option-all')).not.toBeInTheDocument();
  });
});
