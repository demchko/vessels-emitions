import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "./prisma.service";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataImportService {
    private readonly logger = new Logger(DataImportService.name);

    constructor(private prisma: PrismaService) { }

    async importAllData() {
        this.logger.log('Starting data import...');

        try {
            await this.importVessels();
            await this.importPPReference();
            await this.importDailyEmissions();

            this.logger.log('Data import completed successfully');
        } catch (error) {
            this.logger.error('Data import failed:', error);
            throw error;
        }
    }

    private async importVessels() {
        this.logger.log('Importing vessels...');

        const vesselsPath = path.join(process.cwd(), 'data', 'vessels.json');
        const vesselsData = JSON.parse(fs.readFileSync(vesselsPath, 'utf8'));

        for (const vessel of vesselsData) {
            await this.prisma.vessel.upsert({
                where: { imoNo: vessel.IMONo.toString() },
                update: {
                    name: vessel.Name,
                    vesselType: vessel.VesselType,
                },
                create: {
                    name: vessel.Name,
                    imoNo: vessel.IMONo.toString(),
                    vesselType: vessel.VesselType,
                    dwt: vessel.DWT || 50000, // Default DWT if not provided
                },
            });
        }

        this.logger.log(`Imported ${vesselsData.length} vessels`);
    }

    private async importPPReference() {
        this.logger.log('Importing PP reference data...');

        const ppPath = path.join(process.cwd(), 'data', 'pp-reference.json');
        const ppData = JSON.parse(fs.readFileSync(ppPath, 'utf8'));

        for (const ref of ppData) {
            await this.prisma.cE_PPSCCReferenceLine.upsert({
                where: { rowId: ref.RowID },
                update: {
                    category: ref.Category,
                    vesselTypeId: ref.VesselTypeID,
                    size: ref.Size,
                    traj: ref.Traj,
                    a: ref.a,
                    b: ref.b,
                    c: ref.c,
                    d: ref.d,
                    e: ref.e,
                },
                create: {
                    rowId: ref.RowID,
                    category: ref.Category,
                    vesselTypeId: ref.VesselTypeID,
                    size: ref.Size,
                    traj: ref.Traj,
                    a: ref.a,
                    b: ref.b,
                    c: ref.c,
                    d: ref.d,
                    e: ref.e,
                },
            });
        }

        this.logger.log(`Imported ${ppData.length} PP reference records`);
    }

    private async importDailyEmissions() {
        this.logger.log('Importing daily emissions...');

        const emissionsPath = path.join(process.cwd(), 'data', 'daily-log-emissions.json');
        const emissionsData = JSON.parse(fs.readFileSync(emissionsPath, 'utf8'));

        for (const emission of emissionsData) {
            try {
                await this.prisma.dailyLogEmission.upsert({
                    where: {
                        eid_logId: {
                            eid: emission.EID,
                            logId: emission.LOGID.toString()
                        }
                    },
                    update: {
                        vesselId: emission.VesselID.toString(),
                        fromUTC: new Date(emission.FromUTC),
                        toUTC: new Date(emission.TOUTC),
                        metCO2: emission.MET2WCO2 || 0,
                        aetCO2: emission.AET2WCO2 || 0,
                        botCO2: emission.BOT2WCO2 || 0,
                        vrtCO2: emission.VRT2WCO2 || 0,
                        totCO2: emission.TotT2WCO2 || 0,
                        mewCO2e: emission.MEW2WCO2e || 0,
                        aewCO2e: emission.AEW2WCO2e || 0,
                        bowCO2e: emission.BOW2WCO2e || 0,
                        vrwCO2e: emission.VRW2WCO2e || 0,
                        totWCO2e: emission.ToTW2WCO2 || 0,
                        mesOx: emission.MESox || 0,
                        aesOx: emission.AESox || 0,
                        bosOx: emission.BOSox || 0,
                        vrsOx: emission.VRSox || 0,
                        totSOx: emission.TotSOx || 0,
                        menOx: emission.MENOx || 0,
                        aenOx: emission.AENOx || 0,
                        totNOx: emission.TotNOx || 0,
                        mepm10: emission.MEPM10 || 0,
                        aepm10: emission.AEPM10 || 0,
                        totPM10: emission.TotPM10 || 0,
                        aerCO2T2W: emission.AERCO2T2W || 0,
                        aerCO2eW2W: emission.AERCO2eW2W || 0,
                        eeOICO2eW2W: emission.EEOICO2eW2W || 0,
                    },
                    create: {
                        eid: emission.EID,
                        vesselId: emission.VesselID.toString(),
                        logId: emission.LOGID.toString(),
                        fromUTC: new Date(emission.FromUTC),
                        toUTC: new Date(emission.TOUTC),
                        metCO2: emission.MET2WCO2 || 0,
                        aetCO2: emission.AET2WCO2 || 0,
                        botCO2: emission.BOT2WCO2 || 0,
                        vrtCO2: emission.VRT2WCO2 || 0,
                        totCO2: emission.TotT2WCO2 || 0,
                        mewCO2e: emission.MEW2WCO2e || 0,
                        aewCO2e: emission.AEW2WCO2e || 0,
                        bowCO2e: emission.BOW2WCO2e || 0,
                        vrwCO2e: emission.VRW2WCO2e || 0,
                        totWCO2e: emission.ToTW2WCO2 || 0,
                        mesOx: emission.MESox || 0,
                        aesOx: emission.AESox || 0,
                        bosOx: emission.BOSox || 0,
                        vrsOx: emission.VRSox || 0,
                        totSOx: emission.TotSOx || 0,
                        menOx: emission.MENOx || 0,
                        aenOx: emission.AENOx || 0,
                        totNOx: emission.TotNOx || 0,
                        mepm10: emission.MEPM10 || 0,
                        aepm10: emission.AEPM10 || 0,
                        totPM10: emission.TotPM10 || 0,
                        aerCO2T2W: emission.AERCO2T2W || 0,
                        aerCO2eW2W: emission.AERCO2eW2W || 0,
                        eeOICO2eW2W: emission.EEOICO2eW2W || 0,
                    },
                });
            } catch (error) {
                this.logger.warn(`Failed to import emission record EID: ${emission.EID}`, error);
            }
        }

        this.logger.log(`Imported daily emissions data`);
    }
}