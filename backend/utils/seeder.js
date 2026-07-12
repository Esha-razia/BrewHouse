/**
 * Seeds the database with the updated BrewHouse menu in PKR pricing with corrected custom categories.
 * Run with: npm run seed
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  // --- Category: Premium Blend Iced Capp (S: 990 / M/R: 1090 / L: 1190) ---
  {
    name: 'Premium Blend Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/1a/50/fa/1a50fa99a63716e215e2df72c9ee7b95.jpg',
    description: 'Our signature creamy, blended frozen coffee beverage served ice cold.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Sweetener'],
    calories: { small: 220, medium: 290, large: 360 },
  },
  {
    name: 'Mango Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/81/63/16/8163167e5526dfa5e13a0901bf97ada7.jpg',
    description: 'Our classic blended Iced Capp infused with sweet, tropical mango syrup.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Mango Syrup'],
    calories: { small: 240, medium: 320, large: 400 },
    isNewArrival: true,
  },
  {
    name: 'Lotus Biscoff Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/63/9f/f0/639ff028ba2b262b9acc231b0b9d7423.jpg',
    description: 'Blended coffee bliss with crushed Lotus Biscoff cookies and caramelized cookie butter syrup.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Lotus Biscoff Spread', 'Cookie Crumble'],
    calories: { small: 310, medium: 410, large: 510 },
    isNewArrival: true,
    isBestSeller: true,
  },
  {
    name: 'Hazelnut Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/1200x/a2/54/8b/a2548b27fe26bbc46ca7f954f5a6adb4.jpg',
    description: 'Blended Iced Capp with a rich, nutty hazelnut syrup infusion.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Hazelnut Syrup'],
    calories: { small: 230, medium: 300, large: 380 },
    isNewArrival: true,
  },
  {
    name: 'Original Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/43/9a/cc/439acc3a1e75e5061cca670ec2b82452.jpg',
    description: 'The authentic, timeless frozen blended coffee drink that started it all.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice'],
    calories: { small: 210, medium: 280, large: 350 },
    isBestSeller: true,
  },
  {
    name: 'Caramel Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/21/f2/eb/21f2ebef26905a46824adb2aa65046a8.jpg',
    description: 'Frozen blended coffee topped with buttery caramel swirls.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Caramel Drizzle'],
    calories: { small: 250, medium: 330, large: 410 },
  },
  {
    name: 'Java Chip Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/1200x/a8/e3/be/a8e3beaa0353183b0b5bae0eb7dbd3a0.jpg',
    description: 'Frozen blended coffee loaded with rich chocolate chips and chocolate drizzle.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Chocolate Chips', 'Chocolate Syrup'],
    calories: { small: 280, medium: 370, large: 460 },
  },
  {
    name: 'Jaffa Mocha Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/e4/5f/bc/e45fbcae1656fb49272d472dbb834596.jpg',
    description: 'An elegant blend of espresso, dark chocolate, and zesty orange syrup.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Dark Chocolate Sauce', 'Orange Syrup'],
    calories: { small: 260, medium: 345, large: 430 },
  },
  {
    name: 'Strawberry Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/1200x/ee/fe/1b/eefe1bbde93048962c4095f12c9b0dcf.jpg',
    description: 'Blended cold coffee layered with fresh strawberry puree syrup.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Strawberry Puree'],
    calories: { small: 230, medium: 310, large: 390 },
  },
  {
    name: 'Pistachio Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/91/c3/a8/91c3a817a213aa7d1d3423b1b8df24b5.jpg',
    description: 'Nutty and sweet pistachio syrup blended with our frozen coffee base.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Pistachio Syrup'],
    calories: { small: 250, medium: 330, large: 420 },
  },
  {
    name: 'Tropical Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/b0/29/43/b02943bdf573637c46ce9a674d091936.jpg',
    description: 'A breezy, summery iced cappuccino with hints of coconut and pineapple syrup.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Coconut Syrup', 'Pineapple Essence'],
    calories: { small: 230, medium: 310, large: 390 },
  },
  {
    name: 'Oreo Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/26/09/2e/26092ee6928a17eb3bb3af3b2010bd69.jpg',
    description: 'Our rich frozen blended cappuccino blended with crushed Oreo cookie chunks.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Oreo Cookie Pieces', 'Whipped Cream'],
    calories: { small: 320, medium: 420, large: 520 },
    isBestSeller: true,
  },
  {
    name: 'Strawberry Oreo Iced Capp',
    category: 'Premium Blend Iced Capp',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/eb/70/65/eb7065092ee3520fdac70b6aed2a97a0.jpg',
    description: 'Sweet strawberry base blended with chocolatey Oreo crumbles and coffee.',
    ingredients: ['Signature Espresso Blend', 'Milk', 'Ice', 'Oreo Cookies', 'Strawberry Sauce'],
    calories: { small: 330, medium: 435, large: 540 },
  },

  // --- Category: Brew Signature Blended (S: 990 / M/R: 1090 / L: 1190) ---
  {
    name: 'Frozen French Vanilla',
    category: 'Brew Signature Blended',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/736x/d1/24/e7/d124e7ca31e09cf1a636d907f18e2ee0.jpg',
    description: 'Sweet, rich vanilla bean blended ice base topped with whipped cream.',
    ingredients: ['French Vanilla Base', 'Milk', 'Ice', 'Whipped Cream'],
    calories: { small: 280, medium: 370, large: 460 },
  },
  {
    name: 'Frozen Hot Chocolate',
    category: 'Brew Signature Blended',
    priceBySize: { small: 990, medium: 1090, large: 1190 },
    image: 'https://i.pinimg.com/1200x/23/9c/dd/239cdd030fe859842edaab15fa1336e2.jpg',
    description: 'Decadent chocolate base blended with ice and whipped cream for a cold cocoa treat.',
    ingredients: ['Rich Cocoa Blend', 'Steamed Milk', 'Ice', 'Chocolate Drizzle'],
    calories: { small: 310, medium: 400, large: 490 },
  },

  // --- Category: HOT & COLD BEVERAGES ---
  {
    name: 'Espresso Shot',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 625, medium: 625, large: 625 },
    image: 'https://i.pinimg.com/736x/7c/ff/92/7cff9259605cabc4cc2a9e9ee37018ea.jpg',
    description: 'A concentrated shot of coffee brewed by forcing hot water under pressure through finely-ground beans.',
    ingredients: ['Ground Coffee Beans'],
    calories: { small: 5, medium: 5, large: 5 },
  },
  {
    name: 'Americano',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 625, medium: 690, large: 775 },
    image: 'https://i.pinimg.com/736x/6a/eb/a8/6aeba8412ebe8877326fe58804ed48d9.jpg',
    description: 'Double shot of rich espresso topped with hot filtered water for a clean brew profile.',
    ingredients: ['Espresso Shot', 'Hot Water'],
    calories: { small: 5, medium: 10, large: 15 },
  },
  {
    name: 'Cappuccino (Hot Only)',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 675, medium: 750, large: 825 },
    image: 'https://i.pinimg.com/736x/f0/65/5f/f0655f2737da76be9b4ac435c65e3d9b.jpg',
    description: 'Perfect balance of bold espresso, smooth steamed milk, and a thick layer of airy milk foam.',
    ingredients: ['Espresso Shot', 'Steamed Milk', 'Foamed Milk'],
    calories: { small: 110, medium: 150, large: 190 },
  },
  {
    name: 'Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 675, medium: 750, large: 825 },
    image: 'https://i.pinimg.com/736x/57/cd/33/57cd339be653de079e190b1889b93a00.jpg',
    description: 'Rich, full-bodied espresso combined with steamed milk and a light layer of foam.',
    ingredients: ['Espresso Shot', 'Steamed Milk'],
    calories: { small: 120, medium: 170, large: 220 },
    isBestSeller: true,
  },
  {
    name: 'Spanish Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/1200x/43/68/b2/4368b2258668f540412fdfd3cef11d85.jpg',
    description: 'Sweetened condensed milk mixed with bold espresso and steamed milk for a sweet twist.',
    ingredients: ['Espresso Shot', 'Condensed Milk', 'Steamed Milk'],
    calories: { small: 190, medium: 260, large: 330 },
    isBestSeller: true,
  },
  {
    name: 'Mocha Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/236x/6d/fa/76/6dfa762a0148f9867323b931c41e02a1.jpg',
    description: 'A comforting blend of bold espresso, hot steamed milk, and rich chocolate cocoa syrup.',
    ingredients: ['Espresso Shot', 'Cocoa Syrup', 'Steamed Milk'],
    calories: { small: 210, medium: 285, large: 360 },
  },
  {
    name: 'Vanilla Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/736x/bd/11/ea/bd11ea34b765fac62a5608092b7eadf1.jpg',
    description: 'Espresso and steamed milk infused with a sweet, aromatic vanilla bean extract syrup.',
    ingredients: ['Espresso Shot', 'Vanilla Syrup', 'Steamed Milk'],
    calories: { small: 160, medium: 220, large: 280 },
  },
  {
    name: 'Caramel Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/1200x/bd/de/a0/bddea0e4dbe2f7a9cffa8cab5194cb74.jpg',
    description: 'Steamed latte flavored with sweet, buttery golden caramel sauce.',
    ingredients: ['Espresso', 'Caramel Sauce', 'Steamed Milk'],
    calories: { small: 170, medium: 230, large: 290 },
  },
  {
    name: 'Hazelnut Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/736x/11/05/86/110586e5754cc24831d58d35ff8ba019.jpg',
    description: 'Our classic espresso latte flavored with warm, toasted hazelnut syrup.',
    ingredients: ['Espresso', 'Hazelnut Syrup', 'Steamed Milk'],
    calories: { small: 160, medium: 220, large: 280 },
  },
  {
    name: 'Caramel Macchiato',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/736x/0c/ca/23/0cca23a474c32dd704714b2a6344aa4b.jpg',
    description: 'Freshly steamed milk with vanilla syrup, marked with espresso and topped with caramel drizzle.',
    ingredients: ['Espresso', 'Vanilla Syrup', 'Steamed Milk', 'Caramel Drizzle'],
    calories: { small: 140, medium: 190, large: 240 },
    isBestSeller: true,
  },
  {
    name: 'Pistachio Latte',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 950, medium: 950, large: 950 },
    image: 'https://i.pinimg.com/1200x/a4/65/7a/a4657abe48e0d96fe1339cd77cdb812a.jpg',
    description: 'Warm pistachio flavor combined with rich espresso shots and steamed milk.',
    ingredients: ['Espresso', 'Pistachio Cream Sauce', 'Steamed Milk'],
    calories: { small: 180, medium: 180, large: 180 },
  },
  {
    name: 'Flat White (Hot Only)',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 850, medium: 850, large: 850 },
    image: 'https://i.pinimg.com/1200x/78/4d/c5/784dc5a1fd98fc1a364f04f8dc6103dd.jpg',
    description: 'Ristretto espresso shots topped with smooth, velvety microfoamed hot milk.',
    ingredients: ['Double Espresso Ristretto', 'Velvety Steamed Milk'],
    calories: { small: 120, medium: 120, large: 120 },
  },
  {
    name: 'French Vanilla',
    category: 'HOT & COLD BEVERAGES',
    priceBySize: { small: 750, medium: 850, large: 975 },
    image: 'https://i.pinimg.com/736x/e6/f0/75/e6f07596d46f4e58d407497a767e80cb.jpg',
    description: 'Rich, smooth hot vanilla beverage with a creamy, comforting vanilla pod profile.',
    ingredients: ['Premium Vanilla Powder', 'Hot Water', 'Steamed Milk'],
    calories: { small: 180, medium: 250, large: 310 },
    isBestSeller: true,
  },

  // --- Category: Matcha ---
  {
    name: 'Hot Spanish Matcha',
    category: 'Matcha',
    priceBySize: { small: 990, medium: 990, large: 990 },
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
    description: 'Sweetened condensed milk blended with premium Japanese stone-ground matcha and steamed milk.',
    ingredients: ['Matcha Powder', 'Condensed Milk', 'Steamed Milk'],
    calories: { small: 210, medium: 210, large: 210 },
  },
  {
    name: 'Iced Vanilla Bean Matcha Latte',
    category: 'Matcha',
    priceBySize: { small: 1090, medium: 1090, large: 1090 },
    image: 'https://i.pinimg.com/736x/e5/ba/08/e5ba08b87f26f7f19d970a6efe932c57.jpg',
    description: 'Stone-ground matcha green tea served over ice with vanilla bean paste syrup and milk.',
    ingredients: ['Matcha Powder', 'Vanilla Bean Paste', 'Cold Milk', 'Ice'],
    calories: { small: 180, medium: 180, large: 180 },
  },
  {
    name: 'Iced Strawberry Matcha',
    category: 'Matcha',
    priceBySize: { small: 1090, medium: 1090, large: 1090 },
    image: 'https://i.pinimg.com/736x/fe/f8/9a/fef89a3c951484f6fa7b15dee822d1cc.jpg',
    description: 'Vibrant layers of fresh organic strawberry puree, cold milk, and premium matcha over ice.',
    ingredients: ['Matcha Powder', 'Strawberry Puree', 'Cold Milk', 'Ice'],
    calories: { small: 200, medium: 200, large: 200 },
    isBestSeller: true,
  },
  {
    name: 'Iced Mango Matcha',
    category: 'Matcha',
    priceBySize: { small: 1090, medium: 1090, large: 1090 },
    image: 'https://i.pinimg.com/736x/f7/86/04/f7860468178c416b6ae8857bb5b50a7a.jpg',
    description: 'A tropical match made in heaven: layered mango pulp, cold milk, and organic matcha green tea.',
    ingredients: ['Matcha Powder', 'Mango Pulp', 'Cold Milk', 'Ice'],
    calories: { small: 190, medium: 190, large: 190 },
  },
  {
    name: 'Matcha Iced Capp',
    category: 'Matcha',
    priceBySize: { small: 1090, medium: 1090, large: 1090 },
    image: 'https://i.pinimg.com/736x/cb/c6/46/cbc646be9e54e980d0444a21525c4320.jpg',
    description: 'Our frozen blended creamy base infused with organic Japanese green tea matcha powder.',
    ingredients: ['Matcha Green Tea', 'Blended Milk Base', 'Ice'],
    calories: { small: 240, medium: 240, large: 240 },
  },

  // --- Category: Tea ---
  {
    name: 'Earl Grey Tea (Hot Only)',
    category: 'Tea',
    priceBySize: { small: 390, medium: 390, large: 390 },
    image: 'https://i.pinimg.com/1200x/88/a5/87/88a58752882bc8d7b052edc934d44b06.jpg',
    description: 'Premium black tea leaves infused with the fragrant oil of bergamot orange citrus.',
    ingredients: ['Earl Grey Tea Leaf', 'Hot Water'],
    calories: { small: 0, medium: 0, large: 0 },
  },
  {
    name: 'Green Tea (Hot Only)',
    category: 'Tea',
    priceBySize: { small: 390, medium: 390, large: 390 },
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
    description: 'Fresh steamed organic green tea leaves harvested to retain antioxidants and flavor.',
  },

  // --- Category: Coffee Beans (sold by weight: small=250g / medium=500g / large=1kg) ---
  {
    name: 'BrewHouse House Blend Beans',
    category: 'Coffee Beans',
    priceBySize: { small: 1400, medium: 2600, large: 4800 },
    image: 'https://i.pinimg.com/1200x/4e/fe/99/4efe994191f6e11329ee75ddcccf8b97.jpg',
    description: 'Our signature whole bean coffee with rich caramel, dark chocolate, and toasted almond tasting notes.',
    ingredients: ['100% Arabica Roasted Coffee Beans'],
    calories: { small: 0, medium: 0, large: 0 },
    isBestSeller: true,
  },
  {
    name: 'Ethiopian Yirgacheffe Single Origin',
    category: 'Coffee Beans',
    priceBySize: { small: 1800, medium: 3200, large: 6000 },
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
    description: 'Vibrant and complex single origin beans featuring floral jasmine aromas, citrus acidity, and black tea finish.',
    ingredients: ['100% Arabica Specialty Green/Roasted Beans'],
    calories: { small: 0, medium: 0, large: 0 },
    isNewArrival: true,
  },
  {
    name: 'Colombia Excelso Premium Beans',
    category: 'Coffee Beans',
    priceBySize: { small: 1600, medium: 2900, large: 5400 },
    image: 'https://i.pinimg.com/1200x/0c/1c/a1/0c1ca17f7d0dd6a96c67806e8b4c9ea1.jpg',
    description: 'Exquisite medium-bodied roast beans highlighting notes of red apple, sweet cane sugar, and a smooth cocoa finish.',
    ingredients: ['100% Colombia Arabica Coffee Beans'],
    calories: { small: 0, medium: 0, large: 0 },
  },
  {
    name: 'French Roast Espresso Blend',
    category: 'Coffee Beans',
    priceBySize: { small: 1500, medium: 2800, large: 5200 },
    image: 'https://i.pinimg.com/1200x/26/69/62/266962184ed9804e7372dc2781d990cf.jpg',
    description: 'Bold, smoky, and intensely rich dark roasted beans designed for the ultimate espresso crema pull.',
    ingredients: ['Arabica/Robusta Dark Roast Blend'],
    calories: { small: 0, medium: 0, large: 0 },
  },
];

const seed = async () => {
  await connectDB();
  try {
    await Product.deleteMany();
    const productsWithSeo = products.map(p => {
      // Tea: no milk option, no extra espresso shot (sugar level stays)
      // Coffee Beans: no milk, no sugar level, no extra espresso shot (sold as whole beans by weight)
      let customization;
      if (p.category === 'Tea') {
        customization = { milkOptions: [], sugarLevels: ['No Sugar', 'Less Sugar', 'Normal', 'Extra Sweet'], allowExtraShot: false };
      } else if (p.category === 'Coffee Beans') {
        customization = { milkOptions: [], sugarLevels: [], allowExtraShot: false };
      }
      return {
        ...p,
        ...(customization ? { customization } : {}),
        seo: {
          metaTitle: `${p.name} | BrewHouse Specialty Coffee`,
          metaDescription: p.description,
          keywords: `${p.name.toLowerCase().replace(/\s+/g, ', ')}, coffee, fresh brew, pkr menu`
        }
      };
    });
    await Product.insertMany(productsWithSeo);

    const adminExists = await User.findOne({ email: 'admin@brewhouse.com' });
    if (!adminExists) {
      await User.create({
        name: 'BrewHouse Admin',
        email: 'admin@brewhouse.com',
        password: 'admin123',
        role: 'admin',
      });
    }

    console.log('Seed complete: PKR menu with correct categories loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
