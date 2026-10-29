const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { calculateFinalPrice } = require('../services/pricingService');
const { generateOrderNumber } = require('../utils/orderNumber');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Users...');
    const adminUser = await User.create({
      name: 'SHOPEZ Administrator',
      username: 'admin',
      email: 'admin@shopez.com',
      password: 'Admin@12345',
      mobile: '+1 (555) 019-2834',
      address: '100 Commerce Boulevard, Suite 500',
      pincode: '10001',
      userType: 'admin',
      isActive: true,
    });

    const customerUser = await User.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'customer@shopez.com',
      password: 'Customer@12345',
      mobile: '+1 (555) 345-6789',
      address: '742 Evergreen Terrace, Springfield, OR',
      pincode: '97477',
      userType: 'customer',
      isActive: true,
      savedAddresses: [
        {
          fullName: 'John Doe',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'Oregon',
          pincode: '97477',
          mobile: '+1 (555) 345-6789',
          isDefault: true,
        },
        {
          fullName: 'John Doe (Office)',
          street: '404 Silicon Way, Suite 10',
          city: 'Portland',
          state: 'Oregon',
          pincode: '97201',
          mobile: '+1 (555) 345-6789',
          isDefault: false,
        },
      ],
    });

    console.log('[Seed] Seeding Categories...');
    const categoriesData = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Premium headphones, smart accessories, audio gear & gadgets.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: "Men's Fashion",
        slug: 'mens-fashion',
        description: 'Modern menswear, jackets, casual shirts, tailored denim & street apparel.',
        image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: "Women's Fashion",
        slug: 'womens-fashion',
        description: 'Chic dresses, workwear, seasonal outerwear & timeless wardrobe essentials.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Ergonomic runners, retro sneakers, premium leather boots & slides.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Luxury timepieces, polarized sunglasses, Italian leather wallets & packs.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Minimalist decor, ceramic planters, ambient lamps & cozy accents.',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
        isActive: true,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('[Seed] Seeding Products...');
    const productsData = [
      // Electronics
      {
        title: 'Aura Pro Wireless Noise-Cancelling Headphones',
        description:
          'Experience high-fidelity spatial audio with active noise cancellation, ambient transparency mode, and up to 40 hours of playtime on a single USB-C charge.',
        mainImg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        ],
        category: categoryMap['electronics'],
        sizes: ['Standard'],
        gender: 'Unisex',
        price: 299,
        discount: 20,
        stock: 35,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.8, count: 124 },
      },
      {
        title: 'Chronos Ultra Smartwatch & Health Tracker',
        description:
          'Track continuous heart rate, sleep quality, blood oxygen, and athletic workouts with a scratch-resistant AMOLED sapphire display and 7-day battery life.',
        mainImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        ],
        category: categoryMap['electronics'],
        sizes: ['40mm', '44mm'],
        gender: 'Unisex',
        price: 249,
        discount: 15,
        stock: 28,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.7, count: 89 },
      },
      {
        title: 'SoundWave Portable Waterproof Bluetooth Speaker',
        description:
          '360-degree high-impact stereo sound with deep bass reflex, IPX7 water resistance, and an integrated carabiner for outdoor adventures.',
        mainImg: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['electronics'],
        sizes: ['Standard'],
        gender: 'Unisex',
        price: 99,
        discount: 10,
        stock: 50,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.6, count: 42 },
      },

      // Men's Fashion
      {
        title: 'Classic Wool Blend Overcoat in Charcoal',
        description:
          'Tailored double-breasted silhouette cut from an insulating wool-cashmere blend, designed with clean notched lapels and smooth satin lining.',
        mainImg: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        ],
        category: categoryMap['mens-fashion'],
        sizes: ['S', 'M', 'L', 'XL'],
        gender: 'Men',
        price: 189,
        discount: 25,
        stock: 22,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.9, count: 68 },
      },
      {
        title: 'Heritage Heavyweight Relaxed Cotton Hoodie',
        description:
          'Crafted from 480gsm organic french terry cotton with reinforced ribbed cuffs, kangaroo pocket, and double-layered drawstring hood.',
        mainImg: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['mens-fashion'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        gender: 'Men',
        price: 85,
        discount: 10,
        stock: 45,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.5, count: 35 },
      },
      {
        title: 'Slim-Fit Selvedge Denim Jeans',
        description:
          'Raw 13oz Japanese selvedge denim woven with a touch of stretch for durability and structured comfort that patinas uniquely over time.',
        mainImg: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['mens-fashion'],
        sizes: ['30', '32', '34', '36'],
        gender: 'Men',
        price: 120,
        discount: 15,
        stock: 30,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.6, count: 54 },
      },

      // Women's Fashion
      {
        title: 'Silk Ribbed Knit Midi Dress in Emerald',
        description:
          'An elegant body-contouring midi knit dress featuring an open square neckline and long flared sleeves, versatile from boardroom to evening.',
        mainImg: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        ],
        category: categoryMap['womens-fashion'],
        sizes: ['XS', 'S', 'M', 'L'],
        gender: 'Women',
        price: 160,
        discount: 25,
        stock: 20,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.9, count: 91 },
      },
      {
        title: 'Minimalist Relaxed Trench Coat in Warm Sand',
        description:
          'Water-resistant woven cotton gabardine tailored with shoulder epaulets, belted waist, deep storm flap, and horn buttons.',
        mainImg: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['womens-fashion'],
        sizes: ['S', 'M', 'L'],
        gender: 'Women',
        price: 210,
        discount: 30,
        stock: 18,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.8, count: 49 },
      },

      // Footwear
      {
        title: 'Veloce Carbon Cushion Running Shoes',
        description:
          'Engineered with full-length carbon composite plate technology, supercritical foam bounce midsole, and breathable jacquard mesh upper.',
        mainImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
        ],
        category: categoryMap['footwear'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        gender: 'Unisex',
        price: 175,
        discount: 15,
        stock: 40,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.8, count: 112 },
      },
      {
        title: 'Milano Artisan Chelsea Boots in Espresso Leather',
        description:
          'Handmade from full-grain calfskin with Goodyear-welted construction, elasticated side panels, and stacked Vibram rubber lug soles.',
        mainImg: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['footwear'],
        sizes: ['8', '9', '10', '11'],
        gender: 'Men',
        price: 220,
        discount: 20,
        stock: 25,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.7, count: 63 },
      },

      // Accessories
      {
        title: 'Apex Aviator Polarized Sunglasses',
        description:
          'Ultra-light titanium frame with glare-reducing polarized lenses offering 100% UV400 protection and anti-scratch hydrophobic coating.',
        mainImg: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['accessories'],
        sizes: ['Standard'],
        gender: 'Unisex',
        price: 130,
        discount: 15,
        stock: 35,
        isFeatured: true,
        isActive: true,
        ratings: { average: 4.6, count: 77 },
      },
      {
        title: 'Nordic Commuter Waterproof Roll-top Backpack',
        description:
          'Weatherproof polyurethane-coated shell featuring a padded 16-inch laptop compartment, hidden security pocket, and ergonomic shoulder straps.',
        mainImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['accessories'],
        sizes: ['25L'],
        gender: 'Unisex',
        price: 115,
        discount: 10,
        stock: 30,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.8, count: 58 },
      },

      // Home & Living
      {
        title: 'Aura Modern Ceramic Table Lamp',
        description:
          'Handcrafted matte ceramic base paired with an unbleached linen drum shade, soft warm LED dimmer switch, and braided cord.',
        mainImg: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        images: [],
        category: categoryMap['home-living'],
        sizes: ['Medium'],
        gender: 'All',
        price: 95,
        discount: 20,
        stock: 20,
        isFeatured: false,
        isActive: true,
        ratings: { average: 4.7, count: 32 },
      },
    ];

    // Compute final prices
    const preparedProducts = productsData.map((p) => ({
      ...p,
      finalPrice: calculateFinalPrice(p.price, p.discount),
    }));

    const products = await Product.insertMany(preparedProducts);

    console.log('[Seed] Seeding Promotional Banners...');
    const bannersData = [
      {
        title: 'Autumn & Winter Capsule Collection',
        subtitle: 'Elevate your seasonal wardrobe with premium coats, footwear and modern accessories.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
        link: '/products?category=mens-fashion',
        buttonText: 'Explore Collection',
        badge: 'NEW ARRIVALS 2026',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'Audiophile Sound. Zero Distractions.',
        subtitle: 'Save up to 30% on top-rated acoustic headphones, smart home audio & wearables.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
        link: '/products?category=electronics',
        buttonText: 'Shop Electronics',
        badge: 'LIMITED TIME SALE',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Step Into Next-Gen Athletic Comfort',
        subtitle: 'High-cushion carbon running shoes and artisan leather footwear engineered for performance.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
        link: '/products?category=footwear',
        buttonText: 'Discover Footwear',
        badge: 'TRENDING NOW',
        displayOrder: 3,
        isActive: true,
      },
    ];

    await Banner.insertMany(bannersData);

    console.log('[Seed] Seeding Sample Orders...');
    // Create a delivered order for the sample customer
    const order1Item = products[0]; // Aura Headphones
    const order1Price = order1Item.finalPrice;
    const order1OrderNumber = generateOrderNumber();

    await Order.create({
      orderNumber: order1OrderNumber,
      userId: customerUser._id,
      items: [
        {
          productId: order1Item._id,
          title: order1Item.title,
          image: order1Item.mainImg,
          price: order1Item.price,
          discount: order1Item.discount,
          finalPrice: order1Price,
          size: 'Standard',
          quantity: 1,
          lineTotal: order1Price,
        },
      ],
      shippingAddress: {
        fullName: 'John Doe',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        mobile: '+1 (555) 345-6789',
      },
      paymentMethod: 'Online Payment',
      paymentStatus: 'Paid',
      paymentDetails: {
        transactionId: 'TXN-SHPZ-78192837',
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      subtotal: order1Price,
      discountAmount: order1Item.price - order1Price,
      shippingFee: 0,
      taxAmount: Math.round(order1Price * 0.05),
      totalAmount: order1Price + Math.round(order1Price * 0.05),
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'Delivered',
      trackingNumber: 'TRK-983274619US',
    });

    // Create an in-progress order for the customer
    const order2Item1 = products[3]; // Overcoat
    const order2Item2 = products[8]; // Shoes
    const item1Final = order2Item1.finalPrice;
    const item2Final = order2Item2.finalPrice;
    const subtotal2 = item1Final + item2Final;
    const tax2 = Math.round(subtotal2 * 0.05);
    const order2OrderNumber = generateOrderNumber();

    await Order.create({
      orderNumber: order2OrderNumber,
      userId: customerUser._id,
      items: [
        {
          productId: order2Item1._id,
          title: order2Item1.title,
          image: order2Item1.mainImg,
          price: order2Item1.price,
          discount: order2Item1.discount,
          finalPrice: item1Final,
          size: 'L',
          quantity: 1,
          lineTotal: item1Final,
        },
        {
          productId: order2Item2._id,
          title: order2Item2.title,
          image: order2Item2.mainImg,
          price: order2Item2.price,
          discount: order2Item2.discount,
          finalPrice: item2Final,
          size: '10',
          quantity: 1,
          lineTotal: item2Final,
        },
      ],
      shippingAddress: {
        fullName: 'John Doe',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'Oregon',
        pincode: '97477',
        mobile: '+1 (555) 345-6789',
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      subtotal: subtotal2,
      discountAmount: order2Item1.price - item1Final + (order2Item2.price - item2Final),
      shippingFee: 0,
      taxAmount: tax2,
      totalAmount: subtotal2 + tax2,
      orderDate: new Date(),
      status: 'Processing',
      trackingNumber: 'TRK-102938475US',
    });

    // Seed Wishlist for customer with smart watch
    await Wishlist.create({
      userId: customerUser._id,
      products: [products[1]._id],
    });

    console.log('[Seed] Database successfully populated with initial data!');
    console.log('----------------------------------------------------');
    console.log('ADMIN LOGIN:    admin@shopez.com    / Admin@12345');
    console.log('CUSTOMER LOGIN: customer@shopez.com / Customer@12345');
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
