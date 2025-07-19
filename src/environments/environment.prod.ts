export const environment = {
  production: true,
  apiUrl: `http://${process.env['API_URL'] || 'localhost:8080'}/api`
};
