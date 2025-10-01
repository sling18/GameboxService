import React, { useState } from 'react'
import { FileText, Printer, Download, X, Tag, Package } from 'lucide-react'
import type { ServiceOrder, Customer } from '../types'
import logoGamebox from '../assets/logo-gamebox.png'
import { useImageToBase64 } from '../hooks'
import { formatDateForPrint, getStatusDisplayName } from '../utils'

interface MultipleOrdersComandaPreviewProps {
  orders: ServiceOrder[]
  customer: Customer
  onClose: () => void
}

const MultipleOrdersComandaPreview: React.FC<MultipleOrdersComandaPreviewProps> = ({ 
  orders, 
  customer, 
  onClose 
}) => {
  const [viewType, setViewType] = useState<'comanda' | 'individual-stickers'>('comanda')
  
  // Usar hook personalizado para conversión de imagen
  const { base64: logoBase64 } = useImageToBase64(logoGamebox)
  
  // Validación de datos requeridos
  if (!customer || !orders || orders.length === 0) {
    console.error('❌ MultipleOrdersComandaPreview: Datos incompletos', { customer, orders })
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Error</h5>
            </div>
            <div className="modal-body text-center">
              <p>Error: No se pudo cargar la información de la comanda.</p>
              <p className="text-muted small">
                {!customer && 'Información del cliente no disponible. '}
                {(!orders || orders.length === 0) && 'No hay órdenes para mostrar. '}
              </p>
              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  console.log('✅ MultipleOrdersComandaPreview: Datos cargados', { 
    customer: customer.full_name, 
    ordersCount: orders.length 
  })

  const handlePrintComanda = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comanda Múltiple - ${customer.full_name}</title>
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
              .order-item {
                margin-bottom: 4mm;
                padding: 2mm;
                border: 1px solid #ddd;
              }
              .footer {
                text-align: center;
                margin-top: 5mm;
                font-size: 10px;
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
              <div class="title">COMANDA MÚLTIPLE DE SERVICIO</div>
            </div>
            
            <div class="content">
              <div class="section">
                <div><span class="label">FECHA:</span> ${formatDateForPrint(orders[0].created_at)}</div>
                <div><span class="label">DISPOSITIVOS:</span> ${orders.length}</div>
              </div>
              
              <div class="section">
                <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                <div><span class="label">CEDULA:</span> ${customer.cedula}</div>
                ${customer.phone ? `<div><span class="label">TEL:</span> ${customer.phone}</div>` : ''}
              </div>
              
              <div class="section">
                <div class="label">DISPOSITIVOS INGRESADOS:</div>
                ${orders.map((order, index) => `
                  <div class="order-item">
                    <div><span class="label">${index + 1}. ORDEN:</span> ${order.order_number}</div>
                    <div><span class="label">TIPO:</span> ${order.device_type}</div>
                    <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                    <div><span class="label">MODELO:</span> ${order.device_model || 'N/A'}</div>
                    <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                    <div><span class="label">PROBLEMA:</span> ${order.problem_description}</div>
                    ${order.observations ? `<div><span class="label">OBS:</span> ${order.observations}</div>` : ''}
                    <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                    ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="footer">
              <div class="label">TOTAL: ${orders.length} ÓRDENES</div>
              <div class="label">CONSERVE ESTE COMPROBANTE</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handlePrintStickers = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Stickers Individuales - ${customer.full_name}</title>
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
                margin-bottom: 5mm;
                page-break-inside: avoid;
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
                  margin: 2mm;
                  size: auto;
                }
                .sticker-container {
                  width: 7cm;
                  height: 5cm;
                }
              }
            </style>
          </head>
          <body>
            ${orders.map((order) => `
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
            `).join('')}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handleDownloadPDF = () => {
    const title = viewType === 'comanda' ? 'Comanda Múltiple' : 'Stickers Individuales'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      if (viewType === 'individual-stickers') {
        // Template para stickers individuales optimizado 7cm x 5cm
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${customer.full_name}</title>
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
                  margin: 0 auto 5mm auto;
                  page-break-inside: avoid;
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
                    margin: 2mm;
                    size: auto;
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
                <strong>📏 Tamaño:</strong> ${orders.length} stickers de 7cm × 5cm
              </div>
              ${orders.map((order) => `
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
              `).join('')}
            </body>
          </html>
        `)
      } else {
        // Template para comanda múltiple en tirilla
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${customer.full_name}</title>
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
                .order-item {
                  margin-bottom: 4mm;
                  padding: 2mm;
                  border: 1px solid #ddd;
                }
                .footer {
                  text-align: center;
                  margin-top: 5mm;
                  font-size: 10px;
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
                <div class="title">COMANDA MÚLTIPLE DE SERVICIO</div>
              </div>
              
              <div class="content">
                <div class="section">
                  <div><span class="label">FECHA:</span> ${formatDateForPrint(orders[0].created_at)}</div>
                  <div><span class="label">DISPOSITIVOS:</span> ${orders.length}</div>
                </div>
                
                <div class="section">
                  <div><span class="label">CLIENTE:</span> ${customer.full_name}</div>
                  <div><span class="label">CEDULA:</span> ${customer.cedula}</div>
                  ${customer.phone ? `<div><span class="label">TEL:</span> ${customer.phone}</div>` : ''}
                </div>
                
                <div class="section">
                  <div class="label">DISPOSITIVOS INGRESADOS:</div>
                  ${orders.map((order, index) => `
                    <div class="order-item">
                      <div><span class="label">${index + 1}. ORDEN:</span> ${order.order_number}</div>
                      <div><span class="label">TIPO:</span> ${order.device_type}</div>
                      <div><span class="label">MARCA:</span> ${order.device_brand}</div>
                      <div><span class="label">MODELO:</span> ${order.device_model || 'N/A'}</div>
                      <div><span class="label">SERIE:</span> ${order.serial_number || 'N/A'}</div>
                      <div><span class="label">PROBLEMA:</span> ${order.problem_description}</div>
                      ${order.observations ? `<div><span class="label">OBS:</span> ${order.observations}</div>` : ''}
                      <div><span class="label">ESTADO:</span> ${getStatusDisplayName(order.status)}</div>
                      ${order.completed_by ? `<div><span class="label">FINALIZADO POR:</span> ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="footer">
                <div class="label">TOTAL: ${orders.length} ÓRDENES</div>
                <div class="label">CONSERVE ESTE COMPROBANTE</div>
              </div>
            </body>
          </html>
        `)
      }
      
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title d-flex align-items-center">
                <Package size={20} className="me-2" />
                Vista Previa - Múltiples Dispositivos ({orders.length} órdenes)
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
                    Comanda Completa ({orders.length} dispositivos)
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewType === 'individual-stickers' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewType('individual-stickers')}
                  >
                    <Tag className="me-1" size={16} />
                    Stickers Individuales ({orders.length} etiquetas)
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              {viewType === 'individual-stickers' ? (
                // Vista previa de stickers individuales optimizados
                <div className="bg-light p-3 rounded mb-3" style={{ 
                  maxHeight: '500px', 
                  overflowY: 'auto' 
                }}>
                  {orders.map((order, index) => (
                    <div key={order.id} className="mx-auto border rounded p-2 bg-white mb-3" style={{ 
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
                        margin: '0 auto 5px auto',
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
                      
                      <div className="text-center text-muted" style={{ fontSize: '9px', marginTop: '5px' }}>
                        Sticker {index + 1} de {orders.length} - 7cm × 5cm
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Vista previa para comanda múltiple en formato tirilla
                <div className="bg-light p-3 rounded mb-3" style={{ 
                  maxHeight: '500px', 
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
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>COMANDA MÚLTIPLE DE SERVICIO</div>
                    </div>
                    
                    {/* Contenido organizado en secciones */}
                    <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>FECHA:</strong> {formatDateForPrint(orders[0].created_at)}</div>
                        <div><strong>DISPOSITIVOS:</strong> {orders.length}</div>
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div><strong>CLIENTE:</strong> {customer.full_name}</div>
                        <div><strong>CEDULA:</strong> {customer.cedula}</div>
                        {customer.phone && <div><strong>TEL:</strong> {customer.phone}</div>}
                      </div>
                      
                      <div className="mb-2 pb-2" style={{ borderBottom: '1px dashed #ccc' }}>
                        <div style={{ fontWeight: 'bold' }}>DISPOSITIVOS INGRESADOS:</div>
                        {orders.map((order, index) => (
                          <div key={order.id} className="mt-2 p-2" style={{ border: '1px solid #ddd', fontSize: '9px' }}>
                            <div><strong>{index + 1}. ORDEN:</strong> {order.order_number}</div>
                            <div><strong>TIPO:</strong> {order.device_type}</div>
                            <div><strong>MARCA:</strong> {order.device_brand}</div>
                            <div><strong>MODELO:</strong> {order.device_model || 'N/A'}</div>
                            <div><strong>SERIE:</strong> {order.serial_number || 'N/A'}</div>
                            <div><strong>PROBLEMA:</strong> {order.problem_description.slice(0, 30)}...</div>
                            <div><strong>ESTADO:</strong> {getStatusDisplayName(order.status)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-3 pt-2" style={{ 
                      borderTop: '1px dashed #000',
                      fontSize: '9px',
                      fontWeight: 'bold'
                    }}>
                      <div>TOTAL: {orders.length} ÓRDENES</div>
                      <div>CONSERVE ESTE COMPROBANTE</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-muted text-center" style={{ fontSize: '12px' }}>
                    📏 <strong>Formato de impresión:</strong> Tirilla 80mm
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={handlePrintComanda}
                >
                  <Printer size={16} className="me-1" />
                  Imprimir Comanda Completa
                </button>
                
                <button
                  className="btn btn-warning text-dark"
                  onClick={handlePrintStickers}
                >
                  <Tag size={16} className="me-1" />
                  Imprimir {orders.length} Stickers
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

              {/* Info */}
              <div className="alert alert-info mt-3">
                <small>
                  <strong>📋 Comanda Completa:</strong> Un documento con todos los dispositivos del cliente<br />
                  <strong>🏷️ Stickers Individuales:</strong> Etiquetas separadas para marcar cada consola/dispositivo
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MultipleOrdersComandaPreview
