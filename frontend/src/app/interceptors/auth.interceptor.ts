import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  let token: string | null = null;
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      token = localStorage.getItem('artigida_token');
    }
  } catch {}

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear stale session
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('artigida_token');
              localStorage.removeItem('artigida_user');
            }
          } catch {}
          // Redirect to login page
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
