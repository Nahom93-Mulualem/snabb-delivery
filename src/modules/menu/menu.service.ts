import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { MenuItemEntity } from '../../database/entities.js';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly db: InMemoryDbService,
  ) {}

  async getMenuByRestaurant(restaurantId: string): Promise<any[]> {
    try {
      const items = await this.prisma.menuItem.findMany({
        where: {
          OR: [
            { restaurantId },
            { restaurant: { slug: restaurantId } },
          ],
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (items && items.length > 0) {
        return items.map((item: any) => ({
          ...item,
          category: item.category?.name || 'Main',
          inStock: item.isAvailable,
        }));
      }
    } catch (err: any) {
      this.logger.warn(`Prisma getMenuByRestaurant failed, fallback: ${err.message}`);
    }

    return this.db.getMenuItems(restaurantId);
  }

  async getMenuItemById(id: string): Promise<any> {
    try {
      const item = await this.prisma.menuItem.findUnique({
        where: { id },
        include: { category: true, restaurant: true },
      });
      if (item) {
        return {
          ...item,
          category: item.category?.name || 'Main',
          inStock: item.isAvailable,
        };
      }
    } catch (err: any) {
      this.logger.warn(`Prisma getMenuItemById failed, fallback: ${err.message}`);
    }

    const item = this.db.getMenuItemById(id);
    if (!item) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return item;
  }

  async addMenuItem(restaurantId: string, itemData: Partial<MenuItemEntity>): Promise<any> {
    try {
      const created = await this.prisma.menuItem.create({
        data: {
          restaurantId,
          name: itemData.name || 'Untitled Dish',
          description: itemData.description || '',
          price: Number(itemData.price) || 250.0,
          image: itemData.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
          isAvailable: itemData.inStock !== false,
          isPopular: !!itemData.isPopular,
        },
      });
      if (created) return created;
    } catch (err: any) {
      this.logger.warn(`Prisma addMenuItem failed, fallback: ${err.message}`);
    }

    const newItem: MenuItemEntity = {
      id: `dish-${Date.now().toString(36)}`,
      restaurantId,
      name: itemData.name || 'Untitled Product',
      description: itemData.description || '',
      price: itemData.price || 250,
      category: itemData.category || 'Main',
      image: itemData.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80',
      inStock: itemData.inStock !== false,
      options: itemData.options || [],
      isPopular: false,
    };
    return this.db.addMenuItem(newItem);
  }

  async updateMenuItem(id: string, updates: Partial<MenuItemEntity>): Promise<any> {
    try {
      const prismaData: any = {};
      if (updates.name !== undefined) prismaData.name = updates.name;
      if (updates.description !== undefined) prismaData.description = updates.description;
      if (updates.price !== undefined) prismaData.price = Number(updates.price);
      if (updates.image !== undefined) prismaData.image = updates.image;
      if (updates.inStock !== undefined) prismaData.isAvailable = updates.inStock;
      if (updates.isPopular !== undefined) prismaData.isPopular = updates.isPopular;

      const updated = await this.prisma.menuItem.update({
        where: { id },
        data: prismaData,
      });
      if (updated) return updated;
    } catch (err: any) {
      this.logger.warn(`Prisma updateMenuItem failed: ${err.message}`);
    }

    const updated = this.db.updateMenuItem(id, updates);
    if (!updated) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return updated;
  }

  async toggleStock(id: string, inStock: boolean): Promise<any> {
    return this.updateMenuItem(id, { inStock });
  }

  async deleteMenuItem(id: string): Promise<{ success: boolean; id: string }> {
    try {
      await this.prisma.menuItem.delete({
        where: { id },
      });
      return { success: true, id };
    } catch (err: any) {
      this.logger.warn(`Prisma deleteMenuItem failed, fallback: ${err.message}`);
    }

    const deleted = this.db.deleteMenuItem(id);
    if (!deleted) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return { success: true, id };
  }
}

