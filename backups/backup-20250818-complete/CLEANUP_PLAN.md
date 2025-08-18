# Piano di Pulizia del Codice - ANTONELLO GUARNIERI PORTFOLIO

## Stato Backup
- **Backup Script Creato**: `backup_script.sh` pronto per esecuzione manuale
- **Percorso Backup**: `/backups/backup-20250818-complete/`

## 1. File da Rimuovere Immediatamente

### File Debug (7 file):
- [ ] `js/nuovahome-init-wrapper.js` - wrapper temporaneo per debug
- [ ] `js/debug-init-tracker.js` - tracker per debug
- [ ] `js/double-load-detector.js` - detector doppio caricamento
- [ ] `js/preloader-guard.js` - guard preloader
- [ ] `js/production-monitor.js` - monitor produzione
- [ ] `test-double-load.html` - pagina test
- [ ] `test-form.html` - pagina test

### File Duplicati:
- [ ] `nuovahome.html` - duplicato di index.html

## 2. Consolidamento File nuovahome

### Situazione Attuale:
- **In uso**: `js/nuovahome.js` (importato da index.html)
- **Disponibile**: `js/nuovahome-refactored.js` (versione ottimizzata)
- **Problema**: Il file `prepare-for-production.sh` si aspetta di usare la versione refactored

### Azione Richiesta:
1. Confrontare `nuovahome.js` con `nuovahome-refactored.js`
2. Decidere quale versione mantenere
3. Aggiornare `index.html` di conseguenza

## 3. Console.log da Rimuovere (21 file)

### File JS con console.log:
1. `js/portfolio.js`
2. `js/portfolio-static.js`
3. `js/production-monitor.js`
4. `js/preloader-guard.js`
5. `js/nuovahome-refactored.js`
6. `js/nuovahome-init-wrapper.js`
7. `js/modules/portfolio-module.js`
8. `js/modules/homepage-module.js`
9. `js/modules/cms-module.js`
10. `js/form-handler.js`
11. `js/double-load-detector.js`
12. `js/debug-init-tracker.js`
13. `js/core/module-registry.js`
14. `js/core/event-bus.js`
15. `js/core/app-state.js`
16. `js/core/app-initializer.js`
17. `js/app.js`
18. `js/app-coordinator.js`
19. `js/navbar.js`
20. `js/form-ajax.js`
21. `progetti/professional-project-loader.js`

## 4. Architettura Over-Engineered da Semplificare

### Sistema Modulare Complesso:
- Cartella `js/core/` con 4 file
- Cartella `js/modules/` con 3 file
- Sistema event-driven non necessario per sito statico

### Raccomandazione:
- Considerare semplificazione a struttura più diretta
- Mantenere solo i file essenziali

## 5. Ordine di Esecuzione

1. **Backup** (da eseguire manualmente):
   ```bash
   ./backup_script.sh
   ```

2. **Rimozione file debug/test**:
   - Rimuovere i 8 file identificati nella sezione 1

3. **Consolidamento nuovahome**:
   - Testare quale versione funziona meglio
   - Aggiornare riferimenti

4. **Pulizia console.log**:
   - Rimuovere tutti i console.log dai 21 file
   - Mantenere solo console.error per errori critici

5. **Test finale**:
   - Verificare tutte le funzionalità
   - Controllare console per errori
   - Test navigazione e animazioni

## Note Importanti

- **MAI** rimuovere file senza backup
- Testare dopo ogni step di rimozione
- Mantenere versione development separata da production
- Documentare ogni cambiamento

## Checklist Pre-Produzione

- [ ] Backup completato
- [ ] File debug rimossi
- [ ] Console.log puliti
- [ ] File consolidati
- [ ] Test completo superato
- [ ] Performance verificata
- [ ] Zero errori in console