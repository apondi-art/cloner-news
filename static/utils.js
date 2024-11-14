// Throttle function to limit API calls
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

// Create a store for managing items
export const createItemsStore = () => {
  const items = new Set();

  return {
    add: (item) => items.add(item.id),
    has: (item) => items.has(item.id),
    clear: () => items.clear(),
  };
};

// Create HTML elements for items
export const createItemElement = (item) => {
  const card = document.createElement('div');
  card.className = 'story-card';

  const title = document.createElement('a');
  title.href = item.url || `#${item.id}`;
  title.className = 'story-title';
  title.textContent = item.title;
  title.target = '_blank';

  const meta = document.createElement('div');
  meta.className = 'story-meta';
  meta.textContent = `by ${item.by} | ${formatDate(item.time)}`;

  if (item.kids) {
    const comments = document.createElement('a');
    comments.href = '#';
    comments.textContent = ` | ${item.kids.length} comments`;
    comments.onclick = (e) => {
      e.preventDefault();
      toggleComments(item.id);
    };
    meta.appendChild(comments);
  }

  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section';
  commentsSection.id = `comments-${item.id}`;
  commentsSection.style.display = 'none';

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(commentsSection);

  return card;
};

// Show error message
export const showError = (message, duration = 5000) => {
  const errorContainer = document.getElementById('error-container');
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorContainer.appendChild(errorElement);
  setTimeout(() => errorElement.remove(), duration);
};
