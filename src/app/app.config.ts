import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco.loader';
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, RouteReuseStrategy, withViewTransitions } from "@angular/router";
import { provideToastr } from "ngx-toastr";
import { errorInterceptor } from "./core/_interceptors/error.interceptor";
import { jwtInterceptor } from "./core/_interceptors/jwt.interceptor";
import { loadingInterceptor } from "./core/_interceptors/loading.interceptor";
import { CustomRouteReuseStrategy } from "./core/_services/customRouteReuseStrategy";
import { routes } from "./app.routes";
import { NgxSpinnerModule } from "ngx-spinner";
import { TimeagoModule } from "ngx-timeago";
import { ModalModule } from "ngx-bootstrap/modal";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { languageInterceptor } from "./core/_interceptors/language.interceptor";

export const appConfig: ApplicationConfig = {
    providers: [
        provideTransloco({
            config: {
                availableLangs: ['en', 'es', 'de'],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: false
            },
            loader: TranslocoHttpLoader,
        }),
        provideRouter(
            routes,
            withViewTransitions({
                skipInitialTransition: true,
              }),
        ),
        provideAnimations(),
        provideToastr({
            positionClass: 'toast-bottom-right'
        }),
        importProvidersFrom(NgxSpinnerModule, TimeagoModule.forRoot(), ModalModule.forRoot(), MatMenuModule, MatMenuTrigger, MatButtonModule, MatSnackBarModule),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
        provideHttpClient(
            withFetch(),
            withInterceptors([errorInterceptor, jwtInterceptor, loadingInterceptor, languageInterceptor]),
            withInterceptorsFromDi()
        ),
    ]
}
