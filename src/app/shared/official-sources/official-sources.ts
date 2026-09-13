import { Component, input } from '@angular/core';
import type { OfficialSource } from '@content-models';

@Component({
  selector: 'app-official-sources',
  templateUrl: './official-sources.html',
})
export class OfficialSources {
  readonly sources = input<OfficialSource[]>([]);
}
