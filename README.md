# GeoTurismo App

GeoTurismo es una aplicación que permite a los turistas registrar y localizar puntos de interés (como Cervecerías, Universidades, Farmacias, Centros de Emergencias y Supermercados) en un radio de 5km de su ubicación actual. El cálculo de las distancias y radio está potenciado por búsquedas geoespaciales en memoria utilizando el motor de base de datos **Redis** (`GEORADIUS`).


## Primeros pasos

Las siguientes instrucciones te permitirán obtener una copia del proyecto y ponerlo en funcionamiento en tu máquina local.

### Prerrequisitos

Necesitas tener instaladas las siguientes herramientas en tu sistema:
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Instalación y Despliegue

1. Clona el repositorio en tu máquina local:
   ```bash
    git clone https://github.com/donatodebattista/georedis-api.git
    cd georedis-api

   ```

2. Construye y levanta el entorno utilizando Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Acceda a la aplicación

    Abra su navegador en: http://localhost:5173
