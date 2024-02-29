document.addEventListener("DOMContentLoaded", function () {
  // Load the navigation bar
  let navbarElement = document.getElementsByClassName("navbar");
  navbarElement.innerHTML =
    '<nav><ul><li><a href="about_the_project.html">About the Project</a></li><li><a href="what.html">What?</a></li><li><a href="why.html">Why?</a></li><li><a href="how.html">How?</a></li><li><a href="methodology.html">Methodology</a></li><li><a href="renovation_process.html">Renovation Process</a></li><li><a href="technologies.html">Automation and Robotic Technologies</a></li><li><a href="discussion_development.html">Discussion and Future Development</a></li><li><a href="explore/explore.html">Explore Methodology</a></li></ul></nav>';

  // Load initial content
  let contentElement = document.getElementsByClassName("content");
  contentElement.innerHTML =
    "<h1>Index Page Content</h1><p>Content goes here...</p>";

  // Handle navigation clicks
  let links = document.querySelectorAll("nav a");
  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      let href = this.getAttribute("href");

      // Load content dynamically
      fetch(href)
        .then((response) => response.text())
        .then((data) => {
          contentElement.innerHTML = data;
        });
    });
  });
});
