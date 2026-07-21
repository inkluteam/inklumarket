export const categories = [
  { id: '1', name: 'Food & Beverages', icon: '🛒', description: 'Fresh produce, baked goods, and artisan foods', productCount: 42 },
  { id: '2', name: 'Handicrafts', icon: '🎨', description: 'Handmade crafts, pottery, and textiles', productCount: 28 },
  { id: '3', name: 'Fashion & Apparel', icon: '👗', description: 'Clothing, accessories, and wearable art', productCount: 35 },
  { id: '4', name: 'Health & Wellness', icon: '💚', description: 'Natural health products and wellness services', productCount: 22 },
  { id: '5', name: 'Home & Living', icon: '🏠', description: 'Furniture, decor, and home essentials', productCount: 31 },
  { id: '6', name: 'Education & Services', icon: '📚', description: 'Training, consulting, and professional services', productCount: 15 },
]

export const sellers = [
  { id: 's1', name: 'Hope Bakery', email: 'hope@bakery.com', phone: '+63 917 123 4567', joined: '2025-06-15', status: 'active', rating: 4.8, totalSales: 1250, bio: 'PWD-owned bakery producing artisan breads and pastries using organic ingredients from Zamboanga.', disabilityType: 'Physical', location: 'Mampang, Zamboanga City', verified: true },
  { id: 's2', name: 'CraftAbility Co-op', email: 'info@craftability.com', phone: '+63 918 234 5678', joined: '2025-07-20', status: 'active', rating: 4.6, totalSales: 890, bio: 'Cooperative of visually impaired artisans creating handwoven bamboo and rattan products from local materials.', disabilityType: 'Visual', location: 'Tetuan, Zamboanga City', verified: true },
  { id: 's3', name: 'Wellness Roots', email: 'wellness@roots.com', phone: '+63 919 345 6789', joined: '2025-08-10', status: 'active', rating: 4.9, totalSales: 2100, bio: 'Producing organic herbal teas and natural wellness products from locally sourced ingredients in Zamboanga Peninsula.', disabilityType: 'Hearing', location: 'Pagadian City, Zamboanga del Sur', verified: true },
  { id: 's4', name: 'EcoThreads', email: 'hello@ecothreads.ph', phone: '+63 920 456 7890', joined: '2025-09-01', status: 'active', rating: 4.5, totalSales: 670, bio: 'Sustainable fashion from recycled fabrics, employing workers with mobility impairments from AVRC Region IX.', disabilityType: 'Mobility', location: 'Ipil, Zamboanga Sibugay', verified: true },
  { id: 's5', name: 'LightUp Studios', email: 'create@lightup.ph', phone: '+63 921 567 8901', joined: '2025-09-15', status: 'active', rating: 4.7, totalSales: 1450, bio: 'Hand-poured soy candles and aromatherapy products made by deaf artisans from Zamboanga.', disabilityType: 'Hearing', location: 'Baliwasan, Zamboanga City', verified: true },
  { id: 's6', name: 'SkillUp Academy', email: 'learn@skillup.ph', phone: '+63 922 678 9012', joined: '2025-10-05', status: 'active', rating: 4.8, totalSales: 3200, bio: 'Digital skills training and workshops for PWD entrepreneurs in Region IX, with sign language interpretation.', disabilityType: 'Hearing', location: 'Sta. Maria, Zamboanga City', verified: true },
  { id: 's7', name: 'Clay Dreams', email: 'clay@dreams.ph', phone: '+63 923 789 0123', joined: '2025-10-20', status: 'active', rating: 4.4, totalSales: 420, bio: 'Hand-thrown ceramic planters and home decor, designed with easy-grip features for accessibility.', disabilityType: 'Physical', location: 'Dipolog City, Zamboanga del Norte', verified: true },
  { id: 's8', name: 'Farm Fresh Direct', email: 'orders@farmfresh.ph', phone: '+63 924 890 1234', joined: '2025-11-01', status: 'active', rating: 4.6, totalSales: 1800, bio: 'Direct-from-farm organic produce from Zamboanga Peninsula farms, delivered with accessible logistics.', disabilityType: 'Visual', location: 'Molave, Zamboanga del Norte', verified: true },
  { id: 's9', name: 'Ink & Soul', email: 'art@inkandsoul.ph', phone: '+63 925 901 2345', joined: '2025-11-10', status: 'pending', rating: 0, totalSales: 0, bio: 'Digital art prints and custom illustrations by a PWD graphic designer from Zamboanga.', disabilityType: 'Physical', location: 'San Jose, Zamboanga City', verified: false },
  { id: 's10', name: 'Breezy Knits', email: 'knit@breezy.ph', phone: '+63 926 012 3456', joined: '2025-12-01', status: 'active', rating: 4.3, totalSales: 340, bio: 'Handknitted scarves, beanies, and accessories made by seniors with hearing impairments from AVRC.', disabilityType: 'Hearing', location: 'Talisayan, Zamboanga del Norte', verified: true },
]

export const products = [
  { id: '1', name: 'Artisan Sourdough Bread', price: 8.50, category: '1', seller: 'Hope Bakery', sellerId: 's1', image: '/images/bread.jpg', description: 'Freshly baked sourdough bread made with organic flour and natural starter. Crispy golden crust with a soft, tangy interior. Perfect for sandwiches or enjoying with butter.', stock: 25, rating: 4.8, reviews: 124, featured: true, accessibility: 'Wheelchair-accessible pickup location', status: 'approved', dateAdded: '2025-12-01' },
  { id: '2', name: 'Handwoven Bamboo Basket', price: 35.00, category: '2', seller: 'CraftAbility Co-op', sellerId: 's2', image: '/images/basket.jpg', description: 'Beautifully handwoven bamboo basket with intricate checkerboard weave pattern. Perfect for storage, display, or as a decorative piece. Each basket is unique.', stock: 15, rating: 4.6, reviews: 58, featured: true, accessibility: 'Made by artisans with visual impairments', status: 'approved', dateAdded: '2025-12-05' },
  { id: '3', name: 'Organic Herbal Tea Set', price: 22.00, category: '4', seller: 'Wellness Roots', sellerId: 's3', image: '/images/tea.jpg', description: 'Collection of 6 premium organic herbal teas: Chamomile Calm, Peppermint Refresh, Ginger Warmth, Lemongrass Zing, Turmeric Glow, and Butterfly Pea Bliss.', stock: 40, rating: 4.9, reviews: 203, featured: true, accessibility: 'Braille labels on all packaging', status: 'approved', dateAdded: '2025-12-08' },
  { id: '4', name: 'Recycled Fabric Tote Bag', price: 18.00, category: '3', seller: 'EcoThreads', sellerId: 's4', image: '/images/tote.jpg', description: 'Durable tote bag made from 100% recycled fabrics. Features reinforced handles and inner pocket. Stylish, sustainable, and built to last.', stock: 30, rating: 4.5, reviews: 87, featured: false, accessibility: 'Produced by workers with mobility impairments', status: 'approved', dateAdded: '2025-12-10' },
  { id: '5', name: 'Handmade Soy Candle Set', price: 28.00, category: '5', seller: 'LightUp Studios', sellerId: 's5', image: '/images/candle.jpg', description: 'Set of 3 hand-poured soy candles in calming Lavender Dreams, Vanilla Comfort, and Citrus Sunrise scents. 40-hour burn time each.', stock: 20, rating: 4.7, reviews: 156, featured: true, accessibility: 'Tactile-friendly packaging with raised indicators', status: 'approved', dateAdded: '2025-12-12' },
  { id: '6', name: 'Digital Marketing Workshop', price: 49.00, category: '6', seller: 'SkillUp Academy', sellerId: 's6', image: '/images/workshop.jpg', description: '4-hour live online workshop covering social media marketing, content strategy, and analytics for small businesses. Includes sign language interpretation.', stock: 50, rating: 4.8, reviews: 92, featured: false, accessibility: 'Sign language interpretation included', status: 'approved', dateAdded: '2025-12-15' },
  { id: '7', name: 'Ceramic Planter Set', price: 42.00, category: '5', seller: 'Clay Dreams', sellerId: 's7', image: '/images/planter.jpg', description: 'Set of 3 hand-thrown ceramic planters in earthy tones (terracotta, sage, cream). Designed with easy-grip handles for accessibility.', stock: 12, rating: 4.4, reviews: 45, featured: false, accessibility: 'Designed with easy-grip handles', status: 'approved', dateAdded: '2025-12-18' },
  { id: '8', name: 'Fresh Fruit Box', price: 30.00, category: '1', seller: 'Farm Fresh Direct', sellerId: 's8', image: '/images/fruit.jpg', description: 'Seasonal mix of locally sourced organic fruits: mangoes, bananas, papayas, and citrus. Handpicked and delivered fresh within 24 hours of harvest.', stock: 35, rating: 4.6, reviews: 178, featured: true, accessibility: 'Accessible delivery with advance notice', status: 'approved', dateAdded: '2025-12-20' },
  { id: '9', name: 'Organic Honey Jar', price: 15.00, category: '1', seller: 'Farm Fresh Direct', sellerId: 's8', image: '/images/honey.jpg', description: 'Pure, raw organic honey sourced from local beekeepers. Unfiltered and unpasteurized for maximum health benefits. 500ml glass jar.', stock: 45, rating: 4.7, reviews: 95, featured: false, accessibility: 'Accessible delivery', status: 'approved', dateAdded: '2026-01-02' },
  { id: '10', name: 'Bamboo Utensil Set', price: 25.00, category: '5', seller: 'CraftAbility Co-op', sellerId: 's2', image: '/images/utensils.jpg', description: 'Eco-friendly 6-piece bamboo utensil set: fork, knife, spoon, chopsticks, straw, and cleaning brush. Comes in a cotton roll pouch.', stock: 60, rating: 4.5, reviews: 73, featured: false, accessibility: 'Made by artisans with visual impairments', status: 'approved', dateAdded: '2026-01-05' },
  { id: '11', name: 'Woven Rattan Bag', price: 55.00, category: '3', seller: 'CraftAbility Co-op', sellerId: 's2', image: '/images/rattan-bag.jpg', description: 'Handwoven rattan crossbody bag with leather strap. Lightweight yet sturdy, perfect for everyday use or beach outings.', stock: 8, rating: 4.8, reviews: 34, featured: true, accessibility: 'Made by artisans with visual impairments', status: 'approved', dateAdded: '2026-01-08' },
  { id: '12', name: 'Lavender Essential Oil', price: 12.00, category: '4', seller: 'Wellness Roots', sellerId: 's3', image: '/images/lavender-oil.jpg', description: 'Pure lavender essential oil extracted from locally grown lavender. Perfect for aromatherapy, relaxation, and sleep support. 30ml amber bottle.', stock: 55, rating: 4.9, reviews: 188, featured: false, accessibility: 'Braille labels', status: 'approved', dateAdded: '2026-01-10' },
  { id: '13', name: 'Crochet Beanie', price: 20.00, category: '3', seller: 'Breezy Knits', sellerId: 's10', image: '/images/beanie.jpg', description: 'Handcrocheted beanie in soft merino wool. Available in multiple colors. Warm, stylish, and made with love by senior artisans.', stock: 18, rating: 4.3, reviews: 22, featured: false, accessibility: 'Made by seniors with hearing impairments', status: 'approved', dateAdded: '2026-01-12' },
  { id: '14', name: 'Social Media Masterclass', price: 35.00, category: '6', seller: 'SkillUp Academy', sellerId: 's6', image: '/images/masterclass.jpg', description: '2-hour pre-recorded masterclass on Instagram and TikTok marketing. Includes workbook, templates, and certificate of completion.', stock: 100, rating: 4.6, reviews: 67, featured: false, accessibility: 'Closed captions and sign language interpretation', status: 'approved', dateAdded: '2026-01-14' },
  { id: '15', name: 'Coconut Oil Cold-Pressed', price: 10.00, category: '4', seller: 'Wellness Roots', sellerId: 's3', image: '/images/coconut-oil.jpg', description: 'Cold-pressed virgin coconut oil from organic coconuts. Multi-purpose: cooking, skin moisturizer, hair treatment. 250ml glass bottle.', stock: 70, rating: 4.8, reviews: 156, featured: false, accessibility: 'Braille labels', status: 'approved', dateAdded: '2026-01-16' },
  { id: '16', name: 'Macrame Wall Hanging', price: 38.00, category: '2', seller: 'Clay Dreams', sellerId: 's7', image: '/images/macrame.jpg', description: 'Hand-knotted macrame wall hanging in natural cotton cord. Bohemian chic design, 60cm x 90cm. Perfect statement piece for any room.', stock: 7, rating: 4.5, reviews: 29, featured: false, accessibility: 'Designed with easy-grip features', status: 'approved', dateAdded: '2026-01-18' },
]

export const users = [
  { id: 'u1', name: 'Admin User', email: 'admin@inclusivemarket.com', phone: '+63 910 000 0001', role: 'admin', joined: '2025-06-01', status: 'active', avatar: null },
  { id: 'u2', name: 'Maria Santos', email: 'maria@example.com', phone: '+63 917 111 2222', role: 'buyer', joined: '2025-08-15', status: 'active', ordersCount: 8, totalSpent: 245.50, avatar: null },
  { id: 'u3', name: 'Hope Bakery', email: 'hope@bakery.com', phone: '+63 917 123 4567', role: 'seller', joined: '2025-06-15', status: 'active', sellerId: 's1', avatar: null },
  { id: 'u4', name: 'CraftAbility Co-op', email: 'info@craftability.com', phone: '+63 918 234 5678', role: 'seller', joined: '2025-07-20', status: 'active', sellerId: 's2', avatar: null },
  { id: 'u5', name: 'James Liu', email: 'james@example.com', phone: '+63 918 333 4444', role: 'buyer', joined: '2025-10-05', status: 'active', ordersCount: 12, totalSpent: 389.00, avatar: null },
  { id: 'u6', name: 'Ana Garcia', email: 'ana@example.com', phone: '+63 919 444 5555', role: 'buyer', joined: '2025-11-12', status: 'suspended', ordersCount: 3, totalSpent: 87.00, avatar: null },
  { id: 'u7', name: 'Wellness Roots', email: 'wellness@roots.com', phone: '+63 919 345 6789', role: 'seller', joined: '2025-08-10', status: 'active', sellerId: 's3', avatar: null },
  { id: 'u8', name: 'David Kim', email: 'david@example.com', phone: '+63 920 555 6666', role: 'buyer', joined: '2025-12-01', status: 'active', ordersCount: 5, totalSpent: 156.50, avatar: null },
  { id: 'u9', name: 'EcoThreads', email: 'hello@ecothreads.ph', phone: '+63 920 456 7890', role: 'seller', joined: '2025-09-01', status: 'active', sellerId: 's4', avatar: null },
  { id: 'u10', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+63 921 666 7777', role: 'buyer', joined: '2026-01-02', status: 'active', ordersCount: 2, totalSpent: 62.00, avatar: null },
  { id: 'u11', name: 'LightUp Studios', email: 'create@lightup.ph', phone: '+63 921 567 8901', role: 'seller', joined: '2025-09-15', status: 'active', sellerId: 's5', avatar: null },
  { id: 'u12', name: 'Roberto Cruz', email: 'roberto@example.com', phone: '+63 922 777 8888', role: 'buyer', joined: '2025-12-15', status: 'active', ordersCount: 1, totalSpent: 35.00, avatar: null },
  { id: 'u13', name: 'SkillUp Academy', email: 'learn@skillup.ph', phone: '+63 922 678 9012', role: 'seller', joined: '2025-10-05', status: 'active', sellerId: 's6', avatar: null },
  { id: 'u14', name: 'Lisa Tan', email: 'lisa@example.com', phone: '+63 923 888 9999', role: 'buyer', joined: '2026-01-05', status: 'active', ordersCount: 4, totalSpent: 128.00, avatar: null },
  { id: 'u15', name: 'Clay Dreams', email: 'clay@dreams.ph', phone: '+63 923 789 0123', role: 'seller', joined: '2025-10-20', status: 'active', sellerId: 's7', avatar: null },
  { id: 'u16', name: 'Farm Fresh Direct', email: 'orders@farmfresh.ph', phone: '+63 924 890 1234', role: 'seller', joined: '2025-11-01', status: 'active', sellerId: 's8', avatar: null },
  { id: 'u17', name: 'Ink & Soul', email: 'art@inkandsoul.ph', phone: '+63 925 901 2345', role: 'seller', joined: '2025-11-10', status: 'pending', sellerId: 's9', avatar: null },
  { id: 'u18', name: 'Breezy Knits', email: 'knit@breezy.ph', phone: '+63 926 012 3456', role: 'seller', joined: '2025-12-01', status: 'active', sellerId: 's10', avatar: null },
]

export const orders = [
  { id: 'ORD-1001', buyer: 'Maria Santos', buyerId: 'u2', items: [{ productId: '1', name: 'Artisan Sourdough Bread', qty: 2, price: 8.50 }, { productId: '3', name: 'Organic Herbal Tea Set', qty: 1, price: 22.00 }], total: 39.00, status: 'delivered', date: '2026-01-05', paymentMethod: 'cod', shippingAddress: '123 Rizal Ave, Zamboanga City', trackingNumber: 'TRK-20260105' },
  { id: 'ORD-1002', buyer: 'James Liu', buyerId: 'u5', items: [{ productId: '2', name: 'Handwoven Bamboo Basket', qty: 1, price: 35.00 }], total: 35.00, status: 'shipped', date: '2026-01-07', paymentMethod: 'gcash', shippingAddress: '456 Veterans Ave, Zamboanga City', trackingNumber: 'TRK-20260107' },
  { id: 'ORD-1003', buyer: 'Ana Garcia', buyerId: 'u6', items: [{ productId: '4', name: 'Recycled Fabric Tote Bag', qty: 3, price: 18.00 }, { productId: '5', name: 'Handmade Soy Candle Set', qty: 2, price: 28.00 }], total: 110.00, status: 'processing', date: '2026-01-08', paymentMethod: 'bank', shippingAddress: '789 Governor Camins Ave, Zamboanga City' },
  { id: 'ORD-1004', buyer: 'David Kim', buyerId: 'u8', items: [{ productId: '6', name: 'Digital Marketing Workshop', qty: 1, price: 49.00 }], total: 49.00, status: 'delivered', date: '2026-01-03', paymentMethod: 'gcash', shippingAddress: 'Online (Zoom)' },
  { id: 'ORD-1005', buyer: 'Sarah Johnson', buyerId: 'u10', items: [{ productId: '8', name: 'Fresh Fruit Box', qty: 2, price: 30.00 }, { productId: '7', name: 'Ceramic Planter Set', qty: 1, price: 42.00 }], total: 102.00, status: 'pending', date: '2026-01-10', paymentMethod: 'cod', shippingAddress: '321 San Jose Road, Zamboanga City' },
  { id: 'ORD-1006', buyer: 'Maria Santos', buyerId: 'u2', items: [{ productId: '9', name: 'Organic Honey Jar', qty: 2, price: 15.00 }, { productId: '12', name: 'Lavender Essential Oil', qty: 1, price: 12.00 }], total: 42.00, status: 'delivered', date: '2026-01-02', paymentMethod: 'cod', shippingAddress: '123 Rizal Ave, Zamboanga City', trackingNumber: 'TRK-20260102' },
  { id: 'ORD-1007', buyer: 'Roberto Cruz', buyerId: 'u12', items: [{ productId: '11', name: 'Woven Rattan Bag', qty: 1, price: 55.00 }], total: 55.00, status: 'shipped', date: '2026-01-09', paymentMethod: 'gcash', shippingAddress: '555 Tetuan, Zamboanga City', trackingNumber: 'TRK-20260109' },
  { id: 'ORD-1008', buyer: 'Lisa Tan', buyerId: 'u14', items: [{ productId: '13', name: 'Crochet Beanie', qty: 2, price: 20.00 }, { productId: '10', name: 'Bamboo Utensil Set', qty: 1, price: 25.00 }], total: 65.00, status: 'processing', date: '2026-01-11', paymentMethod: 'bank', shippingAddress: '888 Santa Maria, Zamboanga City' },
  { id: 'ORD-1009', buyer: 'James Liu', buyerId: 'u5', items: [{ productId: '14', name: 'Social Media Masterclass', qty: 1, price: 35.00 }], total: 35.00, status: 'delivered', date: '2025-12-28', paymentMethod: 'gcash', shippingAddress: 'Online (Pre-recorded)' },
  { id: 'ORD-1010', buyer: 'David Kim', buyerId: 'u8', items: [{ productId: '1', name: 'Artisan Sourdough Bread', qty: 3, price: 8.50 }, { productId: '5', name: 'Handmade Soy Candle Set', qty: 1, price: 28.00 }], total: 53.50, status: 'pending', date: '2026-01-12', paymentMethod: 'cod', shippingAddress: '222 Baliwasan, Zamboanga City' },
  { id: 'ORD-1011', buyer: 'Lisa Tan', buyerId: 'u14', items: [{ productId: '15', name: 'Coconut Oil Cold-Pressed', qty: 3, price: 10.00 }], total: 30.00, status: 'delivered', date: '2025-12-30', paymentMethod: 'cod', shippingAddress: '888 Santa Maria, Zamboanga City', trackingNumber: 'TRK-20251230' },
  { id: 'ORD-1012', buyer: 'Maria Santos', buyerId: 'u2', items: [{ productId: '16', name: 'Macrame Wall Hanging', qty: 1, price: 38.00 }], total: 38.00, status: 'shipped', date: '2026-01-11', paymentMethod: 'gcash', shippingAddress: '123 Rizal Ave, Zamboanga City', trackingNumber: 'TRK-20260111' },
]

export const reviews = [
  { id: 'r1', productId: '1', userId: 'u2', userName: 'Maria Santos', rating: 5, comment: 'Best sourdough I have ever had! Crispy outside, soft inside. Will order again.', date: '2026-01-06' },
  { id: 'r2', productId: '1', userId: 'u5', userName: 'James Liu', rating: 5, comment: 'Amazing quality bread. Love supporting a PWD-owned business!', date: '2026-01-04' },
  { id: 'r3', productId: '3', userId: 'u2', userName: 'Maria Santos', rating: 5, comment: 'The Chamomile Calm tea is my new favorite. Braille labels are such a thoughtful touch.', date: '2026-01-07' },
  { id: 'r4', productId: '2', userId: 'u5', userName: 'James Liu', rating: 4, comment: 'Beautiful craftsmanship. The weave is very tight and well-made.', date: '2026-01-08' },
  { id: 'r5', productId: '5', userId: 'u8', userName: 'David Kim', rating: 5, comment: 'Candles smell incredible. The raised indicators on the packaging are really clever.', date: '2026-01-05' },
  { id: 'r6', productId: '8', userId: 'u10', userName: 'Sarah Johnson', rating: 4, comment: 'Fruits were fresh and arrived on time. Great service!', date: '2026-01-11' },
  { id: 'r7', productId: '6', userId: 'u8', userName: 'David Kim', rating: 5, comment: 'Excellent workshop! The sign language interpreter made it fully accessible.', date: '2025-12-29' },
  { id: 'r8', productId: '11', userId: 'u12', userName: 'Roberto Cruz', rating: 5, comment: 'Stunning bag. You can feel the quality of the weaving. Very proud to support this co-op.', date: '2026-01-10' },
  { id: 'r9', productId: '4', userId: 'u6', userName: 'Ana Garcia', rating: 4, comment: 'Love the eco-friendly concept. Bag is sturdy and looks great.', date: '2026-01-09' },
  { id: 'r10', productId: '3', userId: 'u14', userName: 'Lisa Tan', rating: 5, comment: 'Gave this as a gift. The recipient loved it. The packaging with Braille is so inclusive.', date: '2025-12-31' },
  { id: 'r11', productId: '12', userId: 'u2', userName: 'Maria Santos', rating: 5, comment: 'High quality lavender oil. Helps me sleep so much better.', date: '2026-01-03' },
  { id: 'r12', productId: '15', userId: 'u14', userName: 'Lisa Tan', rating: 5, comment: 'Pure coconut oil. I use it for cooking and as a skin moisturizer. Multi-purpose!', date: '2025-12-31' },
]

export const activityLogs = [
  { id: 'a1', action: 'User registered', user: 'Sarah Johnson', type: 'user', time: '2 hours ago', icon: 'User', details: 'New buyer account created from Zamboanga City' },
  { id: 'a2', action: 'Product listed', user: 'Breezy Knits', type: 'product', time: '3 hours ago', icon: 'Package', details: 'Crochet Beanie added for review' },
  { id: 'a3', action: 'Order placed', user: 'Lisa Tan', type: 'order', time: '4 hours ago', icon: 'ShoppingCart', details: 'ORD-1008 for ₱65.00 — Zamboanga City delivery' },
  { id: 'a4', action: 'Product approved', user: 'Admin User', type: 'product', time: '5 hours ago', icon: 'Package', details: 'Crochet Beanie approved for AVRC seller' },
  { id: 'a5', action: 'Seller application', user: 'Ink & Soul', type: 'user', time: '6 hours ago', icon: 'User', details: 'New seller application from San Jose, Zamboanga City' },
  { id: 'a6', action: 'Order delivered', user: 'System', type: 'order', time: '8 hours ago', icon: 'ShoppingCart', details: 'ORD-1011 marked as delivered to Santa Maria' },
  { id: 'a7', action: 'Settings updated', user: 'Admin User', type: 'system', time: '1 day ago', icon: 'Settings', details: 'Platform fee changed to 5% for AVRC sellers' },
  { id: 'a8', action: 'User suspended', user: 'Admin User', type: 'user', time: '1 day ago', icon: 'AlertTriangle', details: 'Ana Garcia account suspended for policy violation' },
  { id: 'a9', action: 'Payout processed', user: 'System', type: 'system', time: '2 days ago', icon: 'Settings', details: '₱850.00 paid to Hope Bakery via bank transfer' },
  { id: 'a10', action: 'Product rejected', user: 'Admin User', type: 'product', time: '2 days ago', icon: 'Package', details: 'Counterfeit listing removed from marketplace' },
  { id: 'a11', action: 'New seller registered', user: 'Breezy Knits', type: 'user', time: '3 days ago', icon: 'User', details: 'Seller account activated — AVRC Region IX client' },
  { id: 'a12', action: 'Order placed', user: 'Roberto Cruz', type: 'order', time: '3 days ago', icon: 'ShoppingCart', details: 'ORD-1007 for ₱55.00 — Zamboanga City delivery' },
]

export const payouts = [
  { id: 'PAY-001', sellerId: 's1', sellerName: 'Hope Bakery', amount: 850.00, date: '2026-01-10', status: 'completed', method: 'Bank Transfer', accountName: 'Hope Bakery Inc.' },
  { id: 'PAY-002', sellerId: 's5', sellerName: 'LightUp Studios', amount: 620.50, date: '2026-01-05', status: 'completed', method: 'GCash', accountName: 'LightUp Studios' },
  { id: 'PAY-003', sellerId: 's2', sellerName: 'CraftAbility Co-op', amount: 1200.00, date: '2025-12-28', status: 'completed', method: 'Bank Transfer', accountName: 'CraftAbility Cooperative' },
  { id: 'PAY-004', sellerId: 's3', sellerName: 'Wellness Roots', amount: 980.75, date: '2025-12-20', status: 'completed', method: 'GCash', accountName: 'Wellness Roots PH' },
  { id: 'PAY-005', sellerId: 's8', sellerName: 'Farm Fresh Direct', amount: 720.00, date: '2025-12-15', status: 'completed', method: 'Bank Transfer', accountName: 'Farm Fresh Direct' },
  { id: 'PAY-006', sellerId: 's1', sellerName: 'Hope Bakery', amount: 430.00, date: '2025-12-01', status: 'completed', method: 'Bank Transfer', accountName: 'Hope Bakery Inc.' },
  { id: 'PAY-007', sellerId: 's6', sellerName: 'SkillUp Academy', amount: 1580.00, date: '2025-12-10', status: 'completed', method: 'Bank Transfer', accountName: 'SkillUp Academy' },
  { id: 'PAY-008', sellerId: 's4', sellerName: 'EcoThreads', amount: 340.00, date: '2025-12-05', status: 'completed', method: 'GCash', accountName: 'EcoThreads PH' },
]

export const transactions = [
  { id: 'TXN-001', orderId: 'ORD-1001', buyer: 'Maria Santos', seller: 'Hope Bakery', amount: 39.00, platformFee: 1.95, sellerPayout: 37.05, method: 'Cash on Delivery', status: 'completed', date: '2026-01-05' },
  { id: 'TXN-002', orderId: 'ORD-1002', buyer: 'James Liu', seller: 'CraftAbility Co-op', amount: 35.00, platformFee: 1.75, sellerPayout: 33.25, method: 'GCash', status: 'completed', date: '2026-01-07' },
  { id: 'TXN-003', orderId: 'ORD-1003', buyer: 'Ana Garcia', seller: 'EcoThreads', amount: 54.00, platformFee: 2.70, sellerPayout: 51.30, method: 'Bank Transfer', status: 'completed', date: '2026-01-08' },
  { id: 'TXN-004', orderId: 'ORD-1003', buyer: 'Ana Garcia', seller: 'LightUp Studios', amount: 56.00, platformFee: 2.80, sellerPayout: 53.20, method: 'Bank Transfer', status: 'completed', date: '2026-01-08' },
  { id: 'TXN-005', orderId: 'ORD-1004', buyer: 'David Kim', seller: 'SkillUp Academy', amount: 49.00, platformFee: 2.45, sellerPayout: 46.55, method: 'GCash', status: 'completed', date: '2026-01-03' },
  { id: 'TXN-006', orderId: 'ORD-1005', buyer: 'Sarah Johnson', seller: 'Farm Fresh Direct', amount: 60.00, platformFee: 3.00, sellerPayout: 57.00, method: 'Cash on Delivery', status: 'pending', date: '2026-01-10' },
  { id: 'TXN-007', orderId: 'ORD-1005', buyer: 'Sarah Johnson', seller: 'Clay Dreams', amount: 42.00, platformFee: 2.10, sellerPayout: 39.90, method: 'Cash on Delivery', status: 'pending', date: '2026-01-10' },
  { id: 'TXN-008', orderId: 'ORD-1006', buyer: 'Maria Santos', seller: 'Farm Fresh Direct', amount: 30.00, platformFee: 1.50, sellerPayout: 28.50, method: 'Cash on Delivery', status: 'completed', date: '2026-01-02' },
  { id: 'TXN-009', orderId: 'ORD-1006', buyer: 'Maria Santos', seller: 'Wellness Roots', amount: 12.00, platformFee: 0.60, sellerPayout: 11.40, method: 'Cash on Delivery', status: 'completed', date: '2026-01-02' },
  { id: 'TXN-010', orderId: 'ORD-1007', buyer: 'Roberto Cruz', seller: 'CraftAbility Co-op', amount: 55.00, platformFee: 2.75, sellerPayout: 52.25, method: 'GCash', status: 'completed', date: '2026-01-09' },
]

export const siteSettings = {
  siteName: 'Inclusive Market — AVRC Region IX',
  siteDescription: 'An accessible, community-driven marketplace empowering PWD-led enterprises of AVRC Region IX by connecting Zamboanga Peninsula\'s local, high-quality products directly with conscious consumers.',
  platformFee: 5,
  currency: 'PHP',
  emailNotifications: true,
  orderNotifications: true,
  lowStockAlerts: true,
  maintenanceMode: false,
  registrationOpen: true,
  theme: 'light',
  contactEmail: 'support@inclusivemarket.com',
  contactPhone: '+63 62 991 2345',
  address: 'Mampang, Zamboanga City, Region IX, Philippines',
}
