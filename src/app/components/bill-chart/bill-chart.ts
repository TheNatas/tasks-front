import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { BillService } from '../../services/bill';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-bill-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <h3>Contas por Mês</h3>
      <div class="chart-content">
        <div class="chart-wrapper">
          <canvas #chartCanvas></canvas>
        </div>
        <div class="chart-stats">
          <div class="stat-item overview">
            <span class="stat-label">Total de Meses</span>
            <span class="stat-value">{{ totalMonths }}</span>
            <span class="stat-count">com dados</span>
          </div>
          <div class="stat-item paid">
            <span class="stat-label">Total Pago</span>
            <span class="stat-value">R$ {{ totalPaidAllMonths | number:'1.2-2' }}</span>
            <span class="stat-count">{{ totalPaidBills }} conta{{ totalPaidBills !== 1 ? 's' : '' }}</span>
          </div>
          <div class="stat-item unpaid">
            <span class="stat-label">Total Pendente</span>
            <span class="stat-value">R$ {{ totalUnpaidAllMonths | number:'1.2-2' }}</span>
            <span class="stat-count">{{ totalUnpaidBills }} conta{{ totalUnpaidBills !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./bill-chart.css']
})
export class BillChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private billService = inject(BillService);
  private chart: Chart | null = null;
  private subscriptions = new Subscription();

  totalMonths = 0;
  totalPaidAllMonths = 0;
  totalUnpaidAllMonths = 0;
  totalPaidBills = 0;
  totalUnpaidBills = 0;

  ngOnInit(): void {
    this.initChart();
    this.subscribeToData();
  }

  private initChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: ['Jan 2025', 'Fev 2025', 'Mar 2025'], // Default labels
        datasets: [
          {
            label: 'Contas Pagas',
            data: [100, 200, 150], // Default data
            backgroundColor: '#4caf50',
            borderColor: '#2e7d32',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Contas Pendentes',
            data: [50, 100, 75], // Default data
            backgroundColor: '#ff9800',
            borderColor: '#f57c00',
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x', // This makes it a column chart (vertical bars)
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 20,
              font: {
                size: 14
              },
              usePointStyle: true,
              pointStyle: 'rect'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.chart = new Chart(ctx, config);
    console.log('Chart initialized successfully');
  }

  private subscribeToData(): void {
    const subscription = combineLatest([
      this.billService.billsGroupedByMonth$
    ]).pipe(
      map(([monthlyBills]) => {
        // Create a complete year structure with all 12 months
        const currentYear = new Date().getFullYear();
        const allMonths = [];

        for (let month = 1; month <= 12; month++) {
          const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
          allMonths.push(monthKey);
        }

        // Process all months data, including empty months
        const monthsData = allMonths.map(monthKey => {
          const monthData = monthlyBills.find(m => m.month === monthKey);

          if (monthData) {
            const paidBills = monthData.bills.filter(bill => bill.paid);
            const unpaidBills = monthData.bills.filter(bill => !bill.paid);

            const paidTotal = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
            const unpaidTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

            return {
              month: monthKey,
              paidTotal,
              unpaidTotal,
              paidCount: paidBills.length,
              unpaidCount: unpaidBills.length
            };
          } else {
            // Return zero values for months with no data
            return {
              month: monthKey,
              paidTotal: 0,
              unpaidTotal: 0,
              paidCount: 0,
              unpaidCount: 0
            };
          }
        });

        // Calculate totals across all months (only non-zero months)
        const totalPaidAllMonths = monthsData.reduce((sum, month) => sum + month.paidTotal, 0);
        const totalUnpaidAllMonths = monthsData.reduce((sum, month) => sum + month.unpaidTotal, 0);
        const totalPaidBills = monthsData.reduce((sum, month) => sum + month.paidCount, 0);
        const totalUnpaidBills = monthsData.reduce((sum, month) => sum + month.unpaidCount, 0);
        const monthsWithData = monthsData.filter(month => month.paidTotal > 0 || month.unpaidTotal > 0).length;

        return {
          monthsData,
          totalPaidAllMonths,
          totalUnpaidAllMonths,
          totalPaidBills,
          totalUnpaidBills,
          totalMonths: monthsWithData
        };
      })
    ).subscribe(({ monthsData, totalPaidAllMonths, totalUnpaidAllMonths, totalPaidBills, totalUnpaidBills, totalMonths }) => {
      this.totalPaidAllMonths = totalPaidAllMonths;
      this.totalUnpaidAllMonths = totalUnpaidAllMonths;
      this.totalPaidBills = totalPaidBills;
      this.totalUnpaidBills = totalUnpaidBills;
      this.totalMonths = totalMonths;
      this.updateChart(monthsData);
    });

    this.subscriptions.add(subscription);
  }

  private updateChart(monthsData: any[]): void {
    if (!this.chart) {
      console.error('Chart not initialized');
      return;
    }

    console.log('Updating chart with data:', monthsData);

    if (monthsData.length === 0) {
      // Show empty state with default data
      this.chart.data.labels = ['Nenhum dado'];
      this.chart.data.datasets[0].data = [0];
      this.chart.data.datasets[1].data = [0];
    } else {
      // Format month labels for display
      const labels = monthsData.map(month => {
        const [year, monthNum] = month.month.split('-');
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
      });

      const paidData = monthsData.map(month => month.paidTotal);
      const unpaidData = monthsData.map(month => month.unpaidTotal);

      console.log('Chart labels:', labels);
      console.log('Paid data:', paidData);
      console.log('Unpaid data:', unpaidData);

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = paidData;
      this.chart.data.datasets[1].data = unpaidData;
    }

    this.chart.update('active');
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.subscriptions.unsubscribe();
  }
}
