# DOCNT - Sistema de Gestión Docente Personal

Plataforma web para que un docente pueda planificar y organizar clases, gestionar archivos, y generar certámenes.

## Características

- **Calendario Académico**: Planifica clases, evaluaciones y eventos con vista mensual/semanal
- **Gestión de Cursos**: Organiza cursos por periodos con secciones y horarios
- **Archivos y Notas**: Adjunta archivos y notas a cada evento o curso
- **Generador de Certámenes**: Crea evaluaciones con banco de preguntas
- **Diseño Moderno**: Interfaz elegante con sidebar y responsive design

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Backend**: Server Actions, API Routes
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth.js v5
- **Validación**: Zod, React Hook Form

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas principales protegidas
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Sidebar, header
│   ├── calendar/         # Componentes del calendario
│   ├── courses/          # Componentes de cursos
│   └── exams/            # Componentes de exámenes
├── lib/                  # Lógica de negocio
│   ├── db/               # Prisma client
│   ├── actions/          # Server Actions
│   ├── services/         # Servicios de dominio
│   ├── validations/      # Esquemas Zod
│   └── utils/            # Utilidades
├── types/                # TypeScript types
└── config/               # Configuraciones
```

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd docnt
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```

   Editar `.env.local` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/docnt"
   NEXTAUTH_SECRET="tu-secreto-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Ejecutar migraciones de Prisma**
   ```bash
   npx prisma migrate dev
   ```

   O en producción:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Módulos Implementados

### ✅ Fundamentos (Fase 1)
- [x] Next.js 14 con App Router
- [x] TypeScript configurado
- [x] Tailwind CSS + shadcn/ui
- [x] Prisma + PostgreSQL schema
- [x] NextAuth.js v5 configuración
- [x] Layout base con sidebar

### ✅ Cursos y Secciones (Fase 2)
- [x] Listado de cursos
- [x] Vista detallada de curso
- [x] Server Actions para CRUD

### ✅ Calendario (Fase 3)
- [x] Vista mensual
- [x] Server Actions para eventos
- [x] Integración con cursos

### ✅ Módulo de Asistencia
- [x] Integración con portal UST
- [x] Vista de acceso directo
- [x] Historial de actividad

### 🚧 Pendiente
- [ ] Formularios de creación/edición
- [ ] Sistema de archivos y storage
- [ ] Generador de certámenes
- [ ] Login funcional con OAuth

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linter
npm run lint

# Prisma
npx prisma studio          # UI de base de datos
npx prisma migrate dev     # Crear migración
npx prisma generate        # Generar client
```

## Deployment

### Vercel (Recomendado)

1. Conectar tu repositorio a Vercel
2. Configurar las variables de entorno
3. Deploy automático en cada push a main

### Base de Datos

Usar **Vercel Postgres** para producción:
- Plan free disponible
- Conexión directa desde Prisma
- Backup automático

## Contribuir

Este es un proyecto personal. Si quieres contribuir:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles
