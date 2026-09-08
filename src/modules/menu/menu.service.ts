import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { MenuItemEntity } from '../../database/entities.js';

@Injectable()
export class MenuService {
  constructor(private db: InMemoryDbService) {}

  getMenuByRestaurant(restaurantId: string): MenuItemEntity[] {
    return this.db.getMenuItems(restaurantId);
  }

  getMenuItemById(id: string): MenuItemEntity {
    const item = this.db.getMenuItemById(id);
    if (!item) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return item;
  }

  addMenuItem(restaurantId: string, itemData: Partial<MenuItemEntity>): MenuItemEntity {
    const newItem: MenuItemEntity = {
      id: `dish-${Date.now().toString(36)}`,
      restaurantId,
      name: itemData.name || 'Untitled Product',
      description: itemData.description || '',
      price: itemData.price || 9.99,
      category: itemData.category || 'Main',
      image: itemData.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      inStock: itemData.inStock !== false,
      options: itemData.options || [],
      isPopular: false,
    };
    return this.db.addMenuItem(newItem);
  }

  updateMenuItem(id: string, updates: Partial<MenuItemEntity>): MenuItemEntity {
    const updated = this.db.updateMenuItem(id, updates);
    if (!updated) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return updated;
  }

  toggleStock(id: string, inStock: boolean): MenuItemEntity {
    const updated = this.db.updateMenuItem(id, { inStock });
    if (!updated) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return updated;
  }

  deleteMenuItem(id: string): { success: boolean; id: string } {
    const deleted = this.db.deleteMenuItem(id);
    if (!deleted) {
      throw new NotFoundException(`Menu item "${id}" not found`);
    }
    return { success: true, id };
  }
}
