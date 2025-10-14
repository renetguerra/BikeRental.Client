# Client

Dieses Projekt wurde mit [Angular CLI](https://github.com/angular/angular-cli) Version 19.x.x erstellt.

## Entwicklungsserver

Führen Sie `ng serve` aus, um einen Entwicklungsserver zu starten. Navigieren Sie zu `http://localhost:4200/`. Die Anwendung wird automatisch neu geladen, wenn Sie eine Quelldatei ändern.

## Code-Generierung

Führen Sie `ng generate component component-name` aus, um eine neue Komponente zu generieren. Sie können auch `ng generate directive|pipe|service|class|guard|interface|enum|module` verwenden.

## Build

Führen Sie `ng build` aus, um das Projekt zu bauen. Die Build-Artefakte werden im Verzeichnis `dist/` gespeichert.

## Ausführen von Unit-Tests

Führen Sie `ng test` aus, um Unit-Tests mit [Karma](https://karma-runner.github.io) auszuführen.

## Ausführen von End-to-End-Tests

Führen Sie `ng e2e` aus, um End-to-End-Tests mit Ihrer bevorzugten Plattform auszuführen. Um diesen Befehl zu verwenden, müssen Sie zuerst ein Paket hinzufügen, das End-to-End-Testfunktionen bereitstellt.

## Zusammenfassung der Architektur und des Projektablaufs

Das Projekt folgt einer schichtbasierten Architektur, inspiriert von DDD, mit klarer Trennung der Verantwortlichkeiten und Angular Signals für das Zustandsmanagement.

### Hauptdaten- und Aktionsfluss

1. **Komponente (.component.ts):**
   - Verwaltet die Benutzeroberfläche und Interaktionen.
   - Ruft öffentliche Methoden des Stores auf, um Entitäten zu laden, zu erstellen, zu aktualisieren oder zu löschen.

2. **Store (.store.ts):**
   - Verwaltet den reaktiven Zustand mit Signals und Computed.
   - Kapselt Geschäftslogik und Datenumwandlungen.
   - Ruft Methoden des Service auf, um mit dem Backend zu interagieren.

3. **Service (.service.ts):**
   - Führt HTTP-Anfragen an das Backend/API aus.
   - Gibt die Daten an den Store zurück, um den Zustand zu aktualisieren.

4. **Backend:**
   - Stellt RESTful- und/oder SignalR-Endpunkte für CRUD-Operationen und Echtzeitbenachrichtigungen bereit.

### Beispielablauf

```
Komponente → Store → Service → Backend API
```

**Konkretes Beispiel:**

`MemberEditComponent` → `MemberStore` → `MembersService` → `/api/members`

### Vorteile
- Entkoppelter und wartbarer Code.
- Zentralisierter, reaktiver Zustand.
- Einfache Unit- und Integrationstests.

## Generisches Tabellensystem

Das Projekt enthält eine wiederverwendbare generische Tabellenkomponente zur Anzeige und Verwaltung beliebiger Entitäten (Benutzer, Fahrräder usw.) mit CRUD-Operationen, Paginierung und Filtern.

### Beispiel für die Verwendung

```html
<app-common-table
  [serviceApiUrl]="serviceApiUrl()"
  [columnsInput]="columns"
  [dataSourceInput]="dataSource()"
  [navigateUrlBase]="'/bike'"
  [navigateUrlProperty]="'idBike'"
  [isRowClickable]="true">
</app-common-table>
```

### Typische Konfiguration
- `columnsInput`: Definiert die anzuzeigenden Spalten (Name, Typ, Format usw.).
- `dataSourceInput`: Array der anzuzeigenden Entitäten.
- `serviceApiUrl`: Service-URL für CRUD-Operationen.
- `navigateUrlBase` und `navigateUrlProperty`: Aktivieren die Navigation zu Detail-/Bearbeitungsansichten.
- `isRowClickable`: Aktiviert die Navigation beim Klicken auf eine Zeile.

### Vorteile
- Wiederverwendbar für jede Entität im System.
- Unterstützt Paginierung, Filter und benutzerdefinierte Aktionen.
- Reduziert Code-Duplikation und erleichtert die Wartung.

## Generisches Komponenten- und Modalsystem

Das Projekt verwendet ein generisches Komponenten- und Modalsystem für die Verwaltung von Entitäten und Fotos. Dadurch kann dieselbe Logik und Benutzeroberfläche effizient und skalierbar für verschiedene Datentypen (Benutzer, Fahrräder usw.) wiederverwendet werden.

### Beispiel für die Verwendung des generischen Foto-Modals

```typescript
openPhotoDialog() {
  this.dialog.open(PhotoEditorComponent<MyEntity>, {
    data: {
      entity: this.myEntity(),
      urlServerPath: 'my-entity/add-photo',
      photoConfig: {
        photosProperty: 'photos',
        photoUrlProperty: 'mainPhotoUrl',
        getEntityIdentifier: (e) => e.id.toString()
      },
      onPhotoAdded: (photo, updated) => this.myStore.setEntity(updated)
    }
  });
}
```

### Vorteile
- Ermöglicht generisches CRUD für jede Entität.
- Das Fotomanagement ist universell und pro Entität konfigurierbar.
- Modals und Komponenten werden über Eigenschaften und Callbacks konfiguriert, nicht durch Code-Duplikation.

### Typische Konfiguration
- `photoConfig`: Definiert die Eigenschaften der Entität für Fotos und die Hauptfoto-URL.
- `onPhotoAdded`, `onPhotoDeleted`, `onMainPhotoSet`: Callbacks zur Aktualisierung des Zustands nach jeder Aktion.

## Weitere Hilfe

Für weitere Hilfe zur Angular CLI verwenden Sie `ng help` oder sehen Sie sich die [Angular CLI Overview and Command Reference](https://angular.io/cli) an.
