# Cliente

## Nuevas funcionalidades

### Inicio de sesión único (SSO)

La aplicación soporta autenticación SSO (Single Sign-On), permitiendo a los usuarios iniciar sesión con cuentas de la organización (Google, Microsoft, LDAP, etc.) o redes sociales. Esto facilita el acceso seguro y centralizado, evitando la gestión de múltiples contraseñas.

**¿Cómo funciona?**
- Al acceder a la app, el usuario puede elegir iniciar sesión con su proveedor preferido.
- El backend valida el token y crea la sesión automáticamente.

**Ejemplo genérico de uso en la UI:**
```html
<button (click)="loginWithGoogle()">Iniciar sesión con Google</button>
<button (click)="loginWithMicrosoft()">Iniciar sesión con Microsoft</button>
```
**Ejemplo de código (TypeScript):**
```typescript
loginWithGoogle() {
	this.authService.loginWithProvider('google');
}
```
> El servicio `authService` gestiona la redirección y validación del token SSO.

---

### Internacionalización (i18n) y traducción

La aplicación está completamente traducida a español, inglés y alemán usando Transloco. El usuario puede seleccionar el idioma desde la interfaz, y todos los textos, notificaciones y mensajes de error se muestran en el idioma elegido.

**¿Cómo funciona?**
- El selector de idioma está disponible en el menú principal o en la barra de navegación.
- Al cambiar el idioma, la app actualiza todos los textos automáticamente.

**Ejemplo de selector de idioma en la UI:**
```html
<select [(ngModel)]="selectedLang" (change)="setLang(selectedLang)">
	<option value="es">Español</option>
	<option value="en">English</option>
	<option value="de">Deutsch</option>
</select>
```
**Ejemplo de código (TypeScript):**
```typescript
setLang(lang: string) {
	this.translocoService.setActiveLang(lang);
}
```
> El servicio `translocoService` gestiona el idioma activo y la carga de traducciones.

**Ejemplo de uso de traducción en componentes:**
```html
<span>{{ 'login' | transloco }}</span>
```
**Ejemplo de notificación traducida en servicios:**
```typescript
import { TranslocoService } from "@jsverse/transloco";

const msg = this.translocoService.translate('rentService.rentSuccess');
this.toastr.success(msg);
```

---

### Instalación de Transloco

Para habilitar la traducción, instale Transloco ejecutando:

```bash
npm install @jsverse/transloco
```



 Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 19.x.x.

## Servidor de desarrollo

Ejecute `ng serve` para iniciar un servidor de desarrollo. Navegue a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambia cualquiera de los archivos fuente.

## Generación de código

Ejecute `ng generate component component-name` para generar un nuevo componente. También puede usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Compilación

Ejecute `ng build` para compilar el proyecto. Los artefactos de la compilación se almacenarán en el directorio `dist/`.

## Ejecución de pruebas unitarias

Ejecute `ng test` para ejecutar las pruebas unitarias mediante [Karma](https://karma-runner.github.io).

## Ejecución de pruebas end-to-end

Ejecute `ng e2e` para ejecutar las pruebas end-to-end mediante la plataforma de su elección. Para usar este comando, primero debe agregar un paquete que implemente capacidades de pruebas end-to-end.

## Resumen de la arquitectura y flujo del proyecto

El proyecto sigue una arquitectura por capas inspirada en DDD, con separación clara de responsabilidades y uso de Angular Signals para la gestión de estado.

### Flujo principal de datos y acciones

1. **Componente (.component.ts):**
	- Gestiona la UI y las interacciones del usuario.
	- Llama a métodos públicos del Store para cargar, crear, actualizar o eliminar entidades.

2. **Store (.store.ts):**
	- Mantiene el estado reactivo usando signals y computed.
	- Encapsula la lógica de negocio y las transformaciones de datos.
	- Llama a los métodos del Service para interactuar con el backend.

3. **Service (.service.ts):**
	- Realiza las llamadas HTTP al backend/API.
	- Devuelve los datos al Store para actualizar el estado.

4. **Backend:**
	- Expone endpoints RESTful y/o SignalR para operaciones CRUD y notificaciones en tiempo real.

### Ejemplo de flujo

```
Componente → Store → Service → Backend API
```

**Ejemplo concreto:**

`MemberEditComponent` → `MemberStore` → `MembersService` → `/api/members`

### Ventajas
- Código desacoplado y fácil de mantener.
- Estado centralizado y reactivo.
- Facilidad para pruebas unitarias y de integración.
## Sistema de tablas genéricas

El proyecto incluye un componente de tabla genérica reutilizable para mostrar y gestionar cualquier entidad (usuarios, bicicletas, etc.) con operaciones CRUD, paginación y filtros.

### Ejemplo de uso de la tabla genérica

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

### Configuración típica
- `columnsInput`: Define las columnas a mostrar (nombre, tipo, formato, etc.).
- `dataSourceInput`: Array de entidades a mostrar.
- `serviceApiUrl`: URL del servicio para operaciones CRUD.
- `navigateUrlBase` y `navigateUrlProperty`: Permiten navegación a detalle/edición.
- `isRowClickable`: Activa la navegación al hacer clic en una fila.

### Ventajas
- Reutilizable para cualquier entidad del sistema.
- Soporta paginación, filtros y acciones personalizadas.
- Reduce duplicación de código y facilita el mantenimiento.

## Sistema de componentes y modales genéricos

El proyecto utiliza un sistema de componentes y modales genéricos para la gestión de entidades y fotos. Esto permite reutilizar la misma lógica y UI para diferentes tipos de datos (usuarios, bicicletas, etc.) de forma eficiente y escalable.

### Ejemplo de uso de modal genérico para fotos

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

### Ventajas
- Permite CRUD genérico para cualquier entidad.
- La gestión de fotos es universal y configurable por entidad.
- Los modales y componentes se configuran por propiedades y callbacks, no por duplicación de código.

### Configuración típica
- `photoConfig`: Define las propiedades de la entidad para fotos y URL principal.
- `onPhotoAdded`, `onPhotoDeleted`, `onMainPhotoSet`: Callbacks para actualizar el estado tras cada acción.

### Ejemplo de configuración para bicicletas

```typescript
photoConfig: {
	photosProperty: 'bikePhotos',
	photoUrlProperty: 'photoUrl',
	getEntityIdentifier: (b: Bike) => b.id.toString()
}
```

## Más ayuda

Para obtener más ayuda sobre Angular CLI use `ng help` o consulte la [Angular CLI Overview and Command Reference](https://angular.io/cli).
