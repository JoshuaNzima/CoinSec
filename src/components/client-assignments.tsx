import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

import { toast } from "sonner@2.0.3";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Dog, 
  Shield, 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { formatCompactCurrency, convertUSDToMWK } from '../utils/locale';

interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  contractValue: number;
  contractStartDate: string;
  contractEndDate: string;
  status: 'active' | 'inactive' | 'pending';
  requiresCanines: boolean;
  sitesCount: number;
  notes?: string;
}

interface Guard {
  id: string;
  name: string;
  badge: string;
  role: string;
  experience: number;
  certifications: string[];
  status: 'available' | 'assigned' | 'on_leave' | 'inactive';
  location: string;
  phoneNumber: string;
  specializations: string[];
}

interface Canine {
  id: string;
  name: string;
  breed: string;
  age: number;
  handler: string;
  certifications: string[];
  status: 'available' | 'assigned' | 'training' | 'medical_leave';
  specialization: string[];
  lastVetCheck: string;
}

interface Assignment {
  id: string;
  clientId: string;
  guardIds: string[];
  canineIds: string[];
  siteName: string;
  startDate: string;
  endDate?: string;
  shiftType: 'day' | 'night' | '24hour' | 'rotating';
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  requirements: string;
  budget: number;
  createdBy: string;
  createdAt: string;
}

// Mock data - in production this would come from the backend
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Kamuzu Central Hospital',
    contactPerson: 'Dr. James Phiri',
    email: 'security@kch.mw',
    phone: '+265 1 789 456',
    address: 'PO Box 149',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(45000),
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    status: 'active',
    requiresCanines: true,
    sitesCount: 3,
    notes: 'High security hospital requiring 24/7 coverage'
  },
  {
    id: '2',
    name: 'Lilongwe Shopping Centre',
    contactPerson: 'Mary Banda',
    email: 'security@lsc.mw',
    phone: '+265 1 456 789',
    address: 'City Centre',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(32000),
    contractStartDate: '2024-02-01',
    contractEndDate: '2025-01-31',
    status: 'active',
    requiresCanines: false,
    sitesCount: 1,
    notes: 'Shopping mall with multiple entrances'
  },
  {
    id: '3',
    name: 'Capital Hill Complex',
    contactPerson: 'John Mwale',
    email: 'facilities@caphill.gov.mw',
    phone: '+265 1 234 567',
    address: 'Capital Hill',
    city: 'Lilongwe',
    contractValue: convertUSDToMWK(78000),
    contractStartDate: '2024-01-15',
    contractEndDate: '2025-01-14',
    status: 'active',
    requiresCanines: true,
    sitesCount: 5,
    notes: 'Government complex requiring highest security clearance'
  }
];

const mockGuards: Guard[] = [
  {
    id: 'g1',
    name: 'Francis Phiri',
    badge: 'GRD-001',
    role: 'Senior Guard',
    experience: 8,
    certifications: ['Basic Security', 'Fire Safety', 'First Aid'],
    status: 'available',
    location: 'Lilongwe',
    phoneNumber: '+265 999 123 456',
    specializations: ['Hospital Security', 'Emergency Response']
  },
  {
    id: 'g2',
    name: 'Grace Banda',
    badge: 'GRD-002',
    role: 'Guard',
    experience: 3,
    certifications: ['Basic Security', 'Customer Service'],
    status: 'assigned',
    location: 'Lilongwe',
    phoneNumber: '+265 999 234 567',
    specializations: ['Retail Security', 'Access Control']
  },
  {
    id: 'g3',
    name: 'Peter Mwale',
    badge: 'GRD-003',
    role: 'Guard Captain',
    experience: 12,
    certifications: ['Advanced Security', 'Leadership', 'Crisis Management'],
    status: 'available',
    location: 'Lilongwe',
    phoneNumber: '+265 999 345 678',
    specializations: ['VIP Protection', 'Team Leadership']
  },
  {
    id: 'g4',
    name: 'Alice Tembo',
    badge: 'GRD-004',
    role: 'Guard',
    experience: 5,
    certifications: ['Basic Security', 'CCTV Operations'],
    status: 'available',
    location: 'Blantyre',
    phoneNumber: '+265 999 456 789',
    specializations: ['CCTV Monitoring', 'Report Writing']
  }
];

const mockCanines: Canine[] = [
  {
    id: 'c1',
    name: 'Rex',
    breed: 'German Shepherd',
    age: 5,
    handler: 'Francis Phiri',
    certifications: ['Drug Detection', 'Patrol', 'Protection'],
    status: 'available',
    specialization: ['Drug Detection', 'Perimeter Security'],
    lastVetCheck: '2024-01-15'
  },
  {
    id: 'c2',
    name: 'Luna',
    breed: 'Belgian Malinois',
    age: 3,
    handler: 'Peter Mwale',
    certifications: ['Explosives Detection', 'Tracking'],
    status: 'assigned',
    specialization: ['Explosives Detection', 'VIP Protection'],
    lastVetCheck: '2024-01-20'
  },
  {
    id: 'c3',
    name: 'Max',
    breed: 'Labrador',
    age: 4,
    handler: 'James Nyirenda',
    certifications: ['Search and Rescue', 'Patrol'],
    status: 'available',
    specialization: ['Search Operations', 'Public Safety'],
    lastVetCheck: '2024-01-10'
  }
];

const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    clientId: '1',
    guardIds: ['g2'],
    canineIds: ['c2'],
    siteName: 'Main Hospital Building',
    startDate: '2024-01-01',
    shiftType: '24hour',
    status: 'active',
    requirements: '24/7 security with canine support for drug detection',
    budget: convertUSDToMWK(15000),
    createdBy: 'admin',
    createdAt: '2023-12-15'
  },
  {
    id: 'a2',
    clientId: '2',
    guardIds: ['g1', 'g4'],
    canineIds: [],
    siteName: 'Shopping Centre Main Entrance',
    startDate: '2024-02-01',
    shiftType: 'day',
    status: 'active',
    requirements: 'Day shift coverage for main entrance and CCTV monitoring',
    budget: convertUSDToMWK(8000),
    createdBy: 'supervisor',
    createdAt: '2024-01-15'
  }
];

export function ClientAssignments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [clients] = useState<Client[]>(mockClients);
  const [guards] = useState<Guard[]>(mockGuards);
  const [canines] = useState<Canine[]>(mockCanines);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Check permissions
  const canManageAssignments = user?.role === 'admin' || user?.role === 'supervisor';

  if (!canManageAssignments) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2>Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to manage client assignments.
        </p>
      </div>
    );
  }

  const filteredAssignments = assignments.filter(assignment => {
    const client = clients.find(c => c.id === assignment.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.siteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAssignment = (newAssignment: Omit<Assignment, 'id' | 'createdAt' | 'createdBy'>) => {
    const assignment: Assignment = {
      ...newAssignment,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Unknown'
    };
    setAssignments([...assignments, assignment]);
    setIsAssignmentDialogOpen(false);
    toast.success('Assignment created successfully');
  };

  const handleUpdateAssignment = (updatedAssignment: Assignment) => {
    setAssignments(assignments.map(a => 
      a.id === updatedAssignment.id ? updatedAssignment : a
    ));
    setEditingAssignment(null);
    toast.success('Assignment updated successfully');
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    toast.success('Assignment deleted successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Client & Assignment Management</h1>
          <p className="text-muted-foreground">Manage guard and canine assignments to clients</p>
        </div>
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <AssignmentDialog
            clients={clients}
            guards={guards}
            canines={canines}
            onSave={handleCreateAssignment}
            onClose={() => setIsAssignmentDialogOpen(false)}
          />
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="guards">Guards</TabsTrigger>
          <TabsTrigger value="canines">Canines</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {filteredAssignments.map((assignment) => {
              const client = clients.find(c => c.id === assignment.clientId);
              const assignedGuards = guards.filter(g => assignment.guardIds.includes(g.id));
              const assignedCanines = canines.filter(c => assignment.canineIds.includes(c.id));

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {client?.name} - {assignment.siteName}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(assignment.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {assignment.shiftType}
                          </span>
                          <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <h4>Assigned Guards ({assignedGuards.length})</h4>
                        <div className="space-y-2 mt-2">
                          {assignedGuards.map(guard => (
                            <div key={guard.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Shield className="h-4 w-4" />
                              <div className="flex-1">
                                <div className="font-medium">{guard.name}</div>
                                <div className="text-sm text-muted-foreground">{guard.badge} • {guard.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4>Assigned Canines ({assignedCanines.length})</h4>
                        <div className="space-y-2 mt-2">
                          {assignedCanines.map(canine => (
                            <div key={canine.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <Dog className="h-4 w-4" />
                              <div className="flex-1">
                                <div className="font-medium">{canine.name}</div>
                                <div className="text-sm text-muted-foreground">{canine.breed} • {canine.specialization.join(', ')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4>Assignment Details</h4>
                        <div className="mt-2 space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Budget:</span> {formatCompactCurrency(assignment.budget)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Requirements:</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.requirements}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <ClientsTab clients={clients} />
        </TabsContent>

        <TabsContent value="guards">
          <GuardsTab guards={guards} />
        </TabsContent>

        <TabsContent value="canines">
          <CaninesTab canines={canines} />
        </TabsContent>
      </Tabs>

      {editingAssignment && (
        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <AssignmentDialog
            assignment={editingAssignment}
            clients={clients}
            guards={guards}
            canines={canines}
            onSave={handleUpdateAssignment}
            onClose={() => setEditingAssignment(null)}
          />
        </Dialog>
      )}
    </div>
  );
}

function AssignmentDialog({ 
  assignment, 
  clients, 
  guards, 
  canines, 
  onSave, 
  onClose 
}: {
  assignment?: Assignment;
  clients: Client[];
  guards: Guard[];
  canines: Canine[];
  onSave: (assignment: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    clientId: assignment?.clientId || '',
    guardIds: assignment?.guardIds || [],
    canineIds: assignment?.canineIds || [],
    siteName: assignment?.siteName || '',
    startDate: assignment?.startDate || new Date().toISOString().split('T')[0],
    endDate: assignment?.endDate || '',
    shiftType: assignment?.shiftType || 'day',
    status: assignment?.status || 'scheduled',
    requirements: assignment?.requirements || '',
    budget: assignment?.budget || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignment) {
      onSave({ ...assignment, ...formData });
    } else {
      onSave(formData);
    }
  };

  const availableGuards = guards.filter(g => g.status === 'available' || formData.guardIds.includes(g.id));
  const availableCanines = canines.filter(c => c.status === 'available' || formData.canineIds.includes(c.id));

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {assignment ? 'Edit Assignment' : 'Create New Assignment'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => setFormData({...formData, siteName: e.target.value})}
              placeholder="Enter site name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="shiftType">Shift Type</Label>
            <Select value={formData.shiftType} onValueChange={(value) => setFormData({...formData, shiftType: value as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day Shift</SelectItem>
                <SelectItem value="night">Night Shift</SelectItem>
                <SelectItem value="24hour">24 Hour</SelectItem>
                <SelectItem value="rotating">Rotating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="budget">Budget (MWK)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
              placeholder="Enter budget"
              required
            />
          </div>
        </div>

        <div>
          <Label>Assign Guards</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
            {availableGuards.map(guard => (
              <label key={guard.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.guardIds.includes(guard.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({...formData, guardIds: [...formData.guardIds, guard.id]});
                    } else {
                      setFormData({...formData, guardIds: formData.guardIds.filter(id => id !== guard.id)});
                    }
                  }}
                />
                <span className="text-sm">{guard.name} ({guard.badge})</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>Assign Canines</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
            {availableCanines.map(canine => (
              <label key={canine.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canineIds.includes(canine.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({...formData, canineIds: [...formData.canineIds, canine.id]});
                    } else {
                      setFormData({...formData, canineIds: formData.canineIds.filter(id => id !== canine.id)});
                    }
                  }}
                />
                <span className="text-sm">{canine.name} ({canine.breed})</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            placeholder="Describe specific requirements for this assignment"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {assignment ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function ClientsTab({ clients }: { clients: Client[] }) {
  return (
    <div className="grid gap-4">
      {clients.map(client => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{client.name}</span>
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                {client.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{client.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{client.address}, {client.city}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>Contract Value: {formatCompactCurrency(client.contractValue)}</div>
                <div>Sites: {client.sitesCount}</div>
                <div>Canines Required: {client.requiresCanines ? 'Yes' : 'No'}</div>
                <div>Contract: {new Date(client.contractStartDate).toLocaleDateString()} - {new Date(client.contractEndDate).toLocaleDateString()}</div>
              </div>
            </div>
            {client.notes && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GuardsTab({ guards }: { guards: Guard[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {guards.map(guard => (
        <Card key={guard.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{guard.name}</span>
              <Badge variant={guard.status === 'available' ? 'default' : 'secondary'}>
                {guard.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Badge:</span>
              <span>{guard.badge}</span>
            </div>
            <div className="flex justify-between">
              <span>Role:</span>
              <span>{guard.role}</span>
            </div>
            <div className="flex justify-between">
              <span>Experience:</span>
              <span>{guard.experience} years</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>{guard.location}</span>
            </div>
            <div>
              <span>Certifications:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {guard.certifications.map(cert => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span>Specializations:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {guard.specializations.map(spec => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CaninesTab({ canines }: { canines: Canine[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {canines.map(canine => (
        <Card key={canine.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Dog className="h-5 w-5" />
                {canine.name}
              </span>
              <Badge variant={canine.status === 'available' ? 'default' : 'secondary'}>
                {canine.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Breed:</span>
              <span>{canine.breed}</span>
            </div>
            <div className="flex justify-between">
              <span>Age:</span>
              <span>{canine.age} years</span>
            </div>
            <div className="flex justify-between">
              <span>Handler:</span>
              <span>{canine.handler}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Vet Check:</span>
              <span>{new Date(canine.lastVetCheck).toLocaleDateString()}</span>
            </div>
            <div>
              <span>Certifications:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {canine.certifications.map(cert => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span>Specializations:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {canine.specialization.map(spec => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}