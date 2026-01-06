/**
 * VirtualizedList - High-Performance List Component
 *
 * Uses react-window for efficient rendering of large lists.
 * Only renders items visible in the viewport, dramatically reducing
 * memory usage and improving scroll performance for long feeds.
 */

import { memo, useCallback, useRef, forwardRef } from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimatedItemHeight?: number;
  overscanCount?: number;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadMoreThreshold?: number;
}

interface ItemData<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  setItemHeight: (index: number, height: number) => void;
}

// Row component that measures its own height
const Row = memo(forwardRef<HTMLDivElement, ListChildComponentProps<ItemData<any>>>(
  ({ index, style, data }, ref) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const { items, renderItem, setItemHeight } = data;
    const item = items[index];

    // Measure and report height after render
    const measureHeight = useCallback((node: HTMLDivElement | null) => {
      if (node) {
        const height = node.getBoundingClientRect().height;
        setItemHeight(index, height);
      }
    }, [index, setItemHeight]);

    return (
      <div style={style} ref={ref}>
        <div ref={measureHeight}>
          {renderItem(item, index)}
        </div>
      </div>
    );
  }
));

Row.displayName = 'VirtualizedRow';

function VirtualizedListComponent<T>({
  items,
  renderItem,
  estimatedItemHeight = 400,
  overscanCount = 5,
  className,
  onLoadMore,
  hasMore = false,
  loadMoreThreshold = 5,
}: VirtualizedListProps<T>) {
  const listRef = useRef<List>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

  // Get the height of an item (measured or estimated)
  const getItemHeight = useCallback((index: number): number => {
    return itemHeights.current.get(index) || estimatedItemHeight;
  }, [estimatedItemHeight]);

  // Store measured height and reset list cache if different
  const setItemHeight = useCallback((index: number, height: number) => {
    const currentHeight = itemHeights.current.get(index);
    if (currentHeight !== height) {
      itemHeights.current.set(index, height);
      // Reset the list's cached measurements from this index onwards
      listRef.current?.resetAfterIndex(index, true);
    }
  }, []);

  // Handle scroll to detect when to load more
  const handleItemsRendered = useCallback(({ visibleStopIndex }: { visibleStopIndex: number }) => {
    if (hasMore && onLoadMore && items.length - visibleStopIndex <= loadMoreThreshold) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, items.length, loadMoreThreshold]);

  const itemData: ItemData<T> = {
    items,
    renderItem,
    setItemHeight,
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={getItemHeight}
            itemData={itemData}
            overscanCount={overscanCount}
            onItemsRendered={handleItemsRendered}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;

/**
 * Simple virtualized list for fixed-height items
 */
interface FixedSizeListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
}

export function FixedSizeVirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
}: FixedSizeListProps<T>) {
  const FixedRow = ({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={() => itemHeight}
          >
            {FixedRow}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export default VirtualizedList;
