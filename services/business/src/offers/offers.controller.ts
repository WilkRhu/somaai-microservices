import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';

@Controller('api/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async createOffer(@Body() createOfferDto: any) {
    return await this.offersService.createOffer(createOfferDto);
  }

  @Get()
  async findAllOffers(@Query('establishmentId') establishmentId: string) {
    return await this.offersService.findAllOffers(establishmentId);
  }

  @Get(':id')
  async findOneOffer(@Param('id') id: string) {
    return await this.offersService.findOneOffer(id);
  }

  @Patch(':id')
  async updateOffer(@Param('id') id: string, @Body() updateOfferDto: any) {
    return await this.offersService.updateOffer(id, updateOfferDto);
  }

  @Delete(':id')
  async removeOffer(@Param('id') id: string) {
    await this.offersService.removeOffer(id);
    return { success: true };
  }

  @Post('notifications')
  async createNotification(@Body() createNotificationDto: any) {
    return await this.offersService.createNotification(createNotificationDto);
  }

  @Get('notifications/:offerId')
  async findAllNotifications(@Param('offerId') offerId: string) {
    return await this.offersService.findAllNotifications(offerId);
  }

  @Patch('notifications/:notificationId/view')
  async markAsViewed(@Param('notificationId') notificationId: string) {
    return await this.offersService.markAsViewed(notificationId);
  }
}
