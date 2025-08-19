// academy.js - Funcionalidad para BeePayroll Academy

// Estado de la aplicación
const appState = {
    currentPage: 'home',
    currentPlatform: 'saas', // Plataforma actual (saas, erp, app)
    searchQuery: '',
    selectedCategory: 'todos'
};

// Manejo global de errores para evitar logs innecesarios
window.addEventListener('error', (event) => {
    // Filtrar errores que no son críticos
    if (event.message.includes('override-property-read') || 
        event.message.includes('www-embed-player.js') ||
        event.message.includes('doubleclick.net') ||
        event.message.includes('runtime.lastError')) {
        event.preventDefault();
        return false;
    }
});

// Manejo de errores no capturados
window.addEventListener('unhandledrejection', (event) => {
    // Prevenir que se muestren errores de promesas rechazadas no críticas
    if (event.reason && (
        event.reason.message?.includes('override-property-read') ||
        event.reason.message?.includes('www-embed-player.js')
    )) {
        event.preventDefault();
        return false;
    }
});

// Elementos del DOM
const mainContentEl = document.getElementById('main-content');
const modalsContainerEl = document.getElementById('modals-container');

// --- TEMPLATES ---

function getHomePageTemplate() {
    return `
        <div class="text-center">
            <h1 class="home-title">Centro de Conocimiento</h1>
            <p class="home-subtitle">Todo lo que necesitas para dominar la nómina y nuestras plataformas.</p>
        </div>



        <div class="cards-grid">
            <!-- SaaS Card -->
            <div id="saas-card" class="card saas">
                <i class="fas fa-cloud"></i>
                <h2>Beepayroll SaaS</h2>
                <p>Accede a manuales de usuario, tutoriales y guías para nuestra plataforma en la nube.</p>
            </div>
            <!-- ERP Card -->
            <div id="erp-card" class="card erp">
                 <i class="fas fa-server"></i>
                <h2>Beepayroll ERP</h2>
                <p>Material exclusivo para usuarios internos y clientes específicos. Requiere autorización.</p>
            </div>
            <!-- App Card -->
            <div id="app-card" class="card app">
                <i class="fas fa-mobile-alt"></i>
                <h2>Beepayroll App</h2>
                <p>Descubre cómo usar nuestra aplicación móvil para gestionar la nómina desde cualquier lugar.</p>
            </div>
        </div>

        <div class="popular-guides">
            <h3 class="guides-title">Guías Prácticas Populares</h3>
            
            <!-- Filter Bar -->
            <div class="filter-bar">
                <label for="tema-filter">Tema:</label>
                <select id="tema-filter">
                    <option>Todos los temas</option>
                    <option>Fiscal</option>
                    <option>Cumplimiento</option>
                    <option>IMSS</option>
                    <option>Mejores Prácticas</option>
                </select>
            </div>

            <div class="guides-grid">
                ${getGuideCard('RESICO: Todo lo que debes saber', 'https://placehold.co/600x400/3b82f6/ffffff?text=Fiscal', 'Fiscal')}
                ${getGuideCard('Manual de IDSE para empresas', 'https://placehold.co/600x400/10b981/ffffff?text=IMSS', 'Cumplimiento')}
                ${getGuideCard('Claves para un cálculo de aguinaldo perfecto', 'https://placehold.co/600x400/8b5cf6/ffffff?text=Nómina', 'Mejores Prácticas')}
            </div>
        </div>
    `;
}

function getGuideCard(title, imageUrl, category) {
    return `
        <div class="guide-card" onclick="openGuideModal('${title}')">
            <img src="${imageUrl}" alt="Portada de la guía ${title}">
            <div class="content">
                <p class="category">${category}</p>
                <h4>${title}</h4>
                <p>Aprende sobre los conceptos clave de la nómina en México con nuestros expertos.</p>
                <span class="download-link">Descargar Guía <i class="fas fa-arrow-right ml-1"></i></span>
            </div>
        </div>
    `;
}

function getPlatformPageTemplate(platform) {
    const platformNames = {
        'saas': 'Beepayroll SaaS',
        'erp': 'Beepayroll ERP',
        'app': 'Beepayroll App'
    };
    
    return `
        <div>
            <button id="back-to-home" class="back-button">
                <i class="fas fa-arrow-left"></i> Volver a Academy Home
            </button>
            <div class="platform-layout">
                <!-- Sidebar -->
                <aside class="sidebar">
                    <!-- Navegación dinámica de Notion -->
                    <div class="sidebar-navigation">
                        <!-- Aquí se cargará la navegación desde la API -->
                    </div>
                </aside>
                <!-- Content -->
                <div id="platform-content-area" class="content-area">
                    <!-- ${platformNames[platform]} content will be rendered here -->
                </div>
            </div>
        </div>
    `;
}

function getPlatformContentTemplate(platform) {
    const platformNames = {
        'saas': 'Beepayroll SaaS',
        'erp': 'Beepayroll ERP',
        'app': 'Beepayroll App'
    };
    
    return `
        <div>
            <!-- Buscador y Filtros -->
            <div class="search-filters">
                <div class="filters-row">
                    <!-- Buscador de palabras clave -->
                    <div class="search-input-container">
                        <div class="search-input">
                            <input 
                                type="search" 
                                id="search-docs" 
                                placeholder="Buscar en la documentación de ${platformNames[platform]}... (Presiona Enter)" 
                                value="${appState.searchQuery}"
                            >
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    
                    <!-- Botón para limpiar filtros -->
                    <div class="clear-filters">
                        <button id="clear-filters-btn" class="clear-filters-btn" title="Limpiar filtros">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Resultados de búsqueda -->
                <div id="search-results" class="search-results-info">
                    ${appState.searchQuery ? 
                        `<span class="filters-applied">Búsqueda: "${appState.searchQuery}"</span>` : 
                        `Mostrando toda la documentación disponible de ${platformNames[platform]}`
                    }
                </div>
            </div>

            <!-- Contenido de la documentación -->
            <div id="content-area" class="documentation-content">
                <!-- Aquí se cargará el contenido dinámico desde la API -->
            </div>
        </div>
    `;
}

// Función para convertir enlaces de YouTube en videos incrustados
function convertYouTubeLinksToEmbeds(text) {
    if (!text) return text;
    
    // Regex para detectar enlaces de YouTube
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    
    return text.replace(youtubeRegex, (match, protocol, www, domain, videoId) => {
        return `<div class="youtube-embed-container">
            <iframe 
                width="100%" 
                height="315" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                onerror="this.parentElement.classList.add('failed')"
                onload="this.parentElement.classList.remove('failed')">
            </iframe>
        </div>`;
    });
}

// Función para renderizar bloques de Notion a HTML (integrada desde script.js)
function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) {
        return '<p>No hay contenido disponible.</p>';
    }
    
    let html = '';
    blocks.forEach(block => {
        try {
            switch (block.type) {
                case 'heading_1':
                    const h1Text = block.heading_1?.rich_text?.[0]?.plain_text || '';
                    if (h1Text) html += `<h1>${h1Text}</h1>`;
                    break;
                case 'heading_2':
                    const h2Text = block.heading_2?.rich_text?.[0]?.plain_text || '';
                    if (h2Text) html += `<h2>${h2Text}</h2>`;
                    break;
                case 'heading_3':
                    const h3Text = block.heading_3?.rich_text?.[0]?.plain_text || '';
                    if (h3Text) html += `<h3>${h3Text}</h3>`;
                    break;
                case 'paragraph':
                    const paragraphText = block.paragraph?.rich_text?.map(t => t.plain_text || '').join('') || '';
                    if (paragraphText) html += `<p>${convertYouTubeLinksToEmbeds(paragraphText)}</p>`;
                    break;
                case 'bulleted_list_item':
                    const bulletText = block.bulleted_list_item?.rich_text?.map(t => t.plain_text || '').join('') || '';
                    if (bulletText) html += `<ul><li>${convertYouTubeLinksToEmbeds(bulletText)}</li></ul>`;
                    break;
                case 'numbered_list_item':
                    const numberedText = block.numbered_list_item?.rich_text?.map(t => t.plain_text || '').join('') || '';
                    if (numberedText) html += `<ol><li>${convertYouTubeLinksToEmbeds(numberedText)}</li></ol>`;
                    break;
                case 'image':
                    const imgSrc = block.image?.type === 'external' ? block.image.external.url : block.image.file?.url;
                    if (imgSrc) html += `<img src="${imgSrc}" alt="Imagen de la documentación" onerror="this.style.display='none'">`;
                    break;
                case 'video':
                    const videoUrl = block.video?.external?.url || block.video?.file?.url;
                    if (videoUrl && videoUrl.includes('youtube.com')) {
                        try {
                            const videoId = new URL(videoUrl).searchParams.get('v');
                            if (videoId) {
                                html += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                            }
                        } catch (urlError) {
                            // Error al procesar URL de YouTube - silenciosamente ignorado
                        }
                    }
                    break;
                case 'divider':
                    html += `<hr class="notion-divider">`;
                    break;
                case 'file':
                    const fileUrl = block.file?.type === 'external' ? block.file.external.url : block.file.file?.url;
                    const fileName = block.file?.name || 'archivo';
                    if (fileUrl) html += `<a href="${fileUrl}" target="_blank" class="download-link">Descargar ${fileName}</a>`;
                    break;
                default:
                    // Bloque no soportado - silenciosamente ignorado
                    break;
            }
        } catch (blockError) {
            // Error al procesar bloque - silenciosamente ignorado
        }
    });
    return html || '<p>No hay contenido disponible.</p>';
}

// Función para cargar la navegación desde la API por plataforma
async function loadNavigation(platform = 'saas') {
    try {
        // Verificar si estamos en un entorno de archivo local
        if (window.location.protocol === 'file:') {
            throw new Error('Ejecutando desde archivo local - modo demo activado');
        }
        
        const response = await fetch(`/api/navigation/${platform}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const navData = await response.json();
        
        let navHtml = '';
        for (const category in navData) {
            navHtml += `<ul class="category-section">`;
            navData[category].forEach(page => {
                navHtml += `<li><a href="#" data-slug="${page.slug}" data-platform="${platform}">${page.title}</a></li>`;
            });
            navHtml += `</ul>`;
        }
        
        // Actualizar el sidebar con la navegación de Notion
        const sidebarNav = document.querySelector('.sidebar-navigation');
        if (sidebarNav) {
            sidebarNav.innerHTML = navHtml;
            
            // Añadir event listeners a los links (basado en script.js)
            const allLinks = Array.from(sidebarNav.querySelectorAll('a'));
            allLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const slug = e.target.getAttribute('data-slug');
                    const platform = e.target.getAttribute('data-platform');
                    // Actualiza la URL sin recargar la página (como en script.js)
                    history.pushState({ slug, platform }, '', `?article=${slug}&platform=${platform}`);
                    loadPage(slug, platform);
                });
            });
        }
        

        
    } catch (error) {
        // Modo demo activado silenciosamente
        
        // Mostrar mensaje informativo cuando no se puede conectar a la API
        const sidebarNav = document.querySelector('.sidebar-navigation');
        if (sidebarNav) {
            sidebarNav.innerHTML = `
                <div class="demo-mode">
                    <h4>
                        <i class="fas fa-exclamation-triangle"></i>
                        Modo Demo
                    </h4>
                    <p>
                        Ejecutando en modo demo. Conecta la API de Notion para ver la documentación real.
                    </p>
                    <ul class="demo-articles">
                        <li><a href="#" onclick="loadDemoContent('nomina')">• Nómina</a></li>
                        <li><a href="#" onclick="loadDemoContent('kardex')">• Kardex</a></li>
                        <li><a href="#" onclick="loadDemoContent('timbrado')">• Timbrado</a></li>
                        <li><a href="#" onclick="loadDemoContent('reportes')">• Reportes</a></li>
                        <li><a href="#" onclick="loadDemoContent('configuracion')">• Configuración</a></li>
                    </ul>
                </div>
            `;
        }
        
        // Actualizar categorías del selector con contenido de demo

    }
}

// Función para cargar una página específica (basada en script.js)
async function loadPage(slug, platform = appState.currentPlatform) {
    if (!slug) {
        // Cargar el primer artículo (order = 1) como estado inicial
        try {
            // Verificar si estamos en un entorno de archivo local
            if (window.location.protocol === 'file:') {
                throw new Error('Modo demo - API no disponible');
            }
            
            const response = await fetch(`/api/navigation/${platform}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const navData = await response.json();
            
            // Encontrar el primer artículo (order = 1)
            let firstArticle = null;
            for (const category in navData) {
                if (navData[category].length > 0) {
                    firstArticle = navData[category][0];
                    break;
                }
            }
            
            if (firstArticle) {
                // Cargar el primer artículo
                loadPage(firstArticle.slug, platform);
                return;
            } else {
                // Fallback si no hay artículos
                showNoArticlesMessage();
                return;
            }
            
        } catch (error) {
            // Modo demo activado para carga inicial
            loadDemoContent('nomina');
            return;
        }
    }

    try {
        // Verificar si estamos en un entorno de archivo local
        if (window.location.protocol === 'file:') {
            throw new Error('Modo demo - API no disponible');
        }
        
        const response = await fetch(`/api/page/${platform}/${slug}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blocks = await response.json();
        const contentHtml = renderBlocks(blocks);
        document.getElementById('content-area').innerHTML = contentHtml;
    } catch (error) {
        // Modo demo activado para página
        // Intentar cargar contenido de demo basado en el slug
        const demoCategory = getDemoCategoryFromSlug(slug);
        if (demoCategory) {
            loadDemoContent(demoCategory);
        } else {
            document.getElementById('content-area').innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Contenido no disponible</h3>
                    <p>Este artículo no está disponible en modo demo.</p>
                </div>
            `;
        }
    }
}



// Función auxiliar para obtener categoría de demo desde slug
function getDemoCategoryFromSlug(slug) {
    const slugToCategory = {
        'nomina': 'nomina',
        'kardex': 'kardex',
        'timbrado': 'timbrado',
        'reportes': 'reportes',
        'configuracion': 'configuracion',
        'configuración': 'configuracion'
    };
    return slugToCategory[slug] || null;
}

// Función para mostrar resultados de búsqueda de demo
function showDemoSearchResults(query) {
    const demoContent = {
        'nomina': { title: 'Cálculo de Nómina', excerpt: 'Guía completa para el cálculo de nómina' },
        'kardex': { title: 'Configuración del Kardex', excerpt: 'Configuración del kardex de empleados' },
        'timbrado': { title: 'Timbrado de Nómina', excerpt: 'Proceso de timbrado fiscal' },
        'reportes': { title: 'Generación de Reportes', excerpt: 'Creación de reportes personalizados' },
        'configuracion': { title: 'Configuración de la Empresa', excerpt: 'Parámetros y configuración inicial' }
    };

    const results = Object.entries(demoContent).filter(([key, content]) => 
        content.title.toLowerCase().includes(query.toLowerCase()) || 
        content.excerpt.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
        let resultsHtml = '<div class="search-results">';
        results.forEach(([key, content]) => {
            resultsHtml += `
                <div class="search-result-item" onclick="loadDemoContent('${key}')">
                    <h4>${content.title}</h4>
                    <p>${content.excerpt}</p>
                </div>
            `;
        });
        resultsHtml += '</div>';
        document.getElementById('content-area').innerHTML = resultsHtml;
    } else {
        document.getElementById('content-area').innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda.</p>
            </div>
        `;
    }
}

// Función para cargar contenido de demostración cuando no hay API
function loadDemoContent(category) {
    const demoContent = {
        'nomina': {
            title: 'Cálculo de Nómina',
            content: `
                <h1>Cálculo de Nómina</h1>
                <p>El cálculo correcto de la nómina es esencial para cumplir con la ley y mantener a tus empleados satisfechos.</p>
                
                <h2>Tipos de Percepciones</h2>
                <p>Las percepciones incluyen salario base, bonos, comisiones, horas extra y prestaciones. Cada una tiene diferentes tratamientos fiscales.</p>
                
                <h2>Deducciones Obligatorias</h2>
                <p>Las deducciones obligatorias incluyen ISR, IMSS, INFONAVIT y otros descuentos legales que se calculan automáticamente.</p>
                
                <div class="info-box">
                    <p>
                        <i class="fas fa-info-circle"></i>
                        Este es contenido de demostración. Conecta la API de Notion para ver la documentación real.
                    </p>
                </div>
            `
        },
        'kardex': {
            title: 'Configuración del Kardex',
            content: `
                <h1>Configuración del Kardex de Empleados</h1>
                <p>El kardex de empleados es fundamental para mantener un historial completo de cada trabajador.</p>
                
                <h2>Configuración Básica</h2>
                <p>Ve a Configuración > Empleados > Kardex y establece los campos obligatorios como fecha de ingreso, tipo de contrato y departamento.</p>
                
                <h2>Campos Personalizados</h2>
                <p>Puedes agregar campos personalizados según las necesidades de tu empresa, como certificaciones, habilidades especiales, etc.</p>
                
                <div class="info-box">
                    <p>
                        <i class="fas fa-info-circle"></i>
                        Este es contenido de demostración. Conecta la API de Notion para ver la documentación real.
                    </p>
                </div>
            `
        },
        'timbrado': {
            title: 'Timbrado de Nómina',
            content: `
                <h1>Cómo Realizar el Timbrado de Nómina</h1>
                <p>El proceso de timbrado es el paso final y más crucial para asegurar el cumplimiento fiscal de tu nómina.</p>
                
                <h2>Paso 1: Validar la Prenómina</h2>
                <p>Antes de timbrar, asegúrate de que todos los cálculos en la sección de prenómina sean correctos. Revisa las percepciones, deducciones y el neto a pagar de cada empleado.</p>
                
                <h2>Paso 2: Ejecutar el Timbrado</h2>
                <p>Navega a la pestaña de "Timbrado" y haz clic en el botón "Timbrar Nómina". El sistema se conectará con el SAT para certificar cada recibo.</p>
                
                <div class="info-box">
                    <p>
                        <i class="fas fa-info-circle"></i>
                        Este es contenido de demostración. Conecta la API de Notion para ver la documentación real.
                    </p>
                </div>
            `
        },
        'reportes': {
            title: 'Generación de Reportes',
            content: `
                <h1>Generación de Reportes Personalizados</h1>
                <p>Los reportes personalizados te permiten analizar datos específicos de tu nómina y tomar decisiones informadas.</p>
                
                <h2>Constructor de Reportes</h2>
                <p>Utiliza nuestro constructor visual para crear reportes personalizados arrastrando y soltando campos, filtros y agrupaciones.</p>
                
                <h2>Exportación de Datos</h2>
                <p>Exporta tus reportes en múltiples formatos: PDF, Excel, CSV o envíalos directamente por email a los destinatarios autorizados.</p>
                
                <div class="info-box">
                    <p>
                        <i class="fas fa-info-circle"></i>
                        Este es contenido de demostración. Conecta la API de Notion para ver la documentación real.
                    </p>
                </div>
            `
        },
        'configuracion': {
            title: 'Configuración de la Empresa',
            content: `
                <h1>Configuración de la Empresa y Parámetros</h1>
                <p>La configuración inicial de tu empresa es crucial para el funcionamiento correcto de la plataforma.</p>
                
                <h2>Datos Fiscales</h2>
                <p>Configura tu RFC, régimen fiscal, dirección fiscal y otros datos obligatorios para la facturación y cumplimiento fiscal.</p>
                
                <h2>Parámetros de Nómina</h2>
                <p>Establece las fechas de pago, períodos de nómina, tipos de contrato y otras configuraciones específicas de tu empresa.</p>
                
                <div class="info-box">
                    <p>
                        <i class="fas fa-info-circle"></i>
                        Este es contenido de demostración. Conecta la API de Notion para ver la documentación real.
                    </p>
                </div>
            `
        }
    };

    if (demoContent[category]) {
        document.getElementById('content-area').innerHTML = `
            <div class="demo-content">
                ${demoContent[category].content}
            </div>
        `;
    }
}





// Función para limpiar todos los filtros
function clearAllFilters() {
    // Limpiar el campo de búsqueda
    const searchInput = document.getElementById('search-docs');
    if (searchInput) {
        searchInput.value = '';
        appState.searchQuery = '';
    }
    

    
    // Mostrar la página de bienvenida
    loadPage();
    
    // Actualizar la información de filtros aplicados
    const searchResultsInfo = document.getElementById('search-results');
    if (searchResultsInfo) {
        searchResultsInfo.innerHTML = 'Mostrando toda la documentación disponible';
    }
}

// Función para mostrar mensaje cuando no hay artículos
function showNoArticlesMessage() {
    document.getElementById('content-area').innerHTML = `
        <div class="no-articles">
            <i class="fas fa-folder-open"></i>
            <h3>No hay artículos disponibles</h3>
            <p>No se encontraron artículos en la documentación. Por favor, verifica la configuración de Notion.</p>
        </div>
    `;
}

// --- RENDER & LOGIC ---

function render() {
    if (appState.currentPage === 'home') {
        mainContentEl.innerHTML = getHomePageTemplate();
        addHomeListeners();
    } else if (['saas', 'erp', 'app'].includes(appState.currentPage)) {
        mainContentEl.innerHTML = getPlatformPageTemplate(appState.currentPage);
        document.getElementById('platform-content-area').innerHTML = getPlatformContentTemplate(appState.currentPage);
        addPlatformListeners();
    }
}

function addHomeListeners() {
    document.getElementById('saas-card').addEventListener('click', () => {
        appState.currentPage = 'saas';
        appState.currentPlatform = 'saas';
        render();
    });
    document.getElementById('erp-card').addEventListener('click', () => {
        appState.currentPage = 'erp';
        appState.currentPlatform = 'erp';
        render();
    });
    document.getElementById('app-card').addEventListener('click', () => {
        appState.currentPage = 'app';
        appState.currentPlatform = 'app';
        render();
    });
    document.querySelectorAll('.guide-card').forEach(card => {
        card.addEventListener('click', () => {
            modalsContainerEl.innerHTML = getGuideModalTemplate();
            addModalListeners(document.getElementById('guide-modal'));
        });
    });
}

function addPlatformListeners() {
    document.getElementById('back-to-home').addEventListener('click', (e) => {
        e.preventDefault();
        appState.currentPage = 'home';
        render();
    });

    // Event listeners para búsqueda y filtros (basado en script.js)
    const searchInput = document.getElementById('search-docs');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        // Buscar solo cuando se presiona Enter
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                appState.searchQuery = query;
                
                if (query.length < 3) {
                    // Si la búsqueda es muy corta, mostrar la página de bienvenida
                    loadPage();
                    return;
                }
                
                try {
                    // Verificar si estamos en un entorno de archivo local
                    if (window.location.protocol === 'file:') {
                        throw new Error('Modo demo - API no disponible');
                    }
                    
                    const response = await fetch(`/api/search/${appState.currentPlatform}?q=${encodeURIComponent(query)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const results = await response.json();
                    
                    if (results.length > 0) {
                        let resultsHtml = '<div class="search-results">';
                        resultsHtml += `<h3 class="results-title">Resultados de búsqueda para: "${query}" (${results.length} encontrados)</h3>`;
                        results.forEach(page => {
                            const matchTypeText = page.matchType === 'contenido' ? 'Encontrado en contenido' :
                                                 page.matchType === 'título' ? 'Encontrado en título' : 'Encontrado en categoría';
                            
                            resultsHtml += `
                                <div class="search-result-item" onclick="loadPage('${page.slug}', '${appState.currentPlatform}')">
                                    <div class="result-header">
                                        <h4>${page.title}</h4>
                                        <span class="match-type ${page.matchType}">${matchTypeText}</span>
                                    </div>
                                    <p class="result-category">Categoría: ${page.category}</p>
                                    ${page.contentPreview ? `<p class="result-preview">${page.contentPreview}</p>` : ''}
                                </div>
                            `;
                        });
                        resultsHtml += '</div>';
                        document.getElementById('content-area').innerHTML = resultsHtml;
                    } else {
                        document.getElementById('content-area').innerHTML = `
                            <div class="no-results">
                                <i class="fas fa-search"></i>
                                <h3>No se encontraron resultados</h3>
                                <p>No se encontraron resultados para "${query}". Intenta con otros términos de búsqueda.</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    // Modo demo activado para búsqueda
                    showDemoSearchResults(query);
                }
            }
        });
        
        // Limpiar búsqueda cuando se borre el contenido
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.length === 0) {
                appState.searchQuery = '';
                loadPage(); // Mostrar página de bienvenida
            }
        });
    }
    


            // Botón para limpiar filtros
            const clearFiltersBtn = document.getElementById('clear-filters-btn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => {
                    clearAllFilters();
                });
            }

    // Cargar la navegación de Notion al inicializar
    loadNavigation(appState.currentPlatform);
    
    // Cargar la página de bienvenida por defecto
    loadPage();
    
    // Verificar si hay un artículo en la URL al cargar (como en script.js)
    const params = new URLSearchParams(window.location.search);
    const initialSlug = params.get('article');
    const initialPlatform = params.get('platform');
    if (initialSlug) {
        loadPage(initialSlug, initialPlatform || 'saas');
    }
}

function addModalListeners(modalEl) {
     modalEl.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            modalEl.remove();
        });
     });
}

// Funciones de modal
function getErpModalTemplate() {
    return `
        <div id="erp-modal" class="modal">
            <div class="modal-content">
                <h2>Acceso Restringido</h2>
                <p>El contenido del ERP es exclusivo para usuarios autorizados. Por favor, ingresa tu correo para solicitar acceso. Nuestro equipo validará tu solicitud.</p>
                <div>
                     <input type="email" placeholder="tu-correo@empresa.com">
                     <button class="primary">Solicitar Acceso</button>
                     <button data-close-modal="erp-modal" class="close">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

function getAppModalTemplate() {
    return `
        <div id="app-modal" class="modal">
            <div class="modal-content">
                <h2>Beepayroll App</h2>
                <p>Nuestra aplicación móvil te permite gestionar la nómina desde cualquier lugar. Descarga la app y accede a todas las funcionalidades principales.</p>
                <div>
                     <button class="primary" style="background-color: #10b981;">
                         <i class="fab fa-google-play mr-2"></i> Google Play
                     </button>
                     <button class="primary" style="background-color: #000;">
                         <i class="fab fa-apple mr-2"></i> App Store
                     </button>
                     <button data-close-modal="app-modal" class="close">Cerrar</button>
                </div>
            </div>
        </div>
    `;
}

function getGuideModalTemplate() {
    return `
         <div id="guide-modal" class="modal">
            <div class="modal-content">
                <h2>Descarga la Guía</h2>
                <p>Completa tus datos para recibir la guía "RESICO: Todo lo que debes saber" en formato PDF.</p>
                <div>
                    <input type="text" placeholder="Nombre *">
                    <input type="text" placeholder="Apellido *">
                    <input type="email" placeholder="Correo de trabajo *">
                    <input type="text" placeholder="Cargo">
                    <input type="text" placeholder="Empresa">
                     <select>
                        <option>Número de empleados</option>
                        <option>1-50</option>
                        <option>51-100</option>
                        <option>101-250</option>
                        <option>251+</option>
                    </select>
                </div>
                <div>
                     <button class="primary">Descargar Guía (PDF)</button>
                     <button data-close-modal="guide-modal" class="close">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

// Función para abrir modal de guía
function openGuideModal(title) {
    modalsContainerEl.innerHTML = getGuideModalTemplate();
    addModalListeners(document.getElementById('guide-modal'));
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    render();
});
