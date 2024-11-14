import { loadItems, fetchComments, UPDATE_INTERVAL } from './api.js';
import {
  throttle,
  createItemsStore,
  createItemElement,
  showError,
} from './utils.js';

class NewsApp {
  constructor() {
    this.currentType = 'new';
    this.page = 1;
    this.isLoading = false;
    this.itemsStore = createItemsStore();
    this.pendingUpdates = [];

    // DOM elements
    this.contentElement = document.getElementById('content');
    this.loadingElement = document.getElementById('loading');
    this.newContentNotification = document.getElementById('new-content');

    // Initialize the application
    this.init();
  }

  setupTabNavigation() {
    // Map the nav text to the correct type values
    const navMapping = {
      'Latest Stories': 'new',
      Jobs: 'job',
      Polls: 'poll',
    };

    document.querySelectorAll('.nav-tabs').forEach((nav) => {
      nav.addEventListener('click', async (event) => {
        const text = event.target.textContent.trim();
        const type = navMapping[text];

        if (type && type !== this.currentType) {
          this.currentType = type;
          this.pendingUpdates = [];
          this.newContentNotification.style.display = 'none';
          await this.loadInitialContent();
        }
      });
    });
  }

  async init() {
    try {
      // Set up event listeners
      this.setupTabNavigation();
      this.setupInfiniteScroll();
      this.setupLiveUpdates();
      this.setupNotificationClick();

      // Load initial content
      await this.loadInitialContent();
    } catch (error) {
      showError('Failed to initialize application. Please refresh the page.');
      console.error('Initialization error:', error);
    }
  }

  async loadInitialContent() {
    try {
      this.contentElement.innerHTML = '';
      this.itemsStore.clear();
      this.page = 1;

      const initialStories = await loadItems(this.currentType, 1);
      this.renderItems(initialStories);
    } catch (error) {
      showError('Failed to load initial content. Please try again.');
      console.error('Initial content error:', error);
    }
  }

  setupTabNavigation() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', async () => {
        try {
          const activeTab = document.querySelector('.tab.active');
          if (activeTab) {
            activeTab.classList.remove('active');
          }
          tab.classList.add('active');

          this.currentType = tab.dataset.type;
          this.pendingUpdates = [];
          this.newContentNotification.style.display = 'none';

          await this.loadInitialContent();
        } catch (error) {
          showError('Failed to switch content type. Please try again.');
          console.error('Tab navigation error:', error);
        }
      });
    });
  }

  setupInfiniteScroll() {
    window.addEventListener(
      'scroll',
      throttle(async () => {
        if (this.isLoading) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 500) {
          await this.loadMoreItems();
        }
      }, 500)
    );
  }

  async loadMoreItems() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.loadingElement.style.display = 'block';

    try {
      this.page++;
      const newItems = await loadItems(this.currentType, this.page);
      this.renderItems(newItems);
    } catch (error) {
      this.page--;
      showError('Failed to load more content. Please try again.');
      console.error('Load more items error:', error);
    } finally {
      this.isLoading = false;
      this.loadingElement.style.display = 'none';
    }
  }

  setupLiveUpdates() {
    setInterval(async () => {
      try {
        if (this.currentType === 'new') {
          const latestStories = await loadItems('new', 1);
          const newStories = latestStories.filter(
            (story) => !this.itemsStore.has(story)
          );

          if (newStories.length > 0) {
            this.pendingUpdates = [...this.pendingUpdates, ...newStories];
            this.newContentNotification.style.display = 'block';
          }
        }
      } catch (error) {
        console.error('Live updates error:', error);
      }
    }, UPDATE_INTERVAL);
  }

  setupNotificationClick() {
    this.newContentNotification.addEventListener('click', () => {
      if (this.pendingUpdates.length > 0) {
        this.renderItems(this.pendingUpdates, true);
        this.pendingUpdates = [];
        this.newContentNotification.style.display = 'none';
      }
    });
  }

  renderItems(items, prepend = false) {
    items.forEach((item) => {
      if (!this.itemsStore.has(item)) {
        this.itemsStore.add(item);
        const itemElement = this.createItemWithComments(item);

        if (prepend) {
          this.contentElement.insertBefore(
            itemElement,
            this.contentElement.firstChild
          );
        } else {
          this.contentElement.appendChild(itemElement);
        }
      }
    });
  }

  createItemWithComments(item) {
    const itemElement = createItemElement(item);

    // Add comment functionality
    if (item.kids && item.kids.length > 0) {
      const commentsSection = itemElement.querySelector(`#comments-${item.id}`);
      const commentsLink = itemElement.querySelector('.story-meta a');

      if (commentsLink) {
        commentsLink.addEventListener('click', async (e) => {
          e.preventDefault();
          await this.toggleComments(item.id, commentsSection);
        });
      }
    }

    return itemElement;
  }

  async toggleComments(postId, commentsSection) {
    if (commentsSection.style.display === 'none') {
      commentsSection.style.display = 'block';

      try {
        commentsSection.innerHTML =
          '<div class="loading">Loading comments...</div>';
        const comments = await fetchComments(postId);

        if (comments.length === 0) {
          commentsSection.innerHTML =
            '<div class="comment">No comments yet.</div>';
          return;
        }

        commentsSection.innerHTML = comments
          .map(
            (comment) => `
                    <div class="comment">
                        <div>${comment.text || 'Comment text unavailable'}</div>
                        <div class="story-meta">
                            by ${comment.by} | ${new Date(
              comment.time * 1000
            ).toLocaleString()}
                        </div>
                    </div>
                `
          )
          .join('');
      } catch (error) {
        commentsSection.innerHTML =
          '<div class="error-message">Failed to load comments. Please try again.</div>';
        console.error('Toggle comments error:', error);
      }
    } else {
      commentsSection.style.display = 'none';
    }
  }

  // Helper method to handle errors consistently
  handleError(error, message) {
    showError(message);
    console.error(error);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewsApp();
});
