import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (invoiceData) => {
  try {
    // Validate invoice data
    if (!invoiceData) {
      throw new Error('Invoice data is required');
    }
    
    if (!invoiceData.company || !invoiceData.customer || !invoiceData.items) {
      throw new Error('Invalid invoice data structure');
    }
    
    console.log('Generating PDF for invoice:', invoiceData.invoiceNumber);
    
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // ============= HEADER =============
    // Company Logo/Name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204); // Blue color
    doc.text(invoiceData.company.name || 'Aqua Peak Fish Farm', margin, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(invoiceData.company.address || 'N/A', margin, yPos);
  
  yPos += 5;
  doc.text(`Phone: ${invoiceData.company.phone || 'N/A'} | Email: ${invoiceData.company.email || 'N/A'}`, margin, yPos);
  
  yPos += 5;
  doc.text(`Website: ${invoiceData.company.website || 'N/A'} | Tax ID: ${invoiceData.company.taxId || 'N/A'}`, margin, yPos);

  // Invoice Title on the right
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });
  
  // Draw header line
  yPos += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 102, 204);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;

  // ============= INVOICE & ORDER INFO =============
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  const infoStartY = yPos;
  
  // Left side - Invoice Info
  doc.text('Invoice Number:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.invoiceNumber, margin + 35, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.invoiceDate).toLocaleDateString(), margin + 35, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Order Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoiceData.orderDate).toLocaleDateString(), margin + 35, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Order ID:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(invoiceData.orderId, margin + 35, yPos);
  doc.setFontSize(10);
  
  // Right side - Payment Info
  yPos = infoStartY;
  const rightCol = pageWidth - margin - 60;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.paymentMethod, rightCol + 35, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(invoiceData.paymentStatus === 'Paid' ? 0 : 204, invoiceData.paymentStatus === 'Paid' ? 153 : 102, 0);
  doc.text(invoiceData.paymentStatus, rightCol + 35, yPos);
  doc.setTextColor(0, 0, 0);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Order Status:', rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  const statusColor = getStatusColor(invoiceData.orderStatus);
  doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  doc.text(invoiceData.orderStatus, rightCol + 35, yPos);
  doc.setTextColor(0, 0, 0);

  yPos += 12;

  // ============= CUSTOMER INFO =============
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 30, 'F');
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BILL TO:', margin + 5, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.customer.name, margin + 5, yPos);
  
  yPos += 5;
  doc.text(`Email: ${invoiceData.customer.email}`, margin + 5, yPos);
  
  yPos += 5;
  doc.text(`Phone: ${invoiceData.customer.phone}`, margin + 5, yPos);
  
  yPos += 5;
  const fullAddress = [
    invoiceData.customer.address.street,
    invoiceData.customer.address.apartment,
    invoiceData.customer.address.city,
    invoiceData.customer.address.state,
    invoiceData.customer.address.pinCode
  ].filter(part => part).join(', ');
  
  doc.text(`Address: ${fullAddress || 'N/A'}`, margin + 5, yPos);
  
  yPos += 12;

  // ============= ITEMS TABLE =============
  const tableData = invoiceData.items.map((item, index) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const total = Number(item.total) || 0;
    
    return [
      index + 1,
      item.name || 'N/A',
      item.description || '',
      item.quantity || 0,
      `Rs. ${unitPrice.toFixed(2)}`,
      `Rs. ${total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Product', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ============= TOTALS =============
  const totalsX = pageWidth - margin - 60;
  const subtotal = Number(invoiceData.subtotal) || 0;
  const tax = Number(invoiceData.tax) || 0;
  const taxRate = Number(invoiceData.taxRate) || 0;
  const total = Number(invoiceData.total) || 0;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  if (tax > 0) {
    yPos += 6;
    doc.text(`Tax (${(taxRate * 100).toFixed(0)}%):`, totalsX, yPos);
    doc.text(`Rs. ${tax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  }
  
  yPos += 8;
  doc.setLineWidth(0.3);
  doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX, yPos);
  doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);

  // ============= FOOTER =============
  yPos = pageHeight - 40;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('• All sales are final for live fish. Returns accepted only for defective equipment.', margin, yPos);
  
  yPos += 4;
  doc.text('• Payment is due upon delivery for COD orders.', margin, yPos);
  
  yPos += 4;
  doc.text('• Please inspect your order immediately upon delivery and report any issues within 24 hours.', margin, yPos);
  
  yPos += 4;
  doc.text('• For any queries, please contact us at ' + invoiceData.company.email, margin, yPos);

  // Bottom line
  yPos += 8;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 5;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });

    console.log('PDF generated successfully');
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return { r: 255, g: 152, b: 0 };
    case 'Confirmed':
      return { r: 33, g: 150, b: 243 };
    case 'Shipped':
      return { r: 156, g: 39, b: 176 };
    case 'Delivered':
      return { r: 76, g: 175, b: 80 };
    case 'Cancelled':
      return { r: 244, g: 67, b: 54 };
    default:
      return { r: 0, g: 0, b: 0 };
  }
};

// Download PDF
export const downloadInvoice = (invoiceData) => {
  try {
    console.log('Download invoice called with data:', invoiceData);
    
    if (!invoiceData) {
      throw new Error('No invoice data provided');
    }
    
    const doc = generateInvoicePDF(invoiceData);
    
    if (!doc) {
      throw new Error('Failed to generate PDF document');
    }
    
    const fileName = `Invoice_${invoiceData.invoiceNumber || 'unknown'}.pdf`;
    console.log('Saving PDF as:', fileName);
    
    doc.save(fileName);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error downloading invoice:', error);
    console.error('Error stack:', error.stack);
    alert(`Failed to download invoice: ${error.message}`);
  }
};

// Print PDF
export const printInvoice = (invoiceData) => {
  try {
    const doc = generateInvoicePDF(invoiceData);
    
    // Create blob URL
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = function() {
        printWindow.print();
        // Clean up the URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      };
    } else {
      // Fallback: if popup blocked, try autoPrint
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    }
  } catch (error) {
    console.error('Error printing invoice:', error);
    alert('Failed to print invoice. Please try again.');
  }
};
