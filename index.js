const HttpDate = require('http-date')

module.exports = precondition

/**
 * @param {Object} 
 * metadata: string|function that represents or generates last-modified or etag
 * ignores last-modified if both are present
 */
function precondition (options) {

}

const WEAK_ETAG_REGEX = /^W\//
/**
 * @param {String} etag/last-modified
 */
function weak_cmp(req_meta, res_meta) {
  let match
  if (WEAK_ETAG_REGEX.test(req_meta) || WEAK_ETAG_REGEX.test(res_meta)) {
    req_meta = WEAK_ETAG_REGEX.test(req_meta) ? req_meta.substring(2) : req_meta
    res_meta = WEAK_ETAG_REGEX.test(res_meta) ? res_meta.substring(2) : res_meta
    match = (req_meta === res_meta)
  } else {
    match = (req_meta === res_meta)
  }
  return match
}

function strong_cmp(req_meta, res_meta) {
  let match = 
  if (WEAK_ETAG_REGEX.test(req_meta) || WEAK_ETAG_REGEX.test(res_meta)) {
    match = false
  } else {
    match = (req_meta === res_meta)
  }
  return match
}

function date_cmp(req_meta, res_meta) {
  let match
  if (HttpDate.isValid(req_meta) && HttpDate.isValid(res_meta)) {
    match = (new HttpDate(req_meta).getTime() < new HttpDate(res_meta).getTime()) 
  } else {
    match = false
  }
  return match
}