import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITagMetaData, TagMetaData } from '../tag-meta-data.model';
import { TagMetaDataService } from '../service/tag-meta-data.service';

@Injectable({ providedIn: 'root' })
export class TagMetaDataRoutingResolveService implements Resolve<ITagMetaData> {
  constructor(protected service: TagMetaDataService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITagMetaData> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((tagMetaData: HttpResponse<TagMetaData>) => {
          if (tagMetaData.body) {
            return of(tagMetaData.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new TagMetaData());
  }
}
