import { useEffect, useRef, useState } from 'react';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import './academia-data-table.css';

export function AcademiaStatusPill({ tone = 'gray', children }) {
  return (
    <span className={`adt-status-pill adt-pill-${tone}`}>
      <span className="adt-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function AcademiaTableEmptyRow({ colSpan, title = 'Nothing here yet', message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="adt-empty-cell">
        <div className="adt-empty-state">
          <h3>{title}</h3>
          {message ? <p>{message}</p> : null}
        </div>
      </td>
    </tr>
  );
}

/**
 * HOA Learners–style data table chrome.
 * Pass pageRows already sliced (from useClientTableState).
 */
export default function AcademiaDataTable({
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  searchQuery = '',
  onSearchChange,
  filters = [],
  activeFilter,
  onFilterChange,
  defaultFilterLabel = 'Filters',
  toolbarExtra = null,
  bulkBar = null,
  columns = [],
  rows = [],
  getRowKey = (row) => row?.id,
  sortConfig = { key: null, direction: 'asc' },
  onSort,
  selectable = false,
  selectedKeys = [],
  onToggleRow,
  onToggleAllVisible,
  loading = false,
  error = '',
  onRetry,
  emptyTitle = 'No results found',
  emptyMessage = 'Try adjusting your search or filters.',
  loadingMessage = 'Loading…',
  showPagination = true,
  pageSize,
  pageSizeOptions = ['5', '10', '25'],
  onPageSizeChange,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  rangeLabel = '0',
  onGoToPage,
  visiblePageNumbers = [],
  tableClassName = '',
  className = '',
}) {
  const filterRef = useRef(null);
  const pageSizeRef = useRef(null);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isPageSizeOpen, setPageSizeOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) {
        setPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const colSpan = columns.length + (selectable ? 1 : 0);
  const allVisibleSelected = selectable
    && rows.length > 0
    && rows.every((row) => selectedKeys.includes(String(getRowKey(row))));

  const activeFilterMeta = filters.find((item) => item.id === activeFilter);
  const filterButtonLabel = !activeFilter || activeFilter === filters[0]?.id
    ? defaultFilterLabel
    : (activeFilterMeta?.label || activeFilter);
  const filterIsActive = Boolean(activeFilter && filters[0] && activeFilter !== filters[0].id);

  return (
    <section className={`academia-data-table ${className}`.trim()}>
      {(title || subtitle || onSearchChange || filters.length > 0 || toolbarExtra) ? (
        <div className="adt-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="adt-actions">
            {onSearchChange ? (
              <div className="adt-search-box">
                <img src={hoasearch} alt="" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </div>
            ) : null}

            {filters.length > 0 && onFilterChange ? (
              <div className="adt-filter-dropdown-wrapper" ref={filterRef}>
                <button
                  type="button"
                  className={`adt-btn-light-purple adt-filter-trigger ${filterIsActive ? 'is-active' : ''}`}
                  onClick={() => setFilterOpen((open) => !open)}
                >
                  <img src={hoafilter} alt="" />
                  <span>{filterButtonLabel}</span>
                </button>
                {isFilterOpen ? (
                  <div className="adt-filter-dropdown">
                    {filters.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`adt-filter-option ${activeFilter === option.id ? 'active' : ''}`}
                        onClick={() => {
                          onFilterChange(option.id);
                          setFilterOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {toolbarExtra}
          </div>
        </div>
      ) : null}

      {bulkBar}

      {loading && rows.length === 0 ? (
        <div className="adt-state adt-state-loading" aria-live="polite" aria-busy="true">
          <div className="adt-state-card">
            <div className="adt-spinner" aria-hidden="true" />
            <p>{loadingMessage}</p>
          </div>
        </div>
      ) : error ? (
        <div className="adt-state adt-state-error">
          <div className="adt-state-card">
            <h3>Could not load data</h3>
            <p>{error}</p>
            {onRetry ? (
              <button type="button" className="adt-btn-primary" onClick={onRetry}>
                Try again
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="adt-list-container">
            <table className={`adt-list-table ${tableClassName}`.trim()}>
              <thead>
                <tr>
                  {selectable ? (
                    <th style={{ width: 50 }}>
                      <button
                        type="button"
                        className="adt-th-content adt-minus-select"
                        onClick={onToggleAllVisible}
                        aria-label={allVisibleSelected ? 'Clear page selection' : 'Select page'}
                      >
                        <span className="adt-minus-icon" aria-hidden="true">-</span>
                      </button>
                    </th>
                  ) : null}
                  {columns.map((column) => {
                    const alignClass = column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : '';
                    const sortable = Boolean(column.sortable && onSort && column.key);
                    const sortActive = sortConfig?.key === column.key;
                    return (
                      <th
                        key={column.key || column.label}
                        className={`${alignClass} ${column.headerClassName || ''}`.trim()}
                        style={column.headerStyle}
                      >
                        {column.renderHeader ? column.renderHeader({ sortConfig, onSort }) : (
                          <div
                            className={`adt-th-content ${column.align === 'center' ? 'justify-center' : ''} ${sortable ? 'is-sortable' : ''}`.trim()}
                            onClick={sortable ? () => onSort(column.key) : undefined}
                            onKeyDown={sortable ? (event) => {
                              if (event.key === 'Enter' || event.key === ' ') onSort(column.key);
                            } : undefined}
                            role={sortable ? 'button' : undefined}
                            tabIndex={sortable ? 0 : undefined}
                          >
                            <span>{typeof column.label === 'function' ? column.label() : column.label}</span>
                            {sortable ? (
                              <span className={`adt-sort-icon ${sortActive ? `active ${sortConfig.direction}` : ''}`}>
                                <img src={hoaupdowncaret} alt="" />
                              </span>
                            ) : null}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const rowKey = String(getRowKey(row));
                  const selected = selectedKeys.includes(rowKey);
                  return (
                    <tr key={rowKey} className={selected ? 'selected-row' : undefined}>
                      {selectable ? (
                        <td>
                          <input
                            type="checkbox"
                            className="adt-checkbox"
                            checked={selected}
                            onChange={() => onToggleRow?.(rowKey)}
                            aria-label={`Select row ${rowKey}`}
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => {
                        const alignClass = column.align === 'center'
                          ? 'text-center'
                          : column.align === 'right'
                            ? 'text-right'
                            : '';
                        return (
                          <td
                            key={`${rowKey}-${column.key || column.label}`}
                            className={`${alignClass} ${column.cellClassName || ''}`.trim()}
                            style={column.cellStyle}
                          >
                            {column.renderCell
                              ? column.renderCell(row)
                              : row?.[column.key]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {rows.length === 0 && !loading ? (
                  <AcademiaTableEmptyRow
                    colSpan={Math.max(colSpan, 1)}
                    title={emptyTitle}
                    message={emptyMessage}
                  />
                ) : null}
              </tbody>
            </table>
          </div>

          {showPagination ? (
            <div className="adt-pagination-container">
              <div className="adt-pagination-left">
                Show
                <div className="adt-page-size-dropdown" ref={pageSizeRef}>
                  <button
                    type="button"
                    className="adt-page-size-button"
                    onClick={() => setPageSizeOpen((open) => !open)}
                  >
                    {pageSize}
                    <img src={hoadowncaret} alt="" />
                  </button>
                  {isPageSizeOpen ? (
                    <div className="adt-page-size-menu">
                      {pageSizeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="adt-page-size-option"
                          onClick={() => {
                            onPageSizeChange?.(String(option));
                            setPageSizeOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="adt-page-range">
                  {rangeLabel} of {totalItems}
                </span>
              </div>

              <div className="adt-pagination">
                <button
                  type="button"
                  className="adt-page-nav"
                  onClick={() => onGoToPage?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <img src={hoaprev} alt="Previous" style={{ opacity: currentPage <= 1 ? 0.5 : 1 }} />
                </button>
                {(visiblePageNumbers.length
                  ? visiblePageNumbers
                  : Array.from({ length: totalPages }, (_, i) => i + 1)
                ).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`adt-page-num ${currentPage === num ? 'active' : ''}`}
                    onClick={() => onGoToPage?.(num)}
                  >
                    {num}
                  </button>
                ))}
                {totalPages > 3 && currentPage < totalPages - 1 ? (
                  <span className="adt-page-dots">...</span>
                ) : null}
                <button
                  type="button"
                  className="adt-page-nav"
                  onClick={() => onGoToPage?.(currentPage + 1)}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  <img
                    src={hoanext}
                    alt="Next"
                    style={{ opacity: currentPage >= totalPages || totalPages === 0 ? 0.5 : 1 }}
                  />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
