# Bolsa FEUCN - Frontend

Frontend del proyecto Bolsa FEUCN, desarrollado con Next.js 15, React 19 y TypeScript, utilizando Tailwind CSS para estilos y Axios para la comunicacion con el backend.

La aplicacion sigue una arquitectura modular, organizada por componentes, vistas, servicios y hooks personalizados.

---

## Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 15 / React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Componentes UI | Radix UI + shadcn/ui |
| Cliente HTTP | Axios |
| Estado del servidor | TanStack React Query |
| Autenticacion | NextAuth v4 |
| Runtime | Node.js 20+ |

---

## Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- Backend corriendo en `http://localhost:5185` (ver instrucciones del backend)

---

## Configuracion inicial

### 1. Extraer el codigo fuente

Descomprimir el archivo `.zip` recibido y navegar a la carpeta del frontend:

```bash
cd BolsaFeUCN/frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raiz de la carpeta `frontend/` con el siguiente contenido:

```ini
NEXT_PUBLIC_API_URL=http://localhost:PORT/api
NEXTAUTH_SECRET=<cadena_secreta_aleatoria>
NEXTAUTH_URL=http://localhost:3000
```
> `PORT` es el puerto donde corre el backend (5185 por defecto). Asegurarse de que coincida con la configuracion del backend.
> `NEXTAUTH_SECRET` puede ser cualquier cadena larga y aleatoria. Se puede generar una con: `openssl rand -base64 32`

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000 en el navegador.

---

## Construccion para produccion

```bash
npm run build
npm start
```
