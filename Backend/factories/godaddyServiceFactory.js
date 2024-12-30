// factories/godaddyServiceFactory.js
import GoDaddyAdapter from '../adapters/godaddyAdapter.js';
import GoDaddyService from '../services/godaddyService.js';

const godaddyAdapter = new GoDaddyAdapter();
const godaddyService = new GoDaddyService(godaddyAdapter);

export default godaddyService;
