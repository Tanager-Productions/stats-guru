import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { HeaderComponent } from 'src/app/shared/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  constructor(sync:SyncService, common:CommonService) {
    //sync.beginSync(true).then(() => common.initializeService());
  }

}
