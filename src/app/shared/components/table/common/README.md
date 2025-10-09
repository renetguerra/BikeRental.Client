# CommonTableComponent - Guía de Uso

## Descripción
El `CommonTableComponent` es un componente genérico y reutilizable para mostrar tablas con funcionalidad de navegación al hacer clic en las filas.

## Características
- ✅ **Genérico**: Funciona con cualquier tipo de dato `<T>`
- ✅ **Navegación**: Click en filas para navegar a páginas específicas
- ✅ **Personalizable**: Función de click personalizada
- ✅ **Configurable**: Habilitar/deshabilitar clicks en filas
- ✅ **Responsive**: Diseño adaptable
- ✅ **Themed**: Compatible con sistema de temas claro/oscuro

## Inputs Disponibles

### Básicos
- `serviceApiUrl: string` - URL base del servicio API
- `columnsInput: TableColumn<T>[]` - Configuración de columnas
- `dataSourceInput: T[]` - Datos a mostrar en la tabla

### Navegación
- `navigateUrlBase: string` - URL base para navegación (ej: '/bike', '/user')
- `navigateUrlProperty: string` - Propiedad del objeto para usar como parámetro URL (default: 'id')
- `isRowClickable: boolean` - Habilitar/deshabilitar click en filas (default: true)
- `onRowClick: (row: T) => void` - Función personalizada para manejar clicks

## Ejemplos de Uso

### 1. Navegación Simple
```html
<app-common-table
  [serviceApiUrl]="apiUrl"
  [columnsInput]="columns"
  [dataSourceInput]="dataSource"
  [navigateUrlBase]="'/bike'"
  [navigateUrlProperty]="'idBike'"
  [isRowClickable]="true">
</app-common-table>
```

**Resultado**: Click en fila navega a `/bike/{idBike}`

### 2. Navegación con ID Estándar
```html
<app-common-table
  [serviceApiUrl]="apiUrl"
  [columnsInput]="columns"
  [dataSourceInput]="users"
  [navigateUrlBase]="'/users'"
  [navigateUrlProperty]="'id'">
</app-common-table>
```

**Resultado**: Click en fila navega a `/users/{id}`

### 3. Función Click Personalizada
```html
<app-common-table
  [serviceApiUrl]="apiUrl"
  [columnsInput]="columns"
  [dataSourceInput]="dataSource"
  [onRowClick]="handleCustomClick">
</app-common-table>
```

```typescript
// En el componente padre
handleCustomClick = (row: MyDataType) => {
  // Lógica personalizada
  this.openDialog(row);
  // o
  this.updateSelection(row);
  // o cualquier otra acción
};
```

### 4. Deshabilitar Click en Filas
```html
<app-common-table
  [serviceApiUrl]="apiUrl"
  [columnsInput]="columns"
  [dataSourceInput]="dataSource"
  [isRowClickable]="false">
</app-common-table>
```

### 5. Configuración Completa
```html
<app-common-table
  [serviceApiUrl]="'api/rentals'"
  [columnsInput]="rentalColumns"
  [dataSourceInput]="rentalHistory()"
  [navigateUrlBase]="'/rental/details'"
  [navigateUrlProperty]="'rentalId'"
  [isRowClickable]="hasPermission()"
  [onRowClick]="customHandler">
</app-common-table>
```

## Configuración de Columnas

```typescript
const columns: TableColumn<MyDataType>[] = [
  {
    columnDef: 'id',
    header: 'ID',
    cell: (row: MyDataType) => row.id.toString()
  },
  {
    columnDef: 'name',
    header: 'Nombre',
    cell: (row: MyDataType) => row.name
  },
  {
    columnDef: 'photoUrl',
    header: 'Foto',
    isCustomRender: true // Para renderizado personalizado
  }
];
```

## Casos de Uso Comunes

### Historial de Rentas
```html
<app-common-table
  [navigateUrlBase]="'/bike'"
  [navigateUrlProperty]="'idBike'">
</app-common-table>
```

### Lista de Usuarios
```html
<app-common-table
  [navigateUrlBase]="'/user'"
  [navigateUrlProperty]="'username'">
</app-common-table>
```

### Lista de Favoritos
```html
<app-common-table
  [navigateUrlBase]="'/bike'"
  [navigateUrlProperty]="'bikeId'">
</app-common-table>
```

## Estilos CSS

Las filas clickeables tienen los siguientes estilos automáticos:
- **Cursor**: `pointer` cuando son clickeables
- **Hover**: Cambio de color de fondo y elevación
- **Active**: Efecto de presión
- **Transiciones**: Suaves para mejor UX

## Consideraciones

1. **Propiedad de Navegación**: Asegúrate de que `navigateUrlProperty` exista en tus datos
2. **URLs**: Las URLs se construyen automáticamente como `{navigateUrlBase}/{propertyValue}`
3. **Función Personalizada**: Si defines `onRowClick`, tiene prioridad sobre la navegación automática
4. **Tema**: El componente se adapta automáticamente al tema activo (claro/oscuro)

## TypeScript Interface

```typescript
interface TableColumn<T> {
  columnDef: string;
  header: string;
  cell?: (row: T) => string;
  isCustomRender?: boolean;
}
```