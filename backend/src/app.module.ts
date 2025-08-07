import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './services/prisma.service';
import { EmissionsService } from './services/emissions.service';
import { DataImportService } from './services/data-import.service';
import { EmissionsController } from './controllers/emissions.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [EmissionsController],
  providers: [PrismaService, EmissionsService, DataImportService],
})
export class AppModule { }