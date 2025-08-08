'use client';

import { useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface QuarterlyDeviation {
    vesselId: string;
    vesselName: string;
    quarter: string;
    year: number;
    actualEmissions: number;
    baseline: number;
    deviation: number;
    date: string;
}

interface EmissionsChartProps {
    data: QuarterlyDeviation[];
}

export default function EmissionsChart({ data }: EmissionsChartProps) {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    const vesselData = data.reduce((acc, item) => {
        if (!acc[item.vesselName]) {
            acc[item.vesselName] = [];
        }
        acc[item.vesselName].push(item);
        return acc;
    }, {} as Record<string, QuarterlyDeviation[]>);

    const series = Object.entries(vesselData).map(([vesselName, vesselDeviations]) => ({
        name: vesselName,
        data: vesselDeviations.map(item => ({
            x: new Date(item.date).getTime(),
            y: item.deviation,
            quarter: `${item.year} ${item.quarter}`,
            actualEmissions: item.actualEmissions,
            baseline: item.baseline
        }))
    }));

    const options: Highcharts.Options = {
        chart: {
            type: 'line',
            backgroundColor: '#f8fafc',
            style: {
                fontFamily: 'Inter, sans-serif'
            }
        },
        title: {
            text: 'Vessel Emissions Deviation from Poseidon Principles Baseline',
            style: {
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b'
            }
        },
        subtitle: {
            text: 'Percentage deviation calculated for the last day of each quarter',
            style: {
                color: '#64748b'
            }
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Date',
                style: {
                    color: '#475569'
                }
            },
            labels: {
                style: {
                    color: '#475569'
                }
            }
        },
        yAxis: {
            title: {
                text: 'Deviation from Baseline (%)',
                style: {
                    color: '#475569'
                }
            },
            labels: {
                style: {
                    color: '#475569'
                },
                formatter: function () {
                    return this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                color: '#ef4444',
                dashStyle: 'ShortDash',
                width: 2,
                label: {
                    text: 'Baseline (0% deviation)',
                    style: {
                        color: '#ef4444'
                    }
                }
            }]
        },
        tooltip: {
            shared: true,
            useHTML: true,
            formatter: function () {
                let tooltip = `<b>${Highcharts.dateFormat('%B %Y', this.x!)}</b><br/>`;

                this.points?.forEach((point: any) => {
                    const deviation = point.y.toFixed(2);
                    const color = point.y > 0 ? '#ef4444' : '#22c55e';

                    tooltip += `
            <span style="color: ${point.series.color}">●</span> 
            <b>${point.series.name}</b><br/>
            <span style="color: ${color}; font-weight: bold;">
              ${deviation}% ${point.y > 0 ? 'above' : 'below'} baseline
            </span><br/>
            Quarter: ${point.point.quarter}<br/>
            Actual: ${point.point.actualEmissions.toFixed(2)} t CO₂<br/>
            Baseline: ${point.point.baseline.toFixed(2)} t CO₂<br/><br/>
          `;
                });

                return tooltip;
            },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e2e8f0',
            borderRadius: 8,
            shadow: true
        },
        legend: {
            enabled: true,
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
                color: '#475569'
            }
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: true,
                    radius: 4,
                    states: {
                        hover: {
                            radius: 6
                        }
                    }
                },
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                }
            }
        },
        colors: [
            '#3b82f6', // Blue
            '#ef4444', // Red
            '#22c55e', // Green
            '#f59e0b', // Amber
            '#8b5cf6', // Purple
            '#06b6d4', // Cyan
            '#f97316', // Orange
            '#84cc16', // Lime
        ],
        series: series,
        credits: {
            enabled: false
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartComponentRef}
            />
        </div>
    );
}