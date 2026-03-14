/**
 * Marketplace Service Tests
 */

import { MarketplaceService } from '@/plugin-system/marketplace/marketplace-service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Setup axios.create mock to return a mock instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  beforeEach(() => {
    service = new MarketplaceService();
    jest.clearAllMocks();
  });

  test('should search plugins', async () => {
    const mockData = {
      data: {
        plugins: [
          {
            id: 'plugin-1',
            name: 'Plugin 1',
            version: '1.0.0',
            author: 'Author',
            description: 'Test plugin',
            rating: 4.5,
            downloads: 100,
            tags: ['test'],
          },
        ],
      },
    };

    mockedAxios.create().get = jest.fn().mockResolvedValue(mockData);
    mockAxiosInstance.get.mockResolvedValue(mockData);

    // Note: Actual test would require proper axios mock setup
  });

  test('should get featured plugins', async () => {
    // TODO: Implement with proper axios mocking
  });

  test('should post review', async () => {
    // TODO: Implement with proper axios mocking
  });
});