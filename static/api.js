const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const POLL_API_URL = 'https://hn.algolia.com/api/v1';
const ITEMS_PER_PAGE = 10;
const UPDATE_INTERVAL = 5000;

// Map navigation items to API endpoints
const TYPE_MAPPING = {
  new: 'newstories',
  job: 'jobstories',
  poll: 'poll'
};

// Generic API request function with improved error handling
const apiRequest = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`API request failed for ${url} with status ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Fetch stories with type handling
export const fetchItems = async (type) => {
  try {
    if (type === 'poll') {
      const response = await apiRequest(`${POLL_API_URL}/search_by_date?tags=poll`);
      return response.hits || [];
    }

    const storyType = TYPE_MAPPING[type];
    if (!storyType) {
      throw new Error(`Invalid story type: ${type}`);
    }

    const items = await apiRequest(`${API_BASE_URL}/${storyType}.json`);
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
};

export const fetchItemDetails = async (id) => {
  try {
    return await apiRequest(`${API_BASE_URL}/item/${id}.json`);
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return null;
  }
};

export const loadItems = async (type, page = 1) => {
  try {
    if (type === 'poll') {
      // Handle polls differently using Algolia API
      const response = await apiRequest(
        `${POLL_API_URL}/search_by_date?tags=poll&page=${page - 1}`
      );
      
      // Map Algolia response to match our expected format
      return response.hits
        .map(hit => ({
          id: hit.objectID,
          title: hit.title,
          url: hit.url,
          time: new Date(hit.created_at).getTime() / 1000,
          by: hit.author,
          score: hit.points,
          type: 'poll',
          kids: hit.children || []
        }))
        .slice(0, ITEMS_PER_PAGE);
    }

    // Original implementation for other types
    let itemIds = await fetchItems(type);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageIds = itemIds.slice(startIndex, endIndex);

    // Fetch details for all items
    const items = await Promise.all(pageIds.map((id) => fetchItemDetails(id)));

    // Filter out null items
    let filteredItems = items.filter((item) => item !== null);

    // Apply type-specific filtering
    switch (type) {
      case 'job':
        filteredItems = filteredItems.filter((item) => item.type === 'job');
        break;
      case 'new':
        filteredItems = filteredItems.filter(
          (item) => item.type === 'story' && !item.job && item.url
        );
        break;
    }

    // Return only ITEMS_PER_PAGE items, sorted by time
    return filteredItems
      .slice(0, ITEMS_PER_PAGE)
      .sort((a, b) => b.time - a.time);
  } catch (error) {
    console.error(`Error in loadItems for ${type}:`, error);
    return [];
  }
};

export const fetchComments = async (postId) => {
  try {
    // For polls from Algolia, we need to handle comments differently
    const response = await apiRequest(
      `${POLL_API_URL}/items/${postId}`
    );
    
    if (!response || !response.children) return [];

    return response.children
      .map(comment => ({
        id: comment.id,
        text: comment.text,
        by: comment.author,
        time: new Date(comment.created_at).getTime() / 1000,
        type: 'comment'
      }))
      .sort((a, b) => b.time - a.time);
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};

export { UPDATE_INTERVAL };