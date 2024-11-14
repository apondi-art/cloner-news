// Mocking dependencies from './api.js' and './utils.js'
jest.mock('./api.js', () => ({
    loadItems: jest.fn(),
    fetchComments: jest.fn(),
    UPDATE_INTERVAL: 5000,
  }));
  
  jest.mock('./utils.js', () => ({
    throttle: jest.fn((fn) => fn), // Just return the original function for simplicity
    createItemsStore: jest.fn(() => ({
      has: jest.fn(),
      add: jest.fn(),
      clear: jest.fn(),
    })),
    createItemElement: jest.fn(),
    showError: jest.fn(),
  }));
  import { loadItems, fetchComments } from './api.js';
  import { createItemsStore, createItemElement, showError } from './utils.js';
  import NewsApp from './NewsApp'; // Assuming NewsApp is exported from the file
  
  describe('NewsApp', () => {
    let app;
    
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="content"></div>
        <div id="loading"></div>
        <div id="new-content"></div>
      `;
  
      // Initialize the app
      app = new NewsApp();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('should initialize the app and load initial content', async () => {
        loadItems.mockResolvedValueOnce([]); // Mock initial load
    
        await app.init();
    
        expect(createItemsStore).toHaveBeenCalled();
        expect(loadItems).toHaveBeenCalledWith('new', 1);
        expect(app.itemsStore.clear).toHaveBeenCalled();
        expect(app.contentElement.innerHTML).toBe(''); // Verify content was cleared
      });
    
      test('should handle tab navigation and load new content', async () => {
        loadItems.mockResolvedValueOnce([]); // Mock new tab load
    
        // Mock the tab click event
        const tab = document.createElement('div');
        tab.classList.add('tab');
        tab.dataset.type = 'job';
        document.body.appendChild(tab);
    
        await tab.click();
    
        expect(app.currentType).toBe('job');
        expect(loadItems).toHaveBeenCalledWith('job', 1);
        expect(app.itemsStore.clear).toHaveBeenCalled();
      });
      test('should load more items on infinite scroll', async () => {
        loadItems.mockResolvedValueOnce([]); // Mock additional items
    
        // Simulate a scroll event
        Object.defineProperty(window, 'scrollY', { value: 1000 });
        Object.defineProperty(window, 'innerHeight', { value: 600 });
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500 });
    
        await app.loadMoreItems();
    
        expect(app.isLoading).toBe(true);
        expect(loadItems).toHaveBeenCalledWith('new', 2);
        expect(app.isLoading).toBe(false);
      });
    
      test('should handle live updates', async () => {
        const newStories = [{ id: 1 }, { id: 2 }];
        loadItems.mockResolvedValueOnce(newStories);
    
        jest.useFakeTimers(); // Control timers
    
        app.setupLiveUpdates();
        
        // Fast forward until all timers are executed
        jest.advanceTimersByTime(5000);
    
        expect(loadItems).toHaveBeenCalledWith('new', 1);
        expect(app.pendingUpdates).toEqual(newStories);
        expect(app.newContentNotification.style.display).toBe('block');
      });
      test('should show error when initialization fails', async () => {
        loadItems.mockRejectedValueOnce(new Error('Failed'));
    
        await app.init();
    
        expect(showError).toHaveBeenCalledWith('Failed to initialize application. Please refresh the page.');
      });
    });
    