import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PebSitesApi } from '../../services/site/abstract.sites.api';

@Component({
  selector: 'peb-password-protection',
  templateUrl: './password-protection.component.html',
  styleUrls: ['./password-protection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsPasswordProtectionComponent implements OnInit {

  form: FormGroup;
  siteDeploy = this.appData.accessConfig;
  loading: boolean;
  errorMessage: string;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    // private apiService: PebActualSitesApi,
    @Inject(PE_OVERLAY_DATA) private appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    private apiShop: PebSitesApi,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
  ) {
    this.config.doneBtnCallback = () => {
      this.onSubmit()
    }
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      privatePassword: [
        '',
      ],
      privateMessage: [
        this.siteDeploy?.privateMessage,
      ],
      isPrivate: [this.siteDeploy?.isPrivate, [Validators.required]],
    });

    this.form.get('isPrivate').valueChanges.pipe(
      tap((isPrivate) => {
        if (isPrivate) {
          this.form.get('privatePassword').setValidators([Validators.required]);
          this.form.get('privatePassword').updateValueAndValidity();
        } else {
          this.form.get('privatePassword').clearValidators();
          this.form.get('privatePassword').updateValueAndValidity();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onSubmit() {
    if (this.form.untouched) {
      this.overlay.close();
    }

    if (this.form.invalid) {
      if (this.form.get('privatePassword').hasError('required')) {
        this.errorMessage = 'Password is required';
      }
      this.cdr.markForCheck();

      return;
    }
    this.form.disable();
    this.loading = true;
    const payload: any = {
      isPrivate: this.form.get('isPrivate').value,
      privateMessage: this.form.get('privateMessage').value,
    }
    if (payload.isPrivate) {payload.privatePassword = this.form.get('privatePassword').value;}

    this.apiShop.updateSiteAccessConfig(
      this.appData.id,
      payload,
    ).subscribe(
      (data) => {
        this.appData.onSaved$.next({ updateShopList: true });
        this.overlay.close();
      },
      (error) => {
        if (error.error.statusCode === 400) {
          this.errorMessage = error.error.errors[0];
          this.cdr.markForCheck();
          this.form.enable();
        }
      },
    )

  }
}
