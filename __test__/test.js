const precondition = require('../index.js')
const HttpDate = require('http-date')
var req 

beforeEach(() => {
  //reset req object
  req = {
    method: ''
    headers: {

    }
  }
})

describe('should detect all conditional requests (as defined in RFC 7232)', () => {
  test('should detect range conditional requests', () => {

  })
  test('should detect cache revalidation conditional requests', () => {

  })
  test('should detect "lost update" avoidance conditional requests', () => {

  })
  test('should be able to detect every other conditional requests', () => {

  })
  test('should ignore "If-modified-since" header field if method is neither "head" or "get"', ()=>{

  })
  test('should ignore "If-modified-since" and "if-unmodified-since" if last-modified  '+
    'date is not a valid HTTP-date', ()=>{
    
  })
  test('condition should always evaluate to true if etag value is "*"', () => {

  })
  test.todo('should ignore "if-unmodified-since" if an "If-match" header field is present',() => {

  })
  test.todo('should ignore "if-modified-since" if an "If-none-match" header field is present',() => {

  })
  test.todo('can match a member of a list of etags', () => {

  })
})


describe('should populate the express request object with:', () => {
  test('req.isRanged should be true if "If-range" header field present', () => {

  })
  test('req.isRanged should be false if "If-range" header field not present', () => {

  })
  test('req.isConditional should exist for all requests', () => {

  })
  test('req.isConditional should be true if any of the precondition header fields is present', () => {

  })
  test('req.isConditional should be false if no precondition header field is present', () => {

  })
  test('isCacheRevalidation should be true for cache revalidation requests', ()=>{

  })
  test('isCacheRevalidation should be false for non-cache revalidation requests', ()=>{

  })
})

/**
 * @param {object} header fields key-value pair 
 */
function setHeaders(argument) {
  // body...
}

/**
 * @param {string}  
 */
function getHeaders(argument) {
  // body...
}

/**
 * @param {object}
 * returns true  if header field specified in argument exist in req object
 */
function shouldBeTrue(argument) {
  // body...
}

/**
 * @param {object}
 * returns false if header field specified in argument exist in req object
 */
function ShouldBeFalse(argument) {
  // body...
}