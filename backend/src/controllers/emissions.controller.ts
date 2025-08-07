import { Controller, Get, Post } from '@nestjs/common';
import { EmissionsService } from '../services/emissions.service';
import { DataImportService } from '../services/data-import.service';

@Controller('api/emissions')
export class EmissionsController {
    constructor(
        private readonly emissionsService: EmissionsService,
        private readonly dataImportService: DataImportService
    ) { }

    @Get('deviations')
    async getQuarterlyDeviations() {
        return this.emissionsService.getQuarterlyDeviations();
    }

    @Get('vessels')
    async getVessels() {
        return this.emissionsService.getVesselsWithEmissions();
    }

    @Post('import')
    async importData() {
        await this.dataImportService.importAllData();
        return { message: 'Data imported successfully' };
    }
}