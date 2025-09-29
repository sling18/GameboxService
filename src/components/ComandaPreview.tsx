import React, { useState } from 'react'
import { FileText, Printer, Download, X, Tag } from 'lucide-react'
import type { ServiceOrder, Customer } from '../types'
import logoGamebox from '../assets/logo-gamebox.png'

interface ComandaPreviewProps {
  order: ServiceOrder
  customer: Customer
  onClose: () => void
}

const ComandaPreview: React.FC<ComandaPreviewProps> = ({ order, customer, onClose }) => {
  const [viewType, setViewType] = useState<'comanda' | 'sticker'>('comanda')
  const [logoBase64, setLogoBase64] = useState<string>('')

  // Convertir imagen a base64 para impresión
  React.useEffect(() => {
    const convertImageToBase64 = async () => {
      try {
        const response = await fetch(logoGamebox)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setLogoBase64(reader.result)
          }
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error('Error al cargar la imagen:', error)
      }
    }
    convertImageToBase64()
  }, [])
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'PENDIENTE'
      case 'in_progress':
        return 'EN PROGRESO'
      case 'completed':
        return 'COMPLETADO'
      case 'delivered':
        return 'ENTREGADO'
      default:
        return status.toUpperCase()
    }
  }

  const handlePrint = () => {
    const title = viewType === 'comanda' ? 'Comanda' : 'Sticker'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      if (viewType === 'sticker') {
        // Template HTML para sticker optimizado 7cm x 5cm
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Orden #${order.order_number}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .sticker-container {
                  width: 7cm;
                  height: 5cm;
                  border: 2px solid #000;
                  padding: 2mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  box-sizing: border-box;
                  position: relative;
                }
                .logo {
                  width: 100%;
                  max-width: 4cm;
                  height: auto;
                  margin: 0 auto 2mm auto;
                  display: block;
                }
                .info {
                  flex-grow: 1;
                  font-size: 9px;
                  line-height: 1.2;
                  color: #000;
                }
                .info-line {
                  margin-bottom: 1mm;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .info-line strong {
                  font-weight: bold;
                  color: #000;
                }
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                  }
                  @page {
                    margin: 0;
                    size: 7cm 5cm;
                  }
                  .sticker-container {
                    width: 7cm;
                    height: 5cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="sticker-container">
                <img src="${logoBase64}" alt="GameBox Logo" class="logo">
                <div class="info">
                  <div class="info-line"><strong>ORDEN:</strong> ${order.order_number}</div>
                  <div class="info-line"><strong>CLIENTE:</strong> ${customer.full_name.slice(0, 25)}</div>
                  <div class="info-line"><strong>TEL:</strong> ${(customer.phone || 'N/A').slice(0, 15)}</div>
                  <div class="info-line"><strong>DISPOSITIVO:</strong> ${(order.device_type + ' ' + order.device_brand).slice(0, 22)}</div>
                  <div class="info-line"><strong>SERIE:</strong> ${(order.serial_number || 'N/A').slice(0, 20)}</div>
                </div>
              </div>
            </body>
          </html>
        `)
      } else {
        // Template para comanda en tirilla (80mm)
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Orden #${order.order_number}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 10px; 
                  width: 80mm;
                  margin: 0;
                  padding: 2mm;
                  line-height: 1.3;
                  background: white;
                }
                .header {
                  text-align: center;
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 3mm;
                }
                .logo {
                  width: 60mm;
                  height: auto;
                  margin-bottom: 2mm;
                }
                .title {
                  font-weight: bold;
                  font-size: 11px;
                  margin-bottom: 2mm;
                }
                .content {
                  font-size: 9px;
                  line-height: 1.4;
                }
                .section {
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #ccc;
                  padding-bottom: 2mm;
                }
                .label {
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 5mm;
                  font-size: 8px;
                  border-top: 1px dashed #000;
                  padding-top: 3mm;
                }
                @media print {
                  body { 
                    width: 80mm;
                    margin: 0;
                    padding: 2mm;
                  }
                  @page {
                    margin: 0;
                    size: 80mm auto;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="${logoBase64}" alt="GameBox Logo" class="logo">
                <div class="title">COMANDA DE SERVICIO</div>
              </div>
              
              <div class="content">
                <div class="section">
                  <div><span class="label">ORDEN:</span> ${order.order_number}</div>
                  <div><span class="label">FECHA:</span> ${formatDate(order.created_at)}</div>
                </div>
                
                <div class="section">
                  <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                  <div><span class="label">CEDULA:</span> ${customer.cedula}</div>
                  ${customer.phone ? `<div><span class="label">TEL:</span> ${customer.phone}</div>` : ''}
                </div>
                
                <div class="section">
                  <div class="label">DISPOSITIVO INGRESADO:</div>
                  <div><span class="label">TIPO:</span> ${order.device_type}</div>
                  <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                  <div><span class="label">MODELO:</span> ${order.device_model}</div>
                  <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                </div>
                
                <div class="section">
                  <div class="label">PROBLEMA:</div>
                  <div>${order.problem_description}</div>
                  ${order.observations ? `<div class="label">OBSERVACIONES:</div><div>${order.observations}</div>` : ''}
                </div>
                
                <div class="section">
                  <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                  ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                </div>
              </div>
              
              <div class="footer">
                <div class="label">CONSERVE ESTE COMPROBANTE</div>
              </div>
            </body>
          </html>
        `)
      }
      
      printWindow.document.close()
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handleDownloadPDF = () => {
    const title = viewType === 'comanda' ? 'Comanda' : 'Sticker'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      if (viewType === 'sticker') {
        // Template optimizado para sticker 7cm x 5cm
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Orden #${order.order_number}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Arial', sans-serif; 
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .instructions {
                  background: #e3f2fd;
                  padding: 15px;
                  margin-bottom: 20px;
                  border-radius: 5px;
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                }
                .sticker-container {
                  width: 7cm;
                  height: 5cm;
                  border: 2px solid #000;
                  padding: 2mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  box-sizing: border-box;
                  margin: 0 auto;
                }
                .logo {
                  width: 100%;
                  max-width: 4cm;
                  height: auto;
                  margin: 0 auto 2mm auto;
                  display: block;
                }
                .info {
                  flex-grow: 1;
                  font-size: 9px;
                  line-height: 1.2;
                  color: #000;
                }
                .info-line {
                  margin-bottom: 1mm;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .info-line strong {
                  font-weight: bold;
                  color: #000;
                }
                @media print {
                  .instructions {
                    display: none;
                  }
                  body { 
                    margin: 0;
                    padding: 0;
                  }
                  @page {
                    margin: 0;
                    size: 7cm 5cm;
                  }
                  .sticker-container {
                    width: 7cm;
                    height: 5cm;
                  }
                }
              </style>
            </head>
            <body>
              <div class="instructions">
                <strong>📄 Para guardar como PDF:</strong><br>
                1. Presiona <strong>Ctrl+P</strong> (o Cmd+P en Mac)<br>
                2. En "Destino" selecciona <strong>"Guardar como PDF"</strong><br>
                3. Haz clic en <strong>"Guardar"</strong><br>
                <strong>📏 Tamaño de impresión:</strong> 7cm × 5cm
              </div>
              <div class="sticker-container">
                <img src="${logoBase64}" alt="GameBox Logo" class="logo">
                <div class="info">
                  <div class="info-line"><strong>ORDEN:</strong> ${order.order_number}</div>
                  <div class="info-line"><strong>CLIENTE:</strong> ${customer.full_name.slice(0, 25)}</div>
                  <div class="info-line"><strong>TEL:</strong> ${(customer.phone || 'N/A').slice(0, 15)}</div>
                  <div class="info-line"><strong>DISPOSITIVO:</strong> ${(order.device_type + ' ' + order.device_brand).slice(0, 22)}</div>
                  <div class="info-line"><strong>SERIE:</strong> ${(order.serial_number || 'N/A').slice(0, 20)}</div>
                </div>
              </div>
            </body>
          </html>
        `)
      } else {
        // Template para comanda en tirilla (80mm) - PDF
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - Orden #${order.order_number}</title>
              <meta charset="utf-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Courier New', monospace; 
                  font-size: 10px; 
                  width: 80mm;
                  margin: 0;
                  padding: 2mm;
                  line-height: 1.3;
                  background: white;
                }
                .instructions {
                  background: #e3f2fd;
                  padding: 10px;
                  margin-bottom: 15px;
                  border-radius: 5px;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  width: auto;
                }
                .header {
                  text-align: center;
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 3mm;
                }
                .logo {
                  width: 60mm;
                  height: auto;
                  margin-bottom: 2mm;
                }
                .title {
                  font-weight: bold;
                  font-size: 11px;
                  margin-bottom: 2mm;
                }
                .content {
                  font-size: 9px;
                  line-height: 1.4;
                }
                .section {
                  margin-bottom: 3mm;
                  border-bottom: 1px dashed #ccc;
                  padding-bottom: 2mm;
                }
                .label {
                  font-weight: bold;
                }
                .footer {
                  text-align: center;
                  margin-top: 5mm;
                  font-size: 8px;
                  border-top: 1px dashed #000;
                  padding-top: 3mm;
                }
                @media print {
                  .instructions {
                    display: none;
                  }
                  body { 
                    width: 80mm;
                    margin: 0;
                    padding: 2mm;
                  }
                  @page {
                    margin: 0;
                    size: 80mm auto;
                  }
                }
              </style>
            </head>
            <body>
              <div class="instructions">
                <strong>📄 Para guardar como PDF:</strong><br>
                1. Presiona <strong>Ctrl+P</strong> (o Cmd+P en Mac)<br>
                2. En "Destino" selecciona <strong>"Guardar como PDF"</strong><br>
                3. Haz clic en <strong>"Guardar"</strong><br>
                <strong>📏 Formato:</strong> Tirilla 80mm
              </div>
              
              <div class="header">
                <img src="${logoBase64}" alt="GameBox Logo" class="logo">
                <div class="title">COMANDA DE SERVICIO</div>
              </div>
              
              <div class="content">
                <div class="section">
                  <div><span class="label">ORDEN:</span> ${order.order_number}</div>
                  <div><span class="label">FECHA:</span> ${formatDate(order.created_at)}</div>
                </div>
                
                <div class="section">
                  <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                  <div><span class="label">CEDULA:</span> ${customer.cedula}</div>
                  ${customer.phone ? `<div><span class="label">TEL:</span> ${customer.phone}</div>` : ''}
                </div>
                
                <div class="section">
                  <div class="label">DISPOSITIVO INGRESADO:</div>
                  <div><span class="label">TIPO:</span> ${order.device_type}</div>
                  <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                  <div><span class="label">MODELO:</span> ${order.device_model}</div>
                  <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                </div>
                
                <div class="section">
                  <div class="label">PROBLEMA:</div>
                  <div>${order.problem_description}</div>
                  ${order.observations ? `<div class="label">OBSERVACIONES:</div><div>${order.observations}</div>` : ''}
                </div>
                
                <div class="section">
                  <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                  ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                </div>
              </div>
              
              <div class="footer">
                <div class="label">CONSERVE ESTE COMPROBANTE</div>
              </div>
            </body>
          </html>
        `)
      }
      
      printWindow.document.close()
      
      // Auto-open print dialog for PDF saving
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title d-flex align-items-center">
                <FileText size={20} className="me-2" />
                Vista Previa - Orden #{order.order_number}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>
            
            <div className="modal-body">
              {/* Selector de tipo de vista */}
              <div className="mb-3">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${viewType === 'comanda' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewType('comanda')}
                  >
                    <FileText className="me-1" size={16} />
                    Comanda Completa
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewType === 'sticker' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewType('sticker')}
                  >
                    <Tag className="me-1" size={16} />
                    Sticker de Consola
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              {viewType === 'sticker' ? (
                // Vista previa con imagen para sticker optimizado 7x5cm
                <div className="bg-light p-3 rounded mb-3 text-center" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <div className="border rounded p-2 d-inline-block bg-white" style={{ 
                    width: '280px', 
                    height: '200px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {/* Logo optimizado */}
                    <img src={logoGamebox} alt="GameBox Logo" style={{ 
                      width: '100%', 
                      maxWidth: '180px', 
                      height: 'auto', 
                      margin: '0 auto 8px auto',
                      display: 'block'
                    }} />
                    
                    <div style={{ 
                      fontSize: '11px', 
                      textAlign: 'left', 
                      flexGrow: 1,
                      lineHeight: '1.3'
                    }}>
                      <div style={{ marginBottom: '2px' }}><strong>ORDEN:</strong> {order.order_number}</div>
                      <div style={{ marginBottom: '2px' }}><strong>CLIENTE:</strong> {customer.full_name.slice(0, 25)}</div>
                      <div style={{ marginBottom: '2px' }}><strong>TEL:</strong> {(customer.phone || 'N/A').slice(0, 15)}</div>
                      <div style={{ marginBottom: '2px' }}><strong>DISPOSITIVO:</strong> {(order.device_type + ' ' + order.device_brand).slice(0, 22)}</div>
                      <div><strong>SERIE:</strong> {(order.serial_number || 'N/A').slice(0, 20)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-muted" style={{ fontSize: '12px' }}>
                    📏 <strong>Tamaño de impresión:</strong> 7cm × 5cm
                  </div>
                </div>
              ) : (
                // Vista previa para comanda en formato tirilla
                <div className="bg-light p-3 rounded mb-3" style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto' 
                }}>
                  <div className="mx-auto border rounded p-3 bg-white" style={{ 
                    width: '280px', // Simula 80mm
                    fontFamily: 'Courier New, monospace',
                    fontSize: '11px'
                  }}>
                    {/* Header con logo */}
                    <div className="text-center mb-3 pb-2" style={{ borderBottom: '1px dashed #000' }}>
                      <img src={logoGamebox} alt="GameBox Logo" style={{ 
                        width: '200px', 
                        height: 'auto',
                        marginBottom: '8px'
                      }} />
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>COMANDA DE SERVICIO</div>
                    </div>
                    
                    {/* Contenido organizado en secciones */}
                    <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>ORDEN:</strong> {order.order_number}</div>
                        <div><strong>FECHA:</strong> {formatDate(order.created_at)}</div>
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>CLIENTE:</strong> {customer.full_name}</div>
                        <div><strong>CEDULA:</strong> {customer.cedula}</div>
                        {customer.phone && <div><strong>TEL:</strong> {customer.phone}</div>}
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div style={{ fontWeight: 'bold' }}>DISPOSITIVO INGRESADO:</div>
                        <div><strong>TIPO:</strong> {order.device_type}</div>
                        <div><strong>MARCA:</strong> {order.device_brand}</div>
                        <div><strong>MODELO:</strong> {order.device_model}</div>
                        <div><strong>SERIE:</strong> {order.serial_number || 'N/A'}</div>
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div style={{ fontWeight: 'bold' }}>PROBLEMA:</div>
                        <div>{order.problem_description}</div>
                        {order.observations && (
                          <>
                            <div style={{ fontWeight: 'bold', marginTop: '5px' }}>OBSERVACIONES:</div>
                            <div>{order.observations}</div>
                          </>
                        )}
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>ESTADO:</strong> {getStatusDisplayName(order.status)}</div>
                        {order.completed_by && (
                          <div><strong>FINALIZADO POR:</strong> {order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-3 pt-2" style={{ 
                      borderTop: '1px dashed #000',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      CONSERVE ESTE COMPROBANTE
                    </div>
                  </div>
                  
                  <div className="mt-2 text-muted text-center" style={{ fontSize: '12px' }}>
                    📏 <strong>Formato de impresión:</strong> Tirilla 80mm
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={handlePrint}
                >
                  <Printer size={16} className="me-1" />
                  Imprimir {viewType === 'comanda' ? 'Comanda' : 'Sticker'}
                </button>
                
                <button
                  className="btn btn-success"
                  onClick={handleDownloadPDF}
                >
                  <Download size={16} className="me-1" />
                  Guardar PDF
                </button>
                
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  <X size={16} className="me-1" />
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ComandaPreview