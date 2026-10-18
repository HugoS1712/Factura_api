import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get(`${this.api}/usuarios`);
  }

  agregar(usuario: any) {
    return this.http.post(
      `${this.api}/usuarios`,
      usuario
    );
  }
}