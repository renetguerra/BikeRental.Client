export interface PhotoEditorDialogData<T> {
  entity: T;
  uploadPath: string;
  getEntityIdentifier: (entity: T) => string;
  entityType: 'user' | 'bike'; 
}
