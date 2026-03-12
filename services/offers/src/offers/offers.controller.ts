import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Offers')
@ApiBearerAuth('access-token')
@Controller('api/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create offer' })
  @ApiResponse({ status: 201, description: 'Offer created', type: OfferResponseDto })
  async createOffer(@Body() dto: CreateOfferDto): Promise<OfferResponseDto> {
    return this.offersService.createOffer(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Offer found', type: OfferResponseDto })
  async getOffer(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.offersService.getOfferById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List offers' })
  @ApiResponse({ status: 200, description: 'Offers list', type: [OfferResponseDto] })
  async listOffers(@Query('status') status?: string): Promise<OfferResponseDto[]> {
    return this.offersService.listOffers(status);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update offer' })
  @ApiResponse({ status: 200, description: 'Offer updated', type: OfferResponseDto })
  async updateOffer(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offersService.updateOffer(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete offer' })
  @ApiResponse({ status: 200, description: 'Offer deleted' })
  async deleteOffer(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.offersService.deleteOffer(id);
    return { success: true };
  }
}
