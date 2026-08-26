import live from './client.js';
import mock from './mock.js';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const api = useMock ? mock : live;

export default api;
export { useMock };
