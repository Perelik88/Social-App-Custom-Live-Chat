import { HttpInterceptorFn, HttpEvent, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/internal/operators/finalize';
import { tap } from 'rxjs/internal/operators/tap';
import { BusyService } from '../services/busy-service';
import { delay } from 'rxjs/internal/operators/delay';
import { of } from 'rxjs';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);
  const generateCacheKey = (url: string, params: HttpParams): string => {
    const paramsString = params.keys().map(key => `${key}=${params.get(key)}`).join('&');
    return paramsString ? `${url}?${paramsString}` : url;
  };

  const invalidateCache = (url: string) => {
    for (const key of cache.keys()) {
      if (key.includes(url)) {
        cache.delete(key);
      }
    }
  };

  const cacheKey = generateCacheKey(req.url, req.params);

  if(req.method.includes('POST') && req.url.includes('/likes')) {
    invalidateCache('/likes');
  }

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();
  return next(req).pipe(
    delay(500),
    tap(response => {
      if (req.method === 'GET') {
        cache.set(cacheKey, response);
      }
    }),
    finalize(() => busyService.idle())
  )
};
