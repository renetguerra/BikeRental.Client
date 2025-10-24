import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LanguageStore } from '../_stores/language.store';

/**
 * Interceptor that adds the current language to the request headers.
 */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {

  const languageStore = inject(LanguageStore);

  // Get the current active language from the store
  const lang = languageStore.getActiveLang();
  // Clone the request and add the 'Accept-Language' header
  const modifiedReq = req.clone({
    setHeaders: {
      'Accept-Language': lang
    }
  });

  return next(modifiedReq);
}
