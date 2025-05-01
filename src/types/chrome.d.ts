declare namespace chrome {
  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      windowId: number;
      openerTabId?: number;
      selected: boolean;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      audible?: boolean;
      discarded: boolean;
      autoDiscardable: boolean;
      mutedInfo?: MutedInfo;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
      groupId: number;
      frozen: boolean;
    }

    interface TabChangeInfo {
      status?: string;
      url?: string;
      pinned?: boolean;
      audible?: boolean;
      mutedInfo?: MutedInfo;
      favIconUrl?: string;
      title?: string;
    }

    interface MutedInfo {
      muted: boolean;
      reason?: string;
      extensionId?: string;
    }

    interface OnUpdatedListener {
      (tabId: number, changeInfo: TabChangeInfo, tab: Tab): void;
    }

    interface OnUpdatedEvent {
      addListener(callback: OnUpdatedListener): void;
    }

    interface Tabs {
      onUpdated: OnUpdatedEvent;
      executeScript(tabId: number, details: { file: string }): Promise<void>;
    }
  }

  namespace scripting {
    interface ExecuteScriptDetails {
      target: { tabId: number };
      files: string[];
    }

    interface Scripting {
      executeScript(details: ExecuteScriptDetails): Promise<void>;
    }
  }

  const tabs: chrome.tabs.Tabs;
  const scripting: chrome.scripting.Scripting;
}
