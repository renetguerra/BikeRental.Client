# Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 19.x.x.

## Development server

Run `ng serve` to start a development server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute end-to-end tests via your chosen platform. To use this command, you first need to add a package that implements end-to-end testing capabilities.

## Project Architecture and Flow Summary

The project follows a layered architecture inspired by DDD, with clear separation of responsibilities and Angular Signals for state management.

### Main Data and Action Flow

1. **Component (.component.ts):**
	 - Manages UI and user interactions.
	 - Calls public Store methods to load, create, update, or delete entities.

2. **Store (.store.ts):**
	 - Maintains reactive state using signals and computed.
	 - Encapsulates business logic and data transformations.
	 - Calls Service methods to interact with the backend.

3. **Service (.service.ts):**
	 - Makes HTTP calls to the backend/API.
	 - Returns data to the Store to update state.

4. **Backend:**
	 - Exposes RESTful and/or SignalR endpoints for CRUD operations and real-time notifications.

### Example Flow

```
Component → Store → Service → Backend API
```

**Concrete example:**

`MemberEditComponent` → `MemberStore` → `MembersService` → `/api/members`

### Advantages
- Decoupled and maintainable code.
- Centralized, reactive state.
- Easy unit and integration testing.

## Generic Table System

The project includes a reusable generic table component to display and manage any entity (users, bikes, etc.) with CRUD operations, pagination, and filters.

### Example Usage

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

### Typical Configuration
- `columnsInput`: Defines columns to display (name, type, format, etc.).
- `dataSourceInput`: Array of entities to display.
- `serviceApiUrl`: Service URL for CRUD operations.
- `navigateUrlBase` and `navigateUrlProperty`: Enable navigation to detail/edit views.
- `isRowClickable`: Enables navigation on row click.

### Advantages
- Reusable for any system entity.
- Supports pagination, filters, and custom actions.
- Reduces code duplication and eases maintenance.

## Generic Component and Modal System

The project uses a generic component and modal system for entity and photo management. This allows reuse of the same logic and UI for different data types (users, bikes, etc.) efficiently and scalably.

### Example Usage of Generic Photo Modal

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

### Advantages
- Enables generic CRUD for any entity.
- Photo management is universal and configurable per entity.
- Modals and components are configured by properties and callbacks, not code duplication.

### Typical Configuration
- `photoConfig`: Defines entity properties for photos and main photo URL.
- `onPhotoAdded`, `onPhotoDeleted`, `onMainPhotoSet`: Callbacks to update state after each action.

## More help

For more help on Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli).
