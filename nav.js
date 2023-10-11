"use strict";

// Handling navbar clicks and updating navbar

// Show main list of all stories when click site name
function navAllStories(evt) {
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

// Show login/signup on click on "login"
function navLoginClick(evt) {
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

// Show form for adding a new story on click of "submit"
function navSubmitClick(evt) {
  hidePageComponents();
  $("#add-story-form").show();
}

$navSubmit.on("click", navSubmitClick);

// Update the navigation bar when a user logs in
function updateNavOnLogin() {
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(currentUser.username).show();
  $(".main-nav-links").show();
}