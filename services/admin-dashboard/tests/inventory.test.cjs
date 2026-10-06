const assert = require('node:assert/strict');
const { test, afterEach } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');

// Use the already-declared TypeScript compiler with Node's built-in test runner.
function loadSource(relativePath, mocks = {}, cache = new Map()) {
  const filename = path.resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
      const source = ['.ts', '.tsx'].map((ext) => base + ext).find((file) => fs.existsSync(file));
      if (source) return loadSource(source, mocks, cache);
    }
    return require(id);
  };
  new Function('require', 'module', 'exports', outputText)(localRequire, module, module.exports);
  return module.exports;
}

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
const { getStockStatus, createStockSchema, MAX_INVENTORY_QUANTITY } = loadSource('lib/inventory.ts');

test('stock status uses available stock and the service default threshold', () => {
  for (const [quantity, expected] of [
    [-1, 'Out of stock'], [0, 'Out of stock'], [1, 'Low stock'],
    [9, 'Low stock'], [10, 'In stock'], [100, 'In stock'],
  ]) {
    assert.equal(getStockStatus(quantity), expected);
  }
});

test('quantity validation accepts zero and the service integer boundary', () => {
  const schema = createStockSchema(0);
  assert.equal(schema.safeParse({ quantity: 0 }).success, true);
  assert.equal(schema.safeParse({ quantity: MAX_INVENTORY_QUANTITY }).success, true);
});

test('quantity validation rejects empty, negative, fractional, and overflowing quantities', () => {
  const schema = createStockSchema(0);
  for (const quantity of [NaN, undefined, '', -1, 1.5, Infinity, MAX_INVENTORY_QUANTITY + 1]) {
    assert.equal(schema.safeParse({ quantity }).success, false, `Invalid quantity: ${quantity}`);
  }
});

test('total stock cannot be set below reserved stock', () => {
  const schema = createStockSchema(5);
  assert.equal(schema.safeParse({ quantity: 4 }).success, false);
  assert.equal(schema.safeParse({ quantity: 5 }).success, true);
});

test('inventory API requests the inventory list with limit/offset, not catalog pagination', async () => {
  const products = [{ id: 'product-1', available_quantity: 10, reserved_quantity: 2 }];
  global.fetch = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/api/v1/inventory/products');
    assert.equal(parsed.searchParams.get('limit'), '20');
    assert.equal(parsed.searchParams.get('offset'), '40');
    assert.equal(parsed.searchParams.has('page'), false);
    assert.equal(options.method, 'GET');
    return Response.json(products);
  };
  const { inventoryApi } = loadSource('services/api/inventory.ts');
  assert.deepEqual(await inventoryApi.getProducts({ limit: 20, offset: 40 }), products);
});

test('inventory API sends absolute total quantity including zero', async () => {
  const { inventoryApi } = loadSource('services/api/inventory.ts');
  for (const quantity of [0, 150]) {
    const inventory = { product_id: 'product-1', quantity, reserved_quantity: 0 };
    global.fetch = async (url, options) => {
      assert.equal(new URL(url).pathname, '/api/v1/inventory/product-1');
      assert.equal(options.method, 'PUT');
      assert.deepEqual(JSON.parse(options.body), { quantity });
      return Response.json(inventory);
    };
    assert.deepEqual(await inventoryApi.updateInventory('product-1', { quantity }), inventory);
  }
});

test('inventory API exposes server errors instead of returning empty inventory', async () => {
  global.fetch = async () => Response.json({ message: 'Inventory unavailable' }, { status: 503 });
  const { inventoryApi } = loadSource('services/api/inventory.ts');
  await assert.rejects(inventoryApi.getProducts(), { message: 'Inventory unavailable', status: 503 });
  await assert.rejects(inventoryApi.updateInventory('product-1', { quantity: 2 }), { status: 503 });
});

const product = {
  id: 'product-1', sku: 'SKU-001', name: 'Test product', description: null,
  price: '10.00', available_quantity: 8, reserved_quantity: 2,
};

function renderPage(queryState) {
  const { default: InventoryPage } = loadSource('app/admin/inventory/page.tsx', {
    '@/components/layout/AdminLayout': { AdminLayout: ({ children }) => React.createElement('main', null, children) },
    '@tanstack/react-query': {
      useQueryClient: () => ({}),
      useQuery: () => ({ isLoading: false, isFetching: false, isError: false, refetch: () => {}, ...queryState }),
      useMutation: () => ({ isPending: false, error: null }),
    },
  });
  return renderToStaticMarkup(React.createElement(InventoryPage));
}

test('inventory page displays SKU, stock status, and an accessible update action', () => {
  const html = renderPage({ data: [product] });
  assert.match(html, /SKU-001/);
  assert.match(html, /Low stock/);
  assert.match(html, /Total stock/);
  assert.match(html, /Reserved/);
  assert.match(html, /Available/);
  assert.match(html, /aria-label="Update stock for Test product"/);
  assert.match(html, />10<\/td>/);
});

test('inventory page distinguishes loading, empty, and error states', () => {
  assert.match(renderPage({ isLoading: true }), /animate-pulse/);
  assert.match(renderPage({ data: [] }), /No inventory found/);
  const html = renderPage({ isError: true, error: new Error('Service unavailable') });
  assert.match(html, /Unable to load inventory: Service unavailable/);
  assert.match(html, /Try again/);
  assert.doesNotMatch(html, /No inventory found/);
});

function pageHarness({ page = 1, selected = null, pending = false } = {}) {
  let stateIndex = 0;
  let mutationOptions;
  const updates = [];
  const invalidations = [];
  const submitted = [];
  const mutation = { isPending: pending, error: null, reset: () => {}, mutate: (data) => submitted.push(data) };
  const { default: InventoryPage } = loadSource('app/admin/inventory/page.tsx', {
    react: {
      ...React,
      useState: () => {
        const index = stateIndex++;
        return [[page, selected, ''][index], (value) => updates.push({ index, value })];
      },
    },
    '@tanstack/react-query': {
      useQueryClient: () => ({ invalidateQueries: async (options) => { invalidations.push(options.queryKey); } }),
      useQuery: () => ({ data: Array(20).fill(product), isFetching: false, isError: false }),
      useMutation: (options) => { mutationOptions = options; return mutation; },
    },
  });
  const tree = InventoryPage();
  const nodes = [];
  function walk(element) {
    if (!React.isValidElement(element)) return;
    nodes.push(element);
    React.Children.forEach(element.props.children, walk);
  }
  walk(tree);
  return { nodes, updates, invalidations, submitted, mutationOptions };
}

test('successful stock updates refresh both lists and close the editor', async () => {
  const harness = pageHarness({ selected: product });
  await harness.mutationOptions.onSuccess();
  assert.deepEqual(harness.invalidations, [['inventory'], ['products']]);
  assert.deepEqual(harness.updates, [
    { index: 1, value: null },
    { index: 2, value: 'Stock updated successfully.' },
  ]);
});

test('stock editor submits the selected inventory product ID and absolute total', () => {
  const harness = pageHarness({ selected: product });
  const form = harness.nodes.find((node) => node.type.name === 'StockForm');
  form.props.onSubmit({ quantity: 30 });
  assert.deepEqual(harness.submitted, [{ productId: product.id, values: { quantity: 30 } }]);
  form.props.onCancel();
  assert.deepEqual(harness.updates, [{ index: 1, value: null }]);
});

test('pagination advances and closes the editor, but is disabled during a save', () => {
  const harness = pageHarness({ selected: product });
  const next = harness.nodes.find((node) => node.type === 'button' && node.props.children === 'Next');
  assert.equal(next.props.disabled, false);
  next.props.onClick();
  assert.deepEqual(harness.updates, [{ index: 1, value: null }, { index: 0, value: 2 }]);
  const pending = pageHarness({ selected: product, pending: true });
  const pageButtons = pending.nodes.filter((node) => node.type === 'button');
  assert.equal(pageButtons.every((node) => node.props.disabled), true);
});

test('stock form initializes total quantity and explains reservations', () => {
  const { StockForm } = loadSource('components/inventory/StockForm.tsx');
  const html = renderToStaticMarkup(React.createElement(StockForm, {
    product, onSubmit: () => {}, onCancel: () => {}, isLoading: false, error: null,
  }));
  assert.match(html, /including 2 reserved units/);
  assert.match(html, /min="2"/);
  assert.match(html, /for="stock-quantity"/);
  assert.match(html, /Save stock/);
});

test('stock form disables controls while saving and shows mutation errors', () => {
  const { StockForm } = loadSource('components/inventory/StockForm.tsx');
  const html = renderToStaticMarkup(React.createElement(StockForm, {
    product, onSubmit: () => {}, onCancel: () => {}, isLoading: true, error: new Error('Update failed'),
  }));
  assert.match(html, /Saving\.\.\./);
  assert.match(html, /role="alert"[^>]*>Update failed/);
  assert.equal((html.match(/disabled=""/g) || []).length, 3);
});
