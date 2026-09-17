import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Snabb Food Delivery Platform...');

  // Clean existing records in reverse dependency order
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.favorite.deleteMany().catch(() => {});
  await prisma.menuItem.deleteMany().catch(() => {});
  await prisma.foodCategory.deleteMany().catch(() => {});
  await prisma.restaurant.deleteMany().catch(() => {});
  await prisma.deliveryAddress.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 1. Seed Users
  console.log('👤 Seeding Users across all roles...');
  const customer = await prisma.user.create({
    data: {
      id: 'usr-customer-01',
      name: 'Abebe Bekele',
      email: 'customer@snabb.et',
      phoneNumber: '+251911445566',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
  });

  const restaurantOwner = await prisma.user.create({
    data: {
      id: 'usr-merchant-01',
      name: 'Yohannes Tesfaye',
      email: 'owner@habeshakitchen.et',
      phoneNumber: '+251911223344',
      twoFactorSecret: '793421',
      role: 'RESTAURANT_OWNER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  });

  const courierDriver = await prisma.user.create({
    data: {
      id: 'usr-driver-01',
      name: 'Dawit Kassa',
      email: 'driver@snabb.et',
      phoneNumber: '+251922334455',
      role: 'DELIVERY_DRIVER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: 'usr-admin-01',
      name: 'Alexander Lind',
      email: 'admin@snabb.io',
      clearanceKey: 'SNABB-ROOT-KEY-2026',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    },
  });

  // 2. Seed Addresses for Customer
  console.log('📍 Seeding Delivery Addresses...');
  await prisma.deliveryAddress.createMany({
    data: [
      {
        id: 'addr-01',
        userId: customer.id,
        label: 'Home',
        street: 'Bole Medhanialem, Atlas Apt 3B',
        city: 'Addis Ababa',
        doorCode: '3B',
        isDefault: true,
      },
      {
        id: 'addr-02',
        userId: customer.id,
        label: 'Office',
        street: 'Kazanchis Sunshine Building, 4th Floor',
        city: 'Addis Ababa',
        doorCode: '402',
        isDefault: false,
      },
    ],
  });

  // 3. Seed Restaurants
  console.log('🍽️ Seeding Restaurants in Addis Ababa...');
  const habeshaKitchen = await prisma.restaurant.create({
    data: {
      id: 'rest-habesha-01',
      ownerId: restaurantOwner.id,
      name: 'Habesha Kitchen & Tibs',
      slug: 'habesha-kitchen-tibs',
      description: 'Authentic clay-pot Shekla Tibs, slow-simmered Shiro, freshly spiced Kitfo, and fragrant Doro Wat cooked by master Ethiopian chefs.',
      address: 'Bole Medhanialem, next to Edna Mall',
      city: 'Addis Ababa',
      cuisine: ['Traditional Ethiopian', 'Shekla Tibs', 'Shiro', 'Fasting'],
      rating: 4.9,
      reviewCount: 2420,
      deliveryTimeMin: 18,
      deliveryFee: 65.0,
      minOrder: 150.0,
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
      logoImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
      isOpen: true,
      isAcceptingOrders: true,
      prepTimeDefault: 14,
      tags: ['fast', 'freedel', 'toprated', 'habesha', 'halal'],
    },
  });

  const boleBurger = await prisma.restaurant.create({
    data: {
      id: 'rest-burger-02',
      ownerId: restaurantOwner.id,
      name: 'Bole Burger Foundry',
      slug: 'bole-burger-foundry',
      description: 'Sizzling double smash burgers on toasted brioche, loaded seasoned fries, and artisanal shakes in the heart of Atlas.',
      address: 'Bole Atlas, Cameroon Street',
      city: 'Addis Ababa',
      cuisine: ['Burgers', 'American', 'Fries', 'Halal'],
      rating: 4.8,
      reviewCount: 1250,
      deliveryTimeMin: 16,
      deliveryFee: 45.0,
      minOrder: 180.0,
      bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
      logoImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
      isOpen: true,
      isAcceptingOrders: true,
      prepTimeDefault: 12,
      tags: ['fast', 'toprated', 'halal'],
    },
  });

  const piassaPizza = await prisma.restaurant.create({
    data: {
      id: 'rest-pizza-03',
      ownerId: restaurantOwner.id,
      name: 'Piassa Italian Pizzeria',
      slug: 'piassa-italian-pizzeria',
      description: 'Woodfired sourdough Neapolitan pizzas baked at 450°C, fresh homemade pastas, and Italian desserts.',
      address: 'Kazanchis, Churchill Avenue',
      city: 'Addis Ababa',
      cuisine: ['Pizza', 'Italian', 'Pasta'],
      rating: 4.9,
      reviewCount: 2180,
      deliveryTimeMin: 22,
      deliveryFee: 60.0,
      minOrder: 200.0,
      bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85',
      logoImage: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=200&q=80',
      isOpen: true,
      isAcceptingOrders: true,
      prepTimeDefault: 16,
      tags: ['toprated', 'deal'],
    },
  });

  // 4. Seed Categories & Menu Items for Habesha Kitchen
  console.log('🍲 Seeding Menu Categories and Items for Habesha Kitchen...');
  const catTibs = await prisma.foodCategory.create({
    data: {
      id: 'cat-tibs-01',
      restaurantId: habeshaKitchen.id,
      name: 'Special Tibs & Meats',
      slug: 'special-tibs',
      icon: '🥩',
      sortOrder: 1,
    },
  });

  const catShiro = await prisma.foodCategory.create({
    data: {
      id: 'cat-shiro-02',
      restaurantId: habeshaKitchen.id,
      name: 'Clay-pot Shiro & Fasting (የጾም)',
      slug: 'shiro-fasting',
      icon: '🍲',
      sortOrder: 2,
    },
  });

  const catSpecial = await prisma.foodCategory.create({
    data: {
      id: 'cat-special-03',
      restaurantId: habeshaKitchen.id,
      name: 'Traditional Habesha Feasts',
      slug: 'habesha-feasts',
      icon: '✨',
      sortOrder: 3,
    },
  });

  const catDrinks = await prisma.foodCategory.create({
    data: {
      id: 'cat-drinks-04',
      restaurantId: habeshaKitchen.id,
      name: 'Fresh Juices & Beverages',
      slug: 'beverages',
      icon: '🥤',
      sortOrder: 4,
    },
  });

  // Menu Items for Habesha Kitchen
  const itemTibs = await prisma.menuItem.create({
    data: {
      id: 'dish-01',
      restaurantId: habeshaKitchen.id,
      categoryId: catTibs.id,
      name: 'Special Beef Shekla Tibs',
      description: 'Tender prime beef cubed and flash-seared in traditional clay pottery with onions, jalapeños, rosemary, and aromatic Ethiopian butter (niter kibbeh). Served with freshly rolled injera.',
      price: 420.0,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  const itemShiro = await prisma.menuItem.create({
    data: {
      id: 'dish-02',
      restaurantId: habeshaKitchen.id,
      categoryId: catShiro.id,
      name: 'Clay-pot Shiro Deges',
      description: 'Finely ground sun-dried chickpeas slow-simmered in clay pot with garlic, ginger, and berbere spices. 100% vegan / fasting (የጾም).',
      price: 210.0,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  const itemKitfo = await prisma.menuItem.create({
    data: {
      id: 'dish-03',
      restaurantId: habeshaKitchen.id,
      categoryId: catTibs.id,
      name: 'Special Kitfo with Ayib & Gomen',
      description: 'Finely minced lean beef infused with purified niter kibbeh and hot mitmita chili powder. Served with homemade cottage cheese (ayib) and collard greens (gomen).',
      price: 480.0,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: 'dish-04',
      restaurantId: habeshaKitchen.id,
      categoryId: catSpecial.id,
      name: 'Piping-Hot Doro Wat with Hard-Boiled Egg',
      description: 'The national celebratory feast dish: slow-simmered chicken drumsticks in rich, dark berbere sauce with hard-boiled farm egg and ayib.',
      price: 550.0,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: false,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: 'dish-05',
      restaurantId: habeshaKitchen.id,
      categoryId: catDrinks.id,
      name: 'Fresh Layered Mango & Avocado Juice (Spriss)',
      description: 'Freshly squeezed ripe Ethiopian mango and creamy avocado puree served in colorful layers with fresh lime wedge.',
      price: 120.0,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  // Menu items for Bole Burger
  const catBurger = await prisma.foodCategory.create({
    data: {
      id: 'cat-burgers-01',
      restaurantId: boleBurger.id,
      name: 'Smash Burgers',
      slug: 'smash-burgers',
      icon: '🍔',
      sortOrder: 1,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: 'dish-burger-01',
      restaurantId: boleBurger.id,
      categoryId: catBurger.id,
      name: 'Gourmet Double Smash Burger',
      description: 'Two 100% grass-fed beef patties smashed razor-thin with crispy edges, double aged cheddar, caramelized onions, and house burger sauce on toasted brioche.',
      price: 320.0,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  // Menu items for Piassa Pizza
  const catPizza = await prisma.foodCategory.create({
    data: {
      id: 'cat-pizza-01',
      restaurantId: piassaPizza.id,
      name: 'Woodfired Pizzas',
      slug: 'woodfired-pizzas',
      icon: '🍕',
      sortOrder: 1,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: 'dish-pizza-01',
      restaurantId: piassaPizza.id,
      categoryId: catPizza.id,
      name: 'Authentic Woodfired Margherita Pizza',
      description: 'Italian San Marzano tomato sauce, fresh creamy mozzarella, aromatic basil, and extra virgin olive oil on 48-hour fermented sourdough crust.',
      price: 380.0,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: true,
    },
  });

  // 5. Seed an Example Active Order
  console.log('📦 Seeding Example Orders...');
  await prisma.order.create({
    data: {
      id: 'ord-live-01',
      orderNumber: 'SNB-9281',
      userId: customer.id,
      restaurantId: habeshaKitchen.id,
      driverId: courierDriver.id,
      status: 'OUT_FOR_DELIVERY',
      subtotal: 630.0,
      deliveryFee: 65.0,
      serviceFee: 25.0,
      tip: 50.0,
      total: 770.0,
      deliveryAddress: 'Bole Medhanialem, Atlas Apt 3B',
      dropOffNote: 'Please ring doorbell 3B',
      paymentMethod: 'Telebirr',
      paymentStatus: 'PAID',
      items: {
        create: [
          {
            menuItemId: itemTibs.id,
            name: itemTibs.name,
            quantity: 1,
            price: itemTibs.price,
            subtotal: 420.0,
          },
          {
            menuItemId: itemShiro.id,
            name: itemShiro.name,
            quantity: 1,
            price: itemShiro.price,
            subtotal: 210.0,
          },
        ],
      },
      payments: {
        create: {
          amount: 770.0,
          method: 'Telebirr',
          status: 'PAID',
          transactionRef: 'TLB-2026-98124',
        },
      },
    },
  });

  // 6. Seed a Delivered Order
  await prisma.order.create({
    data: {
      id: 'ord-delivered-02',
      orderNumber: 'SNB-9279',
      userId: customer.id,
      restaurantId: habeshaKitchen.id,
      driverId: courierDriver.id,
      status: 'DELIVERED',
      subtotal: 480.0,
      deliveryFee: 65.0,
      serviceFee: 25.0,
      tip: 30.0,
      total: 600.0,
      deliveryAddress: 'Bole Medhanialem, Atlas Apt 3B',
      paymentMethod: 'Telebirr',
      paymentStatus: 'PAID',
      items: {
        create: [
          {
            menuItemId: itemKitfo.id,
            name: itemKitfo.name,
            quantity: 1,
            price: itemKitfo.price,
            subtotal: 480.0,
          },
        ],
      },
      payments: {
        create: {
          amount: 600.0,
          method: 'Telebirr',
          status: 'PAID',
          transactionRef: 'TLB-2026-87410',
        },
      },
    },
  });

  // 7. Seed Reviews
  console.log('⭐ Seeding Reviews...');
  await prisma.review.create({
    data: {
      userId: customer.id,
      restaurantId: habeshaKitchen.id,
      rating: 5,
      comment: 'Best Shekla Tibs in Bole! Food arrived piping hot in 18 minutes. The injera was so soft and fresh.',
      merchantReply: 'Thank you Abebe! We take pride in serving piping hot Habesha feasts every single day!',
    },
  });

  // 8. Seed Favorite
  console.log('❤️ Seeding Favorites...');
  await prisma.favorite.create({
    data: {
      userId: customer.id,
      restaurantId: habeshaKitchen.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
