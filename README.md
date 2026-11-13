# AgroShift NASA

Proyecto para el reto **Field Shift: Adapting Farms with NASA Data** (NASA Space Apps Challenge 2026).

## Objetivo
Ayudar a agricultores y comunidades agrícolas a **comparar y simular estrategias de rotación de cultivos** frente a presiones climáticas (sequía, olas de calor, lluvias extremas y degradación del suelo) usando datos abiertos de la NASA y ESA en lenguaje simple.

## Fuentes de datos previstas
- **NASA POWER (`power.larc.nasa.gov`)**: Temperatura, humedad, radiación, lluvia y viento (API REST directa).
- **NASA SMAP / ECOSTRESS / SRTM (vía AppEEARS)**: Humedad del suelo, evapotranspiración/estrés térmico y pendiente/riesgo de erosión.
- **Copernicus Sentinel-2 & ERA5**: Vigor vegetativo (NDVI/NDMI) y series climáticas históricas.
- **FAO GAEZ**: Aptitud agroclimática global para cultivos de rotación.

## Estructura inicial
- `app.py`: Punto de entrada simplificado para el hackathon.
- `requirements.txt`: Dependencias mínimas de Python/Streamlit.
