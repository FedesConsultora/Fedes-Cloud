// factories/godaddyServiceFactory.js
import GoDaddyAdapter from '../adapters/godaddyAdapter.js';
import GoDaddyService from '../services/godaddyService.js';

const goDaddyAdapter = new GoDaddyAdapter();
const goDaddyService = new GoDaddyService(goDaddyAdapter);

export default goDaddyService;

