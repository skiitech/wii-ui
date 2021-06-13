import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IQuestion, getQuestionIdentifier } from '../question.model';

export type EntityResponseType = HttpResponse<IQuestion>;
export type EntityArrayResponseType = HttpResponse<IQuestion[]>;

@Injectable({ providedIn: 'root' })
export class QuestionService {
  public resourceSecureUrl = this.applicationConfigService.getEndpointFor('api/secure/questions');
  public resourceUrl = this.applicationConfigService.getEndpointFor('api/questions');
  public resourceBaseUrl = this.applicationConfigService.getEndpointFor('api');

  constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(question: IQuestion): Observable<EntityResponseType> {
    return this.http.post<IQuestion>(this.resourceSecureUrl, question, { observe: 'response' });
  }

  update(question: IQuestion): Observable<EntityResponseType> {
    return this.http.put<IQuestion>(`${this.resourceSecureUrl}/${getQuestionIdentifier(question) as number}`, question, {
      observe: 'response',
    });
  }

  partialUpdate(question: IQuestion): Observable<EntityResponseType> {
    return this.http.patch<IQuestion>(`${this.resourceSecureUrl}/${getQuestionIdentifier(question) as number}`, question, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IQuestion>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findBySubject(id: number, pageNo: number, pageSize: number): Observable<EntityArrayResponseType> {
    return this.http.get<IQuestion[]>(`${this.resourceBaseUrl}/subject/${id}/questions?pageNo=${pageNo}&pageSize=${pageSize}`, {
      observe: 'response',
    });
  }

  findBySubjectWithFilters(
    filters: Map<string, Array<string>>,
    searchValue: string,
    id: number,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    const tagObject: any = {};
    Array.from(filters.entries()).map(val => {
      tagObject[val[0]] = val[1];
    });
    return this.http.post<Map<string, Array<string>>>(
      `${this.resourceBaseUrl}/subject/${id}/questions?pageNo=${pageNo}&pageSize=${pageSize}&title=${searchValue}`,
      tagObject,
      {
        observe: 'response',
      }
    );
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IQuestion[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceSecureUrl}/${id}`, { observe: 'response' });
  }

  addQuestionToCollectionIfMissing(questionCollection: IQuestion[], ...questionsToCheck: (IQuestion | null | undefined)[]): IQuestion[] {
    const questions: IQuestion[] = questionsToCheck.filter(isPresent);
    if (questions.length > 0) {
      const questionCollectionIdentifiers = questionCollection.map(questionItem => getQuestionIdentifier(questionItem)!);
      const questionsToAdd = questions.filter(questionItem => {
        const questionIdentifier = getQuestionIdentifier(questionItem);
        if (questionIdentifier == null || questionCollectionIdentifiers.includes(questionIdentifier)) {
          return false;
        }
        questionCollectionIdentifiers.push(questionIdentifier);
        return true;
      });
      return [...questionsToAdd, ...questionCollection];
    }
    return questionCollection;
  }
}
