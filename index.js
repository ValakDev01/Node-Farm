const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

// ----------------------------------------------------------------

// SERVER
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

// ----------------------------------------------------------------

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product' && query.id) {
    const productId = query.id;
    const productSlug = slugs[productId];

    if (productSlug) {
      res.writeHead(302, {
        Location: `/product/${productSlug}`,
      });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>Product Not Found</h1></body></html>');
    }

    // Product page with slug
  } else if (pathname.startsWith('/product/')) {
    const productSlug = pathname.split('/').pop();
    const productId = slugs.indexOf(productSlug);
    const product = dataObj[productId];

    if (product) {
      const output = replaceTemplate(tempProduct, product);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(output);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>Product Not Found</h1></body></html>');
    }

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found!</h1>');
  }
});

// ----------------------------------------------------------------

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
