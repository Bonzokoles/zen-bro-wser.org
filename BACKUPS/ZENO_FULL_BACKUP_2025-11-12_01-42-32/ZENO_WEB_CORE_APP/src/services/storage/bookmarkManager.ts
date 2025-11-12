/**
 * Bookmark Manager - Zaawansowane zarządzanie zakładkami
 * Funkcje: Foldery, sortowanie, import/export, sync
 */

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon: string;
  folderId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  visitCount: number;
  lastVisited?: string;
  notes?: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  parentId?: string; // dla zagnieżdżonych folderów
  color?: string;
  icon?: string;
  createdAt: string;
  position: number;
}

export interface BookmarkExport {
  version: string;
  exportedAt: string;
  folders: BookmarkFolder[];
  bookmarks: Bookmark[];
}

class BookmarkManager {
  private bookmarks: Bookmark[] = [];
  private folders: BookmarkFolder[] = [];
  private readonly STORAGE_KEY_BOOKMARKS = 'zeno_bookmarks_v2';
  private readonly STORAGE_KEY_FOLDERS = 'zeno_folders_v2';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Ładowanie z localStorage
   */
  private loadFromStorage(): void {
    try {
      const bookmarksData = localStorage.getItem(this.STORAGE_KEY_BOOKMARKS);
      const foldersData = localStorage.getItem(this.STORAGE_KEY_FOLDERS);

      if (bookmarksData) {
        this.bookmarks = JSON.parse(bookmarksData);
      }

      if (foldersData) {
        this.folders = JSON.parse(foldersData);
      } else {
        // Utwórz domyślne foldery
        this.createDefaultFolders();
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      this.createDefaultFolders();
    }
  }

  /**
   * Zapisywanie do localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_BOOKMARKS, JSON.stringify(this.bookmarks));
      localStorage.setItem(this.STORAGE_KEY_FOLDERS, JSON.stringify(this.folders));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }

  /**
   * Tworzenie domyślnych folderów
   */
  private createDefaultFolders(): void {
    const defaultFolders: BookmarkFolder[] = [
      {
        id: 'folder_work',
        name: 'Work',
        color: '#3b82f6',
        icon: '💼',
        createdAt: new Date().toISOString(),
        position: 0,
      },
      {
        id: 'folder_personal',
        name: 'Personal',
        color: '#10b981',
        icon: '🏠',
        createdAt: new Date().toISOString(),
        position: 1,
      },
      {
        id: 'folder_dev',
        name: 'Development',
        color: '#f59e0b',
        icon: '💻',
        createdAt: new Date().toISOString(),
        position: 2,
      },
      {
        id: 'folder_reading',
        name: 'Reading List',
        color: '#8b5cf6',
        icon: '📚',
        createdAt: new Date().toISOString(),
        position: 3,
      },
    ];

    this.folders = defaultFolders;
    this.saveToStorage();
  }

  /**
   * FOLDERY
   */

  createFolder(name: string, parentId?: string, color?: string, icon?: string): BookmarkFolder {
    const folder: BookmarkFolder = {
      id: `folder_${Date.now()}`,
      name,
      parentId,
      color: color || '#64748b',
      icon: icon || '📁',
      createdAt: new Date().toISOString(),
      position: this.folders.length,
    };

    this.folders.push(folder);
    this.saveToStorage();
    return folder;
  }

  updateFolder(folderId: string, updates: Partial<BookmarkFolder>): void {
    const index = this.folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      this.folders[index] = { ...this.folders[index], ...updates };
      this.saveToStorage();
    }
  }

  deleteFolder(folderId: string, moveBookmarksTo?: string): void {
    // Przenieś lub usuń zakładki z folderu
    if (moveBookmarksTo) {
      this.bookmarks.forEach(bookmark => {
        if (bookmark.folderId === folderId) {
          bookmark.folderId = moveBookmarksTo;
        }
      });
    } else {
      // Usuń zakładki z folderu
      this.bookmarks = this.bookmarks.filter(b => b.folderId !== folderId);
    }

    // Usuń folder
    this.folders = this.folders.filter(f => f.id !== folderId);

    // Usuń zagnieżdżone foldery
    this.folders = this.folders.filter(f => f.parentId !== folderId);

    this.saveToStorage();
  }

  getFolders(parentId?: string): BookmarkFolder[] {
    return this.folders
      .filter(f => f.parentId === parentId)
      .sort((a, b) => a.position - b.position);
  }

  /**
   * ZAKŁADKI
   */

  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'visitCount'>): Bookmark {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visitCount: 0,
      tags: bookmark.tags || [],
    };

    this.bookmarks.push(newBookmark);
    this.saveToStorage();
    return newBookmark;
  }

  updateBookmark(bookmarkId: string, updates: Partial<Bookmark>): void {
    const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
    if (index !== -1) {
      this.bookmarks[index] = {
        ...this.bookmarks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
    }
  }

  deleteBookmark(bookmarkId: string): void {
    this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
    this.saveToStorage();
  }

  moveBookmark(bookmarkId: string, targetFolderId?: string): void {
    this.updateBookmark(bookmarkId, { folderId: targetFolderId });
  }

  /**
   * Zwiększ licznik odwiedzin
   */
  incrementVisitCount(bookmarkId: string): void {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      bookmark.visitCount++;
      bookmark.lastVisited = new Date().toISOString();
      this.saveToStorage();
    }
  }

  /**
   * POBIERANIE ZAKŁADEK
   */

  getBookmarksByFolder(folderId?: string): Bookmark[] {
    return this.bookmarks.filter(b => b.folderId === folderId);
  }

  getAllBookmarks(): Bookmark[] {
    return this.bookmarks;
  }

  searchBookmarks(query: string): Bookmark[] {
    const lowerQuery = query.toLowerCase();
    return this.bookmarks.filter(
      b =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.url.toLowerCase().includes(lowerQuery) ||
        b.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        b.notes?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * SORTOWANIE
   */

  sortBookmarks(
    bookmarks: Bookmark[],
    sortBy: 'title' | 'date' | 'visits' | 'url'
  ): Bookmark[] {
    return [...bookmarks].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'visits':
          return b.visitCount - a.visitCount;
        case 'url':
          return a.url.localeCompare(b.url);
        default:
          return 0;
      }
    });
  }

  /**
   * IMPORT/EXPORT
   */

  exportToJSON(): string {
    const exportData: BookmarkExport = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      folders: this.folders,
      bookmarks: this.bookmarks,
    };

    return JSON.stringify(exportData, null, 2);
  }

  exportToHTML(): string {
    let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
    html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
    html += '<TITLE>ZENO Browser Bookmarks</TITLE>\n';
    html += '<H1>ZENO Browser Bookmarks</H1>\n\n';
    html += '<DL><p>\n';

    // Export folderów
    this.folders.forEach(folder => {
      html += `    <DT><H3>${folder.name}</H3>\n`;
      html += '    <DL><p>\n';

      const folderBookmarks = this.getBookmarksByFolder(folder.id);
      folderBookmarks.forEach(bookmark => {
        html += `        <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
      });

      html += '    </DL><p>\n';
    });

    // Export zakładek bez folderu
    const unbookmarked = this.getBookmarksByFolder(undefined);
    if (unbookmarked.length > 0) {
      unbookmarked.forEach(bookmark => {
        html += `    <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
      });
    }

    html += '</DL><p>\n';
    return html;
  }

  importFromJSON(jsonData: string): { success: boolean; imported: number; error?: string } {
    try {
      const data: BookmarkExport = JSON.parse(jsonData);

      // Walidacja
      if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
        return { success: false, imported: 0, error: 'Invalid format' };
      }

      // Merge folders (unikaj duplikatów)
      if (data.folders && Array.isArray(data.folders)) {
        data.folders.forEach(folder => {
          const exists = this.folders.find(f => f.name === folder.name);
          if (!exists) {
            this.folders.push(folder);
          }
        });
      }

      // Merge bookmarks (unikaj duplikatów URL)
      let imported = 0;
      data.bookmarks.forEach(bookmark => {
        const exists = this.bookmarks.find(b => b.url === bookmark.url);
        if (!exists) {
          this.bookmarks.push(bookmark);
          imported++;
        }
      });

      this.saveToStorage();

      return { success: true, imported };
    } catch (error: any) {
      return { success: false, imported: 0, error: error.message };
    }
  }

  /**
   * STATYSTYKI
   */

  getStats() {
    return {
      totalBookmarks: this.bookmarks.length,
      totalFolders: this.folders.length,
      mostVisited: this.bookmarks
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 10),
      recentlyAdded: this.bookmarks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
      byFolder: this.folders.map(folder => ({
        folder: folder.name,
        count: this.getBookmarksByFolder(folder.id).length,
      })),
    };
  }

  /**
   * CZYSZCZENIE
   */

  clearAll(): void {
    this.bookmarks = [];
    this.folders = [];
    this.createDefaultFolders();
    this.saveToStorage();
  }
}

// Export singleton
export const bookmarkManager = new BookmarkManager();
