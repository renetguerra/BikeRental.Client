import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
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
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from "@angular/material/checkbox";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";

export const appConfig: ApplicationConfig = {
    providers: [
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
        importProvidersFrom(NgxSpinnerModule, TimeagoModule.forRoot(), ModalModule.forRoot(), MatMenuModule, MatMenuTrigger, MatButtonModule),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },        
        provideHttpClient(
            withFetch(),
            withInterceptors([errorInterceptor, jwtInterceptor, loadingInterceptor]),
            withInterceptorsFromDi()
        ),                     
    ]
}