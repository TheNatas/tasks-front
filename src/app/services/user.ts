import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface RegisterRequest {
  username: string;
  password: string;
}

interface RegisterResponse {
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<RegisterResponse> {
    const registerData: RegisterRequest = { username, password };
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, registerData);
  }
}
