# Log

Cronológico, append-only. Cada entrada tiene el prefijo
`## [YYYY-MM-DD] <operación> | <descripción>` para que sea parseable con
herramientas unix:

```bash
grep "^## \[" wiki/log.md | tail -10
```

---

*(vacío — el agente añadirá entradas conforme ingieras, consultes y revises)*
