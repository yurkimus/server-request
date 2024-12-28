import '@yurkimus/errors'

export let ServerFeatures = new Map()

let properties = ['fallback', 'onfulfilled', 'onrejected']

export function ServerRequest(feature, input, init) {
  if (!(this instanceof ServerRequest))
    return new ServerRequest(feature, input, init)

  if (!ServerFeatures.has(feature))
    throw TypeError(
      `'feature' must be presented in 'ServerFeatures'.`,
    )

  for (let property of properties)
    if (!(property in ServerFeatures.get(feature)))
      throw TypeError(
        `'feature' must include required properties: ${properties.join(', ')}.`,
      )

  for (let property of properties)
    if (typeof ServerFeatures.get(feature)[property] !== 'function')
      throw TypeError(
        `'feature' properties must be [[Callable]].`,
      )

  this.feature = feature
  this.input = input
  this.init = init
}

ServerRequest.prototype.onfulfilled = function([response, body]) {
  switch (response.status) {
    case 200:
      return ServerFeatures
        .get(this.feature)
        .onfulfilled(body)

    case 204:
      return ServerFeatures
        .get(this.feature)
        .fallback(body)

    case 400:
      throw RequestError(body.message)

    case 401:
      throw AuthorizationError(body.message)

    default:
      throw body
  }
}

ServerRequest.prototype.onrejected = function(reason) {
  ServerFeatures
    .get(this.feature)
    .onrejected(reason)
}

ServerRequest.prototype[Symbol.toStringTag] = 'ServerRequest'