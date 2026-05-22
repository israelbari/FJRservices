import { Router } from 'express';
import { getConfigStatus, getClients, getClientInvoices, getClientProjects, getClientQuotes, searchPartners, getPartnerProjects } from '../controllers/odoo.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/status', authenticate, requireRole('admin', 'editor'), getConfigStatus);
router.get('/clients', authenticate, requireRole('admin', 'editor'), getClients);
router.get('/clients/:clientId/invoices', authenticate, requireRole('admin', 'editor'), getClientInvoices);
router.get('/clients/:clientId/projects', authenticate, requireRole('admin', 'editor'), getClientProjects);
router.get('/clients/:clientId/quotes', authenticate, requireRole('admin', 'editor'), getClientQuotes);
router.get('/search-partners', authenticate, requireRole('admin', 'editor'), searchPartners);
router.get('/partners/:partnerId/projects', authenticate, requireRole('admin', 'editor'), getPartnerProjects);

export default router;
