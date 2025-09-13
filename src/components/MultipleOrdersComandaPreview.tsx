import React, { useState } from 'react'
import { FileText, Printer, Download, X, Tag, Package } from 'lucide-react'
import type { ServiceOrder, Customer } from '../types'

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

  const generateComandaCompleta = () => {
    const firstOrder = orders[0]
    if (!customer) {
      return 'Error: Información del cliente no disponible'
    }
    
    const content = `
==========================================
           GAMEBOXSERVICE
        COMANDA MÚLTIPLE DE SERVICIO
==========================================

FECHA: ${formatDate(firstOrder.created_at)}
CANTIDAD DE DISPOSITIVOS: ${orders.length}

------------------------------------------
CLIENTE:
------------------------------------------
${customer.full_name || 'N/A'}
CEDULA: ${customer.cedula || 'N/A'}
${customer.phone ? `TEL: ${customer.phone}` : ''}

------------------------------------------
DISPOSITIVOS INGRESADOS:
------------------------------------------
${orders.map((order, index) => `
${index + 1}. ORDEN #: ${order.order_number}
   ${order.device_type} - ${order.device_brand}
   MODELO: ${order.device_model || 'N/A'}
   ${order.serial_number ? `SERIE: ${order.serial_number}` : 'SERIE: N/A'}
   
   PROBLEMA:
   ${order.problem_description}
   
   ${order.observations ? `OBSERVACIONES: ${order.observations}` : ''}
   ESTADO: ${getStatusDisplayName(order.status)}
   ${order.completed_by ? `FINALIZADO POR: ${order.completed_by.full_name}` : ''}
   ${'─'.repeat(38)}
`).join('')}

==========================================
TOTAL DE ÓRDENES CREADAS: ${orders.length}
CONSERVE ESTE COMPROBANTE
==========================================
    `
    return content.trim()
  }

  const generateIndividualStickers = () => {
    if (!customer) {
      return 'Error: Información del cliente no disponible'
    }
    
    return orders.map((order, index) => `
┌─────────────────────────────────────┐
│           GAMEBOXSERVICE            │
│             DISPOSITIVO ${(index + 1).toString().padStart(2, '0')}           │
│                                     │
│  ORDEN #: ${(order.order_number || 'N/A').padEnd(25)} │
│                                     │
│  CLIENTE:                           │
│  ${(customer.full_name || 'N/A').slice(0,30).padEnd(30)} │
│                                     │
│  TELEFONO:                          │
│  ${(customer.phone || 'N/A').padEnd(30)} │
│                                     │
│  DISPOSITIVO:                       │
│  ${(order.device_type + ' ' + order.device_brand).slice(0,30).padEnd(30)} │
│                                     │
│  MODELO:                            │
│  ${(order.device_model || 'N/A').slice(0,30).padEnd(30)} │
│                                     │
│  ${order.serial_number ? `SERIE: ${order.serial_number.slice(0,24).padEnd(24)}` : 'SERIE: N/A'.padEnd(31)} │
│                                     │
│  PROBLEMA:                          │
│  ${order.problem_description.slice(0,30).padEnd(30)} │
│  ${order.problem_description.slice(30,60).padEnd(30)} │
│                                     │
└─────────────────────────────────────┘

${'═'.repeat(39)}

`).join('')
  }

  const handlePrintComanda = () => {
    const content = generateComandaCompleta()
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comanda Múltiple - ${customer.full_name}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 10mm;
                white-space: pre-wrap;
                line-height: 1.2;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 5mm;
                }
                @page {
                  margin: 5mm;
                  size: auto;
                }
              }
            </style>
          </head>
          <body>${content}</body>
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
    const content = generateIndividualStickers()
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Stickers Individuales - ${customer.full_name}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 10px; 
                margin: 0; 
                padding: 5mm;
                white-space: pre-wrap;
                line-height: 1.1;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 2mm;
                }
                @page {
                  margin: 2mm;
                  size: auto;
                }
              }
            </style>
          </head>
          <body>${content}</body>
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
    const content = viewType === 'comanda' ? generateComandaCompleta() : generateIndividualStickers()
    const title = viewType === 'comanda' ? 'Comanda Múltiple' : 'Stickers Individuales'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title} - ${customer.full_name}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: ${viewType === 'individual-stickers' ? '10px' : '12px'}; 
                margin: 0; 
                padding: 10mm;
                white-space: pre-wrap;
                line-height: ${viewType === 'individual-stickers' ? '1.1' : '1.2'};
              }
              .instructions {
                background: #e3f2fd;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
              }
              @media print {
                .instructions {
                  display: none;
                }
                body { 
                  margin: 0; 
                  padding: ${viewType === 'individual-stickers' ? '2mm' : '5mm'};
                }
                @page {
                  margin: ${viewType === 'individual-stickers' ? '2mm' : '5mm'};
                  size: auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="instructions">
              <strong>📄 Para guardar como PDF:</strong><br>
              1. Presiona <strong>Ctrl+P</strong> (o Cmd+P en Mac)<br>
              2. En "Destino" selecciona <strong>"Guardar como PDF"</strong><br>
              3. Haz clic en <strong>"Guardar"</strong>
            </div>
            ${content}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
  }

  const content = viewType === 'comanda' ? generateComandaCompleta() : generateIndividualStickers()

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
              <div className="bg-light p-3 rounded mb-3" style={{ 
                fontFamily: 'monospace', 
                fontSize: viewType === 'individual-stickers' ? '10px' : '12px', 
                whiteSpace: 'pre-wrap', 
                maxHeight: '500px', 
                overflowY: 'auto' 
              }}>
                {content}
              </div>
              
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