import { Body, Controller, Post } from '@nestjs/common';
import { AnamneseService } from './anamnese.service';

@Controller('anamneses')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @Post()
  create(@Body() body: any) {
    return this.anamneseService.inserirDadosAnamnese(body);
  }
}
