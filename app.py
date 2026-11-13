import streamlit as st

st.set_page_config(
    page_title="Field Shift — NASA Space Apps 2026",
    page_icon="🌱",
    layout="wide",
)

st.title("🌱 Field Shift: Adapting Farms with NASA Data")
st.caption("Herramienta simple de apoyo para evaluar riesgos climáticos y comparar rotaciones de cultivos.")

tab_diag, tab_rot, tab_mapa = st.tabs([
    "🌤️ 1. Diagnóstico Climático (NASA POWER / ERA5)",
    "🌾 2. Simulador de Rotación y Agua (CROPWAT / AquaCrop)",
    "🛰️ 3. Mapa y Vegetación (Sentinel-2 / SRTM)",
])

with tab_diag:
    st.info("Espacio para conectar NASA POWER + alertas simples (calor, sequía, lluvia extrema).")

with tab_rot:
    st.info("Espacio para comparar cultivos de rotación: consumo de agua, resiliencia térmica y suelo.")

with tab_mapa:
    st.info("Espacio para seleccionar parcela/ubicación y ver NDVI, humedad del suelo (SMAP) y pendiente (SRTM).")
