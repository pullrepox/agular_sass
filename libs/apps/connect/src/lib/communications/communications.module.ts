import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { AuthModule } from '@pe/auth';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { SnackbarModule } from '@pe/snackbar';

import { ThirdPartyGeneratorModule } from '../ngkit-modules';
import { ButtonModule } from '../ngkit-modules/button';
import { NavbarModule } from '../ngkit-modules/navbar';
import { OverlayBoxModule } from '../ngkit-modules/overlay-box';
import { SharedModule } from '../shared/shared.module';

import { DevicePaymentsModule } from './modules';
import { ApiService, StateService } from './services';

export const CommunicationsI18nModuleForChild = I18nModule.forChild();

@NgModule({
  imports: [
    CommonModule,

    AuthModule,
    ClipboardModule,
    CommunicationsI18nModuleForChild,
    FormModule,
    FormsModule,
    SnackbarModule,
    ButtonModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,

    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,

    SharedModule,

    DevicePaymentsModule,
    ThirdPartyGeneratorModule,
  ],
  providers: [
    FormBuilder,
    ApiService,
    StateService,
    MediaService,
  ],
  exports: [DevicePaymentsModule],
})
export class CommunicationsModule {}
