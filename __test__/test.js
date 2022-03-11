const Precondition = require('../index.js')
const HttpDate = require('http-date')
const http = require('http')
const crypto = require('crypto')


//let headers = {}
let strong_etag = '\"' + crypto.randomBytes(16).toString('hex') + '\"'
let weak_etag = 'W/' + '\"' + crypto.randomBytes(16).toString('hex') + '\"'
let last_modified = new HttpDate().toString()
let pre_last_modified = new HttpDate(1646853365000).toString()
let invalid_date = 'Sun,6 Nov 2022 08:34:54 GMT'
const PORT = process.env.PORT || 4000

const precondition_options = {
  weak: {
    weak: true,
    etag: weak_etag
  },
  strong: {
    weak: false,
    etag: strong_etag
  }
}

const request_options = {
  hostname: 'localhost',
  port: PORT,
  path: '/',
  method: 'GET',
  headers: {}
}

beforeEach(() => {
//  server = http.createServer
//  headers = {}
  request_options.headers  = {}
  request_options.method = 'GET'
})

function testServer(callback, request_options, done) {
  let server = http.createServer((req, res)=>{
    callback(req)
    res.end()
  }).listen(PORT)
  http.request(request_options).end(()=>{
    server.close(()=>{
      done()
    })
  })
}

describe('should detect all conditional requests (as defined in RFC 7232)', () => {
  test('should detect if "if-range" field is in header', done => {
    request_options.headers['if-range'] = [strong_etag ,'"xyzzy"', '"r2d2xxxx"', '"c3piozzzz"']
    testServer(req => {
      expect(Precondition.isConditional(req)).toBe(true)
    }, request_options, done)
  })
  test('should detect if "if-none-match" field is in header', done => {
    request_options.headers['if-none-match'] = strong_etag
    testServer(req => {
      expect(Precondition.isConditional(req)).toBe(true)
    }, request_options, done)
  })
  test('should return true if "if-modified-since" field is in header', done => {
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      expect(Precondition.isConditional(req)).toBe(true)
    }, request_options, done)
  })

  test('should detect range conditional requests', done => {
    request_options.headers['if-range'] = [strong_etag ,'"xyzzy"', '"r2d2xxxx"', '"c3piozzzz"']
    testServer(req => {
      expect(Precondition.isRange(req)).toBe(true)
    }, request_options, done)
  })
  test('should detect cache revalidation conditional requests', done => {
    request_options.headers['if-none-match'] = strong_etag
    testServer(req => {
      expect(Precondition.isCacheRevalidation(req)).toBe(true)
    }, request_options, done)
  })
  test('should detect cache revalidation conditional requests', done => {
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      expect(Precondition.isCacheRevalidation(req)).toBe(true)
    }, request_options, done)
  })
  test('should return true if "if-unmodified-since" field is in headers', done => {
    request_options.headers['if-unmodified-since'] = last_modified
    testServer(req => {
      expect(Precondition.isConditional(req)).toBe(true)
    }, request_options, done)
  })
  test('should return true if "if-match" field is in headers', done => {
    request_options.headers['if-match'] = strong_etag
    testServer(req => {
      expect(Precondition.isConditional(req)).toBe(true)
    }, request_options, done)
  })
  test('should throw TypeError if resource metadata is unavailable', done => {
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      function err () {
        return new Precondition(req, undefined)
      }
      expect(err).toThrow(TypeError)
    }, request_options, done)
  })
  test('should ignore "If-modified-since", if method is neither "head" or "get"', done => {
    request_options.headers['if-modified-since'] = last_modified
    request_options.method = 'POST'
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('condition should always evaluate to true if etag value is "*"', done => {
    request_options.headers['if-match'] = '*'
    testServer(req => {
      let condition = Precondition(req, precondition_options.strong).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('"if-none-match" should always evaluate to false if etag value is "*"', done => {
    request_options.headers['if-none-match'] = '*'
    testServer(req => {
      let condition = new Precondition(req, precondition_options.weak).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('can match a member of a list of etags', done => {
    request_options.headers['if-none-match'] = ['"r2d2xxxx"', strong_etag ,'"xyzzy"', '"c3piozzzz"'].join(',')
    testServer(req => {
      let condition = new Precondition(req, precondition_options.strong).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('can match a member of a list of etags', done => {
    request_options.headers['if-none-match'] = ['"r2d2xxxx"', weak_etag ,'"xyzzy"', '"c3piozzzz"'].join(',')
    testServer(req => {
      let condition = new Precondition(req, precondition_options.weak).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  
})

describe('should evalute weak etags', () => {
  test('should evalute same weak and strong_etag to true', done => {
    request_options.headers['if-none-match'] = strong_etag
    testServer(req => {
      let condition =
      new Precondition(req, {etag: 'W/' + strong_etag}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('should evalute matching "if-none-match" weak etags to false', done => {
    request_options.headers['if-none-match'] = weak_etag
    testServer(req => {
      let condition = new Precondition(req, precondition_options.weak).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('should evalute same strong etags with weak comparison to true', done => {
    request_options.headers['if-match'] = strong_etag
    testServer(req => {
      let condition = new Precondition(req, {weak: true, etag: strong_etag}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('should evalute same weak etags to true', done => {
    request_options.headers['if-match'] = weak_etag
    testServer(req => {
      let condition = new Precondition(req, precondition_options.weak).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('should evalute different weak and strong_etag to false', done => {
    request_options.headers['if-range'] = weak_etag
    testServer(req => {
      let condition = new Precondition(req, {weak: true, etag: strong_etag}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
})

describe('should evalute strong etags', () => {

})

describe('should evalute last_modified metadata', () => {
  test('should ignore, "if-unmodified-since" if last-modified  '+
    'date is not a valid HTTP-date', (done)=>{
    request_options.headers['if-unmodified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: invalid_date}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('should ignore "if-modified-since" if an "If-none-match" header field is present', done => {
    request_options.headers['if-modified-since'] = pre_last_modified
    request_options.headers['if-none-match'] = strong_etag
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('should ignore "if-unmodified-since" if an "If-match" header field is present', done => {
    request_options.headers['if-unmodified-since'] = last_modified
    request_options.headers['if-match'] = strong_etag
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('should ignore "If-modified-since", if last-modified  '+
    'date is not a valid HTTP-date', (done)=>{
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: invalid_date}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('Precondition#condition should return true if modification'+
    'date is more recent than that in "if-modified-since" field value', done => {
    request_options.headers['if-modified-since'] = pre_last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('Precondition#condition should return false if modification'+
    'date is not more recent than "if-modified-since" field value', done => {
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: pre_last_modified}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('Precondition#condition should return false if modification'+
    'date is equal to "if-modified-since" field value', done => {
    request_options.headers['if-modified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('Precondition#condition should return true if modification'+
    'date is not more recent than that in "if-unmodified-since" field value', done => {
    request_options.headers['if-unmodified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: pre_last_modified}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('Precondition#condition should return false if modification'+
    'date is more recent than "if-unmodified-since" field value', done => {
    request_options.headers['if-unmodified-since'] = pre_last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(false)
    }, request_options, done)
  })
  test('Precondition#condition should return true if modification'+
    'date is equal to "if-unmodified-since" field value', done => {
    request_options.headers['if-unmodified-since'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
  test('should evalute to true if modification date is equal to if-range field value', done => {
    request_options.headers['if-range'] = last_modified
    testServer(req => {
      let condition = new Precondition(req, {lastModified: last_modified}).condition
      expect(condition).toBe(true)
    }, request_options, done)
  })
})