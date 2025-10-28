import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.css'],
    imports: [RouterLink, TranslocoModule]
})
export class NotFoundComponent {

}
