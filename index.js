const HttpDate = require('http-date')

module.exports = Precondition

/**
 * precondition headers in order of precedence as defined in
 * rfc7232 section 6
 */
const PRECONDITION_HEADERS = [
  'if-match',
  'if-unmodified-since',
  'if-none-match',
  'if-modified-since',
  'if-range'
]
/**
 * @param {Object} req
 * @param {Object} options
 * @param {Boolean} options.weak
 * @param {String} options.etag
 * @param {String} options.lastModified
 * ignores options.lastModified if options.etag is present
 */
function Precondition (req, options) {
  if (!(this instanceof Precondition))
    return new Precondition(req, options)
  let opts = options || {}
  opts.weak = (typeof opts.weak === 'boolean')
    ? opts.weak
    : false
  if (!opts.etag && !opts.lastModified)
    throw new TypeError('Invalid resource metadata')

  this.condition = false
  for (field of PRECONDITION_HEADERS) {
    if (field === 'if-modified-since' && req.headers[field]) {
      if (req.method !== 'GET'  && req.method !== 'HEAD') {
        continue
      }
    }
    if (HttpDate.isValid(req.headers[field])) {
      this.condition = date_cmp(req.headers, opts.lastModified)
      break
    } else {
      let req_meta = req.headers[field] && req.headers[field].split(',')
      if (!req_meta)
        continue
      for(elem of req_meta) {
        let match = opts.weak
          ? weak_cmp(elem, opts.etag)
          : strong_cmp(elem, opts.etag)
        switch(field) {
          case 'if-match':
          case 'if-range':
            this.condition = match
            break
          case 'if-none-match':
            this.condition = (!match)
            break
        }
        if (match) break
      }
      break
    }
  }
}

const WEAK_ETAG_REGEX = /^W\//
/**
 * @param {String} etag/last-modified
 */
function weak_cmp(req_meta, res_meta) {
  let match = false
  if (req_meta === '*')
    match = true
  else if (WEAK_ETAG_REGEX.test(req_meta) || WEAK_ETAG_REGEX.test(res_meta)) {
    req_meta = WEAK_ETAG_REGEX.test(req_meta) ? req_meta.substring(2) : req_meta
    res_meta = WEAK_ETAG_REGEX.test(res_meta) ? res_meta.substring(2) : res_meta
    match = (req_meta === res_meta)
  } else {
    match = (req_meta === res_meta)
  }
  return match
}

function strong_cmp(req_meta, res_meta) {
  return (req_meta === '*') ||
    ((!WEAK_ETAG_REGEX.test(req_meta) && !WEAK_ETAG_REGEX.test(res_meta))
    ? (req_meta === res_meta)
    : false)
}

/**
 * for strong comparison of last-modified metadata, the date header field
 * should be atleast 60 seconds ahead of the last-modified time
 */
function date_cmp(req_meta, res_meta) {
  if (!HttpDate.isValid(res_meta)){
    return false
  }
  
  let condition = false
  if (req_meta['if-modified-since']) {
    condition =
      (new HttpDate(req_meta['if-modified-since']).getTime() < new HttpDate(res_meta).getTime())
  } else if (req_meta['if-unmodified-since']) {
    condition =
      (new HttpDate(res_meta).getTime() <= new HttpDate(req_meta['if-unmodified-since']).getTime())
  } 

  if (req_meta['if-range']) {
    console.log('range: ', req_meta['if-range'])
    condition =
      (new HttpDate(res_meta).getTime() <= new HttpDate(req_meta['if-range']).getTime())
  }
  return condition
}

Precondition.isConditional =
Precondition.prototype.isConditional = function isConditional(req) {
  let value = req.headers['if-match'] || req.headers['if-none-match'] ||
    req.headers['if-modified-since'] || req.headers['if-unmodified-since'] ||
    req.headers['if-range']

    return Boolean(value)
}

Precondition.isRange =
Precondition.prototype.isRange = function isRange(req) {
  return Boolean(req.headers['if-range'])
}

Precondition.isCacheRevalidation =
Precondition.prototype.isCacheRevalidation = function isCacheRevalidation(req) {
  return Boolean(req.headers['if-modified-since'] || req.headers['if-none-match'])
}