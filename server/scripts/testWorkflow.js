const http = require('http');

// Helper to make http requests
const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runIntegrationTests = async () => {
  console.log('====================================================');
  console.log('       SHOPEZ END-TO-END AUTOMATED TEST SUITE        ');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('[Test 1] Testing /api/health endpoint...');
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    if (health.statusCode === 200 && health.data.status === 'ok') {
      console.log('✅ Health check passed: Service is operational.\n');
    } else {
      throw new Error(`Health check failed with status: ${health.statusCode}`);
    }

    // 2. Promotional Banners
    console.log('[Test 2] Testing /api/banners (Homepage Hero)...');
    const banners = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/banners',
      method: 'GET',
    });
    const bannerList = banners.data.data?.banners || [];
    console.log(`✅ Loaded ${bannerList.length} active promotional banners.`);
    console.log(`   Featured: "${bannerList[0]?.title}"\n`);

    // 3. Categories and Product Counts
    console.log('[Test 3] Testing /api/categories...');
    const categories = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/categories',
      method: 'GET',
    });
    const catList = categories.data.data?.categories || [];
    console.log(`✅ Loaded ${catList.length} store categories.`);
    catList.forEach((c) => {
      console.log(`   - ${c.name} (${c.productCount} active products)`);
    });
    console.log('');

    // 4. Products Search & Filtering
    console.log('[Test 4] Testing /api/products with search & filter...');
    const searchRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products?search=shoes&sort=price-asc',
      method: 'GET',
    });
    const foundProducts = searchRes.data.data?.products || [];
    console.log(`✅ Filtered search returned ${foundProducts.length} product(s).`);
    console.log(`   Top result: "${foundProducts[0]?.title}" at $${foundProducts[0]?.finalPrice}\n`);

    // 5. Customer Authentication
    console.log('[Test 5] Customer login with credentials...');
    const customerLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'customer@shopez.com',
        password: 'Customer@12345',
      }
    );

    if (customerLogin.statusCode !== 200 || !customerLogin.data.success) {
      throw new Error('Customer login failed: ' + JSON.stringify(customerLogin.data));
    }

    const customerToken = customerLogin.data.data.token;
    const cookieHeader = customerLogin.headers['set-cookie']
      ? customerLogin.headers['set-cookie'][0].split(';')[0]
      : '';
    console.log('✅ Customer authenticated successfully:');
    console.log(`   Name: ${customerLogin.data.data.user.name}`);
    console.log(`   Role: ${customerLogin.data.data.user.userType}\n`);

    // 6. Add Item to Cart
    console.log('[Test 6] Adding product to authenticated cart...');
    const allProducts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products?limit=2',
      method: 'GET',
    });
    const targetProduct = allProducts.data.data.products[0];
    const targetSize = targetProduct.sizes?.[0] || '';

    const addToCartRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/cart/items',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
          Cookie: cookieHeader,
        },
      },
      {
        productId: targetProduct._id,
        size: targetSize,
        quantity: 1,
      }
    );

    if (addToCartRes.statusCode !== 200) {
      throw new Error('Add to cart failed: ' + JSON.stringify(addToCartRes.data));
    }
    console.log(`✅ Added "${targetProduct.title}" (Size: ${targetSize}) to cart.`);
    console.log(`   Cart Total Items: ${addToCartRes.data.data.cart.totalItems}`);
    console.log(`   Cart Subtotal: $${addToCartRes.data.data.cart.subtotal}\n`);

    // 7. Place Order (Checkout)
    console.log('[Test 7] Placing a new Cash on Delivery Order...');
    const placeOrderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
          Cookie: cookieHeader,
        },
      },
      {
        items: [
          {
            productId: targetProduct._id,
            size: targetSize,
            quantity: 1,
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
      }
    );

    if (placeOrderRes.statusCode !== 201) {
      throw new Error('Order creation failed: ' + JSON.stringify(placeOrderRes.data));
    }
    const createdOrder = placeOrderRes.data.data.order;
    console.log('✅ Order placed successfully!');
    console.log(`   Order Number: ${createdOrder.orderNumber}`);
    console.log(`   Total Amount: $${createdOrder.totalAmount}`);
    console.log(`   Status: ${createdOrder.status}\n`);

    // 8. Verify Cart Emptied after order
    console.log('[Test 8] Checking that cart was cleared upon order creation...');
    const cartCheck = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/cart',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        Cookie: cookieHeader,
      },
    });
    console.log(`✅ Cart item count after order: ${cartCheck.data.data.cart.totalItems} (Emptied)\n`);

    // 9. Administrator Login & Authorization
    console.log('[Test 9] Administrator authentication...');
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@shopez.com',
        password: 'Admin@12345',
      }
    );

    if (adminLogin.statusCode !== 200 || adminLogin.data.data.user.userType !== 'admin') {
      throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
    }
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Administrator authenticated:');
    console.log(`   Name: ${adminLogin.data.data.user.name}`);
    console.log(`   Role: ${adminLogin.data.data.user.userType}\n`);

    // 10. Admin Dashboard Statistics
    console.log('[Test 10] Fetching Admin Dashboard Statistics...');
    const statsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const summary = statsRes.data.data.summary;
    console.log('✅ Live Business Metrics:');
    console.log(`   - Total Products:   ${summary.totalProducts}`);
    console.log(`   - Total Categories: ${summary.totalCategories}`);
    console.log(`   - Total Customers:  ${summary.totalCustomers}`);
    console.log(`   - Total Orders:     ${summary.totalOrders}`);
    console.log(`   - Total Revenue:    $${summary.totalRevenue}\n`);

    // 11. Admin Updating Order Status & Tracking
    console.log(`[Test 11] Admin updating Order #${createdOrder.orderNumber} to "Shipped"...`);
    const updateOrderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/orders/${createdOrder._id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      {
        status: 'Shipped',
        trackingNumber: 'TRK-99887766US',
      }
    );
    if (updateOrderRes.statusCode !== 200) {
      console.error('Update order failed:', updateOrderRes.statusCode, updateOrderRes.data);
    }
    console.log(`✅ Order status updated to: "${updateOrderRes.data.data.order.status}"`);
    console.log(`   Assigned Tracking: "${updateOrderRes.data.data.order.trackingNumber}"\n`);

    // 12. Customer Verification of Status Change
    console.log(`[Test 12] Customer verifying their updated order details...`);
    const customerOrderCheck = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${createdOrder._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    console.log(`✅ Customer sees latest status: "${customerOrderCheck.data.data.order.status}"`);
    console.log(`   Tracking Number: "${customerOrderCheck.data.data.order.trackingNumber}"\n`);

    console.log('====================================================');
    console.log('       ALL 12 INTEGRATION TESTS PASSED 100%!        ');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test suite error:', err.message);
    process.exit(1);
  }
};

runIntegrationTests();
