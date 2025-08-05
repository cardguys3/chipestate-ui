// /app/dashboard/utils/chartOptions.ts

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#fff',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#ccc',
      },
      grid: {
        color: '#333',
      },
    },
    y: {
      ticks: {
        color: '#ccc',
      },
      grid: {
        color: '#333',
      },
    },
  },
}
export { baseChartOptions as barChartOptions };
