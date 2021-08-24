import { constructUrls, urlTemplate } from './url.helper';

describe('url helper', () => {
  it('should return 4 urls if total record count is 350', () => {
    const urls = constructUrls(350);
    expect(urls.length).toBe(4);
    expect(urls[0]).toBe('/v1/public/characters?limit=100&offset=0');
    expect(urls[1]).toBe('/v1/public/characters?limit=100&offset=100');
    expect(urls[2]).toBe('/v1/public/characters?limit=100&offset=200');
    expect(urls[3]).toBe('/v1/public/characters?limit=100&offset=300');
  });

  it('should return 1 if total record count is 20', () => {
    const urls = constructUrls(20);
    expect(urls.length).toBe(1);
    expect(urls[0]).toBe('/v1/public/characters?limit=100&offset=0');
  });

  it('should return 0 if total record count is 0', () => {
    const urls = constructUrls(0);
    expect(urls.length).toBe(0);
  });

  it('should return correct url', () => {
    expect(urlTemplate(100, 100)).toBe(
      '/v1/public/characters?limit=100&offset=100',
    );
    expect(urlTemplate(100)).toBe('/v1/public/characters?limit=100&offset=0');
  });
});
