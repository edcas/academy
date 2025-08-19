# BeePayroll Academy

Sistema de documentación multi-plataforma integrado con Notion API.

## 🚀 Características

- **3 Plataformas Independientes**: SaaS, ERP y App
- **Búsqueda en Contenido Completo**: Título, categoría y contenido del artículo
- **Soporte para YouTube**: Videos incrustados automáticamente
- **Diseño Responsive**: Optimizado para todos los dispositivos
- **Integración con Notion**: API completa para gestión de contenido

## 📁 Estructura del Proyecto

```
Academy/
├── public/
│   ├── index.html          # Página principal (anteriormente academy.html)
│   ├── script.js           # Lógica frontend (anteriormente academy.js)
│   └── style.css           # Estilos CSS (anteriormente academy.css)
├── server.js               # Servidor Express con API de Notion
├── .env                    # Variables de entorno (crear basado en env.example)
├── env.example             # Ejemplo de configuración
└── README.md               # Este archivo
```

## 🔧 Configuración

### 1. Variables de Entorno
Crear archivo `.env` basado en `env.example`:

```bash
# Configuración de Notion API
NOTION_KEY=tu_token_de_integracion

# IDs de las bases de datos para cada plataforma
NOTION_DATABASE_SAAS_ID=id_base_datos_saas
NOTION_DATABASE_ERP_ID=id_base_datos_erp
NOTION_DATABASE_APP_ID=id_base_datos_app
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar Servidor
```bash
node server.js
```

El servidor estará disponible en: `http://localhost:3000`

## 🌐 Endpoints de la API

### Navegación por Plataforma
- `GET /api/navigation/:platform` - Obtener estructura de navegación
  - `:platform` puede ser: `saas`, `erp`, o `app`

### Contenido de Páginas
- `GET /api/page/:platform/:slug` - Obtener contenido de una página
  - `:platform` - Plataforma (saas/erp/app)
  - `:slug` - Identificador único de la página

### Búsqueda en Contenido
- `GET /api/search/:platform?q=query` - Buscar en contenido completo
  - `:platform` - Plataforma (saas/erp/app)
  - `q` - Término de búsqueda

## 🎨 Funcionalidades Frontend

- **Página Principal**: 3 tarjetas para cada plataforma
- **Navegación Izquierda**: Menú dinámico por plataforma
- **Búsqueda Avanzada**: En tiempo real con preview de contenido
- **Soporte Multimedia**: Imágenes, videos de YouTube, archivos
- **Diseño Responsive**: Adaptable a todos los tamaños de pantalla

## 🔄 Migración Completada

- ✅ **Eliminados**: `index.html`, `script.js`, `style.css` (prototipo anterior)
- ✅ **Renombrados**: `academy.html` → `index.html`, `academy.css` → `style.css`, `academy.js` → `script.js`
- ✅ **Servidor**: Configurado para servir `index.html` por defecto
- ✅ **URLs**: `localhost:3000` abre directamente la Academy

## 🚨 Nota Importante

Este proyecto requiere que las bases de datos de Notion tengan la siguiente estructura:
- `title` - Título del artículo
- `slug` - Identificador único
- `category` - Categoría del artículo
- `order` - Orden de visualización

## 📞 Soporte

Para problemas técnicos o implementación, contactar al equipo de desarrollo frontend.
