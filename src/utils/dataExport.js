// src/utils/dataExport.js
export const exportAnalysisData = async () => {
    try {
      // For now, let's just export the latest analysis from local storage
      const analysisData = localStorage.getItem('analysisHistory');
      if (!analysisData) {
        alert('No analysis data available to export');
        return;
      }
  
      // Convert to CSV
      const data = JSON.parse(analysisData);
      const csv = convertToCSV(data);
      
      // Create download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skin-tone-analysis-${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };
  
  const convertToCSV = (data) => {
    if (!Array.isArray(data)) {
      data = [data];
    }
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        return typeof value === 'object' ? 
          JSON.stringify(value) : 
          String(value);
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };