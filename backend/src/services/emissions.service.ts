import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { calculatePPSCCBaselines } from '../utils/calculate-pp-scc-baselines.util';
import Decimal from 'decimal.js';

export interface QuarterlyDeviation {
    vesselId: string;
    vesselName: string;
    quarter: string;
    year: number;
    actualEmissions: number;
    baseline: number;
    deviation: number; // percentage deviation from baseline
    date: string;
}

@Injectable()
export class EmissionsService {
    private readonly logger = new Logger(EmissionsService.name);

    constructor(private prisma: PrismaService) { }

    async getQuarterlyDeviations(): Promise<QuarterlyDeviation[]> {
        this.logger.log('Calculating quarterly deviations...');

        const vessels = await this.prisma.vessel.findMany({
            include: {
                emissions: {
                    orderBy: {
                        toUTC: 'asc'
                    }
                }
            }
        });

        const deviations: QuarterlyDeviation[] = [];

        for (const vessel of vessels) {
            // Get PP reference factors for this vessel type
            const ppFactors = await this.prisma.cE_PPSCCReferenceLine.findMany({
                where: {
                    vesselTypeId: vessel.vesselType,
                    category: 'PP'
                }
            });

            if (ppFactors.length === 0) {
                this.logger.warn(`No PP factors found for vessel ${vessel.name} with type ${vessel.vesselType}`);
                continue;
            }

            // Group emissions by quarter
            const quarterlyEmissions = this.groupEmissionsByQuarter(vessel.emissions);

            for (const [quarterKey, emissions] of Object.entries(quarterlyEmissions)) {
                const [year, quarter] = quarterKey.split('-Q');
                const yearNum = parseInt(year);

                // Get the last day of the quarter
                const lastDayEmissions = emissions[emissions.length - 1];

                if (!lastDayEmissions) continue;

                // Calculate baseline using PP factors
                const dwt = new Decimal(vessel.dwt || 50000);
                const baselines = calculatePPSCCBaselines({
                    factors: ppFactors,
                    year: yearNum,
                    DWT: dwt
                });

                // Use total CO2 emissions for the calculation
                const actualEmissions = lastDayEmissions.totCO2;
                const baseline = baselines.min.toNumber();

                // Calculate percentage deviation
                const deviation = baseline > 0 ? ((actualEmissions - baseline) / baseline) * 100 : 0;

                deviations.push({
                    vesselId: vessel.imoNo,
                    vesselName: vessel.name,
                    quarter: `Q${quarter}`,
                    year: yearNum,
                    actualEmissions,
                    baseline,
                    deviation,
                    date: lastDayEmissions.toUTC.toISOString()
                });
            }
        }

        this.logger.log(`Calculated ${deviations.length} quarterly deviations`);
        return deviations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    private groupEmissionsByQuarter(emissions: any[]) {
        const quarters: { [key: string]: any[] } = {};

        for (const emission of emissions) {
            const date = new Date(emission.toUTC);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const quarter = Math.ceil(month / 3);
            const key = `${year}-Q${quarter}`;

            if (!quarters[key]) {
                quarters[key] = [];
            }
            quarters[key].push(emission);
        }

        return quarters;
    }

    async getVesselsWithEmissions() {
        return this.prisma.vessel.findMany({
            include: {
                _count: {
                    select: {
                        emissions: true
                    }
                }
            }
        });
    }
}