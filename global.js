console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/kyradeng', title: 'GitHub' },
];

// Step 3.2: Check if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Step 3.3: Create the navigation menu dynamically
let nav = document.createElement('nav');
let ul = document.createElement('ul'); // Create an unordered list to hold the links
nav.appendChild(ul);  // Append the ul to the nav
document.body.prepend(nav);  // Add nav at the beginning of the body

// Step 3.4: Iterate through pages and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Step 3.5: Adjust the URL if we're not on the home page
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    // Step 3.6: Create the link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Step 3.7: Add current class to the current page link
    a.classList.toggle('current', a.host === location.host && a.pathname === location.pathname);

    // Step 3.8: Open external links (e.g., GitHub) in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';  // Open external links in a new tab
    }

    // Step 3.9: Create the list item and append the link
    let li = document.createElement('li');
    li.appendChild(a);
    ul.appendChild(li);  // Append the list item to the unordered list
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('.color-scheme select');

// Event listener to update the color scheme when the user selects an option
select.addEventListener('input', function (event) {
  // Set the color-scheme property on the <html> element
  document.documentElement.style.setProperty('color-scheme', event.target.value);

  // Save the user's preference to localStorage
  localStorage.colorScheme = event.target.value;
});

// Function to set the color scheme from localStorage or default
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;  // Update the select element
}

// Check if there's a saved color scheme in localStorage or use 'light dark' by default
const savedScheme = localStorage.colorScheme || 'light dark';
setColorScheme(savedScheme);