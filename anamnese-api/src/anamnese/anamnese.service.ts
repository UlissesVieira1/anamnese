import { Injectable } from '@nestjs/common';

@Injectable()
export class AnamneseService {
  inserirDadosAnamnese(data: any) {
    console.log('Dados recebidos:', data);
    return { ok: true };
  }
}
