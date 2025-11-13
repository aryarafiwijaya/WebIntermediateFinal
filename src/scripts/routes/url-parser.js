function extractPathnameSegments(path) {
  const cleanPath = path.replace(/\/+$/, ''); 
  const splitUrl = cleanPath.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  if (!pathSegments.resource) return '/';

  if (pathSegments.resource === 'detail' && pathSegments.id) {
    return '/detail/:id';
  }

  return `/${pathSegments.resource}`;
}

export function getActivePathname() {
  let hash = location.hash.replace('#', '').toLowerCase().trim();

  if (hash.endsWith('/')) hash = hash.slice(0, -1);

  return hash || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
