import { fetchJSON, renderProjectsPage } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjectsPage(projects, projectsContainer, 'h2');
