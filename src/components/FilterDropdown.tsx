import React, { useState, useRef, useEffect } from 'react';
import { ColumnType } from '../types';
import { useBoardContext } from '../hooks/useBoardContext';
import { getColumnDisplayName } from '../utils/columnUtils';
import { COLUMN_TYPES } from '../types';

/**
 * FilterDropdown Props
 */
interface FilterDropdownProps {
  currentFilter: ColumnType | 'all';
  onFilterChange: (filter: ColumnType | 'all') => void;
}

/**
 * FilterDropdown Component
 * 
 * Custom dropdown for filtering tasks by column
 * Shows options: "All Columns", "To Do", "In Progress", "Done"
 * Positioned at board level (above columns)
 * 
 * @param currentFilter - Currently selected filter
 * @param onFilterChange - Callback when filter changes
 */
export function FilterDropdown({ currentFilter, onFilterChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (filter: ColumnType | 'all') => {
    onFilterChange(filter);
    setIsOpen(false);
  };

  const getFilterDisplayName = (filter: ColumnType | 'all'): string => {
    if (filter === 'all') {
      return 'All Columns';
    }
    return getColumnDisplayName(filter);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="btn btn-secondary flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
        aria-label="Filter tasks by column"
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="filter-dropdown-button"
      >
        <span>{getFilterDisplayName(currentFilter)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

          {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px] z-50"
          role="listbox"
          aria-label="Filter options"
        >
          <button
            type="button"
            onClick={() => handleSelect('all')}
            className={`menu-item w-full text-left px-4 py-2 text-sm transition-colors focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 ${
              currentFilter === 'all'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="option"
            aria-selected={currentFilter === 'all'}
            aria-label="Show all columns"
            data-testid="filter-option-all"
          >
            All Columns
          </button>

          {COLUMN_TYPES.map((columnType) => (
            <button
              key={columnType}
              type="button"
              onClick={() => handleSelect(columnType)}
              className={`menu-item w-full text-left px-4 py-2 text-sm transition-colors focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 ${
                currentFilter === columnType
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              role="option"
              aria-selected={currentFilter === columnType}
              aria-label={`Filter by ${getColumnDisplayName(columnType)} column`}
              data-testid={`filter-option-${columnType}`}
            >
              {getColumnDisplayName(columnType)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
