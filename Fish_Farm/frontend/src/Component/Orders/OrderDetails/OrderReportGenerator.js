import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// We won't import the logo here to avoid build errors

/**
 * OrderReportGenerator - Service for generating order reports in different formats
 */
export class OrderReportGenerator {
  /**
   * Generate a PDF report for orders
   * @param {Array} orders - Array of order objects
   * @param {Object} filters - Filters applied to the orders
   * @param {Object} stats - Order statistics
   * @returns {jsPDF} - PDF document object
   */
  static generatePdfReport(orders, filters, stats) {
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    try {
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // #2c3e50
      doc.text("Order Management Report", pageWidth / 2, 15, { align: "center" });
      
      // Add text logo instead of image to avoid import issues
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80); // Dark blue color
      doc.text("AQUA PEAK", 15, 15);
      
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141); // Light gray color
      doc.text("Fish Farm", 15, 20);
      
      // Add report generation info
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141); // #7f8c8d
      const today = new Date();
      doc.text(
        `Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
        pageWidth / 2,
        25,
        { align: "center" }
      );
      
      // Add filter information
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80); // #2c3e50
      doc.text("Report Filters:", 15, 35);
      
      doc.setFontSize(10);
      let filterText = [];
      
      if (filters.status && filters.status !== 'all') {
        filterText.push(`Status: ${filters.status}`);
      } else {
        filterText.push("Status: All");
      }
      
      if (filters.startDate && filters.endDate) {
        filterText.push(`Date Range: ${filters.startDate} to ${filters.endDate}`);
      }
      
      doc.text(filterText, 20, 42);
      
      // Add summary statistics
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80); // #2c3e50
      doc.text("Summary Statistics", 15, 55);
      
      doc.setFontSize(10);
      doc.text([
        `Total Orders: ${stats.totalOrders}`,
        `Total Revenue: Rs. ${stats.totalRevenue.toFixed(2)}`,
        `Pending: ${stats.statusCounts.Pending}`,
        `Confirmed: ${stats.statusCounts.Confirmed}`,
        `Shipped: ${stats.statusCounts.Shipped}`,
        `Delivered: ${stats.statusCounts.Delivered}`,
        `Cancelled: ${stats.statusCounts.Cancelled}`
      ], 20, 65);
      
      // Add orders table
      doc.setFontSize(14);
      doc.text("Order List", 15, 100);
      
      // Prepare table data
      const tableColumn = ["Order ID", "Date", "Customer", "Status", "Total"];
      const tableRows = [];
      
      orders.forEach(order => {
        const customerName = order.delivery?.firstName || order.delivery?.lastName 
          ? `${order.delivery?.firstName || ''} ${order.delivery?.lastName || ''}`.trim() 
          : 'N/A';
          
        const orderData = [
          order._id?.slice(-6) || 'N/A',
          new Date(order.createdAt).toLocaleDateString(),
          customerName,
          order.status || 'Pending',
          `Rs. ${(order.totalAmount || 0).toFixed(2)}`
        ];
        tableRows.push(orderData);
      });
      
      // Generate table using jspdf-autotable helper
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 105,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [240, 240, 240]
        },
        headStyles: {
          fillColor: [248, 249, 250],
          textColor: [44, 62, 80],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [251, 251, 251]
        }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(127, 140, 141); // #7f8c8d
        doc.text(
          'Aqua-peak Fish Farm Order Management System',
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
      return doc;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
  
  /**
   * Save a PDF report to file
   * @param {Array} orders - Array of order objects
   * @param {Object} filters - Filters applied to the orders
   * @param {Object} stats - Order statistics
   */
  static downloadPdfReport(orders, filters, stats) {
    try {
      const doc = this.generatePdfReport(orders, filters, stats);
      
      // Generate filename with date
      const date = new Date();
      const filename = `order_report_${date.toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      doc.save(filename);
      
      return true;
    } catch (error) {
      console.error('Error downloading PDF report:', error);
      return false;
    }
  }
}

export default OrderReportGenerator;