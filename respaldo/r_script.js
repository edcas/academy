// script.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    const loader = document.getElementById('loader');

    let allLinks = [];

    // Función para renderizar bloques de Notion a HTML
    function renderBlocks(blocks) {
        let html = '';
        blocks.forEach(block => {
            switch (block.type) {
                case 'heading_1':
                    html += `<h1>${block.heading_1.rich_text[0]?.plain_text || ''}</h1>`;
                    break;
                case 'heading_2':
                    html += `<h2>${block.heading_2.rich_text[0]?.plain_text || ''}</h2>`;
                    break;
                case 'heading_3':
                    html += `<h3>${block.heading_3.rich_text[0]?.plain_text || ''}</h3>`;
                    break;
                case 'paragraph':
                    html += `<p>${block.paragraph.rich_text.map(t => t.plain_text).join('')}</p>`;
                    break;
                case 'bulleted_list_item':
                     html += `<ul><li>${block.bulleted_list_item.rich_text.map(t => t.plain_text).join('')}</li></ul>`;
                    break;
                case 'numbered_list_item':
                     html += `<ol><li>${block.numbered_list_item.rich_text.map(t => t.plain_text).join('')}</li></ol>`;
                    break;
                case 'image':
                    const imgSrc = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
                    html += `<img src="${imgSrc}" alt="Imagen de la documentación">`;
                    break;
                case 'video':
                    // Notion API no devuelve un iframe, sino la URL. Construimos el embed.
                    if (block.video.external.url.includes('youtube.com')) {
                       const videoId = new URL(block.video.external.url).searchParams.get('v');
                       html += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                    }
                    break;
                case 'file':
                    const fileUrl = block.file.type === 'external' ? block.file.external.url : block.file.file.url;
                    html += `<a href="${fileUrl}" target="_blank" class="download-link">Descargar ${block.file.name || 'archivo'}</a>`;
                    break;
                // Añadir más tipos de bloques aquí
                default:
                    console.log('Bloque no soportado:', block.type);
            }
        });
        return html;
    }

    // Carga una página por su slug
    async function loadPage(slug) {
        if (!slug) {
            content.innerHTML = "<h1>Bienvenido a Beepayroll Academy</h1><p>Selecciona un artículo de la barra lateral para comenzar.</p>";
            loader.style.display = 'none';
            return;
        }

        loader.style.display = 'block';
        content.innerHTML = '';

        // Marcar link activo
        allLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`a[data-slug='${slug}']`);
        if(activeLink) activeLink.classList.add('active');

        try {
            const response = await fetch(`/api/page/${slug}`);
            const blocks = await response.json();
            content.innerHTML = renderBlocks(blocks);
        } catch (error) {
            content.innerHTML = '<p>Error al cargar el contenido.</p>';
            console.error(error);
        } finally {
            loader.style.display = 'none';
        }
    }

    // Carga la navegación
    async function loadNavigation() {
        const response = await fetch('/api/navigation');
        const navData = await response.json();

        let navHtml = '';
        for (const category in navData) {
            navHtml += `<div class="category-title">${category}</div><ul>`;
            navData[category].forEach(page => {
                navHtml += `<li><a href="#" data-slug="${page.slug}">${page.title}</a></li>`;
            });
            navHtml += `</ul>`;
        }
        sidebar.innerHTML = navHtml;

        // Guardar todos los links para el manejo del estado 'active'
        allLinks = Array.from(sidebar.querySelectorAll('a'));

        // Añadir event listeners a los links
        allLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = e.target.getAttribute('data-slug');
                // Actualiza la URL sin recargar la página
                history.pushState({ slug }, '', `?article=${slug}`);
                loadPage(slug);
            });
        });
    }

    // Lógica de búsqueda
    searchBar.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }

        const response = await fetch(`/api/search?q=${query}`);
        const results = await response.json();

        if (results.length > 0) {
            let resultsHtml = '';
            results.forEach(page => {
                resultsHtml += `<a href="#" data-slug="${page.slug}" class="search-result-item">${page.title}</a>`;
            });
            searchResults.innerHTML = resultsHtml;
            searchResults.style.display = 'block';

            // Añadir event listeners a los resultados de búsqueda
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const slug = e.target.getAttribute('data-slug');
                    history.pushState({ slug }, '', `?article=${slug}`);
                    loadPage(slug);
                    searchResults.style.display = 'none';
                    searchBar.value = '';
                });
            });

        } else {
            searchResults.style.display = 'none';
        }
    });

    // Carga inicial
    async function init() {
        await loadNavigation();
        // Comprueba si hay un artículo en la URL al cargar
        const params = new URLSearchParams(window.location.search);
        const initialSlug = params.get('article');
        loadPage(initialSlug);
    }

    init();
});