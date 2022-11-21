import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { map, share, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import {
  AppThemeEnum,
  PeBuilderEditorRoutingPathsEnum,
  createApplicationUrl,
  getAbbreviation,
  PeDestroyService,
} from '@pe/common';
import { PE_DOMAINS_SETTINGS_LIST } from '@pe/domains';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import {
  PeListSectionButtonTypesEnum,
  PeListSectionIntegrationInterface,
} from '@pe/ui';

import { BAD_REQUEST } from '../../constants';
import { PeAppointmentsRoutingPathsEnum } from '../../enums';
import { PeAppointmentsNetworkAccessInterface } from '../../interfaces';
import {
  PeAppointmentsAccessApiService,
  PeAppointmentsNetworksApiService,
  PeAppointmentsReferenceService,
} from '../../services';
import { PE_APPOINTMENTS_NETWORKS_SETTINGS_LIST } from '../network-editor';

@Component({
  selector: 'pe-appointments-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAppointmentsSettingsComponent {

  private currentAccessConfig: PeAppointmentsNetworkAccessInterface;
  private readonly refreshLiveStatus$ = new BehaviorSubject<void>(null);
  private readonly refreshSettingsByDefaultNetwork$ = new BehaviorSubject<void>(null);
  private readonly saveSubject$ = new BehaviorSubject<any>(null);

  public readonly arrowButtonType = PeListSectionButtonTypesEnum.Arrow;
  public readonly toggleButtonType = PeListSectionButtonTypesEnum.Toggle;

  public readonly domains = PE_DOMAINS_SETTINGS_LIST;
  public readonly networks = PE_APPOINTMENTS_NETWORKS_SETTINGS_LIST;

  public readonly getAccessConfig$ = this.refreshLiveStatus$
    .pipe(
      switchMap(() => this.pebEnvService.applicationId !== BAD_REQUEST
        ? this.peAppointmentsAccessApiService.getAccessConfig(this.pebEnvService.applicationId)
        : of(null)),
      map((accessData: PeAppointmentsNetworkAccessInterface) => {
        if (accessData) {
          this.currentAccessConfig = accessData;

          return [{
            enabled: accessData.isLive,
            icon: 'settings-livestatus',
            title: 'appointments-app.settings.publishing.livestatus',
          }];
        } else {
          return false;
        }
      }),
      share());

  public readonly getAllNetworks$ = this.refreshSettingsByDefaultNetwork$
    .pipe(
      switchMap(() => this.peAppointmentsNetworksApiService.getNetworks()),
      map((networks) => {
        const isDefaultNetworkNotFound = networks.length && !networks
          .some(network => network.isDefault);

        if (isDefaultNetworkNotFound) {
          networks[0].isDefault = true;
        }

        const networkToDefault = !networks.length
          ? BAD_REQUEST
          : networks.find(network => network.isDefault)._id;
        this.setDefaultNetwork(networkToDefault);

        return networks
          .map((network): PeListSectionIntegrationInterface => {
            const { _id, isDefault, logo, name } = network;

            return {
              _id: _id,
              abbreviation: getAbbreviation(name),
              component: this.networks[0].component,
              enabled: isDefault,
              icon: logo,
              title: name,
            };
          });
      }),
      tap(() => {
        this.refreshLiveStatus$.next();
      }));

  public readonly saveSubjectListener$ = this.saveSubject$
    .pipe(
      skip(1),
      switchMap((data) => {
        if (data?.payeverDomain) {
          const { _id, appointmentNetwork } = this.currentAccessConfig;
          const config = { internalDomain: data.internalDomain };

          return this.peAppointmentsAccessApiService
            .updateAccessConfig(appointmentNetwork, _id, config);
        }

        this.peOverlayWidgetService.close();
        data?.connectExisting && this.openEditor(this.domains[2], true);
        data?.personalDomain && this.openEditor(this.domains[1], true);
        data?.networkRemoved && this.refreshSettingsByDefaultNetwork$.next();

        if (data?.network) {
          const fullPath = this.createPath(PeAppointmentsRoutingPathsEnum.Calendar);
          this.router.navigate([fullPath]);
        }

        return of(null);
      }),
      tap((accessData: PeAppointmentsNetworkAccessInterface) => {
        if (accessData) {
          this.currentAccessConfig = accessData;
          this.peOverlayWidgetService.close();
          this.refreshLiveStatus$.next();
        }
      }));

  constructor(
    private location: Location,
    private router: Router,

    private pebEnvService: PebEnvService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peAppointmentsAccessApiService: PeAppointmentsAccessApiService,
    private peAppointmentsNetworksApiService: PeAppointmentsNetworksApiService,
    private peAppointmentsReferenceService: PeAppointmentsReferenceService,
  ) { }

  private createPath(path: string): string {
    return createApplicationUrl(
      this.router,
      this.pebEnvService.applicationId,
      path,
    );
  }

  public openEditor(integration?: PeListSectionIntegrationInterface, isDomain?: boolean): void {
    const backdropClick = () => {
      if (isDomain) {
        this.peOverlayWidgetService.close();
      } else {
        this.peAppointmentsReferenceService.backdropClick();
      }
    };
    const editorData = isDomain
      ? this.currentAccessConfig
      : integration;
    const theme = this.pebEnvService.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
      : AppThemeEnum.default;
    const config: PeOverlayConfig = {
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      component: integration.component,
      data: editorData,
      hasBackdrop: true,
      headerConfig: {
        backBtnTitle: this.translateService.translate('appointments-app.actions.cancel'),
        doneBtnTitle: this.translateService.translate('appointments-app.actions.done'),
        onSaveSubject$: this.saveSubject$,
        removeContentPadding: isDomain,
        theme: theme,
        title: '',
      },
    };
    this.peOverlayWidgetService.open(config);
  }

  private setDefaultNetwork(networkId): void {
    this.pebEnvService.applicationId = networkId;
    this.pebEnvService.shopId = networkId;
    const fullPath = this.createPath(PeBuilderEditorRoutingPathsEnum.Settings);
    this.location.replaceState(fullPath);
  }

  public openNetworkEditor(networkToEdit?: PeListSectionIntegrationInterface): void {
    const network = networkToEdit
      ? networkToEdit
      : this.networks[0];
    this.openEditor(network);
  }

  public switchDomainLiveStatus(integration?: PeListSectionIntegrationInterface): void {
    const { _id, appointmentNetwork, internalDomain } = this.currentAccessConfig;
    if (internalDomain) {
      this.peAppointmentsAccessApiService
        .updateAccessConfig(appointmentNetwork, _id, { isLive: !integration.enabled })
        .pipe(
          tap((accessData: PeAppointmentsNetworkAccessInterface) => {
            this.currentAccessConfig = accessData;
            this.refreshLiveStatus$.next();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('appointments-app.notify.firstly_connect_domain'),
        duration: 5000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
      this.refreshLiveStatus$.next();
    }
  }
}
