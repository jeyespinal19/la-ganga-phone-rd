<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📱 La Ganga Phone RD

> Plataforma de subastas en vivo para teléfonos móviles con sistema de pujas en tiempo real

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39-3ecf8e)](https://supabase.com/)

## ✨ Características

### 🎯 Para Usuarios
- **Subastas en Tiempo Real**: Sistema de pujas con actualización instantánea
- **Temporizadores en Vivo**: Cuenta regresiva precisa para cada subasta
- **Búsqueda y Filtros**: Encuentra productos por nombre, marca, precio y tiempo
- **Modo Oscuro/Claro**: Interfaz adaptable a tus preferencias
- **Responsive Design**: Optimizado para móviles, tablets y desktop
- **PWA Ready**: Instala la app en tu dispositivo
- **Notificaciones**: Alertas push cuando te superen en una puja o subastas próximas a terminar
- **Autenticación**: Registro e inicio de sesión seguro con Supabase Auth

### 🛠️ Para Administradores
- **Panel de Control**: Dashboard completo con analytics
- **Gestión de Productos**: Crear, editar y eliminar subastas
- **Gestión de Usuarios**: Ver estadísticas y clientes ganadores
- **Exportación de Datos**: Descarga reportes en CSV
- **Simulación de Pujas**: Bot automático para testing
- **Historial de Pujas**: Seguimiento completo de cada subasta
- **Drag & Drop**: Reordena productos en el inventario

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta de Supabase (opcional, incluye modo mock)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo-url>
   cd La-Ganga-Phone-RD-main
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` y agrega tus credenciales:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en `http://localhost:3000`

### Build para Producción

```bash
npm run build
npm run preview  # Vista previa de la build
```

## 📦 Estructura del Proyecto

```
La-Ganga-Phone-RD-main/
├── components/           # Componentes React
│   ├── AdminDashboard.tsx
│   ├── ProductCard.tsx
│   ├── FilterPanel.tsx
│   ├── ErrorBoundary.tsx
│   └── ...
├── services/            # Lógica de negocio
│   ├── auctionService.ts
│   ├── supabase.ts
│   └── mockSocket.ts
├── utils/               # Utilidades
│   └── exportUtils.ts
├── types.ts             # Definiciones TypeScript
├── constants.ts         # Constantes de la app
├── App.tsx              # Componente principal
└── vite.config.ts       # Configuración de Vite
```

## 🗄️ Base de Datos (Supabase)

La aplicación utiliza un esquema completo en Supabase con RLS (Row Level Security) para proteger los datos.

### Tablas Principales

**products**
Almacena las subastas activas e históricas.
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  specs TEXT,
  current_bid DECIMAL NOT NULL DEFAULT 0,
  reserve_price DECIMAL,
  image_details TEXT,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled'))
);
```

**bids**
Historial de todas las pujas realizadas.
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**profiles**
Perfiles de usuario extendidos.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vip')),
  status TEXT DEFAULT 'active'
);
```

### Automatización y Seguridad

- **Triggers**: Actualización automática de `current_bid` en la tabla `products` cuando se inserta una nueva puja en `bids`.
- **RLS Policies**: Solo administradores pueden crear/editar productos. Todos los usuarios pueden ver productos y pujas. Los usuarios pueden editar sus propios perfiles.
- **pg_cron**: (Opcional) Tarea programada para cerrar subastas automáticamente cuando expira el tiempo.

Para una configuración completa, consulta [supabase/setup.sql](file:///c:/jey%20celulares/La-Ganga-Phone-RD-main/supabase/setup.sql).


## 🌐 Deployment en Vercel

1. **Push a GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Importar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio
   - Agrega las variables de entorno en Settings

3. **Variables de Entorno en Vercel**
   ```
   VITE_SUPABASE_URL=tu_url
   VITE_SUPABASE_ANON_KEY=tu_key
   ```

4. **Deploy Automático**
   - Cada push a `main` despliega automáticamente
   - El CI/CD está configurado en `.github/workflows/ci.yml`

## 🛡️ Seguridad

- Headers de seguridad configurados en `vercel.json`
- Row Level Security (RLS) en Supabase
- Validación de datos en cliente y servidor
- Error boundary para captura de errores

## 🎨 Personalización

### Colores del Tema

Edita `index.html` para cambiar los colores:

```css
:root {
  --app-bg: #050b14;
  --app-card: #0f172a;
  --app-text: #f8fafc;
  --app-accent: #0ea5e9;
  /* ... */
}
```

### Configuración de Pujas

En `constants.ts`:
```typescript
export const BID_INCREMENT = 50; // Incremento mínimo
export const SIMULATION_INTERVAL = 3000; // Intervalo del bot (ms)
```

## 📊 Analytics y Exportación

La aplicación incluye utilidades para exportar datos:

```typescript
import { exportItemsToCSV, exportUsersToCSV } from './utils/exportUtils';

// Exportar productos
exportItemsToCSV(items);

// Exportar usuarios
exportUsersToCSV(users, winnerStats);
```

## 🧪 Testing

```bash
# Run type checking
npm run build  # TypeScript compilation

# Run ESLint
npx eslint .

# Format code
npx prettier --write .
```

## 📝 Modo Mock

Si no tienes Supabase configurado, la app funciona en modo mock:
- Datos de ejemplo pre-cargados
- Simulación de tiempo real con mock socket
- Ideal para desarrollo y testing

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- [Supabase](https://supabase.com/) - Backend as a Service
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

---

<div align="center">
Hecho con ❤️ por el equipo de La Ganga Phone RD
</div>
