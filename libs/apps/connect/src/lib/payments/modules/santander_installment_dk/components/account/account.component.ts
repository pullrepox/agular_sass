import { Component, Injector, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { PaymentMethodEnum } from '../../../../../shared';
import { REQUIRED_FIELDS_SANTANDER_DK } from '../../../../constants';
import {
  BaseAccountSantanderComponent,
} from '../../../shared/components/base-account-santander/base-account-santander.component';

@Component({
  selector: 'account',
  templateUrl: './../../../shared/components/base-account-santander/base-account-santander.component.html',
  styleUrls: ['./../../../shared/components/base-account-santander/base-account-santander.component.scss'],
})
export class SantanderInstallmentDkAccountComponent extends BaseAccountSantanderComponent {

  readonly sendApplicationOnSave: boolean = true;
  readonly submitButtonText = 'actions.submit';
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;
  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;
  requiredFields = REQUIRED_FIELDS_SANTANDER_DK;

  constructor(injector: Injector) {
    super(injector);
  }
}
