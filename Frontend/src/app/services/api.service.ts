import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5160/api';

  constructor(private http: HttpClient) { }

  // Métodos genéricos para CRUD
  get<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`);
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, id: number, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  delete<T>(endpoint: string, id: number): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  patch<T>(endpoint: string, id: number, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }
}
