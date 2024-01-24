import { Injectable, inject } from '@angular/core';
import { SqlService } from '../../sql/sql.service';

@Injectable({
  providedIn: 'root'
})
export class GamecastDataService {
	private sql = inject(SqlService);
}
