// server.js
require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client');

const app = express();
const port = 3000;

// Inicializa el cliente de Notion
const notion = new Client({ auth: process.env.NOTION_KEY });

// IDs de las bases de datos para cada plataforma
const saasDatabaseId = process.env.NOTION_DATABASE_SAAS_ID;
const erpDatabaseId = process.env.NOTION_DATABASE_ERP_ID;
const appDatabaseId = process.env.NOTION_DATABASE_APP_ID;

// Sirve los archivos estáticos del frontend
app.use(express.static('public'));

// ENDPOINT 1: Obtener la estructura de navegación por plataforma
app.get('/api/navigation/:platform', async (req, res) => {
    const { platform } = req.params;
    
    // Determinar qué base de datos usar según la plataforma
    let databaseId;
    switch (platform) {
        case 'saas':
            databaseId = saasDatabaseId;
            break;
        case 'erp':
            databaseId = erpDatabaseId;
            break;
        case 'app':
            databaseId = appDatabaseId;
            break;
        default:
            return res.status(400).json({ error: 'Plataforma no válida' });
    }
    
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                { property: 'order', direction: 'ascending' },
                { property: 'category', direction: 'ascending' },
            ],
        });

        // Línea añadida para depurar en la terminal
        //console.log('Respuesta cruda de Notion:', JSON.stringify(response, null, 2));

        const navigationData = response.results.reduce((acc, page) => {
            const categoryProperty = page.properties.category?.select;
            const titleProperty = page.properties.title?.title?.[0];
            const slugProperty = page.properties.slug?.rich_text?.[0];

            // Verificar que todas las propiedades necesarias existan y no estén vacías
            if (categoryProperty && titleProperty && slugProperty && 
                titleProperty.plain_text && slugProperty.plain_text) {
                
                const category = categoryProperty.name;
                const title = titleProperty.plain_text;
                const slug = slugProperty.plain_text;

                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push({ title, slug });
            }
            // Si alguna propiedad está vacía o no existe, ignoramos esta página
            return acc;
        }, {});

        res.json(navigationData);
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ error: 'Failed to fetch navigation structure' });
    }
});

// ENDPOINT 2: Obtener el contenido de una página por su SLUG y plataforma
app.get('/api/page/:platform/:slug', async (req, res) => {
    const { platform, slug } = req.params;
    
    // Determinar qué base de datos usar según la plataforma
    let databaseId;
    switch (platform) {
        case 'saas':
            databaseId = saasDatabaseId;
            break;
        case 'erp':
            databaseId = erpDatabaseId;
            break;
        case 'app':
            databaseId = appDatabaseId;
            break;
        default:
            return res.status(400).json({ error: 'Plataforma no válida' });
    }
    
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                // CAMBIADO: 'Slug' a 'slug'
                property: 'slug',
                rich_text: {
                    equals: slug,
                },
            },
        });

        if (response.results.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const pageId = response.results[0].id;

        const blocksResponse = await notion.blocks.children.list({
            block_id: pageId,
        });

        res.json(blocksResponse.results);
    } catch (error) {
        console.error(`Error fetching page for slug ${slug}:`, error);
        res.status(500).json({ error: 'Failed to fetch page content' });
    }
});

// ENDPOINT 3: Búsqueda en contenido completo por plataforma
app.get('/api/search/:platform', async (req, res) => {
    const { platform } = req.params;
    const query = req.query.q;
    
    if (!query || query.trim().length < 2) {
        return res.json([]);
    }
    
    // Determinar qué base de datos usar según la plataforma
    let databaseId;
    switch (platform) {
        case 'saas':
            databaseId = saasDatabaseId;
            break;
        case 'erp':
            databaseId = erpDatabaseId;
            break;
        case 'app':
            databaseId = appDatabaseId;
            break;
        default:
            return res.status(400).json({ error: 'Plataforma no válida' });
    }

    try {
        // Obtener todas las páginas de la base de datos
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                { property: 'order', direction: 'ascending' },
                { property: 'category', direction: 'ascending' },
            ],
        });

        const searchResults = [];
        const queryLower = query.toLowerCase();

        // Buscar en cada página
        for (const page of response.results) {
            const title = page.properties.title?.title?.[0]?.plain_text || '';
            const category = page.properties.category?.select?.name || '';
            const slug = page.properties.slug?.rich_text?.[0]?.plain_text || '';
            
            let contentMatch = false;
            let contentPreview = '';

            // Buscar en el contenido del artículo
            try {
                const blocksResponse = await notion.blocks.children.list({
                    block_id: page.id,
                });

                const contentText = blocksResponse.results
                    .map(block => {
                        switch (block.type) {
                            case 'paragraph':
                                return block.paragraph?.rich_text?.map(t => t.plain_text).join(' ') || '';
                            case 'heading_1':
                            case 'heading_2':
                            case 'heading_3':
                                return block[block.type]?.rich_text?.map(t => t.plain_text).join(' ') || '';
                            case 'bulleted_list_item':
                                return block.bulleted_list_item?.rich_text?.map(t => t.plain_text).join(' ') || '';
                            case 'numbered_list_item':
                                return block.numbered_list_item?.rich_text?.map(t => t.plain_text).join(' ') || '';
                            default:
                                return '';
                        }
                    })
                    .join(' ')
                    .toLowerCase();

                // Verificar si la consulta aparece en el contenido
                if (contentText.includes(queryLower)) {
                    contentMatch = true;
                    // Crear un preview del contenido
                    const words = contentText.split(' ');
                    const queryIndex = words.findIndex(word => word.includes(queryLower));
                    if (queryIndex !== -1) {
                        const start = Math.max(0, queryIndex - 5);
                        const end = Math.min(words.length, queryIndex + 10);
                        contentPreview = words.slice(start, end).join(' ');
                        if (start > 0) contentPreview = '...' + contentPreview;
                        if (end < words.length) contentPreview = contentPreview + '...';
                    }
                }
                    } catch (blockError) {
            // Error silencioso al obtener bloques de la página
        }

            // Incluir en resultados si hay match en título, categoría o contenido
            if (title.toLowerCase().includes(queryLower) || 
                category.toLowerCase().includes(queryLower) || 
                contentMatch) {
                
                searchResults.push({
                    title: title || 'Sin título',
                    slug: slug || 'sin-slug',
                    category: category || 'Sin categoría',
                    contentPreview: contentPreview || '',
                    matchType: contentMatch ? 'contenido' : 
                               title.toLowerCase().includes(queryLower) ? 'título' : 'categoría'
                });
            }
        }

        res.json(searchResults);

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

app.listen(port, () => {
    console.log(`Beepayroll Academy server listening at http://localhost:${port}`);
});