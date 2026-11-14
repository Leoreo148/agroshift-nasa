# AgroShift NASA

Proyecto para el reto **Field Shift: Adapting Farms with NASA Data** (NASA Space Apps Challenge 2026).

## Stack
- **Next.js (App Router) + TypeScript + Tailwind CSS** — desplegado en **Vercel**.

## Fuentes de datos previstas
- **NASA POWER (`power.larc.nasa.gov`)**: Temperatura, humedad, radiación, lluvia y viento.
- **NASA SMAP / ECOSTRESS / SRTM**: Humedad del suelo, estrés térmico/ET y pendiente.
- **Copernicus Sentinel-2 & ERA5**: Vigor vegetativo (NDVI/NDMI) y clima de alta resolución.
- **FAO GAEZ**: Aptitud agroclimática global para cultivos de rotación.

## Desarrollo local
```bash
npm install
npm run dev
```
