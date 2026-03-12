import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';

@Controller('api/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async createOffer(@Body() dto: CreateOfferDto): Promise<OfferResponseDto> {
    return this.offersService.createOffer(dto);
  }

  @Get(':id')
  async getOffer(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offersService.getOfferById(id);
  }

  @Get()
  async listOffers(@Query('status') status?: string): Promise<OfferResponseDto[]> {
    return this.offersService.listOffers(status);
  }

  @Patch(':id')
  async updateOffer(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offersService.updateOffer(id, dto);
  }

  @Delete(':id')
  async deleteOffer(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.offersService.deleteOffer(id);
    return { success: true };
  }
}
