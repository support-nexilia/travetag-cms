import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
};

export function Tabs({ tabs, defaultTabId, activeTabId, onTabChange, className }: TabsProps) {
  const firstTabId = tabs[0]?.id;
  const initialId = defaultTabId || firstTabId;
  const [internalTab, setInternalTab] = useState(initialId);

  const currentTabId = activeTabId ?? internalTab;
  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === currentTabId) ?? tabs[0],
    [currentTabId, tabs]
  );

  const setTab = (tabId: string) => {
    if (!activeTabId) {
      setInternalTab(tabId);
    }
    onTabChange?.(tabId);
  };

  if (!currentTab) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(tab.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-900 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="space-y-6">
        {currentTab.content}
      </div>
    </div>
  );
}
