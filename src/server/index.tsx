import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));
app.use('*', logger(console.log));

// Authentication middleware
async function authenticateUser(accessToken: string) {
  if (!accessToken) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log('Authentication error:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.log('Authentication exception:', error);
    return null;
  }
}

// Create storage buckets on startup
async function initializeStorage() {
  try {
    const buckets = [
      'make-def022bc-incidents',
      'make-def022bc-profiles',
      'make-def022bc-reports'
    ];

    for (const bucketName of buckets) {
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*']
        });
        if (error) {
          console.log(`Error creating bucket ${bucketName}:`, error);
        } else {
          console.log(`Created bucket: ${bucketName}`);
        }
      }
    }
  } catch (error) {
    console.log('Storage initialization error:', error);
  }
}

// Initialize storage on startup
initializeStorage();

// ========================================
// HEALTH CHECK ROUTE
// ========================================

app.get('/make-server-def022bc/health', async (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========================================
// AUTHENTICATION ROUTES
// ========================================

app.post('/make-server-def022bc/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'guard' } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create user with admin privileges
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role,
        badge: `${role.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`,
        created_at: new Date().toISOString()
      },
      email_confirm: true // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}:profile`, {
      id: userId,
      name,
      email,
      role,
      badge: `${role.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`,
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    });

    return c.json({ 
      message: 'User created successfully',
      user: data.user 
    });

  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

app.get('/make-server-def022bc/users/profile', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const profile = await kv.get(`user:${user.id}:profile`);
    if (!profile) {
      // Create profile if it doesn't exist
      const newProfile = {
        id: user.id,
        name: user.user_metadata?.name || 'Unknown User',
        email: user.email,
        role: user.user_metadata?.role || 'guard',
        badge: user.user_metadata?.badge || 'GRD-001',
        status: 'active',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };
      await kv.set(`user:${user.id}:profile`, newProfile);
      return c.json({ profile: newProfile });
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put('/make-server-def022bc/users/profile', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}:profile`);
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      id: user.id, // Ensure ID can't be changed
      last_active: new Date().toISOString()
    };

    await kv.set(`user:${user.id}:profile`, updatedProfile);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ========================================
// GPS TRACKING ROUTES
// ========================================

app.post('/make-server-def022bc/gps/location', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { latitude, longitude, accuracy, heading, speed } = await c.req.json();
    
    if (!latitude || !longitude) {
      return c.json({ error: 'Missing location coordinates' }, 400);
    }

    const locationData = {
      user_id: user.id,
      latitude,
      longitude,
      accuracy: accuracy || null,
      heading: heading || null,
      speed: speed || null,
      timestamp: new Date().toISOString()
    };

    // Store current location
    await kv.set(`location:${user.id}:current`, locationData);

    // Store in location history
    const historyKey = `location:${user.id}:history:${Date.now()}`;
    await kv.set(historyKey, locationData);

    return c.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.log('Location update error:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

app.get('/make-server-def022bc/gps/locations', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all current locations for the user's organization
    const locationKeys = await kv.getByPrefix('location:');
    const currentLocations = locationKeys
      .filter(item => item.key.includes(':current'))
      .map(item => item.value);

    return c.json({ locations: currentLocations });
  } catch (error) {
    console.log('Locations fetch error:', error);
    return c.json({ error: 'Failed to fetch locations' }, 500);
  }
});

app.get('/make-server-def022bc/gps/history/:userId', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const targetUserId = c.req.param('userId');
    const historyKeys = await kv.getByPrefix(`location:${targetUserId}:history:`);
    
    const history = historyKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100); // Last 100 location points

    return c.json({ history });
  } catch (error) {
    console.log('Location history fetch error:', error);
    return c.json({ error: 'Failed to fetch location history' }, 500);
  }
});

// ========================================
// INCIDENT REPORTING ROUTES
// ========================================

app.post('/make-server-def022bc/incidents', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incidentData = await c.req.json();
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const incident = {
      id: incidentId,
      reporter_id: user.id,
      reporter_name: user.user_metadata?.name || 'Unknown',
      ...incidentData,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`incident:${incidentId}`, incident);
    
    // Add to user's incidents list
    const userIncidents = await kv.get(`user:${user.id}:incidents`) || [];
    userIncidents.push(incidentId);
    await kv.set(`user:${user.id}:incidents`, userIncidents);

    return c.json({ incident });
  } catch (error) {
    console.log('Incident creation error:', error);
    return c.json({ error: 'Failed to create incident' }, 500);
  }
});

app.get('/make-server-def022bc/incidents', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incidentKeys = await kv.getByPrefix('incident:');
    const incidents = incidentKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ incidents });
  } catch (error) {
    console.log('Incidents fetch error:', error);
    return c.json({ error: 'Failed to fetch incidents' }, 500);
  }
});

app.put('/make-server-def022bc/incidents/:id/status', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incidentId = c.req.param('id');
    const { status, notes } = await c.req.json();
    
    const incident = await kv.get(`incident:${incidentId}`);
    if (!incident) {
      return c.json({ error: 'Incident not found' }, 404);
    }

    const updatedIncident = {
      ...incident,
      status,
      notes: notes || incident.notes,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`incident:${incidentId}`, updatedIncident);
    return c.json({ incident: updatedIncident });
  } catch (error) {
    console.log('Incident status update error:', error);
    return c.json({ error: 'Failed to update incident status' }, 500);
  }
});

// ========================================
// PATROL CHECKPOINT ROUTES
// ========================================

app.post('/make-server-def022bc/checkpoints/scan', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { checkpoint_id, latitude, longitude, notes } = await c.req.json();
    
    const scanData = {
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      checkpoint_id,
      latitude,
      longitude,
      notes: notes || '',
      timestamp: new Date().toISOString()
    };

    await kv.set(`checkpoint_scan:${scanData.id}`, scanData);
    
    // Add to user's scan history
    const userScans = await kv.get(`user:${user.id}:scans`) || [];
    userScans.push(scanData.id);
    await kv.set(`user:${user.id}:scans`, userScans);

    return c.json({ scan: scanData });
  } catch (error) {
    console.log('Checkpoint scan error:', error);
    return c.json({ error: 'Failed to record checkpoint scan' }, 500);
  }
});

app.get('/make-server-def022bc/checkpoints/scans', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const scanKeys = await kv.getByPrefix('checkpoint_scan:');
    const scans = scanKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ scans });
  } catch (error) {
    console.log('Checkpoint scans fetch error:', error);
    return c.json({ error: 'Failed to fetch checkpoint scans' }, 500);
  }
});

// ========================================
// NOTIFICATION ROUTES
// ========================================

app.post('/make-server-def022bc/notifications', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { title, message, type, target_user_id } = await c.req.json();
    
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title,
      message,
      type: type || 'info',
      sender_id: user.id,
      sender_name: user.user_metadata?.name || 'System',
      target_user_id: target_user_id || 'all',
      read: false,
      created_at: new Date().toISOString()
    };

    await kv.set(`notification:${notification.id}`, notification);
    
    return c.json({ notification });
  } catch (error) {
    console.log('Notification creation error:', error);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

app.get('/make-server-def022bc/notifications/:userId', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const targetUserId = c.req.param('userId');
    const notificationKeys = await kv.getByPrefix('notification:');
    
    const notifications = notificationKeys
      .map(item => item.value)
      .filter(notification => 
        notification.target_user_id === targetUserId || 
        notification.target_user_id === 'all'
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50); // Last 50 notifications

    return c.json({ notifications });
  } catch (error) {
    console.log('Notifications fetch error:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// ========================================
// CLIENT ASSIGNMENT ROUTES
// ========================================

// Clients
app.get('/make-server-def022bc/clients', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const clientKeys = await kv.getByPrefix('client:');
    const clients = clientKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ clients });
  } catch (error) {
    console.log('Clients fetch error:', error);
    return c.json({ error: 'Failed to fetch clients' }, 500);
  }
});

app.post('/make-server-def022bc/clients', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const clientData = await c.req.json();
    const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const client = {
      id: clientId,
      ...clientData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`client:${clientId}`, client);
    return c.json({ client });
  } catch (error) {
    console.log('Client creation error:', error);
    return c.json({ error: 'Failed to create client' }, 500);
  }
});

app.put('/make-server-def022bc/clients/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const clientId = c.req.param('id');
    const updates = await c.req.json();
    
    const client = await kv.get(`client:${clientId}`);
    if (!client) {
      return c.json({ error: 'Client not found' }, 404);
    }

    const updatedClient = {
      ...client,
      ...updates,
      id: clientId,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`client:${clientId}`, updatedClient);
    return c.json({ client: updatedClient });
  } catch (error) {
    console.log('Client update error:', error);
    return c.json({ error: 'Failed to update client' }, 500);
  }
});

app.delete('/make-server-def022bc/clients/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const clientId = c.req.param('id');
    
    // Check if client has active assignments
    const assignmentKeys = await kv.getByPrefix('assignment:');
    const hasActiveAssignments = assignmentKeys
      .map(item => item.value)
      .some(assignment => assignment.clientId === clientId && assignment.status === 'active');
    
    if (hasActiveAssignments) {
      return c.json({ error: 'Cannot delete client with active assignments' }, 400);
    }

    await kv.del(`client:${clientId}`);
    return c.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.log('Client deletion error:', error);
    return c.json({ error: 'Failed to delete client' }, 500);
  }
});

// Guards
app.get('/make-server-def022bc/guards', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const guardKeys = await kv.getByPrefix('guard:');
    const guards = guardKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ guards });
  } catch (error) {
    console.log('Guards fetch error:', error);
    return c.json({ error: 'Failed to fetch guards' }, 500);
  }
});

app.post('/make-server-def022bc/guards', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const guardData = await c.req.json();
    const guardId = `guard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const guard = {
      id: guardId,
      ...guardData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`guard:${guardId}`, guard);
    return c.json({ guard });
  } catch (error) {
    console.log('Guard creation error:', error);
    return c.json({ error: 'Failed to create guard' }, 500);
  }
});

// Canines
app.get('/make-server-def022bc/canines', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const canineKeys = await kv.getByPrefix('canine:');
    const canines = canineKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ canines });
  } catch (error) {
    console.log('Canines fetch error:', error);
    return c.json({ error: 'Failed to fetch canines' }, 500);
  }
});

app.post('/make-server-def022bc/canines', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const canineData = await c.req.json();
    const canineId = `canine_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const canine = {
      id: canineId,
      ...canineData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`canine:${canineId}`, canine);
    return c.json({ canine });
  } catch (error) {
    console.log('Canine creation error:', error);
    return c.json({ error: 'Failed to create canine' }, 500);
  }
});

// Assignments
app.get('/make-server-def022bc/assignments', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assignmentKeys = await kv.getByPrefix('assignment:');
    const assignments = assignmentKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ assignments });
  } catch (error) {
    console.log('Assignments fetch error:', error);
    return c.json({ error: 'Failed to fetch assignments' }, 500);
  }
});

app.post('/make-server-def022bc/assignments', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assignmentData = await c.req.json();
    const assignmentId = `assignment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Validate guards are available
    for (const guardId of assignmentData.guardIds || []) {
      const guard = await kv.get(`guard:${guardId}`);
      if (!guard) {
        return c.json({ error: `Guard ${guardId} not found` }, 400);
      }
      if (guard.status !== 'available') {
        return c.json({ error: `Guard ${guard.name} is not available` }, 400);
      }
    }

    // Validate canines are available
    for (const canineId of assignmentData.canineIds || []) {
      const canine = await kv.get(`canine:${canineId}`);
      if (!canine) {
        return c.json({ error: `Canine ${canineId} not found` }, 400);
      }
      if (canine.status !== 'available') {
        return c.json({ error: `Canine ${canine.name} is not available` }, 400);
      }
    }

    const assignment = {
      id: assignmentId,
      ...assignmentData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`assignment:${assignmentId}`, assignment);
    
    // Update guard statuses to assigned
    for (const guardId of assignmentData.guardIds || []) {
      const guard = await kv.get(`guard:${guardId}`);
      await kv.set(`guard:${guardId}`, { ...guard, status: 'assigned' });
    }

    // Update canine statuses to assigned
    for (const canineId of assignmentData.canineIds || []) {
      const canine = await kv.get(`canine:${canineId}`);
      await kv.set(`canine:${canineId}`, { ...canine, status: 'assigned' });
    }

    return c.json({ assignment });
  } catch (error) {
    console.log('Assignment creation error:', error);
    return c.json({ error: 'Failed to create assignment' }, 500);
  }
});

app.put('/make-server-def022bc/assignments/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assignmentId = c.req.param('id');
    const updates = await c.req.json();
    
    const assignment = await kv.get(`assignment:${assignmentId}`);
    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    const updatedAssignment = {
      ...assignment,
      ...updates,
      id: assignmentId,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`assignment:${assignmentId}`, updatedAssignment);
    return c.json({ assignment: updatedAssignment });
  } catch (error) {
    console.log('Assignment update error:', error);
    return c.json({ error: 'Failed to update assignment' }, 500);
  }
});

app.delete('/make-server-def022bc/assignments/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assignmentId = c.req.param('id');
    
    const assignment = await kv.get(`assignment:${assignmentId}`);
    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    // Free up assigned guards
    for (const guardId of assignment.guardIds || []) {
      const guard = await kv.get(`guard:${guardId}`);
      if (guard) {
        await kv.set(`guard:${guardId}`, { ...guard, status: 'available' });
      }
    }

    // Free up assigned canines
    for (const canineId of assignment.canineIds || []) {
      const canine = await kv.get(`canine:${canineId}`);
      if (canine) {
        await kv.set(`canine:${canineId}`, { ...canine, status: 'available' });
      }
    }

    await kv.del(`assignment:${assignmentId}`);
    return c.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.log('Assignment deletion error:', error);
    return c.json({ error: 'Failed to delete assignment' }, 500);
  }
});

app.get('/make-server-def022bc/assignments/analytics', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assignmentKeys = await kv.getByPrefix('assignment:');
    const assignments = assignmentKeys.map(item => item.value);
    
    const clientKeys = await kv.getByPrefix('client:');
    const clients = clientKeys.map(item => item.value);
    
    const guardKeys = await kv.getByPrefix('guard:');
    const guards = guardKeys.map(item => item.value);
    
    const canineKeys = await kv.getByPrefix('canine:');
    const canines = canineKeys.map(item => item.value);

    const analytics = {
      totalAssignments: assignments.length,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      totalRevenue: assignments.reduce((sum, a) => sum + (a.budget || 0), 0),
      guardsUtilization: guards.filter(g => g.status === 'assigned').length / Math.max(guards.length, 1) * 100,
      caninesUtilization: canines.filter(c => c.status === 'assigned').length / Math.max(canines.length, 1) * 100,
      topClients: clients.map(client => {
        const clientAssignments = assignments.filter(a => a.clientId === client.id);
        return {
          clientId: client.id,
          clientName: client.name,
          assignmentCount: clientAssignments.length,
          revenue: clientAssignments.reduce((sum, a) => sum + (a.budget || 0), 0)
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    };

    return c.json({ analytics });
  } catch (error) {
    console.log('Assignment analytics error:', error);
    return c.json({ error: 'Failed to fetch assignment analytics' }, 500);
  }
});

// ========================================
// ANALYTICS AND REPORTING ROUTES
// ========================================

app.get('/make-server-def022bc/analytics/dashboard', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all users
    const userKeys = await kv.getByPrefix('user:');
    const users = userKeys
      .filter(item => item.key.includes(':profile'))
      .map(item => item.value);

    // Get all incidents
    const incidentKeys = await kv.getByPrefix('incident:');
    const incidents = incidentKeys.map(item => item.value);

    // Get all checkpoint scans
    const scanKeys = await kv.getByPrefix('checkpoint_scan:');
    const scans = scanKeys.map(item => item.value);

    // Calculate analytics
    const analytics = {
      users: {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        by_role: {
          guard: users.filter(u => u.role === 'guard').length,
          supervisor: users.filter(u => u.role === 'supervisor').length,
          admin: users.filter(u => u.role === 'admin').length,
          hr: users.filter(u => u.role === 'hr').length
        }
      },
      incidents: {
        total: incidents.length,
        open: incidents.filter(i => i.status === 'open').length,
        closed: incidents.filter(i => i.status === 'closed').length,
        today: incidents.filter(i => {
          const today = new Date().toDateString();
          return new Date(i.created_at).toDateString() === today;
        }).length
      },
      checkpoints: {
        total_scans: scans.length,
        today: scans.filter(s => {
          const today = new Date().toDateString();
          return new Date(s.timestamp).toDateString() === today;
        }).length,
        unique_guards: new Set(scans.map(s => s.user_id)).size
      }
    };

    return c.json({ analytics });
  } catch (error) {
    console.log('Analytics fetch error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ========================================
// ATTENDANCE MANAGEMENT ROUTES
// ========================================

app.post('/make-server-def022bc/attendance/check-in', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { method, location, notes, rfid_card, qr_code, tablet_station_id } = await c.req.json();
    
    const checkInData = {
      id: `checkin_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      method: method || 'manual', // manual, rfid, qr, tablet, sms, radio
      location,
      notes: notes || '',
      rfid_card,
      qr_code,
      tablet_station_id,
      timestamp: new Date().toISOString(),
      status: 'checked_in'
    };

    await kv.set(`attendance:${checkInData.id}`, checkInData);
    
    // Update user's current status
    await kv.set(`user:${user.id}:attendance_status`, {
      status: 'checked_in',
      timestamp: checkInData.timestamp,
      location: location
    });

    return c.json({ attendance: checkInData });
  } catch (error) {
    console.log('Check-in error:', error);
    return c.json({ error: 'Failed to record check-in' }, 500);
  }
});

app.post('/make-server-def022bc/attendance/check-out', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { method, location, notes } = await c.req.json();
    
    const checkOutData = {
      id: `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      method: method || 'manual',
      location,
      notes: notes || '',
      timestamp: new Date().toISOString(),
      status: 'checked_out'
    };

    await kv.set(`attendance:${checkOutData.id}`, checkOutData);
    
    // Update user's current status
    await kv.set(`user:${user.id}:attendance_status`, {
      status: 'checked_out',
      timestamp: checkOutData.timestamp,
      location: location
    });

    return c.json({ attendance: checkOutData });
  } catch (error) {
    console.log('Check-out error:', error);
    return c.json({ error: 'Failed to record check-out' }, 500);
  }
});

app.get('/make-server-def022bc/attendance/records', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const attendanceKeys = await kv.getByPrefix('attendance:');
    const records = attendanceKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ records });
  } catch (error) {
    console.log('Attendance records fetch error:', error);
    return c.json({ error: 'Failed to fetch attendance records' }, 500);
  }
});

// ========================================
// SHIFT MANAGEMENT ROUTES
// ========================================

app.post('/make-server-def022bc/shifts', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const shiftData = await c.req.json();
    const shiftId = `shift_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const shift = {
      id: shiftId,
      created_by: user.id,
      ...shiftData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`shift:${shiftId}`, shift);
    return c.json({ shift });
  } catch (error) {
    console.log('Shift creation error:', error);
    return c.json({ error: 'Failed to create shift' }, 500);
  }
});

app.get('/make-server-def022bc/shifts', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const shiftKeys = await kv.getByPrefix('shift:');
    const shifts = shiftKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ shifts });
  } catch (error) {
    console.log('Shifts fetch error:', error);
    return c.json({ error: 'Failed to fetch shifts' }, 500);
  }
});

app.put('/make-server-def022bc/shifts/:id/assign', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const shiftId = c.req.param('id');
    const { guard_id } = await c.req.json();
    
    const shift = await kv.get(`shift:${shiftId}`);
    if (!shift) {
      return c.json({ error: 'Shift not found' }, 404);
    }

    const updatedShift = {
      ...shift,
      assigned_guard: guard_id,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`shift:${shiftId}`, updatedShift);
    return c.json({ shift: updatedShift });
  } catch (error) {
    console.log('Shift assignment error:', error);
    return c.json({ error: 'Failed to assign shift' }, 500);
  }
});

// ========================================
// GUARD TOURS AND SCHEDULES ROUTES
// ========================================

app.post('/make-server-def022bc/tours', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tourData = await c.req.json();
    const tourId = `tour_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const tour = {
      id: tourId,
      created_by: user.id,
      ...tourData,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`tour:${tourId}`, tour);
    return c.json({ tour });
  } catch (error) {
    console.log('Tour creation error:', error);
    return c.json({ error: 'Failed to create tour' }, 500);
  }
});

app.get('/make-server-def022bc/tours', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tourKeys = await kv.getByPrefix('tour:');
    const tours = tourKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ tours });
  } catch (error) {
    console.log('Tours fetch error:', error);
    return c.json({ error: 'Failed to fetch tours' }, 500);
  }
});

app.put('/make-server-def022bc/tours/:id/start', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tourId = c.req.param('id');
    const tour = await kv.get(`tour:${tourId}`);
    
    if (!tour) {
      return c.json({ error: 'Tour not found' }, 404);
    }

    const updatedTour = {
      ...tour,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      started_by: user.id
    };

    await kv.set(`tour:${tourId}`, updatedTour);
    return c.json({ tour: updatedTour });
  } catch (error) {
    console.log('Tour start error:', error);
    return c.json({ error: 'Failed to start tour' }, 500);
  }
});

// ========================================
// EQUIPMENT TRACKING ROUTES
// ========================================

app.post('/make-server-def022bc/equipment', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const equipmentData = await c.req.json();
    const equipmentId = `equipment_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const equipment = {
      id: equipmentId,
      created_by: user.id,
      ...equipmentData,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`equipment:${equipmentId}`, equipment);
    return c.json({ equipment });
  } catch (error) {
    console.log('Equipment creation error:', error);
    return c.json({ error: 'Failed to create equipment record' }, 500);
  }
});

app.get('/make-server-def022bc/equipment', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const equipmentKeys = await kv.getByPrefix('equipment:');
    const equipment = equipmentKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ equipment });
  } catch (error) {
    console.log('Equipment fetch error:', error);
    return c.json({ error: 'Failed to fetch equipment' }, 500);
  }
});

app.put('/make-server-def022bc/equipment/:id/assign', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const equipmentId = c.req.param('id');
    const { guard_id, notes } = await c.req.json();
    
    const equipment = await kv.get(`equipment:${equipmentId}`);
    if (!equipment) {
      return c.json({ error: 'Equipment not found' }, 404);
    }

    const updatedEquipment = {
      ...equipment,
      assigned_to: guard_id,
      status: 'assigned',
      assignment_notes: notes,
      assigned_at: new Date().toISOString(),
      assigned_by: user.id
    };

    await kv.set(`equipment:${equipmentId}`, updatedEquipment);
    return c.json({ equipment: updatedEquipment });
  } catch (error) {
    console.log('Equipment assignment error:', error);
    return c.json({ error: 'Failed to assign equipment' }, 500);
  }
});

// ========================================
// EMERGENCY/PANIC BUTTON ROUTES
// ========================================

app.post('/make-server-def022bc/emergency/panic', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { latitude, longitude, notes } = await c.req.json();
    const emergencyId = `emergency_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const emergency = {
      id: emergencyId,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      type: 'panic_button',
      latitude,
      longitude,
      notes: notes || '',
      status: 'active',
      timestamp: new Date().toISOString(),
      priority: 'critical'
    };

    await kv.set(`emergency:${emergencyId}`, emergency);
    
    // Create high-priority notification for all supervisors and admins
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const notification = {
      id: notificationId,
      title: '🚨 EMERGENCY ALERT',
      message: `Panic button activated by ${emergency.user_name}`,
      type: 'emergency',
      sender_id: user.id,
      sender_name: emergency.user_name,
      target_user_id: 'supervisors_admins',
      read: false,
      created_at: new Date().toISOString(),
      emergency_id: emergencyId
    };

    await kv.set(`notification:${notificationId}`, notification);

    return c.json({ emergency });
  } catch (error) {
    console.log('Emergency alert error:', error);
    return c.json({ error: 'Failed to create emergency alert' }, 500);
  }
});

app.get('/make-server-def022bc/emergency/active', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const emergencyKeys = await kv.getByPrefix('emergency:');
    const emergencies = emergencyKeys
      .map(item => item.value)
      .filter(emergency => emergency.status === 'active')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ emergencies });
  } catch (error) {
    console.log('Active emergencies fetch error:', error);
    return c.json({ error: 'Failed to fetch active emergencies' }, 500);
  }
});

app.put('/make-server-def022bc/emergency/:id/resolve', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const emergencyId = c.req.param('id');
    const { resolution_notes } = await c.req.json();
    
    const emergency = await kv.get(`emergency:${emergencyId}`);
    if (!emergency) {
      return c.json({ error: 'Emergency not found' }, 404);
    }

    const updatedEmergency = {
      ...emergency,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolution_notes
    };

    await kv.set(`emergency:${emergencyId}`, updatedEmergency);
    return c.json({ emergency: updatedEmergency });
  } catch (error) {
    console.log('Emergency resolution error:', error);
    return c.json({ error: 'Failed to resolve emergency' }, 500);
  }
});

// ========================================
// COMMUNICATION ROUTES
// ========================================

app.post('/make-server-def022bc/messages', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { recipient_id, message, priority, group_message } = await c.req.json();
    const messageId = `message_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const messageData = {
      id: messageId,
      sender_id: user.id,
      sender_name: user.user_metadata?.name || 'Unknown',
      recipient_id: recipient_id || 'all',
      message,
      priority: priority || 'normal',
      group_message: group_message || false,
      timestamp: new Date().toISOString(),
      read: false
    };

    await kv.set(`message:${messageId}`, messageData);
    return c.json({ message: messageData });
  } catch (error) {
    console.log('Message creation error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

app.get('/make-server-def022bc/messages/:userId', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const targetUserId = c.req.param('userId');
    const messageKeys = await kv.getByPrefix('message:');
    
    const messages = messageKeys
      .map(item => item.value)
      .filter(message => 
        message.recipient_id === targetUserId || 
        message.recipient_id === 'all' ||
        message.sender_id === targetUserId
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);

    return c.json({ messages });
  } catch (error) {
    console.log('Messages fetch error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// ========================================
// TRAINING COMPLIANCE ROUTES
// ========================================

app.post('/make-server-def022bc/training/modules', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const moduleData = await c.req.json();
    const moduleId = `training_module_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const module = {
      id: moduleId,
      created_by: user.id,
      ...moduleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`training_module:${moduleId}`, module);
    return c.json({ module });
  } catch (error) {
    console.log('Training module creation error:', error);
    return c.json({ error: 'Failed to create training module' }, 500);
  }
});

app.get('/make-server-def022bc/training/modules', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const moduleKeys = await kv.getByPrefix('training_module:');
    const modules = moduleKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ modules });
  } catch (error) {
    console.log('Training modules fetch error:', error);
    return c.json({ error: 'Failed to fetch training modules' }, 500);
  }
});

app.post('/make-server-def022bc/training/complete', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { module_id, score, duration } = await c.req.json();
    const completionId = `training_completion_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const completion = {
      id: completionId,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      module_id,
      score,
      duration,
      completed_at: new Date().toISOString(),
      status: score >= 80 ? 'passed' : 'failed'
    };

    await kv.set(`training_completion:${completionId}`, completion);
    return c.json({ completion });
  } catch (error) {
    console.log('Training completion error:', error);
    return c.json({ error: 'Failed to record training completion' }, 500);
  }
});

// ========================================
// SITE/LOCATION MANAGEMENT ROUTES
// ========================================

app.post('/make-server-def022bc/sites', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const siteData = await c.req.json();
    const siteId = `site_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const site = {
      id: siteId,
      created_by: user.id,
      ...siteData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`site:${siteId}`, site);
    return c.json({ site });
  } catch (error) {
    console.log('Site creation error:', error);
    return c.json({ error: 'Failed to create site' }, 500);
  }
});

app.get('/make-server-def022bc/sites', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const siteKeys = await kv.getByPrefix('site:');
    const sites = siteKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ sites });
  } catch (error) {
    console.log('Sites fetch error:', error);
    return c.json({ error: 'Failed to fetch sites' }, 500);
  }
});

// ========================================
// HR MANAGEMENT ROUTES
// ========================================

app.get('/make-server-def022bc/hr/employees', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if user has HR permissions
  if (user.user_metadata?.role !== 'hr' && user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const userKeys = await kv.getByPrefix('user:');
    const employees = userKeys
      .filter(item => item.key.includes(':profile'))
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ employees });
  } catch (error) {
    console.log('HR employees fetch error:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

app.post('/make-server-def022bc/hr/performance-review', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'hr' && user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const reviewData = await c.req.json();
    const reviewId = `performance_review_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const review = {
      id: reviewId,
      created_by: user.id,
      reviewer_name: user.user_metadata?.name || 'Unknown',
      ...reviewData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`performance_review:${reviewId}`, review);
    return c.json({ review });
  } catch (error) {
    console.log('Performance review creation error:', error);
    return c.json({ error: 'Failed to create performance review' }, 500);
  }
});

// ========================================
// WEATHER INTEGRATION ROUTES
// ========================================

app.get('/make-server-def022bc/weather/:location', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const location = c.req.param('location');
    
    // Mock weather data - in production, you'd integrate with a weather API
    const weatherData = {
      location,
      temperature: Math.floor(Math.random() * 40) + 10, // 10-50°C
      humidity: Math.floor(Math.random() * 100),
      conditions: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
      wind_speed: Math.floor(Math.random() * 30),
      visibility: Math.floor(Math.random() * 10) + 1,
      timestamp: new Date().toISOString()
    };

    await kv.set(`weather:${location}:current`, weatherData);
    return c.json({ weather: weatherData });
  } catch (error) {
    console.log('Weather fetch error:', error);
    return c.json({ error: 'Failed to fetch weather data' }, 500);
  }
});

// ========================================
// AUDIT TRAIL ROUTES
// ========================================

app.post('/make-server-def022bc/audit/log', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { action, resource_type, resource_id, details } = await c.req.json();
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const auditLog = {
      id: auditId,
      user_id: user.id,
      user_name: user.user_metadata?.name || 'Unknown',
      action,
      resource_type,
      resource_id,
      details: details || {},
      timestamp: new Date().toISOString(),
      ip_address: c.req.header('x-forwarded-for') || 'unknown'
    };

    await kv.set(`audit:${auditId}`, auditLog);
    return c.json({ audit: auditLog });
  } catch (error) {
    console.log('Audit log error:', error);
    return c.json({ error: 'Failed to create audit log' }, 500);
  }
});

app.get('/make-server-def022bc/audit/logs', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Only admins can view audit logs
  if (user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const auditKeys = await kv.getByPrefix('audit:');
    const logs = auditKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1000); // Last 1000 logs

    return c.json({ logs });
  } catch (error) {
    console.log('Audit logs fetch error:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

// ========================================
// TOURS AND SCHEDULES ADDITIONAL ROUTES
// ========================================

app.put('/make-server-def022bc/tours/:id/complete', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const tourId = c.req.param('id');
    const { notes, checkpoints_completed } = await c.req.json();
    
    const tour = await kv.get(`tour:${tourId}`);
    if (!tour) {
      return c.json({ error: 'Tour not found' }, 404);
    }

    const updatedTour = {
      ...tour,
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      completion_notes: notes,
      checkpoints_completed: checkpoints_completed || 0
    };

    await kv.set(`tour:${tourId}`, updatedTour);
    return c.json({ tour: updatedTour });
  } catch (error) {
    console.log('Tour completion error:', error);
    return c.json({ error: 'Failed to complete tour' }, 500);
  }
});

// ========================================
// ANALYTICS ENHANCEMENT ROUTES
// ========================================

app.get('/make-server-def022bc/analytics/performance', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all users
    const userKeys = await kv.getByPrefix('user:');
    const users = userKeys
      .filter(item => item.key.includes(':profile'))
      .map(item => item.value);

    // Get all incidents, checkpoints, and attendance
    const incidentKeys = await kv.getByPrefix('incident:');
    const incidents = incidentKeys.map(item => item.value);
    
    const scanKeys = await kv.getByPrefix('checkpoint_scan:');
    const scans = scanKeys.map(item => item.value);
    
    const attendanceKeys = await kv.getByPrefix('attendance:');
    const attendanceRecords = attendanceKeys.map(item => item.value);

    // Calculate performance metrics for each user
    const metrics = users.map(user => {
      const userIncidents = incidents.filter(i => i.reporter_id === user.id);
      const userScans = scans.filter(s => s.user_id === user.id);
      const userAttendance = attendanceRecords.filter(a => a.user_id === user.id);
      
      // Calculate attendance rate (simplified)
      const checkins = userAttendance.filter(a => a.status === 'checked_in').length;
      const attendanceRate = checkins > 0 ? Math.min((checkins / 30) * 100, 100) : 0;
      
      // Calculate response time average (mock data)
      const responseTimes = userIncidents.map(() => Math.floor(Math.random() * 300) + 60);
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      return {
        guard_id: user.id,
        guard_name: user.name,
        incidents_handled: userIncidents.length,
        checkpoints_completed: userScans.length,
        response_time_avg: Math.round(avgResponseTime),
        attendance_rate: Math.round(attendanceRate),
        efficiency_score: Math.min(90 + Math.floor(Math.random() * 10), 100),
        last_active: user.last_active || new Date().toISOString()
      };
    });

    return c.json({ metrics });
  } catch (error) {
    console.log('Performance metrics error:', error);
    return c.json({ error: 'Failed to fetch performance metrics' }, 500);
  }
});

app.get('/make-server-def022bc/analytics/incidents/trends', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const days = parseInt(c.req.query('days') || '30');
    const incidentKeys = await kv.getByPrefix('incident:');
    const incidents = incidentKeys.map(item => item.value);
    
    // Generate trend data
    const dates = [];
    const incidentCounts = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      const dayIncidents = incidents.filter(incident => 
        incident.created_at && incident.created_at.startsWith(dateStr)
      );
      incidentCounts.push(dayIncidents.length);
    }
    
    // Calculate incident types
    const types = incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});
    
    // Mock resolution times
    const resolutionTimes = incidents.map(() => Math.floor(Math.random() * 300) + 60);

    const trends = {
      dates,
      incidents: incidentCounts,
      types,
      resolution_times: resolutionTimes
    };

    return c.json({ trends });
  } catch (error) {
    console.log('Incident trends error:', error);
    return c.json({ error: 'Failed to fetch incident trends' }, 500);
  }
});

// ========================================
// ADDITIONAL HR ROUTES
// ========================================

app.get('/make-server-def022bc/hr/performance-reviews', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'hr' && user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const reviewKeys = await kv.getByPrefix('performance_review:');
    const reviews = reviewKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ reviews });
  } catch (error) {
    console.log('Performance reviews fetch error:', error);
    return c.json({ error: 'Failed to fetch performance reviews' }, 500);
  }
});

app.post('/make-server-def022bc/hr/training/assign', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'hr' && user.user_metadata?.role !== 'admin') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const trainingData = await c.req.json();
    const recordId = `training_record_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const record = {
      id: recordId,
      ...trainingData,
      status: 'not_started',
      assigned_by: user.id,
      assigned_at: new Date().toISOString()
    };

    await kv.set(`training_record:${recordId}`, record);
    return c.json({ record });
  } catch (error) {
    console.log('Training assignment error:', error);
    return c.json({ error: 'Failed to assign training' }, 500);
  }
});

// ========================================
// CCTV MANAGEMENT ROUTES
// ========================================

app.get('/make-server-def022bc/cctv/cameras', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const cameraKeys = await kv.getByPrefix('camera:');
    const cameras = cameraKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ cameras });
  } catch (error) {
    console.log('Cameras fetch error:', error);
    return c.json({ error: 'Failed to fetch cameras' }, 500);
  }
});

app.post('/make-server-def022bc/cctv/cameras', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'supervisor') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const cameraData = await c.req.json();
    const cameraId = `camera_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const camera = {
      id: cameraId,
      ...cameraData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_ping: new Date().toISOString()
    };

    await kv.set(`camera:${cameraId}`, camera);
    return c.json({ camera });
  } catch (error) {
    console.log('Camera creation error:', error);
    return c.json({ error: 'Failed to create camera' }, 500);
  }
});

app.put('/make-server-def022bc/cctv/cameras/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'supervisor') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const cameraId = c.req.param('id');
    const updates = await c.req.json();
    
    const camera = await kv.get(`camera:${cameraId}`);
    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    const updatedCamera = {
      ...camera,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(`camera:${cameraId}`, updatedCamera);
    return c.json({ camera: updatedCamera });
  } catch (error) {
    console.log('Camera update error:', error);
    return c.json({ error: 'Failed to update camera' }, 500);
  }
});

app.post('/make-server-def022bc/cctv/cameras/:id/screenshot', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const cameraId = c.req.param('id');
    const timestamp = Date.now();
    
    // In a real implementation, this would capture an actual screenshot
    const screenshot_url = `https://demo-screenshots.example.com/${cameraId}_${timestamp}.jpg`;

    return c.json({ screenshot_url });
  } catch (error) {
    console.log('Screenshot error:', error);
    return c.json({ error: 'Failed to capture screenshot' }, 500);
  }
});

app.post('/make-server-def022bc/cctv/cameras/:id/ptz', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const cameraId = c.req.param('id');
    const { command, value } = await c.req.json();
    
    // Log PTZ command
    const ptzLogId = `ptz_log_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await kv.set(`ptz_log:${ptzLogId}`, {
      camera_id: cameraId,
      command,
      value,
      user_id: user.id,
      timestamp: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('PTZ control error:', error);
    return c.json({ error: 'PTZ control failed' }, 500);
  }
});

// ========================================
// GEOFENCE MANAGEMENT ROUTES
// ========================================

app.get('/make-server-def022bc/cctv/geofence/zones', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const zoneKeys = await kv.getByPrefix('geofence_zone:');
    const zones = zoneKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ zones });
  } catch (error) {
    console.log('Geofence zones fetch error:', error);
    return c.json({ error: 'Failed to fetch geofence zones' }, 500);
  }
});

app.post('/make-server-def022bc/cctv/geofence/zones', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'supervisor') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const zoneData = await c.req.json();
    const zoneId = `geofence_zone_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const zone = {
      id: zoneId,
      ...zoneData,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(`geofence_zone:${zoneId}`, zone);
    return c.json({ zone });
  } catch (error) {
    console.log('Geofence zone creation error:', error);
    return c.json({ error: 'Failed to create geofence zone' }, 500);
  }
});

app.put('/make-server-def022bc/cctv/geofence/zones/:id', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'supervisor') {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }

  try {
    const zoneId = c.req.param('id');
    const updates = await c.req.json();
    
    const zone = await kv.get(`geofence_zone:${zoneId}`);
    if (!zone) {
      return c.json({ error: 'Geofence zone not found' }, 404);
    }

    const updatedZone = {
      ...zone,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(`geofence_zone:${zoneId}`, updatedZone);
    return c.json({ zone: updatedZone });
  } catch (error) {
    console.log('Geofence zone update error:', error);
    return c.json({ error: 'Failed to update geofence zone' }, 500);
  }
});

// ========================================
// CCTV EVENTS ROUTES
// ========================================

app.get('/make-server-def022bc/cctv/events', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const limit = parseInt(c.req.query('limit') || '100');
    const eventKeys = await kv.getByPrefix('cctv_event:');
    const events = eventKeys
      .map(item => item.value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return c.json({ events });
  } catch (error) {
    console.log('CCTV events fetch error:', error);
    return c.json({ error: 'Failed to fetch CCTV events' }, 500);
  }
});

app.put('/make-server-def022bc/cctv/events/:id/acknowledge', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const eventId = c.req.param('id');
    const event = await kv.get(`cctv_event:${eventId}`);
    
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const updatedEvent = {
      ...event,
      acknowledged: true,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString()
    };

    await kv.set(`cctv_event:${eventId}`, updatedEvent);
    return c.json({ event: updatedEvent });
  } catch (error) {
    console.log('Event acknowledgment error:', error);
    return c.json({ error: 'Failed to acknowledge event' }, 500);
  }
});

// ========================================
// RECORDING MANAGEMENT ROUTES
// ========================================

app.post('/make-server-def022bc/cctv/recordings/start', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { camera_id, duration, trigger_type } = await c.req.json();
    const recordingId = `recording_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    const recording = {
      id: recordingId,
      camera_id,
      start_time: new Date().toISOString(),
      duration,
      trigger_type: trigger_type || 'manual',
      status: 'recording',
      started_by: user.id,
      storage_location: `/recordings/${new Date().getFullYear()}/${camera_id}/${recordingId}.mp4`
    };

    await kv.set(`recording:${recordingId}`, recording);
    return c.json({ recording });
  } catch (error) {
    console.log('Recording start error:', error);
    return c.json({ error: 'Failed to start recording' }, 500);
  }
});

app.put('/make-server-def022bc/cctv/recordings/:id/stop', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const recordingId = c.req.param('id');
    const recording = await kv.get(`recording:${recordingId}`);
    
    if (!recording) {
      return c.json({ error: 'Recording not found' }, 404);
    }

    const endTime = new Date();
    const startTime = new Date(recording.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const updatedRecording = {
      ...recording,
      end_time: endTime.toISOString(),
      duration,
      status: 'completed',
      stopped_by: user.id,
      file_size: Math.floor(duration * 2.5 * 1024 * 1024), // Estimated file size
      video_url: `https://demo-recordings.example.com/${recordingId}.mp4`
    };

    await kv.set(`recording:${recordingId}`, updatedRecording);
    return c.json({ recording: updatedRecording });
  } catch (error) {
    console.log('Recording stop error:', error);
    return c.json({ error: 'Failed to stop recording' }, 500);
  }
});

app.get('/make-server-def022bc/cctv/recordings', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const cameraId = c.req.query('camera_id');
    const recordingKeys = await kv.getByPrefix('recording:');
    let recordings = recordingKeys.map(item => item.value);
    
    if (cameraId) {
      recordings = recordings.filter(r => r.camera_id === cameraId);
    }
    
    recordings = recordings.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    return c.json({ recordings });
  } catch (error) {
    console.log('Recordings fetch error:', error);
    return c.json({ error: 'Failed to fetch recordings' }, 500);
  }
});

// ========================================
// CCTV SYSTEM HEALTH ROUTES
// ========================================

app.get('/make-server-def022bc/cctv/system/health', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const cameraKeys = await kv.getByPrefix('camera:');
    const cameras = cameraKeys.map(item => item.value);
    
    const zoneKeys = await kv.getByPrefix('geofence_zone:');
    const zones = zoneKeys.map(item => item.value);
    
    const recordingKeys = await kv.getByPrefix('recording:');
    const recordings = recordingKeys.map(item => item.value);
    
    const health = {
      total_cameras: cameras.length,
      online_cameras: cameras.filter(c => c.status === 'online').length,
      recording_cameras: recordings.filter(r => r.status === 'recording').length,
      active_zones: zones.filter(z => z.is_active).length,
      storage_usage: Math.floor(Math.random() * 40) + 50, // Mock data: 50-90%
      bandwidth_usage: Math.floor(Math.random() * 30) + 30 // Mock data: 30-60%
    };

    return c.json({ health });
  } catch (error) {
    console.log('CCTV health check error:', error);
    return c.json({ error: 'Failed to get system health' }, 500);
  }
});

// ========================================
// REAL-TIME FEATURES ROUTES
// ========================================

app.get('/make-server-def022bc/realtime/status', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get real-time system status
    const userKeys = await kv.getByPrefix('user:');
    const users = userKeys
      .filter(item => item.key.includes(':profile'))
      .map(item => item.value);
    
    const activeGuards = users.filter(u => u.status === 'active' && u.role === 'guard').length;
    
    const emergencyKeys = await kv.getByPrefix('emergency:');
    const activeEmergencies = emergencyKeys
      .map(item => item.value)
      .filter(e => e.status === 'active').length;
    
    const locationKeys = await kv.getByPrefix('location:');
    const recentLocations = locationKeys
      .filter(item => item.key.includes(':current'))
      .map(item => item.value);
    
    const guardsOnPatrol = recentLocations.length;
    
    const status = {
      active_guards: activeGuards,
      active_incidents: activeEmergencies,
      guards_on_patrol: guardsOnPatrol,
      system_status: 'operational',
      last_updated: new Date().toISOString()
    };

    return c.json({ status });
  } catch (error) {
    console.log('Real-time status error:', error);
    return c.json({ error: 'Failed to fetch real-time status' }, 500);
  }
});

// ========================================
// REPORTS GENERATION ROUTES
// ========================================

app.get('/make-server-def022bc/reports/generate/:type', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const reportType = c.req.param('type');
    const { start_date, end_date } = c.req.query();
    
    let reportData = {};
    
    switch (reportType) {
      case 'attendance':
        const attendanceKeys = await kv.getByPrefix('attendance:');
        reportData = {
          type: 'attendance',
          data: attendanceKeys.map(item => item.value),
          generated_at: new Date().toISOString(),
          generated_by: user.id
        };
        break;
        
      case 'incidents':
        const incidentKeys = await kv.getByPrefix('incident:');
        reportData = {
          type: 'incidents',
          data: incidentKeys.map(item => item.value),
          generated_at: new Date().toISOString(),
          generated_by: user.id
        };
        break;
        
      case 'performance':
        const scanKeys = await kv.getByPrefix('checkpoint_scan:');
        const locationKeys = await kv.getByPrefix('location:');
        reportData = {
          type: 'performance',
          data: {
            checkpoint_scans: scanKeys.map(item => item.value),
            location_updates: locationKeys.map(item => item.value)
          },
          generated_at: new Date().toISOString(),
          generated_by: user.id
        };
        break;
        
      case 'daily':
      case 'weekly':
      case 'monthly':
        // Get comprehensive data for period reports
        const allIncidents = await kv.getByPrefix('incident:');
        const allAttendance = await kv.getByPrefix('attendance:');
        const allScans = await kv.getByPrefix('checkpoint_scan:');
        
        reportData = {
          type: reportType,
          period: {
            start_date: start_date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: end_date || new Date().toISOString().split('T')[0]
          },
          summary: {
            total_incidents: allIncidents.length,
            total_attendance_records: allAttendance.length,
            total_checkpoint_scans: allScans.length
          },
          data: {
            incidents: allIncidents.map(item => item.value),
            attendance: allAttendance.map(item => item.value),
            checkpoints: allScans.map(item => item.value)
          },
          generated_at: new Date().toISOString(),
          generated_by: user.id
        };
        break;
        
      default:
        return c.json({ error: 'Invalid report type' }, 400);
    }

    // Store report for future reference
    const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await kv.set(`report:${reportId}`, reportData);

    return c.json({ report: reportData, report_id: reportId });
  } catch (error) {
    console.log('Report generation error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// ========================================
// FILE UPLOAD ROUTES
// ========================================

app.post('/make-server-def022bc/upload/:bucket', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  const user = await authenticateUser(accessToken!);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const bucket = c.req.param('bucket');
    const allowedBuckets = ['incidents', 'profiles', 'reports'];
    
    if (!allowedBuckets.includes(bucket)) {
      return c.json({ error: 'Invalid bucket' }, 400);
    }

    const body = await c.req.arrayBuffer();
    const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const bucketName = `make-def022bc-${bucket}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, body, {
        contentType: c.req.header('content-type') || 'application/octet-stream'
      });

    if (error) {
      console.log('Upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }

    // Generate signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours

    return c.json({ 
      path: data.path,
      url: urlData?.signedUrl 
    });
  } catch (error) {
    console.log('Upload exception:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Health check
app.get('/make-server-def022bc/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'guard-services-backend'
  });
});

// Start server
console.log('🚀 Guard Services Backend Server starting...');
Deno.serve(app.fetch);