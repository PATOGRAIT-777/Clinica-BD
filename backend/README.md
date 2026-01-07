Backend local — instrucciones rápidas

Requisitos
- PostgreSQL instalado y corriendo localmente.
- Node.js (para scripts de seed)

1) Crear base de datos
```bash
createdb techside
```

2) Ejecutar DDL (desde la carpeta `backend/sql`)
```bash
psql -d techside -f backend/sql/ddl_postgres.sql
```

3) Ejecutar seed import (ajusta variables de entorno si es necesario)
```bash
# desde la raiz del repo
node backend/scripts/seed_json_import.js .
```

Variables de entorno (opcional)
- PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE

Siguientes pasos recomendados
- Scaffold de servidor (Node/Express o Django) que implemente autenticacion (JWT), endpoints y use estas tablas.
- Convertir los scripts del frontend para que consuman la API en lugar de localStorage.
