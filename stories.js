"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when the site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const isFavorite = currentUser ? currentUser.isFavorite(story) : false;

  const trashCanIcon = currentUser && currentUser.isAuthor(story)
    ? `<i class="fas fa-trash-alt trash-can"></i>`
    : "";

  return $(`
    <li id="${story.storyId}">
      ${trashCanIcon}
      <i class="fas fa-star star ${isFavorite ? "fas" : "far"}"></i>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

/** Gets list of stories from the server, generates their HTML, and puts on the page. */

function putStoriesOnPage() {
  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle submission of the new story form. */

async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  const newStory = await storyList.addStory(currentUser, { title, author, url });

  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);

  $newStoryForm.slideUp("slow");
  $newStoryForm.trigger("reset");
}

$newStoryForm.on("submit", submitNewStory);

/** Handle click of star icon. */

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite", evt);

  if (!currentUser) return;

  const $story = $(evt.target).closest("li");
  const storyId = $story.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  if ($(evt.target).hasClass("fas")) {
    // Remove favorite
    await currentUser.removeFavorite(story);
    $(evt.target).toggleClass("fas far");
  } else {
    // Add favorite
    await currentUser.addFavorite(story);
    $(evt.target).toggleClass("fas far");
  }
}

$allStoriesList.on("click", ".star", toggleStoryFavorite);

/** Handle click of trash can icon to remove story. */

async function removeStory(evt) {
  console.debug("removeStory", evt);

  const $story = $(evt.target).closest("li");
  const storyId = $story.attr("id");

  await storyList.removeStory(currentUser, storyId);

  $story.remove();
}

$allStoriesList.on("click", ".trash-can", removeStory);

