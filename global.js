console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = '/portfolio/'; // Define the base path for the application

const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/kyradeng', title: 'GitHub' },
];

// Step 3.2: Check if we're on the home page
const ARE_WE_HOME = location.pathname === BASE_PATH;

// Step 3.3: Create the navigation menu dynamically
if (!document.querySelector('nav')) {
    let nav = document.createElement('nav');
    let ul = document.createElement('ul'); // Create an unordered list to hold the links
    nav.appendChild(ul);  // Append the ul to the nav
    document.body.prepend(nav);  // Add nav at the beginning of the body

    // Step 3.4: Iterate through pages and create links
    for (let p of pages) {
        let url = p.url;
        let title = p.title;

        // Step 3.5: Adjust the URL to include the base path
        if (!url.startsWith('http')) {
            url = ARE_WE_HOME ? `${BASE_PATH}${url}` : `${BASE_PATH}${url}`;
        }

        console.log(`Generating link for ${title}: ${url}`); // Debugging statement

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

// Get the theme select element
const select = document.querySelector('.color-scheme select');

function getSystemColorScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }


function applyColorScheme(colorScheme) {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
}

// Function to set the color scheme
function setColorScheme(colorScheme) {
    if (colorScheme === 'light dark') {
      // Detect and apply the system preference
      applyColorScheme(getSystemColorScheme());
    } else {
      // Apply user-selected theme (light or dark)
      applyColorScheme(colorScheme);
    }
  
    // Save the user's preference in localStorage
    localStorage.setItem('colorScheme', colorScheme);
  }

// Load the saved theme or default to 'light dark'
const savedScheme = localStorage.getItem('colorScheme') || 'light dark';
setColorScheme(savedScheme);

select.value = savedScheme;

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (localStorage.getItem('colorScheme') === 'light dark') {
      setColorScheme('light dark'); // Re-evaluate system preference
    }
  });

// Event listener for the theme dropdown
select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
});
