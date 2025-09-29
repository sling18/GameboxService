import React, { useState } from 'react'
import { FileText, Printer, Download, X, Tag } from 'lucide-react'
import type { ServiceOrder, Customer } from '../types'

interface ComandaPreviewProps {
  order: ServiceOrder
  customer: Customer
  onClose: () => void
}

const ComandaPreview: React.FC<ComandaPreviewProps> = ({ order, customer, onClose }) => {
  const [viewType, setViewType] = useState<'comanda' | 'sticker'>('comanda')
  
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

  const generateComandaContent = () => {
    const content = `
==========================================
           GAMEBOXSERVICE
           COMANDA DE SERVICIO
==========================================

ORDEN #: ${order.order_number}
FECHA: ${formatDate(order.created_at)}
------------------------------------------
CLIENTE: ${customer.full_name}
CEDULA: ${customer.cedula}
${customer.phone ? `TEL: ${customer.phone}` : ''}
------------------------------------------
DISPOSITIVO INGRESADO:
------------------------------------------
DISPOSITIVO: ${order.device_type} - ${order.device_brand}
MODELO: ${order.device_model} 
${order.serial_number ? `SERIE: ${order.serial_number}` : 'SERIE: N/A'}

PROBLEMA: ${order.problem_description}
${order.observations ? `OBSERVACIONES: ${order.observations}` : ''}

ESTADO: ${getStatusDisplayName(order.status)}
${order.completed_by ? `FINALIZADO POR: ${order.completed_by.full_name || order.completed_by.email?.split('@')[0] || 'Técnico'}` : ''}
------------------------------------------
==========================================
CONSERVE ESTE COMPROBANTE
==========================================
    `
    return content.trim()
  }

  const generateStickerContent = () => {
    const content = `
┌─────────────────────────────────────┐
│           GAMEBOXSERVICE            │
│  ORDEN #: ${order.order_number.padEnd(25)} │
│  CLIENTE: ${customer.full_name.slice(0,22).padEnd(22)}    │
│  TELEFONO: ${(customer.phone || 'N/A').slice(0,21).padEnd(21)}    │
│  DISPOSITIVO: ${(order.device_type + ' ' + order.device_brand).slice(0,18).padEnd(18)}    │
│  ${order.serial_number ? `SERIE: ${order.serial_number.slice(0,26).padEnd(26)}` : 'SERIE: N/A'.padEnd(33)}  │
└─────────────────────────────────────┘
    `
    return content.trim()
  }

  const handlePrint = () => {
    const content = viewType === 'comanda' ? generateComandaContent() : generateStickerContent()
    const title = viewType === 'comanda' ? 'Comanda' : 'Sticker'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title} - Orden #${order.order_number}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: ${viewType === 'sticker' ? '10px' : '12px'}; 
                margin: 0; 
                padding: 10mm;
                white-space: pre-wrap;
                line-height: 1.2;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: ${viewType === 'sticker' ? '2mm' : '5mm'};
                }
                @page {
                  margin: ${viewType === 'sticker' ? '2mm' : '5mm'};
                  size: ${viewType === 'sticker' ? 'auto' : 'auto'};
                }
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `)
      printWindow.document.close()
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handleDownloadPDF = () => {
    const content = viewType === 'comanda' ? generateComandaContent() : generateStickerContent()
    const title = viewType === 'comanda' ? 'Comanda' : 'Sticker'
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title} - Orden #${order.order_number}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: ${viewType === 'sticker' ? '10px' : '12px'}; 
                margin: 0; 
                padding: 10mm;
                white-space: pre-wrap;
                line-height: 1.2;
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
                  padding: ${viewType === 'sticker' ? '2mm' : '5mm'};
                }
                @page {
                  margin: ${viewType === 'sticker' ? '2mm' : '5mm'};
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
      
      // Auto-open print dialog for PDF saving
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
  }

  const content = viewType === 'comanda' ? generateComandaContent() : generateStickerContent()

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
              <div className="bg-light p-3 rounded mb-3" style={{ 
                fontFamily: 'monospace', 
                fontSize: viewType === 'sticker' ? '10px' : '12px', 
                whiteSpace: 'pre-wrap', 
                maxHeight: '400px', 
                overflowY: 'auto' 
              }}>
                {content}
              </div>
              
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