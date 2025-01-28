const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy do GeoServera (przykład: ahocevar.com)
  app.use(
    '/geoserver',
    createProxyMiddleware({
      target: 'https://ahocevar.com',
      changeOrigin: true,
    })
  );

  // Proxy do Geoportalu
  app.use(
    '/geoportal', // Przekierowuje wszystkie zapytania pod '/geoportal' do serwera Geoportalu
    createProxyMiddleware({
      target: 'https://mapy.geoportal.gov.pl', // Główny serwer Geoportalu
      changeOrigin: true, // Opcja zmieniająca nagłówki 'Origin' zapytania
      pathRewrite: {
        '^/geoportal': '', // Usuwa '/geoportal' ze ścieżki przed przekierowaniem
      },
      secure: false, // Wyłącza wymóg bezpiecznego certyfikatu SSL (jeśli certyfikat jest nieprawidłowy)
    })
  );
};
