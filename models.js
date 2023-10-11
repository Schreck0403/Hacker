"user strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make an instance of Story from data object about story:
   *   - {storyId, title, author, url, username, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const hostname = new URL(this.url).host;
    return hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
  static async getStories() {
    // Query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // Turn plain old story objects from the API into instances of the Story class
    const stories = response.data.stories.map(story => new Story(story));

    // Build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to the story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, { title, author, url }) {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {
        token: user.loginToken,
        story: { title, author, url },
      },
    });

    const newStory = new Story(response.data.story);
    this.stories.unshift(newStory);
    user.ownStories.unshift(newStory);

    return newStory;
  }

  /** Remove a story and update the API and our lists.
   * - user - the current instance of User who will remove the story
   * - storyId - the ID of the story to be removed
   */
  async removeStory(user, storyId) {
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken },
    });

    // Remove the story from the StoryList
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    // Remove the story from the User's ownStories list
    user.ownStories = user.ownStories.filter(story => story.storyId !== storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */
  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // Instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(story => new Story(story));
    this.ownStories = ownStories.map(story => new Story(story));

    // Store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Add a story to the list of user's favorite stories and update the API.
   * - story - the Story instance to be added to favorites
   */
  async addFavorite(story) {
    this.favorites.push(story);
    await this._toggleFavorite(story, "POST");
  }

  /** Remove a story from the list of user's favorite stories and update the API.
   * - story - the Story instance to be removed from favorites
   */
  async removeFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this._toggleFavorite(story, "DELETE");
  }

  /** Toggle the favorite status of a story on the API.
   * - story - the Story instance for which to toggle favorite status
   * - httpVerb - the HTTP verb (POST or DELETE) to use
   */
  async _toggleFavorite(story, httpVerb) {
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: httpVerb,
      data: { token: this.loginToken },
    });
  }
}

