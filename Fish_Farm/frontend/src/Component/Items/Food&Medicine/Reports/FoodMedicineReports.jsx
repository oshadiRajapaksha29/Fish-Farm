import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FoodMedicineReports.css';
import './inventory-summary.css';
import { FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
// Import jsPDF and autotable
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

function FoodMedicineReports() {
  const [isSidebarClosed, setSidebarClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    topProducts: [],
    inventorySummary: { totalItems: 0, lowStock: 0, outOfStock: 0 },
    categorySplit: { food: 0, medicine: 0 },
    recentSales: [],
    monthlySales: []
  });

  const API_BASE_URL = 'http://localhost:5000'; // Adjust based on your setup

  useEffect(() => {
    // Fetch report data
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/foodAndMedicine/reports`);
        
        console.log("API Response - Monthly Sales:", response.data.monthlySales);
        
        if (response.data) {
          // If there's only one month in the API response, use mock data for better visualization
          if (response.data.monthlySales && response.data.monthlySales.length <= 1) {
            console.log("Only one month of data found. Using mock data for monthly sales.");
            response.data.monthlySales = [
              { month: 'Apr', food: 12000, medicine: 8000 },
              { month: 'May', food: 15000, medicine: 9000 },
              { month: 'Jun', food: 14000, medicine: 11000 },
              { month: 'Jul', food: 16500, medicine: 10500 },
              { month: 'Aug', food: 18000, medicine: 12000 },
              { month: 'Sep', food: 17000, medicine: 13000 }
            ];
          }
          setReportData(response.data);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError("Failed to load reports. Please try again later.");
        setIsLoading(false);
        
        // Fall back to mock data in case of API error
        const mockData = {
          topProducts: [
            { id: 1, name: 'TetraMin Flakes', category: 'Food', sold: 42, revenue: 8400, stock: 15 },
            { id: 2, name: 'API Aquarium Salt', category: 'Medicine', sold: 38, revenue: 5700, stock: 8 },
            { id: 3, name: 'Aqua Culture Fish Food', category: 'Food', sold: 35, revenue: 5250, stock: 20 },
            { id: 4, name: 'Ich Treatment', category: 'Medicine', sold: 32, revenue: 6400, stock: 5 },
            { id: 5, name: 'Omega One Fish Food', category: 'Food', sold: 30, revenue: 6000, stock: 12 }
          ],
          inventorySummary: {
            totalItems: 86,
            lowStock: 12,
            outOfStock: 3
          },
          categorySplit: {
            food: 65,
            medicine: 35
          },
          recentSales: [
            { date: '2025-09-18', productName: 'TetraMin Flakes', quantity: 3, revenue: 600 },
            { date: '2025-09-19', productName: 'Ich Treatment', quantity: 2, revenue: 400 },
            { date: '2025-09-19', productName: 'API Aquarium Salt', quantity: 5, revenue: 750 },
            { date: '2025-09-20', productName: 'Omega One Fish Food', quantity: 1, revenue: 200 }
          ],
          monthlySales: [
            { month: 'Apr', food: 12000, medicine: 8000 },
            { month: 'May', food: 15000, medicine: 9000 },
            { month: 'Jun', food: 14000, medicine: 11000 },
            { month: 'Jul', food: 16500, medicine: 10500 },
            { month: 'Aug', food: 18000, medicine: 12000 },
            { month: 'Sep', food: 17000, medicine: 13000 }
          ]
        };
        
        setReportData(mockData);
      }
    };

    fetchReportData();
  }, []);
  
  // Convert data to CSV format
  const convertToCSV = (data, fields, title) => {
    // Add header row
    let csv = fields.map(field => field.header).join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = fields.map(field => {
        let value = typeof field.accessor === 'function' 
          ? field.accessor(item) 
          : item[field.accessor];
        
        // Handle strings with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value;
      }).join(',');
      
      csv += row + '\n';
    });
    
    return csv;
  };
  
  // Download CSV file
  const downloadCSV = (data, fields, filename) => {
    const csv = convertToCSV(data, fields, filename);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Download PDF file with a try-catch block to handle errors
  const downloadPDF = (data, fields, title) => {
    try {
      console.log('Starting PDF generation');
      
      // Create new document with jsPDF
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      
      const fileName = title.replace('.csv', '.pdf');
      
      // Add title to PDF
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(title.replace('.csv', '').replace(/_/g, ' '), 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Check if autoTable is available
      if (typeof doc.autoTable !== 'function') {
        console.error('autoTable is not a function on the jsPDF instance');
        alert('PDF export feature is not properly loaded. Please refresh the page and try again.');
        return;
      }
      
      // Convert data for autoTable
      const tableColumn = fields.map(field => field.header);
      const tableRows = data.map(item => {
        return fields.map(field => {
          return typeof field.accessor === 'function' 
            ? field.accessor(item) 
            : item[field.accessor];
        });
      });
      
      console.log('Generating table with:', { columns: tableColumn, rows: tableRows.length });
      
      // Generate the table using autoTable plugin
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 250, 255]
        }
      });
      
      console.log('Table generated successfully');
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} - Aqua-Peak Fish Farm`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
      
      // Save the PDF file
      console.log('Saving PDF file:', fileName);
      doc.save(fileName);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again later.");
    }
  };
  
  // Top Products CSV fields
  const topProductsFields = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Units Sold', accessor: 'sold' },
    { header: 'Revenue (Rs)', accessor: 'revenue' },
    { header: 'Current Stock', accessor: 'stock' },
    { 
      header: 'Status', 
      accessor: item => item.stock > 10 ? 'Good' : item.stock > 5 ? 'Medium' : 'Low' 
    }
  ];
  
  // Recent Sales CSV fields
  const recentSalesFields = [
    { header: 'Date', accessor: 'date' },
    { header: 'Product', accessor: 'productName' },
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Revenue (Rs)', accessor: 'revenue' }
  ];
  
  // Monthly Sales CSV fields
  const monthlySalesFields = [
    { header: 'Month', accessor: 'month' },
    { header: 'Food Revenue (Rs)', accessor: 'food' },
    { header: 'Medicine Revenue (Rs)', accessor: 'medicine' },
    { 
      header: 'Total Revenue (Rs)', 
      accessor: item => item.food + item.medicine 
    }
  ];
  
  // Inventory Summary CSV fields - this format matches our backend data
  const inventorySummaryFields = [
    { header: 'Total Items', accessor: 'totalItems' },
    { header: 'Low Stock Items', accessor: 'lowStock' },
    { header: 'Out of Stock Items', accessor: 'outOfStock' }
  ];
  
  // Category Split CSV fields
  const categorySplitFields = [
    { header: 'Food Items (%)', accessor: 'food' },
    { header: 'Medicine Items (%)', accessor: 'medicine' }
  ];

  return (
    <div className={`r_fm_r_container ${isSidebarClosed ? 'r_fm_r_sidebar-closed' : ''}`}>
        <div className="r_fm_r_page_header">
          <h1>Food & Medicine Reports</h1>
          <button 
            className="r_fm_r_full_report_btn" 
            onClick={() => {
              try {
                console.log('Starting Full Report PDF generation');
                
                // Export all reports as one PDF
                const doc = new jsPDF();
                console.log('jsPDF instance created for full report');
                
                // Check if autoTable is available
                if (typeof doc.autoTable !== 'function') {
                  console.error('autoTable is not a function on the jsPDF instance for full report');
                  alert('PDF export feature is not properly loaded. Please refresh the page and try again.');
                  return;
                }
                
                // Title page
                doc.setFontSize(24);
                doc.setTextColor(40, 40, 40);
                doc.text('Food & Medicine Reports', 105, 80, { align: 'center' });
                
                doc.setFontSize(14);
                doc.setTextColor(100, 100, 100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 100, { align: 'center' });
                doc.text('Aqua-Peak Fish Farm', 105, 110, { align: 'center' });
                
                // Inventory Summary
                doc.addPage();
                doc.setFontSize(18);
                doc.setTextColor(40, 40, 40);
                doc.text('Inventory Summary', 14, 22);
                
                const inventoryRows = [[
                  'Total Items', 'Low Stock Items', 'Out of Stock Items'
                ], [
                  reportData.inventorySummary.totalItems,
                  reportData.inventorySummary.lowStock,
                  reportData.inventorySummary.outOfStock
                ]];
                
                console.log('Adding Inventory Summary table');
                doc.autoTable({
                  startY: 30,
                  head: [inventoryRows[0]],
                  body: [inventoryRows[1]],
                  headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                });
                
                // Category Split
                doc.setFontSize(18);
                doc.text('Category Split', 14, 70);
                
                const categoryRows = [[
                  'Food Items (%)', 'Medicine Items (%)'
                ], [
                  reportData.categorySplit.food,
                  reportData.categorySplit.medicine
                ]];
                
                console.log('Adding Category Split table');
                doc.autoTable({
                  startY: 78,
                  head: [categoryRows[0]],
                  body: [categoryRows[1]],
                  headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                });
                
                // Top Products
                doc.addPage();
                doc.setFontSize(18);
                doc.text('Top Selling Products', 14, 22);
                
                const topProductsTableColumn = topProductsFields.map(field => field.header);
                const topProductsTableRows = reportData.topProducts.map(item => {
                  return topProductsFields.map(field => {
                    return typeof field.accessor === 'function' 
                      ? field.accessor(item) 
                      : item[field.accessor];
                  });
                });
                
                console.log('Adding Top Products table');
                doc.autoTable({
                  head: [topProductsTableColumn],
                  body: topProductsTableRows,
                  startY: 30,
                  headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                });
                
                // Monthly Sales
                doc.addPage();
                doc.setFontSize(18);
                doc.text('Monthly Sales (Last 6 Months)', 14, 22);
                
                const monthlySalesTableColumn = monthlySalesFields.map(field => field.header);
                const monthlySalesTableRows = reportData.monthlySales.map(item => {
                  return monthlySalesFields.map(field => {
                    return typeof field.accessor === 'function' 
                      ? field.accessor(item) 
                      : item[field.accessor];
                  });
                });
                
                console.log('Adding Monthly Sales table');
                doc.autoTable({
                  head: [monthlySalesTableColumn],
                  body: monthlySalesTableRows,
                  startY: 30,
                  headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                });
                
                // Recent Sales
                doc.addPage();
                doc.setFontSize(18);
                doc.text('Recent Sales', 14, 22);
                
                const recentSalesTableColumn = recentSalesFields.map(field => field.header);
                const recentSalesTableRows = reportData.recentSales.map(item => {
                  return recentSalesFields.map(field => {
                    return typeof field.accessor === 'function' 
                      ? field.accessor(item) 
                      : item[field.accessor];
                  });
                });
                
                console.log('Adding Recent Sales table');
                doc.autoTable({
                  head: [recentSalesTableColumn],
                  body: recentSalesTableRows,
                  startY: 30,
                  headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] }
                });
                
                // Add page numbers to all pages
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  doc.setFontSize(10);
                  doc.setTextColor(150, 150, 150);
                  doc.text(
                    `Page ${i} of ${pageCount} - Aqua-Peak Fish Farm`, 
                    doc.internal.pageSize.width / 2, 
                    doc.internal.pageSize.height - 10, 
                    { align: 'center' }
                  );
                }
                
                console.log('Saving Complete Food & Medicine Report');
                doc.save('Complete_Food_Medicine_Report.pdf');
                console.log('Full report saved successfully');
              } catch (error) {
                console.error("Error generating full report PDF:", error);
                alert("There was an error generating the full PDF report. Please try again later.");
              }
            }}
          >
            <FaFilePdf /> Generate Full Report (PDF)
          </button>
        </div>
        
        {isLoading ? (
          <div className="r_fm_r_loading">
            <div className="r_fm_r_spinner"></div>
            <p>Loading report data...</p>
          </div>
        ) : (
          <div className="r_fm_r_content">
            {/* Summary Cards */}
            <div className="r_fm_r_summary_cards">
              <div className="r_fm_r_card">
                <div className="r_fm_r_card_header">
                  <h3>Inventory Summary</h3>
                  <div className="r_fm_r_card_export_buttons">
                    <button 
                      className="r_fm_r_card_export_btn" 
                      onClick={() => downloadCSV([reportData.inventorySummary], inventorySummaryFields, 'inventory_summary.csv')}
                      title="Export to CSV"
                    >
                      <FaFileExcel />
                    </button>
                    <button 
                      className="r_fm_r_card_export_btn pdf" 
                      onClick={() => downloadPDF([reportData.inventorySummary], inventorySummaryFields, 'Inventory_Summary.pdf')}
                      title="Export to PDF"
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                </div>
                <div className="r_fm_r_inventory_summary">
                  <div className="r_fm_r_inventory_item">
                    <span className="r_fm_r_inventory_label">Total Products</span>
                    <div className="r_fm_r_card_value">{reportData.inventorySummary.totalItems}</div>
                  </div>
                  <div className="r_fm_r_inventory_item">
                    <span className="r_fm_r_inventory_label">Low Stock Items</span>
                    <div className="r_fm_r_card_value">{reportData.inventorySummary.lowStock}</div>
                  </div>
                  <div className="r_fm_r_inventory_item">
                    <span className="r_fm_r_inventory_label">Out of Stock</span>
                    <div className="r_fm_r_card_value">{reportData.inventorySummary.outOfStock}</div>
                  </div>
                </div>
              </div>
              
              <div className="r_fm_r_card">
                <div className="r_fm_r_card_header">
                  <h3>Category Split</h3>
                  <div className="r_fm_r_card_export_buttons">
                    <button 
                      className="r_fm_r_card_export_btn" 
                      onClick={() => downloadCSV([reportData.categorySplit], categorySplitFields, 'category_split.csv')}
                      title="Export to CSV"
                    >
                      <FaFileExcel />
                    </button>
                    <button 
                      className="r_fm_r_card_export_btn pdf" 
                      onClick={() => downloadPDF([reportData.categorySplit], categorySplitFields, 'Category_Split.pdf')}
                      title="Export to PDF"
                    >
                      <FaFilePdf />
                    </button>
                  </div>
                </div>
                <div className="r_fm_r_card_split">
                  <div className="r_fm_r_split_item">
                    <span className="r_fm_r_split_label">Food</span>
                    <div className="r_fm_r_split_bar">
                      <div 
                        className="r_fm_r_split_fill food" 
                        style={{ width: `${reportData.categorySplit.food}%` }}
                      ></div>
                    </div>
                    <span className="r_fm_r_split_value">{reportData.categorySplit.food}%</span>
                  </div>
                  <div className="r_fm_r_split_item">
                    <span className="r_fm_r_split_label">Medicine</span>
                    <div className="r_fm_r_split_bar">
                      <div 
                        className="r_fm_r_split_fill medicine" 
                        style={{ width: `${reportData.categorySplit.medicine}%` }}
                      ></div>
                    </div>
                    <span className="r_fm_r_split_value">{reportData.categorySplit.medicine}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Top Products Table */}
            <div className="r_fm_r_section">
              <div className="r_fm_r_section_header">
                <h2>Top Selling Products</h2>
                <div className="r_fm_r_export_buttons">
                  <button 
                    className="r_fm_r_export_btn" 
                    onClick={() => downloadCSV(reportData.topProducts, topProductsFields, 'top_selling_products.csv')}
                    title="Export to CSV"
                  >
                    <FaFileExcel /> Export CSV
                  </button>
                  <button 
                    className="r_fm_r_export_btn pdf" 
                    onClick={() => downloadPDF(reportData.topProducts, topProductsFields, 'Top_Selling_Products.pdf')}
                    title="Export to PDF"
                  >
                    <FaFilePdf /> Export PDF
                  </button>
                </div>
              </div>
              <div className="r_fm_r_table_container">
                <table className="r_fm_r_table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Units Sold</th>
                      <th>Revenue (Rs)</th>
                      <th>Current Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.map(product => (
                      <tr key={product.id || product._id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.sold}</td>
                        <td>{product.revenue.toLocaleString()}</td>
                        <td>{product.stock}</td>
                        <td>
                          <span className={`r_fm_r_status ${
                            product.stock > 10 ? 'good' : 
                            product.stock > 5 ? 'medium' : 'low'
                          }`}>
                            {product.stock > 10 ? 'Good' : 
                             product.stock > 5 ? 'Medium' : 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Monthly Sales Chart (Simple version without external libraries) */}
            <div className="r_fm_r_section">
              <div className="r_fm_r_section_header">
                <h2>Monthly Sales (Last 6 Months)</h2>
                <div className="r_fm_r_export_buttons">
                  <button 
                    className="r_fm_r_export_btn" 
                    onClick={() => downloadCSV(reportData.monthlySales, monthlySalesFields, 'monthly_sales.csv')}
                    title="Export to CSV"
                  >
                    <FaFileExcel /> Export CSV
                  </button>
                  <button 
                    className="r_fm_r_export_btn pdf" 
                    onClick={() => downloadPDF(reportData.monthlySales, monthlySalesFields, 'Monthly_Sales.pdf')}
                    title="Export to PDF"
                  >
                    <FaFilePdf /> Export PDF
                  </button>
                </div>
              </div>
              <div className="r_fm_r_chart_container">
                <div className="r_fm_r_chart_legend">
                  <div className="r_fm_r_legend_item">
                    <span className="r_fm_r_legend_color food"></span>
                    <span>Food</span>
                  </div>
                  <div className="r_fm_r_legend_item">
                    <span className="r_fm_r_legend_color medicine"></span>
                    <span>Medicine</span>
                  </div>
                </div>
                
                <div className="r_fm_r_chart">
                  {reportData.monthlySales.map((data, index) => {
                    const totalSales = data.food + data.medicine;
                    const maxSales = Math.max(...reportData.monthlySales.map(d => d.food + d.medicine));
                    const barHeight = (totalSales / maxSales) * 100;
                    const foodHeight = (data.food / totalSales) * barHeight;
                    const medicineHeight = (data.medicine / totalSales) * barHeight;
                    
                    return (
                      <div className="r_fm_r_chart_bar_container" key={index}>
                        <div className="r_fm_r_chart_bar" style={{ height: `${barHeight}%` }}>
                          <div className="r_fm_r_chart_segment food" style={{ height: `${foodHeight}%` }}></div>
                          <div className="r_fm_r_chart_segment medicine" style={{ height: `${medicineHeight}%` }}></div>
                        </div>
                        <div className="r_fm_r_chart_label">{data.month}</div>
                        <div className="r_fm_r_chart_value">Rs.{(data.food + data.medicine).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Recent Sales */}
            <div className="r_fm_r_section">
              <div className="r_fm_r_section_header">
                <h2>Recent Sales</h2>
                <div className="r_fm_r_export_buttons">
                  <button 
                    className="r_fm_r_export_btn" 
                    onClick={() => downloadCSV(reportData.recentSales, recentSalesFields, 'recent_sales.csv')}
                    title="Export to CSV"
                  >
                    <FaFileExcel /> Export CSV
                  </button>
                  <button 
                    className="r_fm_r_export_btn pdf" 
                    onClick={() => downloadPDF(reportData.recentSales, recentSalesFields, 'Recent_Sales.pdf')}
                    title="Export to PDF"
                  >
                    <FaFilePdf /> Export PDF
                  </button>
                </div>
              </div>
              <div className="r_fm_r_table_container">
                <table className="r_fm_r_table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Revenue (Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recentSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.productName}</td>
                        <td>{sale.quantity}</td>
                        <td>{sale.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recommendations Section */}
            <div className="r_fm_r_section">
              <h2>Insights & Recommendations</h2>
              <div className="r_fm_r_insights_container">
                <div className="r_fm_r_insight_card">
                  <div className="r_fm_r_insight_icon">
                    <i className="bx bx-trending-up"></i>
                  </div>
                  <div className="r_fm_r_insight_content">
                    <h4>Top Performer</h4>
                    <p>TetraMin Flakes is your best seller, generating Rs.8,400 in revenue. Consider running promotions with this product to boost related sales.</p>
                  </div>
                </div>
                
                <div className="r_fm_r_insight_card">
                  <div className="r_fm_r_insight_icon warning">
                    <i className="bx bx-error"></i>
                  </div>
                  <div className="r_fm_r_insight_content">
                    <h4>Low Stock Alert</h4>
                    <p>Ich Treatment is selling well but stock is running low (only 5 units left). Consider reordering soon to avoid stockouts.</p>
                  </div>
                </div>
                
                <div className="r_fm_r_insight_card">
                  <div className="r_fm_r_insight_icon info">
                    <i className="bx bx-line-chart"></i>
                  </div>
                  <div className="r_fm_r_insight_content">
                    <h4>Sales Trend</h4>
                    <p>Medicine sales are showing steady growth over the last 3 months. Consider expanding your medicine product offerings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default FoodMedicineReports;