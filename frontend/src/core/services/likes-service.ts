import { PaginatedResult } from './../../interfaces/pagination';
import { inject, Service, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Member } from '../../interfaces/member';

@Service()
export class LikesService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<string[]>([]);

  toggleLike(targetedMemberId: string) {
    return this.http.post(`${this.baseUrl}/likes/${targetedMemberId}`, {});
  }

  getLikes(predicate: string, pageNumber: string, pageSize: string) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('predicate', predicate);

    return this.http.get<PaginatedResult<Member>>(this.baseUrl + `/likes`, { params });
  }

  getLikesIds() {
    return this.http.get<string[]>(this.baseUrl + `/likes/list`).subscribe({
      next: (ids) => this.likeIds.set(ids),
      error: (err) => console.error(err)
    });
  }

  clearLikesIds() {
    this.likeIds.set([]);
  }
}
