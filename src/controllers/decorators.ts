type RouteName = string;
export type FieldName = string;

export interface RouteInfo {
  method: HttpMethod;
  childRoute: RouteName;
}

export const childRouteMap = new Map<Constructor, Map<FieldName, RouteInfo>>();

function createMethod(method: HttpMethod) {
  return (childRoute: RouteName) => (Class: any, field: FieldName) => {
    const fieldMap = childRouteMap.get(Class.constructor) ?? new Map<FieldName, RouteInfo>();
    childRouteMap.set(Class.constructor, fieldMap);
    if (fieldMap.has(field)) {
      throw new Error(`Duplicate REST endpoint ${field}`);
    }
    fieldMap.set(field, { method, childRoute });
  };
}

export const Get = createMethod('GET');
export const Post = createMethod('POST');
export const Put = createMethod('PUT');
export const Delete = createMethod('DELETE');
