import { Recept } from './entities/recept.entity';
import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';
import * as qrcode from 'qrcode';
import * as puppeteer from 'puppeteer'
import * as fs from 'fs-extra';
import { FileService } from 'src/utlility/file.service';

interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

@Injectable()
export class ReceptService {
  constructor(
    private readonly fileService: FileService
  ){}

  async generateBarcode(type: string = 'code128', data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer({
        bcid: type,
        text: data,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      }, (err, png) => {
        if (err) {
          return reject(err);
        } else {
          const base64 = png.toString('base64');
          resolve(`data:image/png;base64,${base64}`);
        }
      });
    });
  };

  async generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      qrcode.toDataURL(data, { ...options, type: 'png', mode: "alphanumeric" }, (err, url) => {
        if (err) {
          return reject(err);
        } else {
          resolve(url);
        }
      });
    });
  };


  async generateBoth(type: string, data: string, qrOptions?: QRCodeOptions): Promise<{ barcode: String, qrcode: String }> {
    const barcode = await this.generateBarcode(type, data);
    const qrCode = await this.generateQRCode(data, qrOptions);
    return { barcode, qrcode: qrCode };
  }

  async generateReceiptPDF(type: string, data: string, length: number, qrOptions?: QRCodeOptions): Promise<Buffer> {
    const barcodeUrl = await this.generateBarcode(type, data);
    const qrCodeUrl = await this.generateQRCode(data, qrOptions);
    const customLogo = await this.fileService.convertImageToBase64('./public/logo/logo_cus.png');
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .container {
            width: 80%;
            margin: auto;
          }
          .barcode, .qrcode {
            text-align: center;
            margin: 20px 0;
          }
          .details {
            margin-bottom: 30px;
          }
          h1 {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Receipt</h1>
          <div class="details">
            <p><strong>Product:</strong> ${data}</p>
            <p><strong>Quantity:</strong> ${length}</p>
          </div>
          <div class="barcode">
            <h2>Barcode</h2>
            <img src="${barcodeUrl}" alt="Barcode">
          </div>
          <div class="qrcode">
            <h2>QR Code</h2>
            <img src="${qrCodeUrl}" alt="QR Code">
          </div>
        </div>
      </body>
      </html>
    `;

    const htmlTemplate2 = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .container {
            width: 100%;
            margin: auto;
            display: flex;
            justify-content: space-between;
          }
          .barcode, .qrcode {
            text-align: center;
            margin: 20px 0;
          }
          .details {
            margin-bottom: 30px;
          }
          h1 {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="left">
            <img src="data:image/png;base64,${customLogo}" alt="Logo" style="width: 100px;">
          </div>
          <div class="right">
            <div class="qrcode">
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 150px;">
            </div>
            <div class="barcode">
              <img src="${barcodeUrl}" alt="Barcode">
            </div>
          </div>
        </div>
        <div class="details">
          <p>กรุณาชำระเงินเต็มจำนวน ภายใน 31/01/2562</p>
          <table>
            <tr>
              <td>เลขที่อ้างอิง 1 (Reference 1): 3000193012561</td>
            </tr>
            <tr>
              <td>เลขที่อ้างอิง 2 (Reference 2): 0000000103511011816</td>
            </tr>
            <tr>
              <td>จำนวนเงินที่ชำระ: 400.00 บาท</td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log("page   ",page);
    await page.setContent(htmlTemplate2);
    const pdf = await page.pdf({ format: 'A4' });
   

    await browser.close();
    return pdf;
  }
}
