export function get404 (req:any, res:any, next:any):any {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404' });
};
