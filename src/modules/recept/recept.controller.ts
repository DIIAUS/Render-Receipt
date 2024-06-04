import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReceptService } from './recept.service';
import { Response } from 'express';
import { ApiQuery } from '@nestjs/swagger';

@Controller('recept')
export class ReceptController {
  constructor(private readonly receptService: ReceptService) {}

  @Get('receipt')
  @ApiQuery({
    name: 'type',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'data',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'qrWidth',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'qrMargin',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'qrColorDark',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'qrColorLight',
    type: String,
    required: false,
  })
  async getReceiptPDF(
    @Res() res,
    @Query('type') type: string,
    @Query('data') data: string,
    @Query('qrWidth') qrWidth?: number,
    @Query('qrMargin') qrMargin?: number,
    @Query('qrColorDark') qrColorDark?: string,
    @Query('qrColorLight') qrColorLight?: string,
  ) {
    try {
      const qrOptions = {
        width: qrWidth,
        margin: qrMargin,
        color: {
          dark: qrColorDark,
          light: qrColorLight,
        }
      };

      const pdf = await this.receptService.generateReceiptPDF(type, data, 50,qrOptions);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=receipt.pdf');
    
      res.send(pdf);
    } catch (error) {
      console.log(error);
      res.status(500).send('Error generating PDF');
    }
  }
}
